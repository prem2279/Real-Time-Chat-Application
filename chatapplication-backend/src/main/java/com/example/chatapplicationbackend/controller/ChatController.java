package com.example.chatapplicationbackend.controller;

import com.example.chatapplicationbackend.model.ChatMessage;
import com.example.chatapplicationbackend.repository.ChatMessageReository;
import com.example.chatapplicationbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private UserService userService;

    @Autowired
    private ChatMessageReository chatMessageReository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        if(userService.userExists(chatMessage.getSender())){

            // We will store username in session
            headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
            userService.setUserOnlineStatus(chatMessage.getSender(),true);

            System.out.println("User added successfully "+ chatMessage.getSender()+ " with session ID: "
                    + headerAccessor.getSessionId());

            chatMessage.setTimestamp(LocalDateTime.now());

            if(chatMessage.getMessage() == null){
                chatMessage.setMessage("");
            }

            return chatMessageReository.save(chatMessage);
        }
        return null;
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        System.out.println("Message"+ chatMessage);
        if(userService.userExists(chatMessage.getSender())){

            if(chatMessage.getTimestamp()==null){
                chatMessage.setTimestamp(LocalDateTime.now());
            }

            if(chatMessage.getMessage()==null){
                chatMessage.setMessage("");
            }
            return chatMessageReository.save(chatMessage);
        }
        return null;
    }

    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage,SimpMessageHeaderAccessor headerAccessor) {
        if(userService.userExists(chatMessage.getSender()) && userService.userExists(chatMessage.getReceiver())){

            if(chatMessage.getMessage()==null){
                chatMessage.setMessage("");
            }
            if(chatMessage.getTimestamp()==null){
                chatMessage.setTimestamp(LocalDateTime.now());
            }
            // Setting the message type
            chatMessage.setType(ChatMessage.MessageType.PRIVATE_MESSAGE);

            ChatMessage savedMessage = chatMessageReository.save(chatMessage);

            System.out.println("Message saved in the repository successfully with  ID: "+ savedMessage.getId());

            try{
                String senderDestination = "/user/"+chatMessage.getSender()+"/queue/private";
                System.out.println("Message sent to sender Destination: "+ senderDestination);
                messagingTemplate.convertAndSend(senderDestination, savedMessage);

                String receiverDestination = "/user/"+chatMessage.getReceiver()+"/queue/private";
                System.out.println("Message sent to receiver Destination: "+ receiverDestination);
                messagingTemplate.convertAndSend(receiverDestination, savedMessage);
            }catch(Exception e){
                System.out.println("ERROR occured wile sending the message " + e.getMessage());
                e.printStackTrace();
            }



        }else{
            System.out.println("Error : Sender "+ chatMessage.getSender()+" and Receiver "+chatMessage.getReceiver() +" does not exist");
        }
    }
}
