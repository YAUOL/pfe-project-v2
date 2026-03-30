package com.recrutement.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CVDTO {
    private Long id;
    private String nomFichier;
    private String statut;
    private LocalDateTime uploadedAt;

    // Infos candidat
    private Long candidatId;
    private String candidatNom;
    private String candidatPrenom;
    private String candidatEmail;

    // Score IA (null si pas encore calculé)
    private Double matchingScore;
}