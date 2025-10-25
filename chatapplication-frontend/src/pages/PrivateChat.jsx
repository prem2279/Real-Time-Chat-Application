import { useEffect, useRef, useState } from "react";
import "../styles/PrivateChat.css";
import { FiSend, FiX } from 'react-icons/fi'; // Import new icons

const PrivateChat = ({
                         currentUser,
                         recipientUser,
                         isRecipientOnline,
                         userColor,
                         stompClient,
                         onClose,
                         registerPrivateMessageHandler,
                         unregisterPrivateMessageHandler,
                         style // <-- Make sure to accept the style prop for stacking
                     }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const messageIdRef = useRef(new Set());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const createMessageId = (msg) => {
        return msg.id || `${msg.sender}-${msg.recipient}-${msg.message}-${msg.timestamp}`;
    };

    // ... (Your useEffect hook from line 32 to 74 remains exactly the same) ...
    useEffect(() => {
        let isMounted = true;
        const loadMessageHistory = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/messages/private?user1=${currentUser}&user2=${recipientUser}`
                );
                if (response.ok && isMounted) {
                    const history = await response.json();
                    const processedHistory = history.map(msg => {
                        const messageId = createMessageId(msg);
                        return { ...msg, id: messageId };
                    });

                    messageIdRef.current.clear();
                    processedHistory.forEach(msg => {
                        messageIdRef.current.add(msg.id);
                    })
                    setMessages(processedHistory);
                }

            } catch (error) {
                console.error('Error loading message history', error);
            }
            finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadMessageHistory();
        registerPrivateMessageHandler(recipientUser, handleIncomingPrivateMessage);

        return () => {
            isMounted = false;
            unregisterPrivateMessageHandler(recipientUser);
        }
    }, [currentUser, recipientUser, registerPrivateMessageHandler, unregisterPrivateMessageHandler]);


    // ... (Your handleIncomingPrivateMessage hook from line 76 to 91 remains exactly the same) ...
    const handleIncomingPrivateMessage = (privateMessage) => {
        const messageId = createMessageId(privateMessage);

        if (privateMessage.sender === recipientUser && !messageIdRef.current.has(messageId)) {
            const newMessage = {
                ...privateMessage,
                id: messageId,
            };

            messageIdRef.current.add(messageId);
            setMessages(prev => [...prev, newMessage]);
        }
    };

    // ... (Your sendPrivateMessge function from line 93 to 134 remains exactly the same) ...
    const sendPrivateMessge = (e) => {
        e.preventDefault();
        if (message.trim() && stompClient.current && stompClient.current.connected) {
            const timestamp = new Date();
            const privateMessage = {
                sender: currentUser,
                receiver: recipientUser,
                message: message.trim(),
                type: 'PRIVATE_MESSAGE',
                color: userColor,
                timestamp: timestamp
            };

            const messageId = createMessageId(privateMessage);
            const messageWithId = {
                ...privateMessage,
                id: messageId
            };

            // Optimistically add to UI
            if (!messageIdRef.current.has(messageId)) {
                messageIdRef.current.add(messageId);
                setMessages(prev => [...prev, messageWithId]);
            }

            try {
                if (stompClient.current.connected) {
                    stompClient.current.publish({
                        destination: '/app/chat.sendPrivateMessage',
                        body: JSON.stringify(privateMessage)
                    });
                    setMessage('');
                } else {
                    // Rollback if not connected
                    setMessages(prev => prev.filter(msg => msg.id !== messageId));
                    messageIdRef.current.delete(messageId);
                }
            } catch (error) {
                console.error('Error sending message', error);
                // Rollback on error
                setMessages(prev => prev.filter(msg => msg.id !== messageId));
                messageIdRef.current.delete(messageId);
            }
        }
    };


    const formatTime = (timestamp) => {
        let timeInput = timestamp;
        if (typeof timeInput === 'string' && !timeInput.endsWith('Z') && timeInput.includes('T')) {
            timeInput += 'Z';
        }
        return new Date(timeInput).toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour12: true, // Use 12-hour clock
            hour: "numeric",
            minute: "2-digit",
        });
    };

    // --- NEW JSX with style prop ---
    return (
        <div className="private-chat-window" style={style}>
            <div className="private-chat-header">
                <div className="recipient-info">
                    <div className="recipient-avatar" style={{backgroundColor: '#fff', color: '#777'}}>
                        {recipientUser?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="recipient-details">
                        <h3>{recipientUser}</h3>
                        <div className={`recipient-status ${isRecipientOnline ? 'online' : 'offline'}`}>
                            {isRecipientOnline ? 'Online' : 'Offline'}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="close-btn">
                    <FiX />
                </button>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading Messages...</p>
                </div>
            ) : (
                <>
                    <div className="private-message-container">
                        {messages.length === 0 ? (
                            <div className="no-message">
                                <p>This is the beginning of your conversation with {recipientUser}.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`private-message ${msg.sender === currentUser ? 'own-message' : 'received-message'}`}>
                                    <div className="message-content">
                                        {msg.message}
                                    </div>
                                    <span className="timestamp">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef}></div>
                    </div>
                    <div className="private-message-input-container">
                        <form onSubmit={sendPrivateMessge} className="private-message-form">
                            <input
                                type="text"
                                placeholder={`Message ${recipientUser}...`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="private-message-input"
                                maxLength={500} />
                            <button type="submit" className="private-send-button" disabled={!message.trim()}>
                                <FiSend />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default PrivateChat;