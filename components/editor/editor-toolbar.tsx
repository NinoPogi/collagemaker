'use client';

import React, { useRef } from 'react';

interface EditorToolbarProps {
  title: string;
  setTitle: (val: string) => void;
  onBack: () => void;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onDelete: () => void;
  onDownload: () => void;
  isSaving: boolean;
}

export default function EditorToolbar({
  title,
  setTitle,
  onBack,
  onAddText,
  onAddImage,
  onDelete,
  onDownload,
  isSaving
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onAddImage(e.target.files[0]);
      e.target.value = ''; // Reset
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Nav & Title */}
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
            ←
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold bg-transparent border-none focus:outline-none"
          />
          {isSaving && <span className="text-xs text-slate-400">Saving...</span>}
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Add Image
          </button>
          <input 
            type="file" 
            hidden 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          
          <button 
            onClick={onAddText}
            className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Add Text
          </button>

          <button 
            onClick={onDelete}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            Delete
          </button>

          <button 
            onClick={onDownload}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}