'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { sendMessageToClaude, streamResponseFromClaude, CLAUDE_MODELS } from '../lib/api/claude';
import { v4 as uuidv4 } from 'uuid';

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
    const [streamingMessage, setStreamingMessage] = useState(null);

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
                // Start with no chats
                setChats([]);
                setCurrentChat(null);
                saveChats([]);
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
                // Start with an empty folders list
                setFolders([]);
                saveFolders([]);
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
     * Process files for API submission
     *
     * @param {Array} files - Array of file objects
     * @returns {Promise<Array>} - Processed file objects for API
     */
    const processFilesForAPI = async (files) => {
        const processedFiles = [];

        for (const file of files) {
            // Convert file to base64
            const base64Content = await fileToBase64(file);

            processedFiles.push({
                file_id: uuidv4(),
                media_type: file.type,
                data: base64Content.split(',')[1] // Remove data URL prefix
            });
        }

        return processedFiles;
    };

    /**
     * Convert a file to base64 format
     *
     * @param {File} file - File to convert
     * @returns {Promise<string>} - Promise containing base64 data URL
     */
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
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
                id: uuidv4(),
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
            // Process files for API if any
            const processedFiles = files.length > 0 ? await processFilesForAPI(files) : [];

            // Prepare AI message placeholder for streaming
            const aiMessageId = `msg_${Date.now() + 1}`;
            const aiMessage = {
                id: aiMessageId,
                sender: 'ai',
                text: '',
                model: selectedModel.id,
                timestamp: new Date().toISOString(),
            };

            // We'll use streaming for a better user experience
            setStreamingMessage(aiMessage);
            const messagesWithAiPlaceholder = [...updatedMessages, aiMessage];
            setChatMessages(messagesWithAiPlaceholder);

            // Get previous messages for context (excluding the user's current message)
            const previousMessages = chatMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            // Use streaming response
            let fullResponse = '';
            await streamResponseFromClaude(
                message,
                selectedModel.id,
                previousMessages,
                processedFiles,
                extendedThinking,
                (chunk) => {
                    fullResponse += chunk;
                    setStreamingMessage(prev => ({
                        ...prev,
                        text: fullResponse
                    }));
                }
            );

            // Complete the message with the full response
            const completedAiMessage = {
                ...aiMessage,
                text: fullResponse
            };

            // Replace the streaming message with the completed one
            const finalMessages = [...updatedMessages, completedAiMessage];
            setChatMessages(finalMessages);
            saveChatMessages(chatId, finalMessages);

            // Update the chat's last message to indicate the AI's response
            const chatsWithResponse = chats.map(chat => {
                if (chat.id === chatId) {
                    return {
                        ...chat,
                        lastMessage: fullResponse.slice(0, 50) + (fullResponse.length > 50 ? '...' : '')
                    };
                }
                return chat;
            });
            setChats(chatsWithResponse);
            saveChats(chatsWithResponse);

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
            setStreamingMessage(null);
        }
    };

    /**
     * Delete a chat
     *
     * @param {string} chatId - ID of chat to delete
     */
    const deleteChat = (chatId) => {
        if (!chatId) return;

        // Remove chat from list
        const updatedChats = chats.filter(chat => chat.id !== chatId);
        setChats(updatedChats);
        saveChats(updatedChats);

        // Remove chat messages
        if (typeof window !== 'undefined' && user) {
            localStorage.removeItem(`messages_${user.id}_${chatId}`);
        }

        // If current chat is deleted, set current chat to first available or null
        if (currentChat && currentChat.id === chatId) {
            setCurrentChat(updatedChats.length > 0 ? updatedChats[0] : null);
        }

        // Update folder counts if needed
        const deletedChat = chats.find(chat => chat.id === chatId);
        if (deletedChat && deletedChat.folderId) {
            updateFolderChatCount(deletedChat.folderId);
        }
    };

    /**
     * Rename a chat
     *
     * @param {string} chatId - Chat ID to rename
     * @param {string} newTitle - New title for the chat
     */
    const renameChat = (chatId, newTitle) => {
        if (!chatId || !newTitle.trim()) return;

        const updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
                return { ...chat, title: newTitle };
            }
            return chat;
        });

        setChats(updatedChats);
        saveChats(updatedChats);

        // Update current chat if it's the one being renamed
        if (currentChat && currentChat.id === chatId) {
            setCurrentChat({ ...currentChat, title: newTitle });
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
        streamingMessage,
        setCurrentChat,
        setSelectedModel,
        setExtendedThinking,
        createChat,
        sendMessage,
        deleteChat,
        renameChat,
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