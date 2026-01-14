import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, FabricImage, IText, Rect, FabricObject, Path } from 'fabric';

export interface LayerCanvasState {
  activeCellIndex: number;
}

interface UseLayerCanvasOptions {
  rows: number;
  cols: number;
  canvasWidth: number;
  canvasHeight: number;
  initialState?: object | null;
}

export function useLayerCanvas({
  rows,
  cols,
  canvasWidth,
  canvasHeight,
  initialState,
}: UseLayerCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [activeCell, setActiveCell] = useState<number>(0);
  const initialized = useRef(false);

  // Helper to get cell dimensions and bounds
  const getCellBounds = useCallback((index: number) => {
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;
    const row = Math.floor(index / cols);
    const col = index % cols;

    const centerX = (col * cellWidth) + (cellWidth / 2);
    const centerY = (row * cellHeight) + (cellHeight / 2);

    return {
      left: col * cellWidth,
      top: row * cellHeight,
      centerX,
      centerY,
      width: cellWidth,
      height: cellHeight,
    };
  }, [rows, cols, canvasWidth, canvasHeight]);

  // Create clip rect for a specific cell
  const createClipRect = useCallback((index: number) => {
    const bounds = getCellBounds(index);
    return new Rect({
      left: bounds.centerX,
      top: bounds.centerY,
      width: bounds.width,
      height: bounds.height,
      originX: 'center',
      originY: 'center',
      absolutePositioned: true, // Critical for robust clipping
      strokeWidth: 0, // Ensure no stroke affects bounds
      fill: 'transparent',
    });
  }, [getCellBounds]);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || initialized.current) return;
    initialized.current = true;

    const canvas = new Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true, // Keep text on top
      selection: true,
    });

    fabricRef.current = canvas;

    // Load state if exists
    if (initialState) {
       // Check if it's the old multi-canvas format (cells object)
       if ('cells' in initialState) {
          console.warn('Incompatible multi-canvas state found, starting fresh');
       } else {
          canvas.loadFromJSON(initialState).then(() => {
             canvas.renderAll();
          });
       }
    }

    // Grid Visuals (Internal Lines Only)
    const gridGroup: FabricObject[] = [];
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;

    // Vertical lines
    for (let c = 1; c < cols; c++) {
      const x = c * cellWidth;
      const pathData = `M 0 0 L 0 ${canvasHeight}`;
      const line = new Path(pathData, {
        left: x,
        top: 0,
        stroke: '#e0e0e0',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'top',
      });
      gridGroup.push(line);
    }

    // Horizontal lines
    for (let r = 1; r < rows; r++) {
      const y = r * cellHeight;
      const pathData = `M 0 0 L ${canvasWidth} 0`;
      const line = new Path(pathData, {
        left: 0,
        top: y,
        stroke: '#e0e0e0',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'center',
      });
      gridGroup.push(line);
    }
    // We don't add grid as objects to avoid messing with export/serialization? 
    // Actually, adding them as non-selectable background objects is good.
    gridGroup.forEach(obj => canvas.add(obj));
    gridGroup.forEach(obj => canvas.sendObjectToBack(obj));

    // Event Listeners
    canvas.on('mouse:down', (e) => {
      if (e.target) return; // Clicked on object

      // Clicked on empty space -> Determine Active Cell
      const pointer = canvas.getScenePoint(e.e);
      const col = Math.floor(pointer.x / (canvasWidth / cols));
      const row = Math.floor(pointer.y / (canvasHeight / rows));
      const index = row * cols + col;
      
      if (index >= 0 && index < rows * cols) {
        setActiveCell(index);
      }
    });

    // Object boundary constraints (Optional: strictly keep image center in cell)
    canvas.on('object:moving', (e) => {
       const obj = e.target;
       if (!obj || !obj.clipPath) return; // Only constrain clipped objects (images)
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      initialized.current = false;
    };
  }, [canvasWidth, canvasHeight, rows, cols, initialState]);

  // Actions
  const addImageToActiveCell = useCallback((url: string) => {
    if (!fabricRef.current) return;

    FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      const bounds = getCellBounds(activeCell);
      
      // Scale image to cover the cell (like object-fit: cover)
      const scale = Math.max(
        bounds.width / img.width!,
        bounds.height / img.height!
      );
      
      img.scale(scale);
      
      // Center in cell using center coordinates
      img.set({
        left: bounds.centerX,
        top: bounds.centerY,
        originX: 'center',
        originY: 'center',
        // Apply Clip Path
        clipPath: createClipRect(activeCell)
      });

      fabricRef.current!.add(img);
      fabricRef.current!.setActiveObject(img);
      fabricRef.current!.renderAll();
    });
  }, [activeCell, getCellBounds, createClipRect]);

  const addTextToActiveCell = useCallback(() => {
    if (!fabricRef.current) return;
    
    // Text is global, but we can spawn it centered on the active cell
    const bounds = getCellBounds(activeCell);

    const text = new IText('Type your text', {
      left: bounds.centerX,
      top: bounds.centerY,
      originX: 'center',
      originY: 'center',
      fontSize: 40,
      fontFamily: 'Inter, sans-serif',
      fill: '#333333',
      // No clipPath means it floats on top!
    });

    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    fabricRef.current.renderAll();
  }, [activeCell, getCellBounds]);

  const deleteActive = useCallback(() => {
    if (!fabricRef.current) return;
    const activeObjects = fabricRef.current.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
      fabricRef.current.discardActiveObject();
      fabricRef.current.requestRenderAll();
    }
  }, []);

  const downloadCanvas = useCallback(async (title: string) => {
     if (!fabricRef.current) return;
     const dataURL = fabricRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
     });
     const link = document.createElement('a');
     link.download = `${title}.png`;
     link.href = dataURL;
     link.click();
  }, []);
  
  const generateThumbnail = useCallback(async () => {
    if (!fabricRef.current) return null;
    return fabricRef.current.toDataURL({
        format: 'jpeg',
        quality: 0.8,
        multiplier: 0.5
     });
  }, []);

  const getJsonState = useCallback(() => {
     return fabricRef.current?.toJSON();
  }, []);

  return {
    canvasRef,
    activeCell,
    setActiveCell,
    addImageToActiveCell,
    addTextToActiveCell,
    deleteActive,
    downloadCanvas,
    generateThumbnail,
    getJsonState
  };
}
