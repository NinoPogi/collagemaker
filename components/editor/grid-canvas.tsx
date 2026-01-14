'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Canvas, FabricImage, IText, ImageFormat } from 'fabric';

export interface GridCanvasRef {
  getCanvas: () => Canvas | null;
  getJsonState: () => object | null;
  loadState: (state: object) => void;
  addImageFromUrl: (url: string) => void;
  addText: () => void;
  deleteActive: () => void;
  toDataURL: (options?: { format?: ImageFormat; quality?: number; multiplier?: number }) => string | null;
}

interface GridCanvasProps {
  width: number;
  height: number;
  cellIndex: number;
  isActive: boolean;
  onSelect: (index: number) => void;
  initialState?: object | null;
  onStateChange?: (index: number, state: object) => void;
}

const GridCanvas = forwardRef<GridCanvasRef, GridCanvasProps>(
  ({ width, height, cellIndex, isActive, onSelect, initialState, onStateChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const initialized = useRef(false);

    useEffect(() => {
      if (!canvasRef.current || initialized.current) return;

      initialized.current = true;

      const canvas = new Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
      });

      fabricRef.current = canvas;

      // Load initial state if provided
      if (initialState && typeof initialState === 'object' && Object.keys(initialState).length > 0) {
        canvas.loadFromJSON(initialState).then(() => {
          canvas.renderAll();
        });
      }

      // Notify parent of state changes
      canvas.on('object:modified', () => {
        onStateChange?.(cellIndex, canvas.toJSON());
      });
      canvas.on('object:added', () => {
        onStateChange?.(cellIndex, canvas.toJSON());
      });
      canvas.on('object:removed', () => {
        onStateChange?.(cellIndex, canvas.toJSON());
      });

      // Handle selection for active cell tracking
      canvas.on('mouse:down', () => {
        onSelect(cellIndex);
      });

      return () => {
        canvas.dispose();
        fabricRef.current = null;
        initialized.current = false;
      };
    }, [width, height, cellIndex, initialState, onSelect, onStateChange]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      getJsonState: () => fabricRef.current?.toJSON() ?? null,
      loadState: (state: object) => {
        if (fabricRef.current) {
          fabricRef.current.loadFromJSON(state).then(() => {
            fabricRef.current?.renderAll();
          });
        }
      },
      addImageFromUrl: (url: string) => {
        FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
          if (!fabricRef.current) return;

          // Smart scaling to fit within cell
          const scale = Math.min(
            fabricRef.current.width! / img.width!,
            fabricRef.current.height! / img.height!,
            1
          ) * 0.8;

          img.scale(scale);
          img.set({
            left: fabricRef.current.width! / 2,
            top: fabricRef.current.height! / 2,
            originX: 'center',
            originY: 'center',
          });

          fabricRef.current.add(img);
          fabricRef.current.setActiveObject(img);
          fabricRef.current.renderAll();
        });
      },
      addText: () => {
        if (!fabricRef.current) return;
        const text = new IText('Edit me', {
          left: fabricRef.current.width! / 2,
          top: fabricRef.current.height! / 2,
          originX: 'center',
          originY: 'center',
          fontSize: Math.min(width, height) * 0.1,
        });
        fabricRef.current.add(text);
        fabricRef.current.setActiveObject(text);
        fabricRef.current.renderAll();
      },
      deleteActive: () => {
        if (!fabricRef.current) return;
        const activeObjects = fabricRef.current.getActiveObjects();
        if (activeObjects.length) {
          activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
          fabricRef.current.discardActiveObject();
          fabricRef.current.requestRenderAll();
        }
      },
      toDataURL: (options) => {
        return fabricRef.current?.toDataURL({
          format: options?.format ?? 'png',
          quality: options?.quality ?? 1,
          multiplier: options?.multiplier ?? 1,
        }) ?? null;
      },
    }), [width, height]);

    return (
      <div className="relative cursor-pointer" onClick={() => onSelect(cellIndex)}>
        <canvas ref={canvasRef} />
      </div>
    );
  }
);

GridCanvas.displayName = 'GridCanvas';

export default GridCanvas;
