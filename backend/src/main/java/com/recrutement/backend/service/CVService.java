package com.recrutement.backend.service;

import com.recrutement.backend.model.CV;
import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.CVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CVService {

    private final CVRepository cvRepository;

    // 📁 Folder where CVs will be stored
    private final String uploadDir = "uploads/";

    // 📥 Upload and save CV
public CV uploadCV(MultipartFile file, Utilisateur candidat, Offre offre) throws IOException {

    // ⚠️ CHECK: Has this candidate already applied to this offer?
    List<CV> existingApplications = cvRepository.findByCandidatAndOffre(candidat, offre);
    
    if (!existingApplications.isEmpty()) {
        throw new IllegalStateException("Vous avez déjà postulé à cette offre");
    }

    // Create uploads folder if it doesn't exist
    Path uploadPath = Paths.get(uploadDir);

        // Generate unique filename
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // Save file to disk
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Create CV entity
        CV cv = new CV();
        cv.setNomFichier(file.getOriginalFilename());
        cv.setCheminFichier(filePath.toString());
        cv.setCandidat(candidat);
        cv.setOffre(offre);

        return cvRepository.save(cv);
    }

    // 📄 Get CV by id
    public CV getCVById(Long id) {
        return cvRepository.findById(id).orElse(null);
    }

    // 👤 Get CVs of a candidate
    public List<CV> getCVsByCandidat(Utilisateur candidat) {
        return cvRepository.findByCandidat(candidat);
    }

    // 📑 Get CVs for an offer
    public List<CV> getCVsByOffre(Offre offre) {
        return cvRepository.findByOffre(offre);
    }

    // ❌ Delete CV
    public void deleteCV(Long id) {
        cvRepository.deleteById(id);
    }
    
}