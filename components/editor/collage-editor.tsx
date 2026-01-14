'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { updateProject, uploadImage } from '@/app/actions';
import { Project } from '@/types/project';
import EditorToolbar from './editor-toolbar';
import { useLayerCanvas } from './use-layer-canvas';

interface CollageEditorProps {
  project: Project;
}

export default function CollageEditor({ project }: CollageEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(project.title);
  const [isSaving, setIsSaving] = useState(false);

  // Get grid configuration from project (with fallbacks)
  const rows = project.gridRows || 1;
  const cols = project.gridCols || 1;

  // Use layer canvas hook (Smart Single Canvas)
  const {
    canvasRef,
    activeCell,
    setActiveCell,
    addImageToActiveCell,
    addTextToActiveCell,
    deleteActive,
    downloadCanvas,
    generateThumbnail,
    getJsonState
  } = useLayerCanvas({
    rows,
    cols,
    canvasWidth: project.canvasWidth,
    canvasHeight: project.canvasHeight,
    initialState: typeof project.canvasState === 'string'
      ? JSON.parse(project.canvasState)
      : project.canvasState,
  });

  // Handle Saving Logic
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Generate thumbnail
      const thumbnailDataUrl = await generateThumbnail();
      let thumbnailUrl = project.thumbnailUrl;

      if (thumbnailDataUrl) {
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

  // Responsive Container sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-save Interval
  useEffect(() => {
    const timer = setInterval(() => {
      handleSave();
    }, 30000);
    return () => clearInterval(timer);
  }, [title]);

  // Calculate display scale (dynamically fitting container)
  const padding = 32; // Safety padding
  const availableWidth = Math.max(0, containerSize.width - padding);
  const availableHeight = Math.max(0, containerSize.height - padding);

  const scale = containerSize.width && containerSize.height ? Math.min(
    availableWidth / project.canvasWidth,
    availableHeight / project.canvasHeight,
    1
  ) : 0.1; // Default small scale to prevent initial blowup

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <EditorToolbar
        title={title}
        setTitle={setTitle}
        isSaving={isSaving}
        onBack={() => router.push('/dashboard')}
        onAddImage={onAddImage}
        onAddText={addTextToActiveCell}
        onDelete={deleteActive}
        onDownload={() => downloadCanvas(title)}
      />

      <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 pb-28 md:pb-4 overflow-hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-slate-600 dark:text-slate-400">
             Active Cell: <span className="font-bold text-orange-500">{activeCell + 1}</span>
          </div>

          <div
            className="shadow-2xl border border-slate-200 dark:border-slate-700 bg-white"
            style={{
              width: project.canvasWidth * scale,
              height: project.canvasHeight * scale,
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: project.canvasWidth,
                height: project.canvasHeight,
              }}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}