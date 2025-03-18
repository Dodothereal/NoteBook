'use client';

import { useRef, useEffect } from 'react';

export default function ChatArea({ chat }) {
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a chat or create a new one
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto p-4">
      {chat.messages.map((message) => (
        <div
          key={message.id}
          className={`mb-6 ${
            message.role === 'user' ? 'text-right' : ''
          }`}
        >
          <div className={`inline-block max-w-3xl ${
            message.role === 'user' ? 'text-right' : 'text-left'
          }`}>
            {/* Display file attachments if present */}
            {message.attachments && message.attachments.length > 0 && (
              <div className={`mb-2 flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className="flex flex-wrap gap-2 max-w-full">
                  {message.attachments.map((file) => (
                    <div key={file.id} className="border rounded overflow-hidden" style={{ width: '120px' }}>
                      {file.preview ? (
                        <div className="h-20 flex items-center justify-center overflow-hidden">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-20 flex items-center justify-center bg-gray-100">
                          <span className="text-gray-500 text-sm">{file.type.split('/')[0]}</span>
                        </div>
                      )}
                      <div className="p-1">
                        <div className="text-xs font-medium truncate">{file.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Message content */}
            <div
              className={`rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.loading ? (
                <div className="flex items-center">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              ) : message.error ? (
                <div className="text-red-500">{message.content}</div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}