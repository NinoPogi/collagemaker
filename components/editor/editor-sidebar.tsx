import { useState } from 'react';
import { Upload, Type, Image as ImageIcon, Grid3X3, Settings, Move, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { ProjectImage } from '@prisma/client';
import ImagesPanel from './panels/images-panel';

interface EditorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddText: () => void;
  projectId: string;
  projectImages: ProjectImage[];
}

export default function EditorSidebar({
  activeTab,
  setActiveTab,
  onAddText,
  projectId,
  projectImages
}: EditorSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const tabs = [
    { id: 'add', icon: <ImageIcon size={20} />, label: 'Images' }, // Changed 'Upload' to 'Images'
    { id: 'text', icon: <Type size={20} />, label: 'Text', action: onAddText },
  ];

  const handleTabClick = (id: string, action?: () => void) => {
     setActiveTab(id);
     if (action) {
        action();
     } else {
        // If it's a panel tab, ensure sidebar is expanded
        setIsExpanded(true);
     }
  };

  return (
    <div className="flex h-full z-20 transition-all duration-300 ease-in-out relative">
      {/* Desktop Icon Bar (Left) */}
      <div className="hidden md:flex flex-col w-20 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full z-30">
        <div className="flex flex-col items-center py-4 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.action)}
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

      {/* Expanded Panel (Drawer) */}
      <div 
        className={`hidden md:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full overflow-hidden transition-all duration-300
           ${isExpanded && activeTab === 'add' ? 'w-80 opacity-100' : 'w-0 opacity-0'}
        `}
      >
         {activeTab === 'add' && (
             <ImagesPanel 
                projectId={projectId}
                images={projectImages} 
                onUploadSuccess={() => {}} 
             />
         )}
      </div>

       {/* Toggle Button (Optional, for manual collapse) */}
        {activeTab === 'add' && (
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-lg p-1 text-slate-400 hover:text-slate-600 z-10"
                style={{ left: isExpanded ? '20rem' : '5rem' }} // Dynamic positioning logic needed or just flex
            >
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        )}


      {/* Mobile Bottom Bar (Status Quo for now, but should ideally open a drawer too) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-2 flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.action)}
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
        {/* Mobile drawer rendering logic would go here */}
      </div>
    </div>
  );
}
