import {useEffect, useRef, useState} from "react";
import "../styles/PrivateChat.css";
import {FiSend, FiX} from 'react-icons/fi'; // Import new icons
import {api} from "../services/authService";
import formatTime from "../services/formatTime";

const BotChat = ({
                     currentUser,
                     recipientUser,
                     onClose,
                     style // <-- Make sure to accept the style prop for stacking
                 }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const messageIdRef = useRef(new Set());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const createMessageId = (msg) => {
        return msg.id || `${msg.sender}-${msg.recipient}-${msg.message}-${msg.timestamp}`;
    };

    // ... (Your useEffect hook from line 32 to 74 remains exactly the same) ...
    useEffect(() => {
        const loadMessageHistory = async () => {
            try {
                const response = await api.get(
                    `/api/messages/bot?user1=${currentUser}`
                );

                console.log(response, "fgfg")
                const history = await response.data;
                const processedHistory = history.map(msg => {
                    const messageId = createMessageId(msg);
                    return {...msg, id: messageId};
                });

                messageIdRef.current.clear();
                processedHistory.forEach(msg => {
                    messageIdRef.current.add(msg.id);
                })
                setMessages(processedHistory);


            } catch (error) {
                console.error('Error loading message history', error);
            } finally {
                setLoading(false);
            }
        };

        loadMessageHistory();

    }, [currentUser]);


    const sendPrompt = async (e) => {
        e.preventDefault();

        if (isSending || !message.trim()) {
            return;
        }

        setIsSending(true);

        const userMessageContent = message.trim();
        setMessage("");

        const timestamp = new Date();
        const botRequestData = {
            sender: currentUser,
            receiver: recipientUser,
            message: userMessageContent,
            timestamp: timestamp,
            type: "CHATBOT"
        };

        const messageId = createMessageId(botRequestData);
        const messageWithId = {
            ...botRequestData,
            id: messageId
        };

        // Optimistically add to UI
        if (!messageIdRef.current.has(messageId)) {
            messageIdRef.current.add(messageId);
            setMessages(prev => [...prev, messageWithId]);
        }

        // Add a temporary "waiting" message for visual feedback
        const waitingMessageId = 'waiting-' + Date.now();
        setMessages(prev => [...prev, {
            id: waitingMessageId,
            sender: recipientUser,
            message: 'Waiting for AI response...',
            timestamp: new Date(),
            type: 'WAITING', // New type for visual distinction
        }]);

        try {
            const response = await api.post(
                `/api/chat`, botRequestData
            );

            // Remove the temporary waiting message first
            setMessages(prev => prev.filter(msg => msg.id !== waitingMessageId));

            const botResponseData = response.data;
            const responseMessageId = createMessageId(botResponseData);

            // Optimistically add to UI
            if (!messageIdRef.current.has(responseMessageId)) {
                messageIdRef.current.add(responseMessageId);
                setMessages(prev => [...prev, botResponseData]);
            }


        } catch (error) {
            console.error('Error sending message', error);
            // Rollback on error If we Didn't get any response
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            messageIdRef.current.delete(messageId);

            // ALERT USER OF FAILURE
            alert('❌ Chatbot service failed to respond. Please try again.');

        }finally {
            setIsSending(false);
        }


    };


    // --- NEW JSX with style prop ---
    return (
        <div className="private-chat-window" style={style}>
            <div className="private-chat-header">
                <div className="recipient-info">
                    <div className="recipient-avatar" style={{backgroundColor: '#fff', color: '#777'}}>
                        AI
                    </div>
                    <div className="recipient-details">
                        <h3>AI Bot</h3>
                        <div className={`recipient-status ${isSending ? 'waiting' : 'online'}`}>
                            {isSending ? 'Thinking...' : 'Online'}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="close-btn">
                    <FiX/>
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
                                <div key={msg.id}
                                     className={`private-message ${msg.sender === currentUser ? 'own-message' : 'received-message'}`}>
                                    {msg.type === 'WAITING' ? (
                                        <div className="message-content waiting-message">
                                            {msg.message}
                                        </div>
                                    ) : (
                                        <div className="message-content">
                                            {msg.message}
                                        </div>
                                    )}

                                    {msg.type !== 'WAITING' && (
                                        <span className="timestamp">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef}></div>
                    </div>
                    <div className="private-message-input-container">
                        <form onSubmit={sendPrompt} className="private-message-form">
                            <input
                                type="text"
                                placeholder={isSending ? "Waiting for AI response..." : `Message ${recipientUser}...`}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="private-message-input"
                                maxLength={500}
                                disabled={isSending}
                            />
                            <button type="submit" className="private-send-button" disabled={!message.trim() || isSending}>
                                {isSending ? <div className="loading-spinner small"></div> : <FiSend />}
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default BotChat;