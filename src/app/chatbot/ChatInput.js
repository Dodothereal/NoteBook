'use client';

import { useState } from 'react';
import FileUpload from './FileUpload';

export default function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if ((message.trim() || attachedFiles.length > 0) && !disabled) {
      onSendMessage(message, attachedFiles);
      setMessage('');
      setAttachedFiles([]);
      setShowFileUpload(false);
    }
  };
  
  const handleFileUpload = (files) => {
    setAttachedFiles([...attachedFiles, ...files]);
  };
  
  const removeAttachedFile = (id) => {
    setAttachedFiles(attachedFiles.filter(file => file.id !== id));
  };
  
  return (
    <div className="border-t p-4">
      {showFileUpload && (
        <FileUpload onFileUpload={handleFileUpload} />
      )}
      
      {attachedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center bg-gray-100 rounded-full px-3 py-1"
            >
              <span className="text-sm truncate max-w-xs">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachedFile(file.id)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex">
        <button
          type="button"
          onClick={() => setShowFileUpload(!showFileUpload)}
          className="mr-2 px-3 py-2 border rounded hover:bg-gray-100"
          disabled={disabled}
        >
          📎
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 rounded-l border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          disabled={disabled}
        />
        
        <button
          type="submit"
          className={`${
            disabled 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white px-4 py-2 rounded-r`}
          disabled={disabled}
        >
          Send
        </button>
      </form>
    </div>
  );
}