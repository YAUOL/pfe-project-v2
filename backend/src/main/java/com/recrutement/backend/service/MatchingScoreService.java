package com.recrutement.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recrutement.backend.model.CV;
import com.recrutement.backend.model.MatchingScore;
import com.recrutement.backend.model.Offre;
import com.recrutement.backend.repository.CVRepository;
import com.recrutement.backend.repository.MatchingScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MatchingScoreService {

    private final MatchingScoreRepository matchingScoreRepository;
    private final CVRepository cvRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;

    public MatchingScore calculateAndSave(Long cvId) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found: " + cvId));

        Offre offre = cv.getOffre();

        Optional<MatchingScore> existing = matchingScoreRepository.findFirstByCvAndOffre(cv, offre);
        if (existing.isPresent()) {
            System.out.println("[MATCHING] Score already exists for CV " + cvId);
            return existing.get();
        }

        String cvText = cv.getTexteExtrait() != null ? cv.getTexteExtrait() : "";
        String jobDescription = offre.getDescription() != null ? offre.getDescription() : "";
        String requiredSkills = offre.getCompetencesRequises() != null
                ? offre.getCompetencesRequises() : "";

        System.out.println("[MATCHING] Calling AI service for CV " + cvId);

        try {
            Map<String, String> requestBody = Map.of(
                    "cv_text", cvText,
                    "job_description", jobDescription,
                    "required_skills", requiredSkills
            );

            String jsonBody = objectMapper.writeValueAsString(requestBody);

            // ✅ FIXED: force HTTP/1.1 — uvicorn does not support HTTP/2 upgrades
            HttpClient client = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_1_1)
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/api/match"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            System.out.println("[MATCHING] AI response status: " + response.statusCode());
            System.out.println("[MATCHING] AI response body: " + response.body());

            if (response.statusCode() != 200) {
                throw new RuntimeException("AI service returned: " + response.statusCode()
                        + " — " + response.body());
            }

            Map<?, ?> responseMap = objectMapper.readValue(response.body(), Map.class);

            double scoreValue = ((Number) responseMap.get("score")).doubleValue();
            List<?> matchedList = (List<?>) responseMap.get("matched_skills");
            List<?> missingList = (List<?>) responseMap.get("missing_skills");

            String matchedSkills = matchedList != null && !matchedList.isEmpty()
                    ? String.join(", ", matchedList.stream().map(Object::toString).toList())
                    : "None";
            String missingSkills = missingList != null && !missingList.isEmpty()
                    ? String.join(", ", missingList.stream().map(Object::toString).toList())
                    : "None";

            BigDecimal score = BigDecimal.valueOf(scoreValue)
                    .setScale(2, RoundingMode.HALF_UP);

            MatchingScore ms = new MatchingScore();
            ms.setCv(cv);
            ms.setOffre(offre);
            ms.setScore(score);
            ms.setMatchedSkills(matchedSkills);
            ms.setMissingSkills(missingSkills);

            MatchingScore saved = matchingScoreRepository.save(ms);
            System.out.println("[MATCHING] ✅ AI Score: " + score + "% for CV " + cvId);
            return saved;

        } catch (Exception e) {
            System.err.println("[MATCHING] ❌ AI service error: " + e.getMessage());
            System.out.println("[MATCHING] Falling back to basic matching...");
            return fallbackMatching(cv, offre);
        }
    }

    private MatchingScore fallbackMatching(CV cv, Offre offre) {
        String cvText = cv.getTexteExtrait() != null
                ? cv.getTexteExtrait().toLowerCase() : "";
        String requiredSkills = offre.getCompetencesRequises() != null
                ? offre.getCompetencesRequises() : "";

        String[] skills = requiredSkills.split("[,;\\n]");
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String skill : skills) {
            String s = skill.trim();
            if (s.isEmpty()) continue;
            if (cvText.contains(s.toLowerCase())) {
                matched.add(s);
            } else {
                missing.add(s);
            }
        }

        double percentage = skills.length > 0
                ? (double) matched.size() / skills.length * 100
                : 50.0;

        BigDecimal score = BigDecimal.valueOf(percentage)
                .setScale(2, RoundingMode.HALF_UP);

        MatchingScore ms = new MatchingScore();
        ms.setCv(cv);
        ms.setOffre(offre);
        ms.setScore(score);
        ms.setMatchedSkills(matched.isEmpty() ? "None" : String.join(", ", matched));
        ms.setMissingSkills(missing.isEmpty() ? "None" : String.join(", ", missing));

        System.out.println("[MATCHING] Fallback score: " + score + "% for CV " + cv.getId());
        return matchingScoreRepository.save(ms);
    }

    public Optional<MatchingScore> getScoreByCv(CV cv) {
        List<MatchingScore> scores = matchingScoreRepository.findByCv(cv);
        if (scores.isEmpty()) return Optional.empty();
        return scores.stream()
                .max(java.util.Comparator.comparing(MatchingScore::getId));
    }

    public MatchingScore recalculate(Long cvId) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found: " + cvId));

        // Delete existing score so calculateAndSave runs fresh
        matchingScoreRepository.findFirstByCvAndOffre(cv, cv.getOffre())
                .ifPresent(matchingScoreRepository::delete);

        return calculateAndSave(cvId);
    }
}