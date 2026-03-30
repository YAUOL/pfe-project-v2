package com.recrutement.backend.repository;

import com.recrutement.backend.model.CV;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.model.Offre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CVRepository extends JpaRepository<CV, Long> {

    List<CV> findByCandidat(Utilisateur candidat);

    List<CV> findByOffre(Offre offre);

    List<CV> findByCandidatAndOffre(Utilisateur candidat, Offre offre);
}