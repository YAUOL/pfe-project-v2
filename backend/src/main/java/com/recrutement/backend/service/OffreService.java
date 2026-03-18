package com.recrutement.backend.service;

import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.OffreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OffreService {

    private final OffreRepository offreRepository;

    // Récupérer toutes les offres actives
    public List<Offre> getAllOffres() {
        return offreRepository.findAll();
    }

    // Récupérer les offres d'un recruteur spécifique
    public List<Offre> getOffresByRecruteur(Utilisateur recruteur) {
        return offreRepository.findByRecruteur(recruteur);
    }

    // Récupérer une offre par ID
    public Offre getOffreById(Long id) {
        return offreRepository.findById(id).orElse(null);
    }

    // Créer une nouvelle offre
    public Offre createOffre(Offre offre) {
        offre.setActive(true); // Par défaut, l'offre est active
        return offreRepository.save(offre);
    }

    // Supprimer une offre
    public void deleteOffre(Long id) {
        offreRepository.deleteById(id);
    }

    // Mettre à jour une offre
    public Offre updateOffre(Long id, Offre offreDetails) {
        Offre offre = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre not found"));

        offre.setTitre(offreDetails.getTitre());
        offre.setDescription(offreDetails.getDescription());
        offre.setLocalisation(offreDetails.getLocalisation());
        offre.setTypeContrat(offreDetails.getTypeContrat());
        offre.setCompetencesRequises(offreDetails.getCompetencesRequises());
        offre.setActive(offreDetails.isActive());

        return offreRepository.save(offre);
    }
}