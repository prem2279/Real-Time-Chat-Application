package com.example.chatapplicationbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ChatapplicationbackendApplication {

    public static void main(String[] args) {
        System.out.println("Working directory: " + System.getProperty("user.dir"));

        SpringApplication.run(ChatapplicationbackendApplication.class, args);
    }

}
