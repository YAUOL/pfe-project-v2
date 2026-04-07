package com.recrutement.backend.controller;

import com.recrutement.backend.dto.LoginRequest;
import com.recrutement.backend.dto.LoginResponse;
import com.recrutement.backend.dto.RegisterRequest;
import com.recrutement.backend.model.Role;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.security.JwtService;
import com.recrutement.backend.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurService utilisateurService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (utilisateurService.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(409).body("Email already exists");
            }

            // Block public ADMIN registration
            if (request.getRole() == Role.ADMIN) {
                return ResponseEntity.status(403).body("You cannot register as ADMIN");
            }

            Utilisateur newUser = new Utilisateur();
            newUser.setEmail(request.getEmail());
            newUser.setPassword(request.getPassword());
            newUser.setNom(request.getNom());
            newUser.setPrenom(request.getPrenom());

            // Allow only CANDIDAT or RECRUTEUR
            if (request.getRole() == Role.RECRUTEUR) {
                newUser.setRole(Role.RECRUTEUR);
            } else {
                newUser.setRole(Role.CANDIDAT);
            }

            utilisateurService.createUtilisateur(newUser);

            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<Utilisateur> userOpt = utilisateurService.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        Utilisateur utilisateur = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), utilisateur.getPassword())) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        String token = jwtService.generateToken(utilisateur.getEmail());

        return ResponseEntity.ok(new LoginResponse(
                token,
                utilisateur.getEmail(),
                utilisateur.getRole().name()
        ));
    }
}