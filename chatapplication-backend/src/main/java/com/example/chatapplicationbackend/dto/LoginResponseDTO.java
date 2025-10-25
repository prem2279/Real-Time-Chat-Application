package com.example.chatapplicationbackend.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {
    private String token;
    private UserDTO userDTO;
}
