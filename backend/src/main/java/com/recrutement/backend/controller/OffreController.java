package com.recrutement.backend.controller;

import com.recrutement.backend.model.Offre;
import com.recrutement.backend.service.OffreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offres")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class OffreController {

    private final OffreService offreService;

    @GetMapping
    public ResponseEntity<List<Offre>> getAllOffres() {
        log.info("📋 GET /api/offres");
        try {
            List<Offre> offres = offreService.getAllOffres();
            return ResponseEntity.ok(offres);
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<Offre>> getActiveOffres() {
        log.info("✅ GET /api/offres/active");
        try {
            List<Offre> offres = offreService.getActiveOffres();
            return ResponseEntity.ok(offres);
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOffreById(@PathVariable Long id) {
        log.info("🔍 GET /api/offres/{}", id);
        try {
            Offre offre = offreService.getOffreById(id);
            return ResponseEntity.ok(offre);
        } catch (RuntimeException e) {
            log.error("❌ Offre non trouvée");
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur"));
        }
    }

    @GetMapping("/recruteur/{recruteurId}")
    public ResponseEntity<?> getOffresByRecruteur(@PathVariable Long recruteurId) {
        log.info("👤 GET /api/offres/recruteur/{}", recruteurId);
        try {
            List<Offre> offres = offreService.getOffresByRecruteur(recruteurId);
            return ResponseEntity.ok(offres);
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchOffres(@RequestParam String keyword) {
        log.info("🔎 GET /api/offres/search?keyword={}", keyword);
        try {
            List<Offre> offres = offreService.searchOffres(keyword);
            return ResponseEntity.ok(offres);
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur"));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUTEUR')")
    public ResponseEntity<?> createOffre(
            @Valid @RequestBody Offre offre,
            Authentication authentication) {
        log.info("➕ POST /api/offres");
        try {
            String email = authentication.getName();
            Offre createdOffre = offreService.createOffre(offre, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOffre);
        } catch (RuntimeException e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUTEUR')")
    public ResponseEntity<?> updateOffre(
            @PathVariable Long id,
            @Valid @RequestBody Offre offre) {
        log.info("✏️ PUT /api/offres/{}", id);
        try {
            Offre updatedOffre = offreService.updateOffre(id, offre);
            return ResponseEntity.ok(updatedOffre);
        } catch (RuntimeException e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteOffre(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/offres/{}", id);
        try {
            // Soft delete to keep offer visible with status DELETED
            offreService.deleteOffre(id);
            return ResponseEntity.ok(createSuccessResponse("Offre supprimée (soft delete)"));
        } catch (RuntimeException e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('RECRUTEUR')")
    public ResponseEntity<?> toggleOffreStatus(@PathVariable Long id) {
        log.info("🔄 PATCH /api/offres/{}/toggle-status", id);
        try {
            Offre updatedOffre = offreService.toggleOffreStatus(id);
            return ResponseEntity.ok(updatedOffre);
        } catch (RuntimeException e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur"));
        }
    }

    @GetMapping("/count/recruteur/{recruteurId}")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> countOffresByRecruteur(@PathVariable Long recruteurId) {
        log.info("📊 GET /api/offres/count/recruteur/{}", recruteurId);
        try {
            long count = offreService.countOffresByRecruteur(recruteurId);
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur"));
        }
    }

    @GetMapping("/count/active")
    public ResponseEntity<?> countActiveOffres() {
        log.info("📊 GET /api/offres/count/active");
        try {
            long count = offreService.countActiveOffres();
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Erreur: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur serveur"));
        }
    }

    @PatchMapping("/{id}/set-active")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> setOffreActive(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            Authentication authentication
    ) {
        log.info("✅ PATCH /api/offres/{}/set-active", id);

        try {
            Boolean active = body.get("active");
            if (active == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Missing field: active"));
            }

            String email = authentication.getName();
            Offre updated = offreService.setOffreActive(id, active, email);

            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Server error: " + e.getMessage()));
        }
    }

    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}