import { useState } from 'react';
import { Upload, Type, Image as ImageIcon, Grid3X3, Settings, Move, X, LayoutGrid } from 'lucide-react';
import { ProjectImage } from '@/lib/generated/prisma/client';
import ImagesPanel from './panels/images-panel';
import TextPanel from './panels/text-panel';
import TransformPanel from './panels/transform-panel';
import BorderPanel from './panels/border-panel';
import { ChevronRight, ChevronLeft, Crop } from 'lucide-react';

interface EditorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddText: () => void;
  projectId: string;
  projectImages: ProjectImage[];
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onSelectImage: (image: ProjectImage) => void;
  activeObjectProperties: any; // We can type this strictly later if needed
  onUpdateActiveObject: (updates: any) => void;
  activeObjectFilters: any;
  onUpdateActiveImageFilter: (type: string, value: number | boolean) => void;
  gridConfig: { color: string, thickness: number };
  onUpdateGridConfig: (updates: any) => void;
  onBringToFront: () => void;
}

export default function EditorSidebar({
  activeTab,
  setActiveTab,
  onAddText,
  projectId,
  projectImages,
  isExpanded,
  setIsExpanded,
  onSelectImage,
  activeObjectProperties,
  onUpdateActiveObject,
  activeObjectFilters,
  onUpdateActiveImageFilter,
  gridConfig,
  onUpdateGridConfig,
  onBringToFront
}: EditorSidebarProps) {
  
  const tabs = [
    { id: 'upload', icon: <Upload size={20} />, label: 'Upload', disabled: false },
    { id: 'images', icon: <ImageIcon size={20} />, label: 'Images' },
    { id: 'text', icon: <Type size={20} />, label: 'Text' }, 
    { id: 'border', icon: <LayoutGrid size={20} />, label: 'Border' },
    // { id: 'crop', icon: <Crop size={20} />, label: 'Crop', disabled: true }, 
  ];

  const handleTabClick = (id: string) => {
     if(id === 'crop') return; // Disabled for now

     // Toggle Logic: If clicking active tab, collapse it? 
     // Or just always open. Let's make it toggle for better interaction.
     if (activeTab === id && isExpanded) {
        setIsExpanded(false);
     } else {
        setActiveTab(id);
        setIsExpanded(true);
     }
     
  };

  const renderPanelContent = () => {
      switch(activeTab) {
          case 'upload':
              return <ImagesPanel 
                  projectId={projectId} 
                  images={projectImages} 
                  onUploadSuccess={()=>{}} 
                  onSelectImage={onSelectImage} 
              />;
          case 'images':
              return <TransformPanel 
                   activeFilters={activeObjectFilters}
                   onUpdateFilter={onUpdateActiveImageFilter}
                   onBringToFront={onBringToFront}
              />;
          case 'text':
              return <TextPanel 
                 onAddText={onAddText} 
                 properties={activeObjectProperties}
                 onUpdate={onUpdateActiveObject}
              />;
           case 'border':
               return <BorderPanel 
                   config={gridConfig}
                   onUpdate={onUpdateGridConfig}
               />;
          default:
              return null;
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
              onClick={() => handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all relative group ${
                activeTab === tab.id && isExpanded
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.disabled && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
                      Coming Soon
                  </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Panel (Drawer) */}
      <div 
        className={`hidden md:flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full overflow-hidden transition-all duration-300 relative z-20
           ${isExpanded && activeTab !== 'crop' ? 'w-80 opacity-100' : 'w-0 opacity-0'}
        `}
      >
         {renderPanelContent()}
      </div>

       {/* Toggle Button */}
        {activeTab !== 'crop' && (
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-lg p-1 text-slate-400 hover:text-slate-600 z-10 shadow-sm"
                style={{ left: isExpanded ? '25rem' : '5rem' }} 
            >
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        )}


      {/* Mobile Bottom Bar (Z-Index 50 to stay above content, but panels need to go over it?) 
          Actually user requested panels to cover toolbar. So panels must be fixed z-50 bottom-0.
      */}
      
      {/* Mobile Panel Overlay */}
      {isExpanded && activeTab !== 'crop' && (
          <div className="md:hidden fixed inset-x-0 bottom-0 h-[50vh] bg-white dark:bg-slate-800 z-40 rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-y-auto transform transition-transform duration-300 ease-in-out p-4 pb-24 border-t border-slate-200 dark:border-slate-700">
               {/* Mobile Header for Panel */}
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold capitalize">{tabs.find(t=>t.id===activeTab)?.label}</h3>
                  <button onClick={() => setIsExpanded(false)} className="p-2 bg-slate-100 rounded-full"><X size={16}/></button>
               </div>
               {renderPanelContent()}
          </div>
      )}

      {/* Bottom Bar Icons */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-2 flex justify-around items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id && isExpanded
                ? 'text-orange-600 dark:text-orange-400 transform -translate-y-1'
                : 'text-slate-500'
            } ${tab.disabled ? 'opacity-50' : ''}`}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
