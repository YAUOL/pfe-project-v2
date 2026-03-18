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
        
        // ✅ FIX : Ne pas dupliquer si prenom = nom
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
}