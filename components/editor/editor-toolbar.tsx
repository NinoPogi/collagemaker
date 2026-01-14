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
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left: Nav & Title */}
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
            ←
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold bg-transparent border-none focus:outline-none w-32 md:w-auto"
          />
          {isSaving && <span className="text-xs text-slate-400">Saving...</span>}
        </div>

        {/* Right: Tools (Responsive) */}
        <div className="
          fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
          md:static md:p-0 md:bg-transparent md:border-t-0 md:justify-end md:shadow-none md:gap-2
        ">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 md:px-4 md:py-2 bg-slate-100 rounded-lg hover:bg-slate-200 flex flex-col md:flex-row items-center gap-1"
          >
            <span className="md:hidden text-lg">🖼️</span>
            <span className="text-xs md:text-sm">Image</span>
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
            className="p-3 md:px-4 md:py-2 bg-slate-100 rounded-lg hover:bg-slate-200 flex flex-col md:flex-row items-center gap-1"
          >
            <span className="md:hidden text-lg">T</span>
            <span className="text-xs md:text-sm">Text</span>
          </button>

          <button 
            onClick={onDelete}
            className="p-3 md:px-4 md:py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex flex-col md:flex-row items-center gap-1"
          >
            <span className="md:hidden text-lg">🗑️</span>
            <span className="text-xs md:text-sm">Delete</span>
          </button>

          <button 
            onClick={onDownload}
            className="p-3 md:px-4 md:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex flex-col md:flex-row items-center gap-1"
          >
            <span className="md:hidden text-lg">⬇️</span>
            <span className="text-xs md:text-sm">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}