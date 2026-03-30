package com.recrutement.backend.controller;

import com.recrutement.backend.model.MatchingScore;
import com.recrutement.backend.service.MatchingScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MatchingScoreController {

    private final MatchingScoreService matchingScoreService;

    // POST: calculate score for a CV
    @PostMapping("/calculate/{cvId}")
    public ResponseEntity<?> calculateScore(@PathVariable Long cvId) {
        try {
            MatchingScore score = matchingScoreService.calculateAndSave(cvId);
            return ResponseEntity.ok(convertToMap(score));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // POST: force recalculate score for a CV
    @PostMapping("/recalculate/{cvId}")
    public ResponseEntity<?> recalculateScore(@PathVariable Long cvId) {
        try {
            MatchingScore score = matchingScoreService.recalculate(cvId);
            return ResponseEntity.ok(convertToMap(score));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    private Map<String, Object> convertToMap(MatchingScore ms) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", ms.getId());
        map.put("score", ms.getScore());
        map.put("matchedSkills", ms.getMatchedSkills());
        map.put("missingSkills", ms.getMissingSkills());
        map.put("createdAt", ms.getCreatedAt() != null
                ? ms.getCreatedAt().toString() : null);
        map.put("cvId", ms.getCv() != null ? ms.getCv().getId() : null);
        return map;
    }
}