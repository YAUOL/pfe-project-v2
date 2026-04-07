package com.recrutement.backend.config;

import com.recrutement.backend.model.Role;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@itgate.com";

        if (utilisateurRepository.findByEmail(adminEmail).isEmpty()) {
            Utilisateur admin = new Utilisateur();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin123!"));
            admin.setNom("Admin");
            admin.setPrenom("System");
            admin.setRole(Role.ADMIN);

            utilisateurRepository.save(admin);

            System.out.println("✅ Default admin account created: " + adminEmail);
        } else {
            System.out.println("ℹ️ Admin account already exists");
        }
    }
}