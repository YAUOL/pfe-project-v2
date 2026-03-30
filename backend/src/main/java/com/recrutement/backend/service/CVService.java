package com.recrutement.backend.service;

import com.recrutement.backend.model.CV;
import com.recrutement.backend.model.Offre;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.CVRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
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
    private final String uploadDir = "uploads/";

    // ─────────────────────────────────────────────
    // Upload and save CV
    // ─────────────────────────────────────────────
    public CV uploadCV(MultipartFile file, Utilisateur candidat, Offre offre) throws IOException {

        // Check duplicate application
        List<CV> existingApplications = cvRepository.findByCandidatAndOffre(candidat, offre);
        if (!existingApplications.isEmpty()) {
            throw new IllegalStateException("Vous avez déjà postulé à cette offre");
        }

        // Create uploads folder if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Extract text based on file type
        String extractedText = extractText(file.getOriginalFilename(), filePath);

        // Create CV entity
        CV cv = new CV();
        cv.setNomFichier(file.getOriginalFilename());
        cv.setCheminFichier(filePath.toString());
        cv.setTexteExtrait(extractedText);
        cv.setCandidat(candidat);
        cv.setOffre(offre);
        cv.setStatut(CV.StatutCandidature.PENDING);

        return cvRepository.save(cv);
    }

    // ─────────────────────────────────────────────
    // Extract text based on file type
    // ─────────────────────────────────────────────
    private String extractText(String originalFileName, Path filePath) {
        if (originalFileName == null) return "";

        String fileName = originalFileName.toLowerCase();

        if (fileName.endsWith(".pdf")) {
            return extractFromPdf(filePath);
        } else if (fileName.endsWith(".docx")) {
            return extractFromDocx(filePath);
        } else if (fileName.endsWith(".doc")) {
            return extractFromDoc(filePath);
        } else {
            System.out.println("[EXTRACT] Unsupported file type: " + originalFileName);
            return "";
        }
    }

    // ─────────────────────────────────────────────
    // Extract from PDF
    // ─────────────────────────────────────────────
    private String extractFromPdf(Path filePath) {
        try (PDDocument document = Loader.loadPDF(filePath.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            System.out.println("[PDF] Extracted " + text.length() + " characters");
            return text;
        } catch (Exception e) {
            System.err.println("[PDF] Error: " + e.getMessage());
            return "";
        }
    }

    // ─────────────────────────────────────────────
    // Extract from DOCX
    // ─────────────────────────────────────────────
    private String extractFromDocx(Path filePath) {
        try (XWPFDocument doc = new XWPFDocument(new FileInputStream(filePath.toFile()))) {
            StringBuilder sb = new StringBuilder();

            // Extract paragraphs
            for (XWPFParagraph para : doc.getParagraphs()) {
                String text = para.getText();
                if (text != null && !text.trim().isEmpty()) {
                    sb.append(text).append("\n");
                }
            }

            // Extract tables
            for (XWPFTable table : doc.getTables()) {
                for (XWPFTableRow row : table.getRows()) {
                    for (XWPFTableCell cell : row.getTableCells()) {
                        String text = cell.getText();
                        if (text != null && !text.trim().isEmpty()) {
                            sb.append(text).append(" ");
                        }
                    }
                    sb.append("\n");
                }
            }

            String text = sb.toString().trim();
            System.out.println("[DOCX] Extracted " + text.length() + " characters");
            if (text.length() > 0) {
                System.out.println("[DOCX] Preview: "
                        + text.substring(0, Math.min(200, text.length())));
            }
            return text;

        } catch (Exception e) {
            System.err.println("[DOCX] Error: " + e.getMessage());
            return "";
        }
    }

    // ─────────────────────────────────────────────
    // Extract from DOC (old Word format)
    // ─────────────────────────────────────────────
    private String extractFromDoc(Path filePath) {
        try (HWPFDocument doc = new HWPFDocument(new FileInputStream(filePath.toFile()))) {
            String text = doc.getDocumentText();
            System.out.println("[DOC] Extracted " + text.length() + " characters");
            return text;
        } catch (Exception e) {
            System.err.println("[DOC] Error: " + e.getMessage());
            return "";
        }
    }

    // ─────────────────────────────────────────────
    // Re-extract text for existing CV
    // ─────────────────────────────────────────────
    public CV reExtractText(Long cvId) {
        CV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new RuntimeException("CV not found: " + cvId));

        Path filePath = Paths.get(cv.getCheminFichier());
        if (!Files.exists(filePath)) {
            System.err.println("[RE-EXTRACT] File not found: " + cv.getCheminFichier());
            return cv;
        }

        String text = extractText(cv.getNomFichier(), filePath);
        cv.setTexteExtrait(text);
        CV saved = cvRepository.save(cv);
        System.out.println("[RE-EXTRACT] CV " + cvId + " → " + text.length() + " chars");
        return saved;
    }

    // ─────────────────────────────────────────────
    // Save CV
    // ─────────────────────────────────────────────
    public CV save(CV cv) {
        return cvRepository.save(cv);
    }

    // ─────────────────────────────────────────────
    // Get CV by id
    // ─────────────────────────────────────────────
    public CV getCVById(Long id) {
        return cvRepository.findById(id).orElse(null);
    }

    // ─────────────────────────────────────────────
    // Get CVs of a candidate
    // ─────────────────────────────────────────────
    public List<CV> getCVsByCandidat(Utilisateur candidat) {
        return cvRepository.findByCandidat(candidat);
    }

    // ─────────────────────────────────────────────
    // Get CVs for an offer
    // ─────────────────────────────────────────────
    public List<CV> getCVsByOffre(Offre offre) {
        return cvRepository.findByOffre(offre);
    }

    // ─────────────────────────────────────────────
    // Delete CV
    // ─────────────────────────────────────────────
    public void deleteCV(Long id) {
        cvRepository.deleteById(id);
    }
}