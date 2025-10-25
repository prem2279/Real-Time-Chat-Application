package com.example.chatapplicationbackend.listener;

import com.example.chatapplicationbackend.model.ChatMessage;
// You may not need this repository if you don't save LEAVE messages
// import com.example.chatapp.repository.ChatMessageReository;
import com.example.chatapplicationbackend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener; // <-- FIX: Import this
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime; // <-- FIX: Import this
import java.util.Map; // <-- FIX: Import this

@Component
public class WebSocketListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketListener.class);

    @Autowired
    private UserService userService;

    // FIX 2: Add @Autowired to initialize the messagingTemplate
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    // FIX 1: Add the @EventListener annotation
    @EventListener
    public void handleWebsocketConnetListener(SessionConnectedEvent event) {
        logger.info("Connected to websocket");
    }

    // FIX 1: Add the @EventListener annotation
    @EventListener
    public void handleWebsocketDisconnectListener(SessionDisconnectEvent event) {

        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // FIX 3: Add null checks to prevent NullPointerException
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null) {
            String userName = (String) sessionAttributes.get("username");

            if (userName != null) {
                logger.info(userName + " disconnected from websocket");

                // Set user offline in DB
                userService.setUserOnlineStatus(userName, false);

                // Create and send the LEAVE message
                ChatMessage chatMessage = new ChatMessage();
                chatMessage.setType(ChatMessage.MessageType.LEAVE);
                chatMessage.setSender(userName);
                chatMessage.setMessage(userName + " has left"); // Optional message
                chatMessage.setTimestamp(LocalDateTime.now()); // Optional timestamp

                messagingTemplate.convertAndSend("/topic/public", chatMessage);
            }
        } else {
            logger.warn("Disconnect event with no session attributes.");
        }
    }
}