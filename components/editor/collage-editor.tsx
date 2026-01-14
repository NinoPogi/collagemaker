'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateProject, uploadImage } from '@/app/actions';
import { Project } from '@/types/project';
import { useCanvas } from './use-canvas';
import EditorToolbar from './editor-toolbar';

interface CollageEditorProps {
  project: Project;
}

export default function CollageEditor({ project }: CollageEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(project.title);
  const [isSaving, setIsSaving] = useState(false);
  
  // 1. Use our custom hook
  const { 
    canvasRef, 
    fabricRef, // Exposed if needed for direct access
    addImage, 
    addText, 
    deleteActive, 
    downloadCanvas,
    getJsonState,
    getThumbnail,
    addImageFromUrl
  } = useCanvas(project);

  // 2. Handle Saving Logic
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Generate thumbnail
      const thumbnailDataUrl = getThumbnail();
      let thumbnailUrl = project.thumbnailUrl;

      if (thumbnailDataUrl) {
         // Upload thumbnail
         // Convert data URL to blob or transmit as string (uploadImage handles base64 string)
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
        canvasState,
        thumbnailUrl: thumbnailUrl ?? undefined,
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', JSON.stringify(file)); // This won't work for File object directly over server actions like this usually needs FormData
    // Actually we can pass FormData to server action.
    // We need to append the file.
  };

  const onAddImage = async (file: File) => {
     // Upload first
     const formData = new FormData();
     // We need to convert file to base64 or just send FormData if server action supports it.
     // Server action supports FormData taking 'file' as string | Blob?
     // Actions.ts: const file = formData.get('file') as string; -> It expects string (base64) or maybe I should change it to handle File/Blob if possible?
     // ImageKit node sdk upload method takes 'file' as "string | Buffer | ReadableStream". base64 string works.
     // So let's convert File to base64 on client.
     
     const reader = new FileReader();
     reader.readAsDataURL(file);
     reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const formData = new FormData();
        formData.append('file', base64);
        formData.append('fileName', file.name);

        const res = await uploadImage(formData);
        if (res.success && res.url) {
            addImageFromUrl(res.url);
        } else {
            alert('Image upload failed');
        }
     };
  };

  // 3. Auto-save Interval
  useEffect(() => {
    const timer = setInterval(() => {
      // Only save if we have a canvas instance
      if (fabricRef.current) {
        handleSave();
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [title]); // Re-create timer if title changes to capture new title

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <EditorToolbar 
        title={title}
        setTitle={setTitle}
        isSaving={isSaving}
        onBack={() => router.push('/dashboard')}
        onAddImage={onAddImage}
        onAddText={addText}
        onDelete={deleteActive}
        onDownload={() => downloadCanvas(title)}
      />

      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="shadow-2xl border border-slate-200 dark:border-slate-700 bg-white">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}