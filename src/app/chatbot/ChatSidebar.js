'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onUpdateTitle,
}) {
  const { user, logout } = useAuth();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  const startEditing = (chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };
  
  const saveTitle = () => {
    if (editTitle.trim()) {
      onUpdateTitle(editingChatId, editTitle);
    }
    setEditingChatId(null);
  };
  
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">NoteBook</h1>
        <p className="text-sm text-gray-400">AI Chatbot</p>
      </div>
      
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-2 rounded cursor-pointer mb-1 ${
              chat.id === currentChatId ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            {editingChatId === chat.id ? (
              <div className="flex">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-gray-600 text-white px-2 py-1 rounded"
                  autoFocus
                  onBlur={saveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                />
              </div>
            ) : (
              <div className="flex justify-between items-center" onClick={() => onSelectChat(chat.id)}>
                <div 
                  className="overflow-hidden text-ellipsis whitespace-nowrap flex-1"
                  onDoubleClick={() => startEditing(chat)}
                >
                  {chat.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{user?.name}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}