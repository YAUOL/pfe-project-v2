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
    private boolean active;
    private LocalDateTime createdAt;
}