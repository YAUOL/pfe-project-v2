package com.recrutement.backend.controller;

import com.recrutement.backend.model.Utilisateur;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/secure")
    public String secureEndpoint(Authentication authentication) {
        Utilisateur currentUser = (Utilisateur) authentication.getPrincipal();
        return "Hello " + currentUser.getEmail() + ", your role is " + currentUser.getRole();
    }
}