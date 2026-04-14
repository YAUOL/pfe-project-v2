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
        log.info("📋 Récupération de toutes les offres");
        return offreRepository.findAll();
    }

    public Offre getOffreById(Long id) {
        log.info("🔍 Recherche de l'offre avec id: {}", id);
        return offreRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("❌ Offre non trouvée avec l'id: {}", id);
                    return new RuntimeException("Offre non trouvée avec l'id: " + id);
                });
    }

    public List<Offre> getOffresByRecruteur(Long recruteurId) {
        log.info("👤 Récupération des offres du recruteur id: {}", recruteurId);
        return offreRepository.findByRecruteurId(recruteurId);
    }

    public List<Offre> getActiveOffres() {
        log.info("✅ Récupération des offres actives");
        // Exclure celles marquées supprimées (status = DELETED)
        return offreRepository.findByActiveTrue()
                .stream()
                .filter(o -> !"DELETED".equalsIgnoreCase(o.getStatus()))
                .collect(Collectors.toList());
    }

    public List<Offre> searchOffres(String keyword) {
        log.info("🔎 Recherche d'offres avec le mot-clé: {}", keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllOffres().stream()
                    .filter(o -> !"DELETED".equalsIgnoreCase(o.getStatus()))
                    .collect(Collectors.toList());
        }
        return offreRepository.searchByKeyword(keyword).stream()
                .filter(o -> !"DELETED".equalsIgnoreCase(o.getStatus()))
                .collect(Collectors.toList());
    }

    @Transactional
    public Offre createOffre(Offre offre, String recruteurEmail) {
        log.info("➕ Création d'une nouvelle offre par le recruteur email: {}", recruteurEmail);

        Utilisateur recruteur = utilisateurRepository.findByEmail(recruteurEmail)
                .orElseThrow(() -> {
                    log.error("❌ Recruteur non trouvé avec l'email: {}", recruteurEmail);
                    return new RuntimeException("Recruteur non trouvé avec l'email: " + recruteurEmail);
                });

        offre.setRecruteur(recruteur);

        if (offre.getActive() == null) {
            offre.setActive(true);
        }
        if (offre.getCreatedAt() == null) {
            offre.setCreatedAt(LocalDateTime.now());
        }
        if (offre.getUpdatedAt() == null) {
            offre.setUpdatedAt(offre.getCreatedAt());
        }
        if (offre.getStatus() == null) {
            offre.setStatus("ACTIVE");
        }

        Offre savedOffre = offreRepository.save(offre);
        log.info("✅ Offre créée avec succès, id: {}", savedOffre.getId());

        return savedOffre;
    }

    @Transactional
    public Offre updateOffre(Long id, Offre offreDetails) {
        log.info("✏️ Mise à jour de l'offre id: {}", id);

        Offre offre = getOffreById(id);

        if (offreDetails.getTitre() != null) {
            offre.setTitre(offreDetails.getTitre());
        }
        if (offreDetails.getDescription() != null) {
            offre.setDescription(offreDetails.getDescription());
        }
        if (offreDetails.getLocalisation() != null) {
            offre.setLocalisation(offreDetails.getLocalisation());
        }
        if (offreDetails.getTypeContrat() != null) {
            offre.setTypeContrat(offreDetails.getTypeContrat());
        }
        if (offreDetails.getCompetencesRequises() != null) {
            offre.setCompetencesRequises(offreDetails.getCompetencesRequises());
        }
        if (offreDetails.getCompany() != null) {
            offre.setCompany(offreDetails.getCompany());
        }
        if (offreDetails.getCategory() != null) {
            offre.setCategory(offreDetails.getCategory());
        }
        if (offreDetails.getExperienceLevel() != null) {
            offre.setExperienceLevel(offreDetails.getExperienceLevel());
        }
        if (offreDetails.getSalaryMin() != null) {
            offre.setSalaryMin(offreDetails.getSalaryMin());
        }
        if (offreDetails.getSalaryMax() != null) {
            offre.setSalaryMax(offreDetails.getSalaryMax());
        }
        if (offreDetails.getActive() != null) {
            offre.setActive(offreDetails.getActive());
        }

        // Mark as UPDATED so candidates can see it changed
        offre.setStatus("UPDATED");
        offre.setUpdatedAt(LocalDateTime.now());

        Offre updatedOffre = offreRepository.save(offre);
        log.info("✅ Offre mise à jour avec succès, id: {}", updatedOffre.getId());

        return updatedOffre;
    }

    @Transactional
    public void deleteOffre(Long id) {
        log.info("🗑️ Soft delete de l'offre id: {}", id);

        Offre offre = offreRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("❌ Offre non trouvée avec l'id: {}", id);
                    return new RuntimeException("Offre non trouvée avec l'id: " + id);
                });

        // Soft delete: conserver l'offre pour l'historique candidat
        offre.setActive(false);
        offre.setStatus("DELETED");
        offre.setUpdatedAt(LocalDateTime.now());
        offreRepository.save(offre);

        log.info("✅ Offre {} marquée comme supprimée (soft delete)", id);
    }

    @Transactional
    public Offre toggleOffreStatus(Long id) {
        log.info("🔄 Changement du statut de l'offre id: {}", id);

        Offre offre = getOffreById(id);
        boolean newActive = !Boolean.TRUE.equals(offre.getActive());
        offre.setActive(newActive);

        // Ne pas écraser l'état DELETED
        if (!"DELETED".equalsIgnoreCase(offre.getStatus())) {
            offre.setStatus(newActive ? "ACTIVE" : "CLOSED");
            offre.setUpdatedAt(LocalDateTime.now());
        }

        Offre updatedOffre = offreRepository.save(offre);
        log.info("✅ Statut de l'offre {}: active={}, status={}", id, updatedOffre.getActive(), updatedOffre.getStatus());

        return updatedOffre;
    }

    public long countOffresByRecruteur(Long recruteurId) {
        log.info("📊 Comptage des offres du recruteur id: {}", recruteurId);
        return offreRepository.countByRecruteurId(recruteurId);
    }

    public long countActiveOffres() {
        log.info("📊 Comptage des offres actives");
        return offreRepository.countActiveOffres();
    }

    @Transactional
    public Offre setOffreActive(Long offreId, boolean active, String actorEmail) {

        Offre offre = getOffreById(offreId);

        Utilisateur actor = utilisateurRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + actorEmail));

        // Recruiter can only change his own offers
        if (actor.getRole() == com.recrutement.backend.model.Role.RECRUTEUR) {
            String ownerEmail = offre.getRecruteur().getEmail();
            if (!actorEmail.equals(ownerEmail)) {
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