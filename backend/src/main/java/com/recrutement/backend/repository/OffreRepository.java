package com.recrutement.backend.repository;

import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Utilisateur;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffreRepository extends JpaRepository<Offre, Long> {

    List<Offre> findByActiveTrue();
    List<Offre> findByRecruteur(Utilisateur recruteur);
}