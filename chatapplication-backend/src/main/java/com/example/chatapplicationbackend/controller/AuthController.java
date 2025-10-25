package com.example.chatapplicationbackend.controller;

import com.example.chatapplicationbackend.dto.LoginRequestDTO;
import com.example.chatapplicationbackend.dto.LoginResponseDTO;
import com.example.chatapplicationbackend.dto.RegisterRequestDTO;
import com.example.chatapplicationbackend.dto.UserDTO;
import com.example.chatapplicationbackend.model.User;
import com.example.chatapplicationbackend.repository.UserRepository;
import com.example.chatapplicationbackend.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<UserDTO> signup(@RequestBody RegisterRequestDTO registerRequestDTO) {

        return ResponseEntity.ok(authenticationService.signup(registerRequestDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {

        LoginResponseDTO loginResponseDTO = authenticationService.login(loginRequestDTO);
        ResponseCookie responseCookie = ResponseCookie.from("JWT", loginResponseDTO.getToken())
                .sameSite("strict")
                .maxAge(1*60*60)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body(loginResponseDTO.getUserDTO());

    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication authentication) {
        return authenticationService.logout(authentication);
    }

    @GetMapping("/getonlineusers")
    public ResponseEntity<Map<String,Object>> getOnlineUsers(){
        return ResponseEntity.ok(authenticationService.getOnlineUsers());
    }

    @GetMapping("/getCurrentUser")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("USER IS NOT AUTHORIZED");
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow(()->new  RuntimeException("User not found"  )  );

        return ResponseEntity.ok(ConvertToUserDTO(user));
    }

    public UserDTO ConvertToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());

        return userDTO;
    }
}
