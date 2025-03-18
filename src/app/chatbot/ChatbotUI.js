'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getChatHistory, storeChatHistory, getUserSettings, storeUserSettings } from '@/lib/localStorage';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import ChatInput from './ChatInput';
import ModelSelector from './ModelSelector';

export default function ChatbotUI() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [selectedModel, setSelectedModel] = useState('deepseek-r1');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      // Load chat history
      const savedChats = getChatHistory(user.id);
      setChats(savedChats);
      
      // Load user settings
      const settings = getUserSettings(user.id);
      if (settings.preferredModel) {
        setSelectedModel(settings.preferredModel);
      }
      
      // Set current chat to the latest one, or create a new one if none exists
      if (savedChats.length > 0) {
        setCurrentChatId(savedChats[0].id);
      } else {
        createNewChat();
      }
    }
  }, [user]);

  // Save model preference when it changes
  useEffect(() => {
    if (user) {
      const settings = getUserSettings(user.id);
      storeUserSettings(user.id, {
        ...settings,
        preferredModel: selectedModel
      });
    }
  }, [selectedModel, user]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      model: selectedModel,
      createdAt: new Date().toISOString(),
    };
    
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChat.id);
    if (user) {
      storeChatHistory(user.id, updatedChats);
    }
    
    return newChat;
  };

  const getCurrentChat = () => {
    return chats.find((chat) => chat.id === currentChatId) || null;
  };

  const updateChat = (updatedChat) => {
    const updatedChats = chats.map((chat) => 
      chat.id === updatedChat.id ? updatedChat : chat
    );
    
    setChats(updatedChats);
    if (user) {
      storeChatHistory(user.id, updatedChats);
    }
  };

  const sendMessage = async (message, attachedFiles = []) => {
    setLoading(true);
    let chat = getCurrentChat();
    
    if (!chat) {
      chat = createNewChat();
    }
    
    // Create file attachments array if files are present
    let fileAttachments = [];
    if (attachedFiles.length > 0) {
      fileAttachments = attachedFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.preview,
      }));
    }
    
    // Add user message
    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      attachments: fileAttachments.length > 0 ? fileAttachments : undefined,
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...chat.messages, newUserMessage];
    const updatedChat = { ...chat, messages: updatedMessages };
    
    updateChat(updatedChat);
    
    // Add loading message for AI
    const aiMessageId = (Date.now() + 1).toString();
    const loadingMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      loading: true,
      timestamp: new Date().toISOString(),
    };
    
    const chatWithLoading = {
      ...updatedChat,
      messages: [...updatedMessages, loadingMessage],
    };
    
    updateChat(chatWithLoading);
    
    // Simulate AI response (placeholder for actual API call)
    try {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Placeholder response
      const response = `This is a simulated response from the ${selectedModel} model. In a real implementation, this would call the appropriate API.
      
You asked: "${message}"
      
${fileAttachments.length > 0 ? `I see you've attached ${fileAttachments.length} file(s): ${fileAttachments.map(f => f.name).join(', ')}` : ''}`;
      
      // Update AI message with response
      const aiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: response,
        loading: false,
        timestamp: new Date().toISOString(),
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      const finalChat = { ...updatedChat, messages: finalMessages };
      
      // If this is the first message, update the chat title
      if (updatedMessages.length === 1) {
        finalChat.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
      }
      
      updateChat(finalChat);
    } catch (error) {
      console.error('Error calling AI model:', error);
      
      // Update message to show error
      const errorMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        error: true,
        loading: false,
        timestamp: new Date().toISOString(),
      };
      
      const messagesWithError = [...updatedMessages, errorMessage];
      const chatWithError = { ...updatedChat, messages: messagesWithError };
      
      updateChat(chatWithError);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId);
    setChats(updatedChats);
    if (user) {
      storeChatHistory(user.id, updatedChats);
    }
    
    // If we deleted the current chat, select the first available chat or create a new one
    if (chatId === currentChatId) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const updateChatTitle = (chatId, newTitle) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    );
    setChats(updatedChats);
    if (user) {
      storeChatHistory(user.id, updatedChats);
    }
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onUpdateTitle={updateChatTitle}
      />
      
      <div className="flex flex-col flex-1">
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
        
        <div className="flex-1 overflow-hidden">
          <ChatArea
            chat={getCurrentChat()}
          />
        </div>
        
        <ChatInput
          onSendMessage={sendMessage}
          disabled={loading}
        />
      </div>
    </div>
  );
}