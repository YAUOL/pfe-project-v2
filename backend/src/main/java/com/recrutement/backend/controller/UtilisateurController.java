package com.recrutement.backend.controller;

import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    // 👤 GET mon profil
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            
            Utilisateur user = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Créer un DTO simple pour retourner les infos de base
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("email", user.getEmail());
            profile.put("nom", user.getNom());
            profile.put("prenom", user.getPrenom());
            profile.put("role", user.getRole().name());
            
            // Fix : Ne pas dupliquer si prenom = nom
            String fullName;
            if (user.getPrenom().equals(user.getNom())) {
                fullName = user.getPrenom();
            } else {
                fullName = user.getPrenom() + " " + user.getNom();
            }
            profile.put("fullName", fullName);
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // 📝 PUT mettre à jour mon profil
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @RequestBody Map<String, String> updates,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            
            Utilisateur user = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Mettre à jour les champs
            if (updates.containsKey("prenom")) {
                user.setPrenom(updates.get("prenom"));
            }
            if (updates.containsKey("nom")) {
                user.setNom(updates.get("nom"));
            }
            // Note: L'email ne peut pas être changé pour des raisons de sécurité
            
            // Sauvegarder
            Utilisateur updated = utilisateurService.save(user);
            
            // Retourner le profil mis à jour
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", updated.getId());
            profile.put("email", updated.getEmail());
            profile.put("nom", updated.getNom());
            profile.put("prenom", updated.getPrenom());
            profile.put("role", updated.getRole().name());
            
            String fullName;
            if (updated.getPrenom().equals(updated.getNom())) {
                fullName = updated.getPrenom();
            } else {
                fullName = updated.getPrenom() + " " + updated.getNom();
            }
            profile.put("fullName", fullName);
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}