package com.recrutement.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(nullable = false)
    private String nomFichier;

    @Column(nullable = false)
    private String cheminFichier;

    @Column(columnDefinition = "TEXT")
    private String texteExtrait;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidat_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private Utilisateur candidat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "offre_id", nullable = false)
    @JsonIgnoreProperties({"recruteur", "hibernateLazyInitializer", "handler"})
    private Offre offre;

    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCandidature statut = StatutCandidature.PENDING;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (statut == null) {
            statut = StatutCandidature.PENDING;
        }
    }

    public enum StatutCandidature {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}