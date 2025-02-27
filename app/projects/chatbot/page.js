// app/projects/chatbot/page.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../src/context/AuthContext';
import { ChatProvider, useChat } from '../../../src/context/ChatContext';
import { processFiles, getHumanReadableSize } from '../../../src/lib/files/fileUpload';
import { CLAUDE_MODELS } from '../../../src/lib/api/claude';

// AI models configuration
const aiModels = [
  { id: CLAUDE_MODELS.CLAUDE_3_5_SONNET, name: 'Claude 3.5 Sonnet', icon: '🧠' },
  { id: CLAUDE_MODELS.CLAUDE_3_7_SONNET, name: 'Claude 3.7 Sonnet', icon: '⚡' },
  { id: CLAUDE_MODELS.CLAUDE_3_7_SONNET, name: 'Claude 3.7 + Extended Thinking', icon: '🔍', extended: true }
];

// ChatbotContent component that uses ChatContext
function ChatbotContent() {
  const { user, logout } = useAuth();
  const {
    chats,
    folders,
    currentChat,
    chatMessages,
    selectedModel,
    extendedThinking,
    isThinking,
    setCurrentChat,
    setSelectedModel,
    setExtendedThinking,
    createChat,
    sendMessage
  } = useChat();

  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if should show scroll to bottom button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const bottomThreshold = 300;
    setShowScrollToBottom(scrollHeight - scrollTop - clientHeight > bottomThreshold);
  };

  // Monitor chat container scroll
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() && uploadedFiles.length === 0) return;

    await sendMessage(message, uploadedFiles.map(file => file.file));

    setMessage('');
    setUploadedFiles([]);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const processedFiles = await processFiles(files, (progress) => {
        setUploadProgress(progress);
      });

      setUploadedFiles(prev => [...prev, ...processedFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
      // TODO: Show error notification
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle model selection
  const handleSelectModel = (model) => {
    setSelectedModel({
      id: model.id,
      name: model.name,
      icon: model.icon
    });

    // Set extended thinking flag if model supports it
    setExtendedThinking(!!model.extended);

    setMenuOpen(false);
  };

  // Create a new chat
  const handleNewChat = () => {
    createChat('New Chat');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
      <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col overflow-hidden`}>
          {sidebarOpen && (
              <>
                <div className="p-4 border-b border-gray-700">
                  <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Projects</span>
                  </Link>

                  <button
                      className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-md"
                      onClick={handleNewChat}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>New Chat</span>
                  </button>
                </div>

                <div className="overflow-y-auto flex-grow">
                  {/* Folders */}
                  <div className="p-3">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Folders</h3>
                    <ul className="space-y-1">
                      {folders.map(folder => (
                          <li key={folder.id}>
                            <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <span>{folder.name}</span>
                              <span className="ml-auto text-xs text-gray-500">{folder.chats}</span>
                            </button>
                          </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chat history */}
                  <div className="p-3">
                    <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Recent Chats</h3>
                    <ul className="space-y-1">
                      {chats.map(chat => (
                          <li key={chat.id}>
                            <button
                                className={`w-full flex flex-col items-start p-2 rounded-md hover:bg-gray-700 transition-colors ${chat.id === currentChat?.id ? 'bg-gray-700' : ''}`}
                                onClick={() => setCurrentChat(chat)}
                            >
                              <span className="font-medium truncate w-full">{chat.title}</span>
                              <span className="text-xs text-gray-400 truncate w-full">{chat.lastMessage}</span>
                              <span className="text-xs text-gray-500 mt-1">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </span>
                            </button>
                          </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* User section */}
                <div className="p-4 border-t border-gray-700 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span>{user?.displayName?.charAt(0) || 'U'}</span>
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{user?.displayName || 'User'}</div>
                    <div className="text-xs text-gray-400">{user?.role || 'User'}</div>
                  </div>
                  <button
                      className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400"
                      onClick={logout}
                      title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
          )}
        </div>

        {/* Main content */}
        <div className="flex-grow flex flex-col h-full">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center gap-2">
            <button
                className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-grow">
              <h1 className="text-lg font-semibold">{currentChat?.title || 'New Chat'}</h1>
            </div>

            <div className="relative">
              <button
                  className="flex items-center gap-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                  onClick={() => setMenuOpen(!menuOpen)}
              >
                <span>{selectedModel.icon}</span>
                <span>{selectedModel.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-gray-700 rounded-md shadow-lg z-10">
                    <ul className="py-1">
                      {aiModels.map(model => (
                          <li key={model.id + (model.extended ? '-extended' : '')}>
                            <button
                                className={`w-full text-left px-4 py-2 hover:bg-gray-600 transition-colors flex items-center gap-2 ${
                                    selectedModel.id === model.id && extendedThinking === !!model.extended ? 'bg-gray-600' : ''
                                }`}
                                onClick={() => handleSelectModel(model)}
                            >
                              <span>{model.icon}</span>
                              <span>{model.name}</span>
                            </button>
                          </li>
                      ))}
                    </ul>
                  </div>
              )}
            </div>
          </header>

          {/* Chat container */}
          <div
              ref={chatContainerRef}
              className="flex-grow overflow-y-auto p-4 space-y-4"
              onScroll={handleScroll}
          >
            {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="text-5xl mb-4">{selectedModel.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{selectedModel.name}</h2>
                  <p className="text-gray-400 max-w-md">
                    Start a conversation with {selectedModel.name} by sending a message or uploading a file below.
                  </p>
                </div>
            ) : (
                chatMessages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-3xl rounded-lg p-4 ${
                          msg.sender === 'user' ? 'bg-blue-600' :
                              msg.sender === 'system' ? 'bg-red-800' :
                                  'bg-gray-700'
                      }`}>
                        {/* Files */}
                        {msg.files && msg.files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {msg.files.map(file => (
                                  <div key={file.id} className="bg-gray-800 rounded-md overflow-hidden">
                                    {file.preview ? (
                                        <div className="relative h-24 w-40">
                                          <Image
                                              src={file.preview}
                                              alt={file.name}
                                              fill
                                              className="object-cover"
                                          />
                                        </div>
                                    ) : (
                                        <div className="h-24 w-40 flex items-center justify-center bg-gray-800">
                                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        </div>
                                    )}
                                    <div className="p-2">
                                      <div className="text-sm truncate">{file.name}</div>
                                      <div className="text-xs text-gray-400">{getHumanReadableSize(file.size)}</div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                        )}

                        {/* Message text */}
                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {/* Timestamp */}
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                ))
            )}

            {/* AI thinking indicator */}
            {isThinking && (
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-lg p-4 bg-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400">Thinking</div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* Scroll to bottom marker */}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollToBottom && (
              <button
                  className="absolute bottom-24 right-6 p-2 bg-gray-700 rounded-full shadow-lg hover:bg-gray-600 transition-colors"
                  onClick={scrollToBottom}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
          )}

          {/* File upload progress */}
          {isUploading && (
              <div className="px-4 py-2 bg-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Uploading files...</span>
                  <span className="ml-auto">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
          )}

          {/* Uploaded files preview */}
          {uploadedFiles.length > 0 && (
              <div className="px-4 py-2 bg-gray-800 flex flex-wrap gap-2">
                {uploadedFiles.map(file => (
                    <div key={file.id} className="bg-gray-700 rounded-md flex items-center gap-2 pl-2 pr-1 py-1">
                      {file.preview ? (
                          <div className="relative h-6 w-6 rounded overflow-hidden">
                            <Image
                                src={file.preview}
                                alt={file.name}
                                fill
                                className="object-cover"
                            />
                          </div>
                      ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                      )}
                      <span className="text-sm truncate max-w-[100px]">{file.name}</span>
                      <button
                          className="p-1 text-gray-400 hover:text-gray-200"
                          onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id))}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                ))}
              </div>
          )}

          {/* Input area */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-start gap-2">
              <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
              />
              <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700"
                  onClick={() => fileInputRef.current?.click()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              <div className="flex-grow">
              <textarea
                  className="w-full bg-gray-700 rounded-md border border-gray-600 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder={`Message ${selectedModel.name}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
              />
              </div>

              <button
                  type="submit"
                  className="p-3 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={!message.trim() && uploadedFiles.length === 0 || isThinking}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}

// Wrapper component with auth check and chat provider
export default function ChatbotPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking auth
  if (loading || !isAuthenticated) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
    );
  }

  return (
      <ChatProvider>
        <ChatbotContent />
      </ChatProvider>
  );
}