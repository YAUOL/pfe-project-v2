package com.recrutement.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "matching_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchingScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id")
    private CV cv;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offre_id")
    private Offre offre;

    @Column(nullable = false)
    private Double score; // Score entre 0.0 et 1.0

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime calculatedAt;
}