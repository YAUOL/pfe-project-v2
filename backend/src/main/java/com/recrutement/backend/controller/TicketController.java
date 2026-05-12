package com.recrutement.backend.controller;

import com.recrutement.backend.model.Ticket;
import com.recrutement.backend.model.TicketMessage;
import com.recrutement.backend.model.Utilisateur;
import com.recrutement.backend.repository.TicketMessageRepository;
import com.recrutement.backend.repository.TicketRepository;
import com.recrutement.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final TicketMessageRepository ticketMessageRepository;
    private final UtilisateurRepository utilisateurRepository;

    // ── Recruiter: create a ticket ─────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('RECRUTEUR')")
    public ResponseEntity<?> createTicket(
            @RequestBody Map<String, String> body,
            Authentication auth) {

        Utilisateur recruiter = utilisateurRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = Ticket.builder()
                .subject(body.get("subject"))
                .status(Ticket.TicketStatus.OPEN)
                .recruiter(recruiter)
                .build();

        Ticket saved = ticketRepository.save(ticket);
        return ResponseEntity.ok(toTicketDTO(saved));
    }

    // ── Recruiter: get their tickets ───────────────────────────────────
    @GetMapping("/my")
    @PreAuthorize("hasRole('RECRUTEUR')")
    public ResponseEntity<List<Map<String, Object>>> getMyTickets(Authentication auth) {
        Utilisateur recruiter = utilisateurRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Ticket> tickets = ticketRepository.findByRecruiterId(recruiter.getId());
        tickets.sort(Comparator.comparing(Ticket::getCreatedAt).reversed());

        return ResponseEntity.ok(tickets.stream().map(this::toTicketDTO).collect(Collectors.toList()));
    }

    // ── Admin: get all tickets ─────────────────────────────────────────
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(tickets.stream().map(this::toTicketDTO).collect(Collectors.toList()));
    }

    // ── Get messages for a ticket ──────────────────────────────────────
    @GetMapping("/{id}/messages")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMessages(@PathVariable Long id) {
        List<TicketMessage> messages = ticketMessageRepository.findByTicketIdOrderBySentAtAsc(id);
        return ResponseEntity.ok(messages.stream().map(this::toMessageDTO).collect(Collectors.toList()));
    }

    // ── Send a message in a ticket ─────────────────────────────────────
    @PostMapping("/{id}/messages")
    @PreAuthorize("hasRole('RECRUTEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() == Ticket.TicketStatus.CLOSED) {
            return ResponseEntity.badRequest().body("Ticket is closed");
        }

        Utilisateur sender = utilisateurRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TicketMessage message = TicketMessage.builder()
                .content(body.get("content"))
                .sender(sender)
                .ticket(ticket)
                .build();

        TicketMessage saved = ticketMessageRepository.save(message);
        return ResponseEntity.ok(toMessageDTO(saved));
    }

    // ── Admin: close a ticket ──────────────────────────────────────────
    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> closeTicket(@PathVariable Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(Ticket.TicketStatus.CLOSED);
        ticket.setClosedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        return ResponseEntity.ok(toTicketDTO(ticket));
    }

    // ── Helpers ────────────────────────────────────────────────────────
    private Map<String, Object> toTicketDTO(Ticket t) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", t.getId());
        map.put("subject", t.getSubject());
        map.put("status", t.getStatus().name());
        map.put("createdAt", t.getCreatedAt());
        map.put("closedAt", t.getClosedAt());
        map.put("recruiterId", t.getRecruiter().getId());
        map.put("recruiterNom", t.getRecruiter().getNom());
        map.put("recruiterPrenom", t.getRecruiter().getPrenom() != null ? t.getRecruiter().getPrenom() : "");
        map.put("recruiterEmail", t.getRecruiter().getEmail());
        return map;
    }

    private Map<String, Object> toMessageDTO(TicketMessage m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId());
        map.put("content", m.getContent());
        map.put("senderId", m.getSender().getId());
        map.put("senderNom", m.getSender().getNom());
        map.put("senderPrenom", m.getSender().getPrenom() != null ? m.getSender().getPrenom() : "");
        map.put("sentAt", m.getSentAt());
        return map;
    }
}