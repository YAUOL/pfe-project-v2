package com.recrutement.backend.controller;

import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.service.OffreService;
import com.recrutement.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offres")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OffreController {

    private final OffreService offreService;
    private final UtilisateurService utilisateurService;

    // GET toutes les offres (public)
    @GetMapping
    public ResponseEntity<List<Offre>> getAllOffres() {
        List<Offre> offres = offreService.getAllOffres();
        return ResponseEntity.ok(offres);
    }

    // GET mes offres (recruteur connecté)
    @GetMapping("/mes-offres")
    public ResponseEntity<?> getMesOffres(Authentication authentication) {
        try {
            // Récupérer l'email depuis le token JWT
            String email = authentication.getName();
            System.out.println("🔍 [MES OFFRES] Recherche recruteur avec email: " + email);
            
            // Trouver l'utilisateur dans la base de données
            Utilisateur recruteur = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Recruteur not found: " + email));
            
            System.out.println("✅ [MES OFFRES] Recruteur trouvé: " + recruteur.getEmail());
            
            // Récupérer toutes les offres de ce recruteur
            List<Offre> mesOffres = offreService.getOffresByRecruteur(recruteur);
            
            System.out.println("💼 [MES OFFRES] Nombre d'offres trouvées: " + mesOffres.size());
            
            return ResponseEntity.ok(mesOffres);
        } catch (Exception e) {
            System.out.println("❌ [MES OFFRES] Erreur: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // GET une offre par ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOffreById(@PathVariable Long id) {
        try {
            Offre offre = offreService.getOffreById(id);
            if (offre == null) {
                return ResponseEntity.status(404).body("Offre not found");
            }
            return ResponseEntity.ok(offre);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // POST créer une nouvelle offre
    @PostMapping
    public ResponseEntity<?> createOffre(@RequestBody Offre offre, Authentication authentication) {
        try {
            // Récupérer l'email depuis le token JWT
            String email = authentication.getName();
            
            // Trouver l'utilisateur dans la base de données
            Utilisateur recruteur = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Recruteur not found: " + email));
            
            // Associer le recruteur à l'offre
            offre.setRecruteur(recruteur);
            
            // Sauvegarder l'offre
            Offre savedOffre = offreService.createOffre(offre);
            
            return ResponseEntity.ok(savedOffre);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // DELETE supprimer une offre
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOffre(@PathVariable Long id, Authentication authentication) {
        try {
            // Récupérer l'email depuis le token JWT
            String email = authentication.getName();
            
            // Trouver l'utilisateur dans la base de données
            Utilisateur recruteur = utilisateurService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Recruteur not found: " + email));
            
            // Vérifier que l'offre existe et appartient au recruteur
            Offre offre = offreService.getOffreById(id);
            if (offre == null) {
                return ResponseEntity.status(404).body("Offre not found");
            }
            
            if (!offre.getRecruteur().getId().equals(recruteur.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to delete this offer");
            }
            
            // Supprimer l'offre
            offreService.deleteOffre(id);
            
            return ResponseEntity.ok("Offre deleted successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}