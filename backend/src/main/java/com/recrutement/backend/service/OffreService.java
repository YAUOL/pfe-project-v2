package com.recrutement.backend.service;

import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.OffreRepository;
import com.recrutement.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OffreService {

    private final OffreRepository offreRepository;
    private final UtilisateurRepository utilisateurRepository;

    public List<Offre> getAllOffres() {
        return offreRepository.findAll();
    }

    public Offre getOffreById(Long id) {
        return offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée avec l'id: " + id));
    }

    public List<Offre> getOffresByRecruteur(Long recruteurId) {
        return offreRepository.findByRecruteurId(recruteurId);
    }

    public List<Offre> getActiveOffres() {
        return offreRepository.findByActiveTrue()
                .stream()
                .filter(o -> !"DELETED".equalsIgnoreCase(o.getStatus()))
                .filter(o -> !o.isDisabledByAdmin())
                .collect(Collectors.toList());
    }

    public List<Offre> searchOffres(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllOffres().stream()
                    .filter(o -> !"DELETED".equalsIgnoreCase(o.getStatus()))
                    .filter(o -> !o.isDisabledByAdmin())
                    .collect(Collectors.toList());
        }
        return offreRepository.searchByKeyword(keyword).stream()
                .filter(o -> !"DELETED".equalsIgnoreCase(o.getStatus()))
                .filter(o -> !o.isDisabledByAdmin())
                .collect(Collectors.toList());
    }

    @Transactional
    public Offre createOffre(Offre offre, String recruteurEmail) {
        Utilisateur recruteur = utilisateurRepository.findByEmail(recruteurEmail)
                .orElseThrow(() -> new RuntimeException("Recruteur non trouvé: " + recruteurEmail));

        offre.setRecruteur(recruteur);
        if (offre.getActive() == null) offre.setActive(true);
        if (offre.getCreatedAt() == null) offre.setCreatedAt(LocalDateTime.now());
        if (offre.getUpdatedAt() == null) offre.setUpdatedAt(offre.getCreatedAt());
        if (offre.getStatus() == null) offre.setStatus("ACTIVE");
        offre.setDisabledByAdmin(false);

        return offreRepository.save(offre);
    }

    @Transactional
    public Offre updateOffre(Long id, Offre offreDetails) {
        Offre offre = getOffreById(id);

        if (offreDetails.getTitre() != null) offre.setTitre(offreDetails.getTitre());
        if (offreDetails.getDescription() != null) offre.setDescription(offreDetails.getDescription());
        if (offreDetails.getLocalisation() != null) offre.setLocalisation(offreDetails.getLocalisation());
        if (offreDetails.getTypeContrat() != null) offre.setTypeContrat(offreDetails.getTypeContrat());
        if (offreDetails.getCompetencesRequises() != null) offre.setCompetencesRequises(offreDetails.getCompetencesRequises());
        if (offreDetails.getCompany() != null) offre.setCompany(offreDetails.getCompany());
        if (offreDetails.getCategory() != null) offre.setCategory(offreDetails.getCategory());
        if (offreDetails.getExperienceLevel() != null) offre.setExperienceLevel(offreDetails.getExperienceLevel());
        if (offreDetails.getSalaryMin() != null) offre.setSalaryMin(offreDetails.getSalaryMin());
        if (offreDetails.getSalaryMax() != null) offre.setSalaryMax(offreDetails.getSalaryMax());
        if (offreDetails.getActive() != null) offre.setActive(offreDetails.getActive());

        offre.setStatus("UPDATED");
        offre.setUpdatedAt(LocalDateTime.now());

        return offreRepository.save(offre);
    }

    @Transactional
    public void deleteOffre(Long id) {
        Offre offre = offreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée: " + id));
        offre.setActive(false);
        offre.setStatus("DELETED");
        offre.setUpdatedAt(LocalDateTime.now());
        offreRepository.save(offre);
    }

    @Transactional
    public Offre toggleOffreStatus(Long id) {
        Offre offre = getOffreById(id);

        // Block recruiter if admin disabled it
        if (offre.isDisabledByAdmin()) {
            throw new RuntimeException("This offer has been deactivated by an admin and cannot be toggled.");
        }

        boolean newActive = !Boolean.TRUE.equals(offre.getActive());
        offre.setActive(newActive);

        if (!"DELETED".equalsIgnoreCase(offre.getStatus())) {
            offre.setStatus(newActive ? "ACTIVE" : "CLOSED");
            offre.setUpdatedAt(LocalDateTime.now());
        }

        return offreRepository.save(offre);
    }

    // ── Admin deactivate — sets disabledByAdmin = true, recruiter can't re-enable ──
    @Transactional
    public Offre adminDeactivateOffre(Long id) {
        Offre offre = getOffreById(id);
        offre.setActive(false);
        offre.setDisabledByAdmin(true);
        offre.setStatus("CLOSED");
        offre.setUpdatedAt(LocalDateTime.now());
        return offreRepository.save(offre);
    }

    public long countOffresByRecruteur(Long recruteurId) {
        return offreRepository.countByRecruteurId(recruteurId);
    }

    public long countActiveOffres() {
        return offreRepository.countActiveOffres();
    }

    @Transactional
    public Offre setOffreActive(Long offreId, boolean active, String actorEmail) {
        Offre offre = getOffreById(offreId);

        Utilisateur actor = utilisateurRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + actorEmail));

        // Block recruiter if admin disabled it
        if (offre.isDisabledByAdmin() && actor.getRole() == com.recrutement.backend.model.Role.RECRUTEUR) {
            throw new RuntimeException("This offer has been deactivated by an admin.");
        }

        if (actor.getRole() == com.recrutement.backend.model.Role.RECRUTEUR) {
            if (!actorEmail.equals(offre.getRecruteur().getEmail())) {
                throw new RuntimeException("Forbidden: not your offer");
            }
        }

        offre.setActive(active);
        if (!"DELETED".equalsIgnoreCase(offre.getStatus())) {
            offre.setStatus(active ? "ACTIVE" : "CLOSED");
            offre.setUpdatedAt(LocalDateTime.now());
        }
        return offreRepository.save(offre);
    }
}