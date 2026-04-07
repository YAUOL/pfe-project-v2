package com.recrutement.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OffreDTO {
    private Long id;
    private String titre;
    private String description;
    private String localisation;
    private String typeContrat;
    private String competencesRequises;
    private String company;
    private String category;
    private String experienceLevel;
    private Integer salaryMin;
    private Integer salaryMax;
    private boolean active;
    private LocalDateTime createdAt;
}