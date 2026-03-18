package com.recrutement.backend.controller;

import com.recrutement.backend.dto.LoginRequest;
import com.recrutement.backend.dto.LoginResponse;
import com.recrutement.backend.dto.RegisterRequest;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.security.JwtService;
import com.recrutement.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurService utilisateurService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder; // ← inject it

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setPassword(request.getPassword());
        utilisateur.setRole(request.getRole());

        Utilisateur savedUser = utilisateurService.createUtilisateur(utilisateur);

        return ResponseEntity.ok("User registered successfully with ID: " + savedUser.getId());
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<Utilisateur> userOpt = utilisateurService.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        Utilisateur utilisateur = userOpt.get();

        // ✅ Use passwordEncoder.matches instead of equals
        if (!passwordEncoder.matches(request.getPassword(), utilisateur.getPassword())) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        String token = jwtService.generateToken(utilisateur.getEmail());

        return ResponseEntity.ok(new LoginResponse(
                token,
                utilisateur.getEmail(),
                utilisateur.getRole().name()));
    }
}