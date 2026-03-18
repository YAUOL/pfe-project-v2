package com.recrutement.backend.controller;

import com.recrutement.backend.model.CV;
import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.service.CVService;
import com.recrutement.backend.service.OffreService;
import com.recrutement.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CVController {

    private final CVService cvService;
    private final OffreService offreService;
    private final UtilisateurService utilisateurService;

    // 📤 POST upload CV pour une offre
    @PostMapping("/upload")
    public ResponseEntity<?> uploadCV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("offreId") Long offreId,
            Authentication authentication
    ) {

        try {

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Récupère l'email depuis le token JWT
            String email = authentication.getName();
            System.out.println("🔍 [UPLOAD CV] Email from JWT: " + email);
            
            // Trouve l'utilisateur dans la base de données
            Utilisateur candidat = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            System.out.println("✅ [UPLOAD CV] Utilisateur trouvé: " + candidat.getEmail());

            // Get offer
            Offre offre = offreService.getOffreById(offreId);

            if (offre == null) {
                return ResponseEntity.badRequest().body("Offer not found");
            }

            // Save CV
            CV savedCV = cvService.uploadCV(file, candidat, offre);

            return ResponseEntity.ok(savedCV);

        } catch (IllegalStateException e) {
            // Duplicate application
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    // 📋 GET tous les CVs pour une offre (pour le recruteur)
    @GetMapping("/offre/{offreId}")
    public ResponseEntity<?> getCVsByOffre(@PathVariable Long offreId) {
        try {
            // Récupère l'offre
            Offre offre = offreService.getOffreById(offreId);
            
            if (offre == null) {
                return ResponseEntity.status(404).body("Offre not found");
            }

            // Récupère tous les CVs pour cette offre
            List<CV> cvs = cvService.getCVsByOffre(offre);
            
            return ResponseEntity.ok(cvs);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // 👤 GET mes CVs (candidat connecté)
    @GetMapping("/mes-cvs")
    public ResponseEntity<?> getMesCVs(Authentication authentication) {
        try {
            // Récupère l'email depuis le token JWT
            String email = authentication.getName();
            System.out.println("🔍 [MES CVS] Recherche de l'utilisateur avec email: " + email);
            
            // Trouve l'utilisateur dans la base de données
            Utilisateur candidat = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            System.out.println("✅ [MES CVS] Utilisateur trouvé: " + candidat.getEmail() + " - Role: " + candidat.getRole());
            
            // Récupère tous les CVs de ce candidat
            List<CV> mesCVs = cvService.getCVsByCandidat(candidat);
            
            System.out.println("📋 [MES CVS] Nombre de CVs trouvés: " + mesCVs.size());
            
            return ResponseEntity.ok(mesCVs);
        } catch (Exception e) {
            System.out.println("❌ [MES CVS] Erreur: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}