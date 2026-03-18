package com.recrutement.backend.repository;

import com.recrutement.backend.model.CV;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.model.Offre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CVRepository extends JpaRepository<CV, Long> {

    // 🔍 Get all CVs uploaded by a candidate
    List<CV> findByCandidat(Utilisateur candidat);

    // 🔍 Get all CVs submitted for a specific job offer
    List<CV> findByOffre(Offre offre);

    // 🔍 Get CV submitted by a specific candidate for a specific offer
    List<CV> findByCandidatAndOffre(Utilisateur candidat, Offre offre);

}