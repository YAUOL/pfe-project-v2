package com.recrutement.backend.repository;

import com.recrutement.backend.model.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicketIdOrderBySentAtAsc(Long ticketId);
}