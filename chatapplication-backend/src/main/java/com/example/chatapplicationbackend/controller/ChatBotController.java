package com.example.chatapplicationbackend.controller;

import com.example.chatapplicationbackend.model.ChatMessage;
import com.example.chatapplicationbackend.repository.ChatMessageReository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatBotController {

    @Value("${api.url}")
    private String OLLAMA_URL;

    @Autowired
    private ChatMessageReository chatMessageReository;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessage userMessage){
        ChatMessage botResponse = new ChatMessage();
        try{

            if(userMessage.getSender() == null || userMessage.getSender().isBlank()){
                Map<String,String> errorDetails = new HashMap<>();
                errorDetails.put("status","400");
                errorDetails.put("error","Bad Request");
                errorDetails.put("message","The sender field is required and cannot be blank");
                return ResponseEntity.badRequest().body(errorDetails);
            }

            if(userMessage.getMessage() == null || userMessage.getMessage().isBlank()){
                Map<String,String> errorDetails = new HashMap<>();
                errorDetails.put("status","400");
                errorDetails.put("error","Bad Request");
                errorDetails.put("message","Prompt is required for bot to respond");
                return ResponseEntity.badRequest().body(errorDetails);
            }

            userMessage.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));
//            if(userMessage.getTimestamp()==null){
//                userMessage.setTimestamp(LocalDateTime.now());
//            }

            userMessage.setType(ChatMessage.MessageType.CHATBOT);
            userMessage.setReceiver("bot");

            chatMessageReository.save(userMessage);

            String botReply = botReply(userMessage.getMessage());

            if(botReply.startsWith("Error")){
                Map<String,String> errorDetails = new HashMap<>();
                errorDetails.put("status","500");
                errorDetails.put("error","Internal Server Error");
                errorDetails.put("message",botReply);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorDetails);
            }
            botResponse.setMessage(botReply);
            botResponse.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));
            botResponse.setSender("bot");
            botResponse.setReceiver(userMessage.getSender());
            botResponse.setType(ChatMessage.MessageType.CHATBOT);

            chatMessageReository.save(botResponse);

            return ResponseEntity.ok(botResponse);


        }catch (Exception e){
            e.printStackTrace();
            Map<String,String> errorDetails = new HashMap<>();
            errorDetails.put("status","400");
            errorDetails.put("error",e.toString());
            errorDetails.put("message",e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);

        }
    }

    private String botReply(String prompt){

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String,Object> body = new HashMap<>();
        body.put("model", "llama3.2:1b");
        body.put("prompt", prompt);
        body.put("stream", false);

        HttpEntity<Map<String,Object>> request = new HttpEntity<>(body, headers);

        try {

            Map<String, Object> response = restTemplate.postForObject(
                    OLLAMA_URL,
                    request,
                    Map.class
            );


            if (response != null && response.containsKey("response")) {
                return response.get("response").toString();
            } else {
                // Handle case where OLLAMA returns success but without the 'response' key
                System.err.println("OLLAMA response missing the 'response' key: " + response);
                return "Error: Could not parse chatbot response.";
            }

        } catch (HttpClientErrorException e) {
            // Handles 4xx errors (e.g., OLLAMA couldn't find the model)
            System.err.println("Client Error (" + e.getStatusCode() + "): " + e.getResponseBodyAsString());
            return "Error: Failed to communicate with OLLAMA (Client error). " + e.getResponseBodyAsString();

        } catch (ResourceAccessException e) {
            // Handles connection problems (e.g., OLLAMA service is down or URL is wrong)
            System.err.println("Connection Error: OLLAMA service unreachable or URL is incorrect.");
            return "Error: OLLAMA service is currently unavailable." + e.getMessage();

        } catch (Exception e) {
            // Catch all other unexpected errors
            System.err.println("Unexpected Error during OLLAMA call: " + e.getMessage());
            return "Error: An unexpected issue occurred. "+e.getMessage();
        }

    }
}
