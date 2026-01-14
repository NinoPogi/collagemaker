import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, FabricImage, IText } from 'fabric';
import { Project } from '@/types/project';

export function useCanvas(project: Project) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || initialized.current) return;

    initialized.current = true;
    
    const canvas = new Canvas(canvasRef.current, {
      width: project.canvasWidth,
      height: project.canvasHeight,
      backgroundColor: '#ffffff',
    });

    fabricRef.current = canvas;

    if (project.canvasState && project.canvasState !== 'null') {
      const state = typeof project.canvasState === 'string' 
        ? JSON.parse(project.canvasState) 
        : project.canvasState;
        
      canvas.loadFromJSON(state).then(() => {
        canvas.renderAll();
      });
    }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      initialized.current = false;
    };
  }, [project]);

  // Actions
  const addImage = useCallback((file: File) => {
    if (!fabricRef.current) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target?.result as string;
      FabricImage.fromURL(imgUrl).then((img) => {
        if (!fabricRef.current) return;
        
        // Smart scaling
        const scale = Math.min(
          fabricRef.current.width! / img.width!,
          fabricRef.current.height! / img.height!,
          1
        ) * 0.5;

        img.scale(scale);
        img.set({
            left: fabricRef.current.width! / 2,
            top: fabricRef.current.height! / 2,
            originX: 'center',
            originY: 'center',
        });
        
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const addImageFromUrl = useCallback((url: string) => {
    FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      if (!fabricRef.current) return;
      
      // Smart scaling
      const scale = Math.min(
        fabricRef.current.width! / img.width!,
        fabricRef.current.height! / img.height!,
        1
      ) * 0.5;

      img.scale(scale);
      img.set({
          left: fabricRef.current.width! / 2,
          top: fabricRef.current.height! / 2,
          originX: 'center',
          originY: 'center',
      });
      
      fabricRef.current.add(img);
      fabricRef.current.setActiveObject(img);
    });
  }, []);

  const addText = useCallback(() => {
    if (!fabricRef.current) return;
    const text = new IText('Double click to edit', {
      left: fabricRef.current.width! / 2,
      top: fabricRef.current.height! / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 40,
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
  }, []);

  const deleteActive = useCallback(() => {
    if (!fabricRef.current) return;
    const activeObjects = fabricRef.current.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
      fabricRef.current.discardActiveObject();
      fabricRef.current.requestRenderAll();
    }
  }, []);

  const downloadCanvas = useCallback((title: string) => {
    if (!fabricRef.current) return;
    const dataURL = fabricRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, 
    });
    const link = document.createElement('a');
    link.download = `${title}.png`;
    link.href = dataURL;
    link.click();
  }, []);

  const getThumbnail = useCallback(() => {
    if (!fabricRef.current) return null;
    return fabricRef.current.toDataURL({
      format: 'jpeg',
      quality: 0.8,
      multiplier: 0.5, 
    });
  }, []);

  const getJsonState = useCallback(() => {
    return fabricRef.current?.toJSON();
  }, []);

  return {
    canvasRef,
    fabricRef,
    addImage,
    addText,
    deleteActive,
    downloadCanvas,
    getJsonState,
    getThumbnail,
    addImageFromUrl
  };
}