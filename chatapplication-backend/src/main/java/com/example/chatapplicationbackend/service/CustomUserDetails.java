package com.example.chatapplicationbackend.service;

import com.example.chatapplicationbackend.model.User;
import com.example.chatapplicationbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetails implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        User user =  userRepository.findByUsername(username).orElseThrow(()->new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.emptyList())
                .accountLocked(false)
                .accountExpired(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();

    }
}
