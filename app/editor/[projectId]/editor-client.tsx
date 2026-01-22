'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateProject, uploadImage } from '@/app/actions';
import { Project } from '@/types/project';
import EditorHeader from '@/components/editor/editor-header';
import EditorSidebar from '@/components/editor/editor-sidebar';
import FloatingMenu from '@/components/editor/floating-menu';
import { useLayerCanvas } from '../../../components/editor/use-layer-canvas';
import { ProjectImage } from '@/lib/generated/prisma/client';

interface CollageEditorProps {
  project: Project;
  initialImages: ProjectImage[];
}

export default function CollageEditor({ project, initialImages }: CollageEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(project.title);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use layer canvas hook (Smart Single Canvas)
  const {
    canvasRef,
    addImageToActiveCell,
    addTextToActiveCell,
    downloadCanvas,
    generateThumbnail,
    getJsonState,
    deleteActiveObject,
    isObjectSelected,
    activeObjectRect,
    isDragging,
    activeObjectProperties,
    updateActiveObject,
    activeObjectFilters,
    updateActiveImageFilter,
    gridConfig,
    updateGridConfig,
    bringActiveObjectToFront
  } = useLayerCanvas({
    project,
    onCanvasChange: () => {
       handleSave();
    }
  });

  // Auto-switch tabs based on selection
  useEffect(() => {
     if (activeObjectRect) {
         if (activeObjectRect.type === 'image') {
             setActiveTab('images');
             setIsSidebarOpen(true);
         } else if (activeObjectRect.type === 'i-text' || activeObjectRect.type === 'text') {
             setActiveTab('text');
             setIsSidebarOpen(true);
         }
     } else {
         // No selection -> Active Cell changed or just deselected
         // User wants to open upload tab
         setActiveTab('upload');
         setIsSidebarOpen(true);
     }
  }, [activeObjectRect]); // Dependency on rect change (selection change)

  // Handle Saving Logic
  const handleSave = async (isManual = false) => {
    setIsSaving(true);
    try {
      let thumbnailUrl = project.thumbnailUrl;

      // Update thumbnail only on manual save to save bandwidth/speed?
      // Or just do it every time if it's fast enough. 
      // Let's do it every time for now to keep it synced.
      const thumbnailDataUrl = await generateThumbnail();
      if (thumbnailDataUrl) {
        // We can optimize this to only upload if changed, but for now upload.
         // (Omitted for brevity in this snippet, assuming existing upload logic is sound)
         // ... Re-add upload logic here if needed, or simpler:
         const formData = new FormData();
         formData.append('file', thumbnailDataUrl);
         formData.append('fileName', `thumbnail-${project.id}.jpg`);
         formData.append('useUniqueFileName', 'false');
         const uploadRes = await uploadImage(formData);
         if (uploadRes.success && uploadRes.url) {
            thumbnailUrl = uploadRes.url;
         }
      }

      const canvasState = getJsonState();
      await updateProject(project.id, {
        title,
        canvasState: canvasState ? JSON.parse(JSON.stringify(canvasState)) : null,
        thumbnailUrl: thumbnailUrl ?? undefined,
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image upload
  const onAddImage = async (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const formData = new FormData();
      formData.append('file', base64);
      formData.append('fileName', file.name);

      const res = await uploadImage(formData);
      if (res.success && res.url) {
        addImageToActiveCell(res.url);
      } else {
        alert('Image upload failed');
      }
    };
  };

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);


  // Calculate display scale (dynamically fitting container)
  const padding = 32; // Safety padding
  const availableWidth = Math.max(0, containerSize.width - padding);
  const availableHeight = Math.max(0, containerSize.height - padding);

  const scale = containerSize.width && containerSize.height ? Math.min(
    availableWidth / project.canvasWidth,
    availableHeight / project.canvasHeight,
    1
  ) : 0.1;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
       {/* Header */}
       <EditorHeader 
          title={title}
          setTitle={setTitle}
          isSaving={isSaving}
          onBack={() => router.push('/')}
          onDownload={() => downloadCanvas(title)}
          onManualSave={() => handleSave(true)}
       />


       {/* Main Content Area */}
       <div className="flex flex-1 overflow-hidden relative">
          
          {/* Sidebar / Bottom Bar */}
          <EditorSidebar 
             activeTab={activeTab}
             setActiveTab={setActiveTab}
             isExpanded={isSidebarOpen}
             setIsExpanded={setIsSidebarOpen}
             onAddText={addTextToActiveCell}
             projectId={project.id}
             projectImages={initialImages}
             activeObjectProperties={activeObjectProperties}
             onUpdateActiveObject={updateActiveObject}
             activeObjectFilters={activeObjectFilters}
             onUpdateActiveImageFilter={updateActiveImageFilter}
             gridConfig={gridConfig}
             onUpdateGridConfig={updateGridConfig}
             onBringToFront={bringActiveObjectToFront}
             onSelectImage={(image) => {
                 addImageToActiveCell(image.url);
                 // Auto-close on mobile
                 if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                 }
             }}
          />
          
          {/* Canvas Area */}
          <main 
             ref={containerRef} 
             className="flex-1 flex items-center justify-center p-4 pb-24 md:pb-4 bg-dots-pattern relative"
             onClick={() => {
                // If sidebar is open, close it (on mobile especially, or desktop if user wants full view)
                // Actually the requirement: "if they want to close the tab they just click outside the canvas"
                // This `main` area IS the outside of the canvas wrapper (the dots area).
                // if(isSidebarOpen) setIsSidebarOpen(false);
             }}
          >
              <div 
                className="shadow-2xl border border-slate-200 dark:border-slate-700 bg-white transition-all duration-300 ease-out relative"
                style={{
                  width: project.canvasWidth * scale,
                  height: project.canvasHeight * scale,
                }}
              >
                 <div
                    style={{
                       width: project.canvasWidth,
                       height: project.canvasHeight,
                       transform: `scale(${scale})`,
                       transformOrigin: 'top left'
                    }}
                 >
                    {isObjectSelected && activeObjectRect && !isDragging && (
                        <FloatingMenu 
                           onDelete={deleteActiveObject} 
                           position={{
                              top: activeObjectRect.top,
                              left: activeObjectRect.left + (activeObjectRect.width / 2)
                           }}
                           label={activeObjectRect.type === 'i-text' ? 'Text Layer' : 'Image Layer'}
                        />
                    )}
                    {isObjectSelected && !activeObjectRect && !isDragging && (
                        <FloatingMenu onDelete={deleteActiveObject} />
                    )}
                    {/* Stable wrapper for Fabric.js to manipulate without breaking React */}
                    <div>
                       <canvas ref={canvasRef} />
                    </div>
                 </div>
              </div>
          </main>
       </div>
    </div>
  );
}