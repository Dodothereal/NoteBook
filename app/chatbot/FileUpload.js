'use client';

import { useState, useRef } from 'react';

export default function FileUpload({ onFileUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  
  const inputRef = useRef(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (fileList) => {
    // Validate file types and size (simple validation)
    const validFiles = Array.from(fileList).filter(file => {
      // Limit to 10MB per file for example
      return file.size <= 10 * 1024 * 1024;
    });
    
    if (validFiles.length < fileList.length) {
      alert('Some files were skipped because they were too large (max 10MB)');
    }
    
    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      file,
      preview: file.type.startsWith('image') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false,
    }));
    
    setFiles([...files, ...newFiles]);
    simulateUpload(newFiles);
  };
  
  const simulateUpload = async (newFiles) => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Mark files as uploaded
    const uploadedFiles = newFiles.map(file => ({
      ...file,
      uploaded: true,
    }));
    
    setFiles(prev => prev.map(file => {
      const uploadedFile = uploadedFiles.find(f => f.id === file.id);
      return uploadedFile || file;
    }));
    
    setUploading(false);
    setUploadProgress(0);
    
    // Notify parent component
    onFileUpload(uploadedFiles);
  };
  
  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };
  
  return (
    <div className="mb-4">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop files here, or click to select files
            </p>
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Select Files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      
      {uploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className="bg-blue-600 h-2 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">
            Uploading: {uploadProgress}%
          </p>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="mt-4 flex flex-nowrap gap-4 overflow-x-auto">
          {files.map((file) => (
            <div key={file.id} className="border rounded p-2 w-32 flex-shrink-0">
              {file.preview ? (
                <div className="h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center bg-gray-100">
                  <span className="text-gray-500">{file.type.split('/')[0]}</span>
                </div>
              )}
              <div className="mt-2">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {Math.round(file.size / 1024)} KB
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs ${file.uploaded ? 'text-green-500' : 'text-gray-500'}`}>
                    {file.uploaded ? 'Uploaded' : 'Pending'}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}