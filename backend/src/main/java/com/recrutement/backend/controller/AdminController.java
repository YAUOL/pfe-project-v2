package com.recrutement.backend.controller;

import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.service.OffreService;
import com.recrutement.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {

    private final UtilisateurService utilisateurService;
    private final OffreService offreService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> adminDashboard() {
        return ResponseEntity.ok("Welcome Admin!");
    }

    @GetMapping("/users")
    public ResponseEntity<List<Utilisateur>> getAllUsers() {
        return ResponseEntity.ok(utilisateurService.getAllUtilisateurs());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            Utilisateur user = utilisateurService.getUtilisateurById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole().name().equals("ADMIN")) {
                return ResponseEntity.badRequest().body("Admin account cannot be deleted");
            }

            utilisateurService.deleteUtilisateur(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting user: " + e.getMessage());
        }
    }

    @GetMapping("/offres")
    public ResponseEntity<List<Offre>> getAllOffresForAdmin() {
        return ResponseEntity.ok(offreService.getAllOffres());
    }

    @DeleteMapping("/offres/{id}")
    public ResponseEntity<?> deleteOffreByAdmin(@PathVariable Long id) {
        try {
            offreService.deleteOffre(id);
            return ResponseEntity.ok("Offre deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting offre: " + e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        List<Utilisateur> users = utilisateurService.getAllUtilisateurs();
        List<Offre> offres = offreService.getAllOffres();

        long candidats = users.stream().filter(u -> u.getRole().name().equals("CANDIDAT")).count();
        long recruteurs = users.stream().filter(u -> u.getRole().name().equals("RECRUTEUR")).count();
        long admins = users.stream().filter(u -> u.getRole().name().equals("ADMIN")).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", users.size());
        stats.put("totalCandidates", candidats);
        stats.put("totalRecruiters", recruteurs);
        stats.put("totalAdmins", admins);
        stats.put("totalOffres", offres.size());

        return ResponseEntity.ok(stats);
    }
}