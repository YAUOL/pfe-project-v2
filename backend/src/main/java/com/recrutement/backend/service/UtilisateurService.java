package com.recrutement.backend.service;

import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ Create user WITH HASH
    public Utilisateur createUtilisateur(Utilisateur utilisateur) {

        // 🔐 HASH PASSWORD
        utilisateur.setPassword(passwordEncoder.encode(utilisateur.getPassword()));

        return utilisateurRepository.save(utilisateur);
    }

    // ✅ Find by email
    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    // ✅ Get all users
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    // ✅ Get user by id
    public Optional<Utilisateur> getUtilisateurById(Long id) {
        return utilisateurRepository.findById(id);
    }

    // ✅ Delete user
    public void deleteUtilisateur(Long id) {
        utilisateurRepository.deleteById(id);
    }

    // ✅ Check password
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

}