package com.example.chatapplicationbackend.dto;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class UserDTO {
    private long id;

    @Column(unique=true,nullable=false)
    private String username;

    @Column(unique=true,nullable = false)
    private String email;

    @Column(nullable=false)
    private String password;

    @Column(nullable=false, name="is_online")
    private boolean isOnline;

}
