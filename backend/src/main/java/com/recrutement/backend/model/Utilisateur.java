package com.recrutement.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity  // ← This makes it a database table
@Table(name = "utilisateurs")  // ← Table name
@Data  // ← Lombok: auto-generates getters/setters
@NoArgsConstructor  // ← Auto-generates empty constructor
@AllArgsConstructor  // ← Auto-generates constructor with all fields
public class Utilisateur {

    @Id  // ← Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← Auto-increment
    private Long id;

    @Column(nullable = false, unique = true)  // ← Email must be unique
    private String email;

    @Column(nullable = false)  // ← Password is required
    private String password;

    @Column(nullable = false)
    private String nom;

    private String prenom;  // ← Optional field (no @Column)

    @Enumerated(EnumType.STRING)  // ← Store enum as text (not number)
    @Column(nullable = false)
    private Role role;  // ← CANDIDAT, RECRUTEUR, or ADMIN

    @CreationTimestamp  // ← Auto-fills with current date/time
    @Column(updatable = false)  // ← Can't be changed after creation
    private LocalDateTime createdAt;
}