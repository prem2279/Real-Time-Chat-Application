package com.example.chatapplicationbackend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name="chats")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false)
    private String message;

    @Column
    private String receiver;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column
    private String color;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    public enum MessageType {
        CHAT, PRIVATE_MESSAGE, JOIN, LEAVE, TYPING
    }
}
