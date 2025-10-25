package com.example.chatapplicationbackend.service;

import com.example.chatapplicationbackend.dto.LoginRequestDTO;
import com.example.chatapplicationbackend.dto.LoginResponseDTO;
import com.example.chatapplicationbackend.dto.RegisterRequestDTO;
import com.example.chatapplicationbackend.dto.UserDTO;
import com.example.chatapplicationbackend.jwt.JwtService;
import com.example.chatapplicationbackend.model.User;
import com.example.chatapplicationbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    public UserDTO signup(RegisterRequestDTO registerRequestDTO){
        if(userRepository.findByUsername(registerRequestDTO.getUsername()).isPresent()){
            throw new RuntimeException("Username is already in use");
        }

        User user = new User();
        user.setUsername(registerRequestDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        user.setEmail(registerRequestDTO.getEmail());
        user.setOnline(false);
        return convertToUserDTO(userRepository.save(user));

    }

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO){

        User user = userRepository.findByUsername(loginRequestDTO.getUsername())
                .orElseThrow(()->new  RuntimeException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequestDTO.getUsername(), loginRequestDTO.getPassword()));

        user.setOnline(true);
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);

        LoginResponseDTO loginResponseDTO = new LoginResponseDTO();
        loginResponseDTO.setUserDTO(convertToUserDTO(user));
        loginResponseDTO.setToken(jwtToken);
        return loginResponseDTO;


        //throw new RuntimeException("Username is already in use");


    }

    public ResponseEntity<String>  logout(Authentication authentication){

        if (authentication != null) {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElse(null);

            // --- ADD THIS BLOCK ---
            if (user != null) {
                user.setOnline(false);
                userRepository.save(user);
            }
            // ----------------------
        }

        ResponseCookie responseCookie = ResponseCookie.from("JWT","")
                .httpOnly(true)
                .maxAge(0)
                .secure(true)
                .path("/")
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body("Logged Out Successfully");
    }

    public UserDTO convertToUserDTO(User user){
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());

        return userDTO;
    }

    public Map<String,Object>  getOnlineUsers(){
        List<User> usersList = userRepository.findByIsOnlineTrue();
        System.out.println("usersList: " + usersList);
        Map<String,Object> onlineUsers = usersList.stream().collect(Collectors.toMap(User::getUsername, user->user));
        return onlineUsers;

    }



}
