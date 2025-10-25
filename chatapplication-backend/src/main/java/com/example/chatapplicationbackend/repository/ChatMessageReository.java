package com.example.chatapplicationbackend.repository;

import com.example.chatapplicationbackend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageReository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT cm from ChatMessage cm where cm.type='PRIVATE_MESSAGE' and " +
            "((cm.sender=:user1 and cm.receiver=:user2) or (cm.sender=:user2 and cm.receiver=:user1)) " +
            "order by cm.timestamp asc ")
    List<ChatMessage> findPrivateMessagesBetweenTwoUsers(@Param("user1") String user1,@Param("user2") String user2);

}
