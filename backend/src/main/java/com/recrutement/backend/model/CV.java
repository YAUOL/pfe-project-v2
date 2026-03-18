package com.recrutement.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cvs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CV {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Original file name
    @Column(nullable = false)
    private String nomFichier;

    // File path where the CV is stored
    @Column(nullable = false)
    private String cheminFichier;

    // Text extracted from the CV (used by AI later)
    @Column(columnDefinition = "TEXT")
    private String texteExtrait;

    // Candidate who uploaded the CV
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidat_id", nullable = false)
    private Utilisateur candidat;

    // Job offer the candidate applied to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offre_id", nullable = false)
    private Offre offre;

    // Upload date
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;
}