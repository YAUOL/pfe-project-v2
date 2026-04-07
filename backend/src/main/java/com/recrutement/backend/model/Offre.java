package com.recrutement.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "offres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String localisation;

    @Column(name = "type_contrat")
    private String typeContrat;

    @Column(name = "competences_requises", columnDefinition = "TEXT")
    private String competencesRequises;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String category;

    @Column(name = "experience_level", nullable = false)
    private String experienceLevel;

    @Column(name = "salary_min", nullable = false)
    private Integer salaryMin;

    @Column(name = "salary_max", nullable = false)
    private Integer salaryMax;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruteur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Utilisateur recruteur;

    @OneToMany(mappedBy = "offre", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"offre", "hibernateLazyInitializer", "handler"})
    private List<CV> cvs;

    @OneToMany(mappedBy = "offre", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"offre", "hibernateLazyInitializer", "handler"})
    private List<MatchingScore> matchingScores;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (active == null) {
            active = true;
        }
        if (cvs == null) {
            cvs = new ArrayList<>();
        }
        if (matchingScores == null) {
            matchingScores = new ArrayList<>();
        }
    }
}