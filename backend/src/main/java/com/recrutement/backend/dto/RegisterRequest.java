package com.recrutement.backend.dto;

import com.recrutement.backend.model.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String nom;
    private String prenom;
    private String email;
    private String password;
    private Role role;  
}