package com.recrutement.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private String content;
    private Long senderId;
    private String senderNom;
    private String senderPrenom;
    private Long receiverId;
    private boolean isRead;
    private LocalDateTime sentAt;
}