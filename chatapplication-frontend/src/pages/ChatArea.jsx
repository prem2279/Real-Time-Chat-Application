import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import PrivateChat from "./PrivateChat";
import "../styles/ChatArea.css";
// Import icons
import { FiSend, FiSmile, FiMenu, FiX } from 'react-icons/fi';

const API_URL= import.meta.env.VITE_API_URL;

const ChatArea = () => {


    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
    const { username, color: userColor } = currentUser || {};

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState("");
    const [privateMessages, setPrivateMessages] = useState(new Map());
    const [unreadMessages, setUnreadMessages] = useState(new Map());
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [lastMessage, setLastMessage] = useState(null);

    // --- NEW STATE FOR RESPONSIVE SIDEBAR ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const privateMessageHandlers = useRef(new Map());
    const stompClient = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const emojis = ["😀", "😂", "😍", "😊", "😎", "👍", "👎", "❤️", "🔥", "🚀", "🎉"];

    // ... (Your useEffect hooks from line 41 to 177 remain exactly the same) ...
    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
        }
    }, [currentUser, navigate]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- FIX 2: Create a useEffect to handle new messages ---
    useEffect(() => {
        if (!lastMessage) return; // Do nothing if no message

        const chatMessage = lastMessage;

        // Logic for handling JOIN/LEAVE
        setOnlineUsers((prev) => {
            const updated = new Set(prev);
            if (chatMessage.type === "JOIN") {
                console.log("Adding user to Set:", chatMessage.sender);
                updated.add(chatMessage.sender);
            } else if (chatMessage.type === "LEAVE") {
                console.log("Removing user from Set:", chatMessage.sender);
                updated.delete(chatMessage.sender);
            }
            return updated;
        });

        // Logic for handling TYPING
        if (chatMessage.type === "TYPING") {
            console.log("Person Typing, " + chatMessage.sender);
            setIsTyping(chatMessage.sender);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsTyping(""), 2000);
        }

        // Logic for adding to message list
        if (chatMessage.type !== "TYPING") {
            setMessages((prev) => [
                ...prev,
                {
                    ...chatMessage,
                    timestamp: chatMessage.timestamp || new Date().toString(),
                    id: chatMessage.id || Date.now() + Math.random(),
                },
            ]);
        }

    }, [lastMessage]); // This effect runs every time a new message arrives

    const registerPrivateMessageHandler = useCallback((otherUser, handler) => {
        privateMessageHandlers.current.set(otherUser, handler);
    }, []);

    const unregisterPrivateMessageHandler = useCallback((otherUser) => {
        privateMessageHandlers.current.delete(otherUser);
    }, []);

    // ------------------ STOMP CONNECTION ------------------
    useEffect(() => {
        if (!username) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(API_URL + "/ws"),
            reconnectDelay: 5000,
            connectHeaders: { username },
            debug: (str) => console.log("[STOMP DEBUG]", str),
            onConnect: () => {
                console.log("✅ Connected to STOMP");

                // --- FIX 3: Subscription ONLY sets the lastMessage state ---
                client.subscribe("/topic/public", (msg) => {
                    const chatMessage = JSON.parse(msg.body);
                    // console.log("chat message,", msg.body) // Keep this commented
                    setLastMessage(chatMessage);
                });

                // Subscribe to private messages
                client.subscribe(`/user/${username}/queue/private`, (msg) => {
                    const privateMessage = JSON.parse(msg.body);

                    console.log("Private message RECEIVED:", privateMessage);
                    const otherUser =
                        privateMessage.sender === username
                            ? privateMessage.receiver
                            : privateMessage.sender;

                    const handler = privateMessageHandlers.current.get(otherUser);
                    if (handler) handler(privateMessage);
                    else if (privateMessage.receiver === username) {
                        setUnreadMessages((prev) => {
                            const newMap = new Map(prev);
                            newMap.set(otherUser, (newMap.get(otherUser) || 0) + 1);
                            return newMap;
                        });
                    }
                });

                // Notify server of new user
                client.publish({
                    destination: "/app/chat.addUser",
                    body: JSON.stringify({ sender:username, type: "JOIN", color: userColor }),
                });

                // Fetch online users (This part is correct)
                authService
                    .getOnlineUsers()
                    .then((data) => {
                        console.log("Online Users,", data);
                        const fetchedUsers = Object.keys(data);

                        setOnlineUsers((prev) => {
                            const merged = new Set(prev);
                            fetchedUsers.forEach((u) => merged.add(u));
                            merged.add(username);
                            return merged;
                        });
                    })
                    .catch(console.error);
            },
            onStompError: (frame) => console.error("❌ STOMP Error:", frame),
            onWebSocketClose: () => console.warn("⚠️ WebSocket Closed"),
            onDisconnect: () => console.log("🔌 Disconnected"),
        });

        stompClient.current = client;
        client.activate();

        return () => {
            console.log("!!! CHATAREA IS UNMOUNTING !!!");
            if (client.active) client.deactivate();
            clearTimeout(typingTimeoutRef.current);
        };
    }, [username, userColor]);

    // ... (Your Chat Handlers from line 180 to 244 remain exactly the same) ...
    // ------------------ CHAT HANDLERS ------------------
    const openPrivateChat = (otherUser) => {
        if (otherUser === username) return;
        setPrivateMessages((prev) => new Map(prev).set(otherUser, true));
        setUnreadMessages((prev) => {
            const newMap = new Map(prev);
            newMap.delete(otherUser);
            return newMap;
        });
        // On mobile, close sidebar when opening a chat
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const closePrivateChat = (otherUser) => {
        setPrivateMessages((prev) => {
            const newMap = new Map(prev);
            newMap.delete(otherUser);
            return newMap;
        });
        unregisterPrivateMessageHandler(otherUser);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !stompClient.current?.connected) return; // boolean check

        stompClient.current.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify({
                sender: username,
                message: message,
                type: "CHAT",
                color: userColor,
            }),
        });

        setMessage("");
        setShowEmojiPicker(false);
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        if (stompClient.current?.connected && e.target.value.trim()) {
            stompClient.current.publish({
                destination: "/app/chat.sendMessage",
                body: JSON.stringify({ sender: username, type: "TYPING" }),
            });
        }
    };

    const addEmoji = (emoji) => setMessage((prev) => prev + emoji);

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


    // ------------------ JSX ------------------
    return (
        <div className="chat-container">
            {/* --- NEW RESPONSIVE SIDEBAR --- */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Users Online</h2>
                    <button className="sidebar-toggle-close" onClick={() => setIsSidebarOpen(false)}>
                        <FiX />
                    </button>
                </div>
                <div className="users-list">
                    {Array.from(onlineUsers).sort().map((user) => (
                        <div
                            key={user}
                            className={`user-item ${user === username ? "current-user" : ""}`}
                            onClick={() => openPrivateChat(user)}
                        >
                            <div className="avatar-wrapper">
                                <div
                                    className="user-avatar"
                                    style={{ backgroundColor: user === username ? userColor : "#777" }}
                                >
                                    {user.charAt(0).toUpperCase()}
                                </div>
                                <span className="online-indicator"></span>
                            </div>
                            <span className="user-name">{user}</span>
                            {user === username && <span className="you-label">(You)</span>}
                            {unreadMessages.has(user) && (
                                <span className="unread-count">{unreadMessages.get(user)}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat */}
            <div className="main-chat">
                <div className="chat-header">
                    {/* --- NEW SIDEBAR TOGGLE FOR MOBILE --- */}
                    <button className="sidebar-toggle-open" onClick={() => setIsSidebarOpen(true)}>
                        <FiMenu />
                    </button>
                    <h4>Global Chat</h4>
                </div>
                <div className="message-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.type.toLowerCase()}`}>
                            {msg.type === "JOIN" && (
                                <div className="system-message">
                                    <span style={{color: msg.color || '#007bff'}}>{msg.sender}</span> Joined the Group
                                </div>
                            )}
                            {msg.type === "LEAVE" && (
                                <div className="system-message">{msg.sender} Left the Group</div>
                            )}
                            {msg.type === "CHAT" && (
                                <div className={`chat-message ${msg.sender === username ? "own-message" : ""}`}>
                                    <div className="message-info">
                                        <span className="sender" style={{ color: msg.sender !== username ? (msg.color || "#007bff") : 'white' }}>
                                            {msg.sender === username ? 'You' : msg.sender}
                                        </span>
                                        <span className="time">{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div className="message-text">{msg.message}</div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="typing-indicator-wrapper">
                        {isTyping && isTyping !== username && (
                            <div className="typing-indicator">{isTyping} is typing...</div>
                        )}
                    </div>
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                    {showEmojiPicker && (
                        <div className="emoji-picker">
                            {emojis.map((emoji) => (
                                <button key={emoji} onClick={() => addEmoji(emoji)}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={sendMessage} className="message-form">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="emoji-btn"
                        >
                            <FiSmile />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={handleTyping}
                            className="message-input"
                            maxLength={500}
                        />
                        <button className="send-btn" type="submit" disabled={!message.trim()}>
                            <FiSend />
                        </button>
                    </form>
                </div>
            </div>

            {/* Private Chats */}
            {Array.from(privateMessages.keys()).map((otherUser, index) => (
                <PrivateChat
                    key={otherUser}
                    style={{ '--chat-index': index }}
                    currentUser={username}
                    recipientUser={otherUser}
                    isRecipientOnline={onlineUsers.has(otherUser)}
                    userColor={userColor}
                    stompClient={stompClient}
                    onClose={() => closePrivateChat(otherUser)}
                    registerPrivateMessageHandler={registerPrivateMessageHandler}
                    unregisterPrivateMessageHandler={unregisterPrivateMessageHandler}
                />
            ))}
        </div>
    );
};

export default ChatArea;