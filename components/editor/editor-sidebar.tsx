'use client';

import { useState } from 'react';
import { Upload, Type, Grid3X3, Settings, Move, X } from 'lucide-react';

interface EditorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddText: () => void;
  onAddImageInput: () => void; // Trigger hidden file input
}

export default function EditorSidebar({
  activeTab,
  setActiveTab,
  onAddText,
  onAddImageInput
}: EditorSidebarProps) {
  
  const tabs = [
    { id: 'add', icon: <Upload size={20} />, label: 'Add', action: onAddImageInput },
    { id: 'text', icon: <Type size={20} />, label: 'Text', action: onAddText },
    // { id: 'grid', icon: <Grid3X3 size={20} />, label: 'Grid' },
    // { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left) */}
      <div className="hidden md:flex flex-col w-20 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full z-20">
        <div className="flex flex-col items-center py-4 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if(tab.action) tab.action();
              }}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-2 flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
               setActiveTab(tab.id);
               if(tab.action) tab.action();
            }}
            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id
                ? 'text-orange-600 dark:text-orange-400 transform -translate-y-1'
                : 'text-slate-500'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
