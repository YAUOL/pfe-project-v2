package com.recrutement.backend.service;

import com.recrutement.backend.dto.LoginRequest;
import com.recrutement.backend.dto.RegisterRequest;
import com.recrutement.backend.model.Role;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;

    // ✅ Register
    public Utilisateur register(RegisterRequest request) {

        // check if email already exists
        Optional<Utilisateur> existingUser =
                utilisateurRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Utilisateur user = new Utilisateur();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // later we will hash
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setRole(Role.CANDIDAT); // default role

        return utilisateurRepository.save(user);
    }

    // ✅ Login
    public Utilisateur login(LoginRequest request) {

        Utilisateur user = utilisateurRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}
