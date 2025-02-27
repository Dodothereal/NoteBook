'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Claude model identifiers
export const CLAUDE_MODELS = {
    CLAUDE_3_5_SONNET: 'claude-3-5-sonnet-20240620',
    CLAUDE_3_7_SONNET: 'claude-3-7-sonnet-20240307',
};

// Create context
const ChatContext = createContext();

/**
 * Chat provider component
 */
export function ChatProvider({ children }) {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [selectedModel, setSelectedModel] = useState({
        id: CLAUDE_MODELS.CLAUDE_3_5_SONNET,
        name: 'Claude 3.5 Sonnet',
        icon: '🧠'
    });
    const [extendedThinking, setExtendedThinking] = useState(false);

    // Load chats from localStorage when user changes
    useEffect(() => {
        if (user) {
            loadChats();
            loadFolders();
        } else {
            setChats([]);
            setFolders([]);
            setCurrentChat(null);
            setChatMessages([]);
        }
    }, [user]);

    // Load chat messages when currentChat changes
    useEffect(() => {
        if (currentChat) {
            loadChatMessages(currentChat.id);
        } else {
            setChatMessages([]);
        }
    }, [currentChat]);

    /**
     * Load chats from localStorage
     */
    const loadChats = () => {
        if (typeof window === 'undefined' || !user) return;

        try {
            const savedChats = localStorage.getItem(`chats_${user.id}`);
            if (savedChats) {
                const parsedChats = JSON.parse(savedChats);
                setChats(parsedChats);

                // Set current chat to the first one if none is selected
                if (!currentChat && parsedChats.length > 0) {
                    setCurrentChat(parsedChats[0]);
                }
            } else {
                // Initialize with demo chats if none exist
                const initialChats = [
                    { id: 'chat1', title: 'Research Assistant', lastMessage: 'What are the latest developments in quantum computing?', timestamp: new Date().toISOString(), folderId: null },
                    { id: 'chat2', title: 'Code Helper', lastMessage: 'Can you explain async/await in JavaScript?', timestamp: new Date().toISOString(), folderId: null },
                    { id: 'chat3', title: 'Travel Planning', lastMessage: 'I need suggestions for a 7-day trip to Japan.', timestamp: new Date().toISOString(), folderId: null },
                ];

                setChats(initialChats);
                setCurrentChat(initialChats[0]);
                saveChats(initialChats);
            }
        } catch (error) {
            console.error('Error loading chats:', error);
            setChats([]);
        }
    };

    /**
     * Load folders from localStorage
     */
    const loadFolders = () => {
        if (typeof window === 'undefined' || !user) return;

        try {
            const savedFolders = localStorage.getItem(`folders_${user.id}`);
            if (savedFolders) {
                setFolders(JSON.parse(savedFolders));
            } else {
                // Initialize with demo folders if none exist
                const initialFolders = [
                    { id: 'folder1', name: 'Work Projects', chats: 0 },
                    { id: 'folder2', name: 'Personal', chats: 0 },
                    { id: 'folder3', name: 'Learning', chats: 0 },
                ];

                setFolders(initialFolders);
                saveFolders(initialFolders);
            }
        } catch (error) {
            console.error('Error loading folders:', error);
            setFolders([]);
        }
    };

    /**
     * Save chats to localStorage
     */
    const saveChats = (chatData = chats) => {
        if (typeof window === 'undefined' || !user) return;
        localStorage.setItem(`chats_${user.id}`, JSON.stringify(chatData));
    };

    /**
     * Save folders to localStorage
     */
    const saveFolders = (folderData = folders) => {
        if (typeof window === 'undefined' || !user) return;
        localStorage.setItem(`folders_${user.id}`, JSON.stringify(folderData));
    };

    /**
     * Load chat messages from localStorage
     *
     * @param {string} chatId - Chat ID
     */
    const loadChatMessages = (chatId) => {
        if (typeof window === 'undefined' || !user || !chatId) return;

        try {
            const savedMessages = localStorage.getItem(`messages_${user.id}_${chatId}`);
            if (savedMessages) {
                setChatMessages(JSON.parse(savedMessages));
            } else {
                setChatMessages([]);
            }
        } catch (error) {
            console.error('Error loading chat messages:', error);
            setChatMessages([]);
        }
    };

    /**
     * Save chat messages to localStorage
     *
     * @param {string} chatId - Chat ID
     * @param {Array} messages - Chat messages to save
     */
    const saveChatMessages = (chatId, messages = chatMessages) => {
        if (typeof window === 'undefined' || !user || !chatId) return;
        localStorage.setItem(`messages_${user.id}_${chatId}`, JSON.stringify(messages));
    };

    /**
     * Create a new chat
     *
     * @param {string} title - Chat title
     * @param {string} folderId - Folder ID (optional)
     * @returns {Object} Newly created chat
     */
    const createChat = (title = 'New Chat', folderId = null) => {
        const newChat = {
            id: `chat_${Date.now()}`,
            title,
            lastMessage: '',
            timestamp: new Date().toISOString(),
            folderId
        };

        const updatedChats = [newChat, ...chats];
        setChats(updatedChats);
        setCurrentChat(newChat);
        setChatMessages([]);
        saveChats(updatedChats);
        saveChatMessages(newChat.id, []);

        // Update folder chat count
        if (folderId) {
            updateFolderChatCount(folderId);
        }

        return newChat;
    };

    /**
     * Update folder chat count
     *
     * @param {string} folderId - Folder ID
     */
    const updateFolderChatCount = (folderId) => {
        const updatedFolders = folders.map(folder => {
            if (folder.id === folderId) {
                const chatCount = chats.filter(chat => chat.folderId === folderId).length;
                return { ...folder, chats: chatCount };
            }
            return folder;
        });

        setFolders(updatedFolders);
        saveFolders(updatedFolders);
    };

    /**
     * Send a message to AI model
     *
     * @param {string} message - Message text
     * @param {Array} files - Files to include in the message
     * @returns {Promise} Promise that resolves when the message is sent
     */
    const sendMessage = async (message, files = []) => {
        if (!currentChat || (!message.trim() && files.length === 0)) return;

        // Create chat if none exists
        let chatId = currentChat.id;
        if (!chatId) {
            const newChat = createChat('New Chat');
            chatId = newChat.id;
        }

        // Create user message
        const userMessage = {
            id: `msg_${Date.now()}`,
            sender: 'user',
            text: message,
            files: files.map(file => ({
                id: file.name,
                name: file.name,
                type: file.type,
                size: file.size,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            })),
            timestamp: new Date().toISOString(),
        };

        // Add user message to chat
        const updatedMessages = [...chatMessages, userMessage];
        setChatMessages(updatedMessages);
        saveChatMessages(chatId, updatedMessages);

        // Update chat in list
        const updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
                return {
                    ...chat,
                    lastMessage: message || "Sent a file",
                    timestamp: new Date().toISOString()
                };
            }
            return chat;
        });
        setChats(updatedChats);
        saveChats(updatedChats);

        // Set thinking state
        setIsThinking(true);

        try {
            // For MVP, we'll simulate AI response after a delay
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

            // Wait 1-3 seconds to simulate thinking
            await delay(Math.random() * 2000 + 1000);

            // Create AI response
            let responseText = '';

            if (message.trim()) {
                // Simple response logic based on the message
                if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
                    responseText = `Hello there! How can I assist you today?`;
                } else if (message.toLowerCase().includes('help')) {
                    responseText = `I'd be happy to help! What specific question or task do you need assistance with?`;
                } else if (message.toLowerCase().includes('thanks') || message.toLowerCase().includes('thank you')) {
                    responseText = `You're welcome! Feel free to ask if you need anything else.`;
                } else {
                    responseText = `I'm processing your request "${message}". In a full implementation, I would call the ${selectedModel.name} API here.`;
                }
            } else if (files.length > 0) {
                // Response for file uploads
                const fileNames = files.map(f => f.name).join(', ');
                responseText = `I've received ${files.length} file(s): ${fileNames}. In a full implementation, I would process these files using ${selectedModel.name}.`;
            }

            // Add AI message to chat
            const aiMessage = {
                id: `msg_${Date.now() + 1}`,
                sender: 'ai',
                text: responseText,
                model: selectedModel.id,
                timestamp: new Date().toISOString(),
            };

            const messagesWithAi = [...updatedMessages, aiMessage];
            setChatMessages(messagesWithAi);
            saveChatMessages(chatId, messagesWithAi);

        } catch (error) {
            console.error('Error sending message:', error);

            // Add error message
            const errorMessage = {
                id: `msg_${Date.now() + 2}`,
                sender: 'system',
                text: `Error: ${error.message || 'An error occurred while processing your request'}`,
                timestamp: new Date().toISOString(),
            };

            const messagesWithError = [...updatedMessages, errorMessage];
            setChatMessages(messagesWithError);
            saveChatMessages(chatId, messagesWithError);

        } finally {
            setIsThinking(false);
        }
    };

    // Context value
    const value = {
        chats,
        folders,
        currentChat,
        chatMessages,
        selectedModel,
        extendedThinking,
        isThinking,
        loading,
        setCurrentChat,
        setSelectedModel,
        setExtendedThinking,
        createChat,
        sendMessage,
        loadChatMessages
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Custom hook to use chat context
 */
export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}