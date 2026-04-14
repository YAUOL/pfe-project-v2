package com.recrutement.backend.controller;

import com.recrutement.backend.model.CV;
import com.recrutement.backend.model.MatchingScore;
import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Role;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.service.CVService;
import com.recrutement.backend.service.MatchingScoreService;
import com.recrutement.backend.service.OffreService;
import com.recrutement.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CVController {

    private final CVService cvService;
    private final OffreService offreService;
    private final UtilisateurService utilisateurService;
    private final MatchingScoreService matchingScoreService;

    // ─────────────────────────────────────────────
    // POST upload CV (Candidate only)
    // ─────────────────────────────────────────────
    @PostMapping("/upload")
    @PreAuthorize("hasRole('CANDIDAT')")
    public ResponseEntity<?> uploadCV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("offreId") Long offreId,
            Authentication authentication
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String email = authentication.getName();
            Utilisateur candidat = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            Offre offre = offreService.getOffreById(offreId);
            if (offre == null) {
                return ResponseEntity.badRequest().body("Offer not found");
            }

            CV savedCV = cvService.uploadCV(file, candidat, offre);

            // Auto-calculate matching score after upload (non-blocking)
            try {
                matchingScoreService.calculateAndSave(savedCV.getId());
                System.out.println("[UPLOAD] Score calculated for CV " + savedCV.getId());
            } catch (Exception e) {
                System.err.println("[UPLOAD] Score failed (non-blocking): " + e.getMessage());
            }

            return ResponseEntity.ok(convertCVToMap(savedCV));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // GET CVs for an offer (Recruiter/Admin)
    // ─────────────────────────────────────────────
    @GetMapping("/offre/{offreId}")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> getCVsByOffre(@PathVariable Long offreId) {
        try {
            Offre offre = offreService.getOffreById(offreId);
            if (offre == null) {
                return ResponseEntity.status(404).body("Offre not found");
            }

            List<CV> cvs = cvService.getCVsByOffre(offre);
            System.out.println("[GET CVs] Offre " + offreId + " → " + cvs.size() + " CVs found");

            List<Map<String, Object>> result = cvs.stream()
                    .map(this::convertCVToMap)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("[GET CVs] ERROR for offre " + offreId + ":");
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // GET CVs with scores (sorted by score DESC) (Recruiter/Admin)
    // ─────────────────────────────────────────────
    @GetMapping("/offre/{offreId}/with-scores")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> getCVsWithScores(@PathVariable Long offreId) {
        try {
            Offre offre = offreService.getOffreById(offreId);
            if (offre == null) {
                return ResponseEntity.status(404).body("Offre not found");
            }

            List<CV> cvs = cvService.getCVsByOffre(offre);
            List<Map<String, Object>> result = new ArrayList<>();

            for (CV cv : cvs) {
                Map<String, Object> item = new HashMap<>();
                item.put("cv", convertCVToMap(cv));

                Optional<MatchingScore> scoreOpt = matchingScoreService.getScoreByCv(cv);
                if (scoreOpt.isPresent()) {
                    MatchingScore ms = scoreOpt.get();
                    Map<String, Object> scoreMap = new HashMap<>();
                    scoreMap.put("id", ms.getId());
                    scoreMap.put("score", ms.getScore());
                    scoreMap.put("matchedSkills", ms.getMatchedSkills());
                    scoreMap.put("missingSkills", ms.getMissingSkills());
                    scoreMap.put("createdAt", ms.getCreatedAt() != null ? ms.getCreatedAt().toString() : null);
                    item.put("matchingScore", scoreMap);
                } else {
                    item.put("matchingScore", null);
                }

                result.add(item);
            }

            // Sort by score DESC (nulls last)
            result.sort((a, b) -> {
                Object aScoreObj = a.get("matchingScore");
                Object bScoreObj = b.get("matchingScore");
                if (aScoreObj == null && bScoreObj == null) return 0;
                if (aScoreObj == null) return 1;
                if (bScoreObj == null) return -1;
                BigDecimal aVal = (BigDecimal) ((Map<?, ?>) aScoreObj).get("score");
                BigDecimal bVal = (BigDecimal) ((Map<?, ?>) bScoreObj).get("score");
                return bVal.compareTo(aVal);
            });

            System.out.println("[WITH-SCORES] Offre " + offreId + " → " + result.size() + " CVs");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("[WITH-SCORES] ERROR:");
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // GET mes CVs (Candidate only)
    // ─────────────────────────────────────────────
    @GetMapping("/mes-cvs")
    @PreAuthorize("hasRole('CANDIDAT')")
    public ResponseEntity<?> getMesCVs(Authentication authentication) {
        try {
            String email = authentication.getName();
            Utilisateur candidat = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            List<CV> mesCVs = cvService.getCVsByCandidat(candidat);
            List<Map<String, Object>> result = mesCVs.stream()
                    .map(this::convertCVToMap)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // PUT update status (Recruiter/Admin only + ownership check)
    // Expected values: PENDING / ACCEPTED / REJECTED
    // ─────────────────────────────────────────────
    @PutMapping("/{cvId}/status")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long cvId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            CV cv = cvService.getCVById(cvId);
            if (cv == null) {
                return ResponseEntity.status(404).body("CV not found");
            }

            String statutStr = body.get("statut");
            if (statutStr == null || statutStr.isBlank()) {
                return ResponseEntity.badRequest().body("Missing 'statut' field");
            }

            CV.StatutCandidature newStatus;
            try {
                newStatus = CV.StatutCandidature.valueOf(statutStr.toUpperCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body("Invalid status. Allowed: PENDING, ACCEPTED, REJECTED");
            }

            String email = authentication.getName();
            Utilisateur actor = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            // If recruiter: must own the offer linked to this CV
            if (actor.getRole() == Role.RECRUTEUR) {
                String offerOwnerEmail = cv.getOffre().getRecruteur().getEmail();
                if (!email.equals(offerOwnerEmail)) {
                    return ResponseEntity.status(403).body("Forbidden: not your offer");
                }
            }

            cv.setStatut(newStatus);
            cvService.save(cv);

            System.out.println("[STATUS] CV " + cvId + " → " + newStatus.name());
            return ResponseEntity.ok("Status updated");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // POST re-extract text from CV file (Recruiter/Admin)
    // ─────────────────────────────────────────────
    @PostMapping("/{cvId}/reextract")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> reExtractText(@PathVariable Long cvId) {
        try {
            CV cv = cvService.reExtractText(cvId);
            System.out.println("[RE-EXTRACT] Done for CV " + cvId);
            return ResponseEntity.ok(convertCVToMap(cv));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────
    // GET download/view CV file
    // (kept as authenticated-only by SecurityConfig; access depends on your global security rules)
    // ─────────────────────────────────────────────
    @GetMapping("/{cvId}/file")
    public ResponseEntity<Resource> downloadCVFile(@PathVariable Long cvId) {
        try {
            CV cv = cvService.getCVById(cvId);
            if (cv == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(cv.getCheminFichier());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String fileName = cv.getNomFichier().toLowerCase();
            MediaType mediaType;
            if (fileName.endsWith(".pdf")) {
                mediaType = MediaType.APPLICATION_PDF;
            } else if (fileName.endsWith(".docx")) {
                mediaType = MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                );
            } else {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + cv.getNomFichier() + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ─────────────────────────────────────────────
    // Helper: Convert CV to safe Map
    // ─────────────────────────────────────────────
    private Map<String, Object> convertCVToMap(CV cv) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", cv.getId());
        map.put("nomFichier", cv.getNomFichier());
        map.put("cheminFichier", cv.getCheminFichier());
        map.put("texteExtrait", cv.getTexteExtrait());
        map.put("uploadedAt", cv.getUploadedAt() != null ? cv.getUploadedAt().toString() : null);
        map.put("statut", cv.getStatut() != null ? cv.getStatut().name() : "PENDING");

        Map<String, Object> candidatMap = new HashMap<>();
        if (cv.getCandidat() != null) {
            candidatMap.put("id", cv.getCandidat().getId());
            candidatMap.put("nom", cv.getCandidat().getNom());
            candidatMap.put("prenom", cv.getCandidat().getPrenom());
            candidatMap.put("email", cv.getCandidat().getEmail());
        }
        map.put("candidat", candidatMap);

        Map<String, Object> offreMap = new HashMap<>();
        if (cv.getOffre() != null) {
            offreMap.put("id", cv.getOffre().getId());
            offreMap.put("titre", cv.getOffre().getTitre());
        }
        map.put("offre", offreMap);

        return map;
    }
// ─────────────────────────────────────────────
// POST calculate match score for a CV (Recruiter/Admin + ownership check)
// Endpoint used by frontend: /api/cv/calculate-match/{cvId}
// ─────────────────────────────────────────────
@PostMapping("/calculate-match/{cvId}")
@PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
public ResponseEntity<?> calculateMatchForCv(
        @PathVariable Long cvId,
        Authentication authentication
) {
    try {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        CV cv = cvService.getCVById(cvId);
        if (cv == null) {
            return ResponseEntity.status(404).body("CV not found");
        }

        String email = authentication.getName();
        Utilisateur actor = utilisateurService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // If recruiter: must own the offer linked to this CV
        if (actor.getRole() == Role.RECRUTEUR) {
            String offerOwnerEmail = cv.getOffre().getRecruteur().getEmail();
            if (!email.equals(offerOwnerEmail)) {
                return ResponseEntity.status(403).body("Forbidden: not your offer");
            }
        }

        MatchingScore score = matchingScoreService.calculateAndSave(cvId);

        Map<String, Object> map = new HashMap<>();
        map.put("id", score.getId());
        map.put("score", score.getScore());
        map.put("matchedSkills", score.getMatchedSkills());
        map.put("missingSkills", score.getMissingSkills());
        map.put("createdAt", score.getCreatedAt() != null ? score.getCreatedAt().toString() : null);

        return ResponseEntity.ok(map);

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Error: " + e.getMessage());
    }
}



}