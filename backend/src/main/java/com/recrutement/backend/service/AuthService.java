package com.recrutement.backend.service;

import com.recrutement.backend.dto.LoginRequest;
import com.recrutement.backend.dto.RegisterRequest;
import com.recrutement.backend.model.Role;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public Utilisateur register(RegisterRequest request) {

        Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        if (request.getRole() == Role.ADMIN) {
            throw new RuntimeException("You cannot register as ADMIN");
        }

        Utilisateur user = new Utilisateur();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());

        if (request.getRole() == Role.RECRUTEUR) {
            user.setRole(Role.RECRUTEUR);
        } else {
            user.setRole(Role.CANDIDAT);
        }

        return utilisateurRepository.save(user);
    }

    public Utilisateur login(LoginRequest request) {

        Utilisateur user = utilisateurRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}