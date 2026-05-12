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
        try {
            return ResponseEntity.ok(offreService.getAllOffres());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<Offre>> getActiveOffres() {
        try {
            return ResponseEntity.ok(offreService.getActiveOffres());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOffreById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(offreService.getOffreById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @GetMapping("/recruteur/{recruteurId}")
    public ResponseEntity<?> getOffresByRecruteur(@PathVariable Long recruteurId) {
        try {
            return ResponseEntity.ok(offreService.getOffresByRecruteur(recruteurId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchOffres(@RequestParam String keyword) {
        try {
            return ResponseEntity.ok(offreService.searchOffres(keyword));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUTEUR')")
    public ResponseEntity<?> createOffre(@Valid @RequestBody Offre offre, Authentication authentication) {
        try {
            String email = authentication.getName();
            Offre createdOffre = offreService.createOffre(offre, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOffre);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUTEUR')")
    public ResponseEntity<?> updateOffre(@PathVariable Long id, @Valid @RequestBody Offre offre) {
        try {
            return ResponseEntity.ok(offreService.updateOffre(id, offre));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteOffre(@PathVariable Long id) {
        try {
            offreService.deleteOffre(id);
            return ResponseEntity.ok(createSuccessResponse("Offre supprimée"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('RECRUTEUR')")
    public ResponseEntity<?> toggleOffreStatus(@PathVariable Long id) {
        try {
            Offre updatedOffre = offreService.toggleOffreStatus(id);
            return ResponseEntity.ok(updatedOffre);
        } catch (RuntimeException e) {
            // Returns 403 if admin disabled it
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    // ── Admin only: deactivate and lock offer ──────────────────────────
    @PatchMapping("/{id}/admin-deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminDeactivateOffre(@PathVariable Long id) {
        try {
            Offre offre = offreService.adminDeactivateOffre(id);
            return ResponseEntity.ok(offre);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @GetMapping("/count/recruteur/{recruteurId}")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> countOffresByRecruteur(@PathVariable Long recruteurId) {
        try {
            Map<String, Long> response = new HashMap<>();
            response.put("count", offreService.countOffresByRecruteur(recruteurId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @GetMapping("/count/active")
    public ResponseEntity<?> countActiveOffres() {
        try {
            Map<String, Long> response = new HashMap<>();
            response.put("count", offreService.countActiveOffres());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Erreur serveur"));
        }
    }

    @PatchMapping("/{id}/set-active")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> setOffreActive(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            Authentication authentication) {
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse("Server error: " + e.getMessage()));
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