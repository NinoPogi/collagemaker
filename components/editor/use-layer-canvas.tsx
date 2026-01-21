import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, FabricImage, IText, Rect, FabricObject, Path, InteractiveFabricObject, } from 'fabric';
import { Project } from '@/types/project';

export interface LayerCanvasState {
  activeCellIndex: number;
}

interface UseLayerCanvasOptions {
  project: Project;
  onCanvasChange?: () => void;
}

export function useLayerCanvas({
  project,
  onCanvasChange,
}: UseLayerCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [activeCell, setActiveCell] = useState<number>(0);
  const [isObjectSelected, setIsObjectSelected] = useState(false);
  const [activeObjectRect, setActiveObjectRect] = useState<{ top: number; left: number; width: number; height: number; type: string; } | null>(null);
  const [activeObjectProperties, setActiveObjectProperties] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const initialized = useRef(false);
  const canvasWidth = project.canvasWidth;
  const canvasHeight = project.canvasHeight;
  const initialState = typeof project.canvasState === 'string'
    ? JSON.parse(project.canvasState)
    : project.canvasState;  

    // Get grid configuration from project (with fallbacks)
  const rows = project.gridRows || 1;
  const cols = project.gridCols || 1;


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

    InteractiveFabricObject.ownDefaults = {
    ...InteractiveFabricObject.ownDefaults,
    cornerStrokeColor: 'blue',
    cornerColor: 'lightblue',
    cornerStyle: 'circle',
    padding: 10,
    transparentCorners: false,
    cornerDashArray: [2, 2],
    borderColor: 'orange',
    borderDashArray: [3, 1, 3],
    borderScaleFactor: 4,
}

    fabricRef.current = canvas;

    // Grid Visuals Helper
    const addGrid = () => {
      // Clear existing grid lines first to prevent stacking
      // We check for our specific tag 'grid-line' AND legacy lines that might have been saved
      canvas.getObjects().forEach(obj => {
         // @ts-ignore - 'id' is a custom property we're using
         if (obj.id === 'grid-line' || (obj.type === 'path' && obj.stroke === '#e0e0e0' && !obj.selectable)) {
            canvas.remove(obj);
         }
      });

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
          // @ts-ignore
          id: 'grid-line', // Tag for easy removal
          excludeFromExport: true // Custom flag we can use to filter before save if needed
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
          // @ts-ignore
          id: 'grid-line',
          excludeFromExport: true
        });
        gridGroup.push(line);
      }
      gridGroup.forEach(obj => canvas.add(obj));
      gridGroup.forEach(obj => canvas.sendObjectToBack(obj));
    };

    // Load State Logic - Only run if canvas is empty or force reload needed
    if (initialState && canvas.getObjects().length === 0) {
        // console.log('Loading state:', initialState); 
        canvas.loadFromJSON(initialState).then(() => {
            // Aggressive cleanup of any lines that might have been loaded from JSON
            addGrid(); 
            canvas.renderAll();
        }).catch(err => {
            console.warn('JSON Load Warning (might be partial):', err);
            // Even if it failed, we want a grid
            addGrid();
            canvas.renderAll();
        });
    } else {
        // Just add grid if we're not loading state (or state is already there)
        addGrid();
    }

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


    canvas.on('object:moving', (e) => {
       const obj = e.target;
       if (!obj || !obj.clipPath) return; 
    });

    // AutoSave & Event Hooks
    const debounce = (func: Function, timeout = 2000) => {
      let timer: NodeJS.Timeout;
      return (...args: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(args); }, timeout);
      };
    };

    const triggerSave = debounce(() => {
        if (onCanvasChange) onCanvasChange();
    }, 1000); // 1s debounce is better UX

    // Selection Events
    const handleSelection = () => {
       const active = canvas.getActiveObject();
       setIsObjectSelected(!!active);

       if (active) {
          const bound = active.getBoundingRect();
          setActiveObjectRect({
             top: bound.top,
             left: bound.left,
             width: bound.width,
             height: bound.height,
             type: active.type
          });

          // Extract properties if text
          if (active.type === 'i-text' || active.type === 'text') {
             setActiveObjectProperties({
                fontFamily: (active as IText).fontFamily,
                fontSize: (active as IText).fontSize,
                fill: (active as IText).fill,
                textAlign: (active as IText).textAlign,
                fontWeight: (active as IText).fontWeight,
                fontStyle: (active as IText).fontStyle,
             });
          } else {
             // We can extend this for other objects later
             setActiveObjectProperties(null);
          }

       } else {
          setActiveObjectRect(null);
          setActiveObjectProperties(null);
       }
    };

    const handleObjectModified = () => {
        handleSelection(); // Re-calculate bounds
        triggerSave();
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => {
       setIsObjectSelected(false);
       setActiveObjectRect(null);
       setActiveObjectProperties(null);
    });
    
    // Track movement for dynamic menu
    const handleTransformStart = () => {
        handleSelection();
        setIsDragging(true);
    };

    const handleInteractionEnd = () => {
        setIsDragging(false);
        handleSelection(); // Update final position
        triggerSave(); // Ensure save happens on end
    };

    canvas.on('object:moving', handleTransformStart);
    canvas.on('object:scaling', handleTransformStart);
    canvas.on('object:rotating', handleTransformStart);
    canvas.on('object:resizing', handleTransformStart);

    canvas.on('mouse:up', handleInteractionEnd); 
    // canvas.on('object:modified') is also good but mouse:up covers non-modifying interactions too if needed, 
    // but strictly for "not being dragged", mouse:up is the interaction end.

    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:removed', triggerSave);

    // Initial Render
    canvas.renderAll();

    // Native Drag & Drop Support
    const upperCanvasEl = canvas.upperCanvasEl;
    const wrapper = upperCanvasEl.parentElement; // Fabric wrapper
    
    if (wrapper) {
       wrapper.addEventListener('dragover', handleDragOver);
       wrapper.addEventListener('drop', handleDrop);
    }

    return () => {
      canvas.dispose();
      fabricRef.current = null;
      initialized.current = false;
      if (wrapper) {
          wrapper.removeEventListener('dragover', handleDragOver);
          wrapper.removeEventListener('drop', handleDrop);
      }
    };
  }, [canvasWidth, canvasHeight, rows, cols]); // Removed initialState to prevent re-init loops

  // DND Handlers
  const handleDragOver = useCallback((e: DragEvent) => {
     e.preventDefault();
     e.dataTransfer!.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
      e.preventDefault();
      if (!fabricRef.current) return;

      const payload = e.dataTransfer?.getData('payload');
      if (!payload) return;

      const { url } = JSON.parse(payload);
      if (!url) return;

      // Coordinate Calculation (handling CSS scale)
      const canvas = fabricRef.current;
      const upperCanvasEl = canvas.upperCanvasEl; 
      const rect = upperCanvasEl.getBoundingClientRect(); // Visual rect (scaled by CSS)
      
      const x = (e.clientX - rect.left) / (rect.width / canvasWidth);
      const y = (e.clientY - rect.top) / (rect.height / canvasHeight);

      // Determine Cell
      const col = Math.floor(x / (canvasWidth / cols));
      const row = Math.floor(y / (canvasHeight / rows));
      const index = row * cols + col;

      if (index >= 0 && index < rows * cols) {
         setActiveCell(index);
         // Small timeout to allow state update? strictly setActiveCell is async but addImage uses param?
         // Actually addImageToActiveCell uses proper param or state. 
         // Let's modify addImageToCell to accept index directly or reuse existing.
         // Existing uses `activeCell` state which might be stale in this callback closure?
         // Ah, `handleDrop` is a closure from the render. `activeCell` might be old.
         // Better to implement `addImageToCell(index, url)` helper that doesn't rely on state.
         addImageToCell(index, url);
      }

  }, [canvasWidth, canvasHeight, cols, rows]);

  // Refactor addImage to take index
  const addImageToCell = useCallback((cellIndex: number, url: string) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current; // Stable ref

    FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      const bounds = getCellBounds(cellIndex);
      
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
        clipPath: createClipRect(cellIndex)
      });

      // Remove existing image in this cell IF strict mode? 
      // Optional: Remove previous images intersecting this cell center?
      // For now just add on top.

      canvas.add(img);
      canvas.setActiveObject(img);

      canvas.renderAll();
      
      // Trigger autosave
      canvas.fire('object:added', { target: img });
    });
  }, [getCellBounds, createClipRect]);


  // Actions
  const addImageToActiveCell = useCallback((url: string) => {
     addImageToCell(activeCell, url);
  }, [activeCell, addImageToCell]);

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

  const deleteActiveObject = useCallback(() => {
      if (!fabricRef.current) return;
      const active = fabricRef.current.getActiveObject();
      if (active) {
          fabricRef.current.remove(active);
          fabricRef.current.discardActiveObject();
          fabricRef.current.renderAll(); // Auto-save triggers on 'object:removed'
          setIsObjectSelected(false);
      }
  }, []);

  const updateActiveObject = useCallback((updates: Partial<FabricObject>) => {
      if (!fabricRef.current) return;
      const active = fabricRef.current.getActiveObject();
      if (active) {
          active.set(updates);
          active.setCoords(); // Update hit box
          fabricRef.current.requestRenderAll();
          
          // Manually trigger updates
          if (active.type === 'i-text' || active.type === 'text') {
              // Update state locally so UI reflects change immediately
               setActiveObjectProperties((prev: any) => ({ ...prev, ...updates }));
          }

          // Trigger save
          fabricRef.current.fire('object:modified', { target: active });
      }
  }, []);

  const downloadCanvas = useCallback(async (title: string) => {
     if (!fabricRef.current) return;
     const canvas = fabricRef.current; // Stable ref

     // 1. Handle Background (Make opaque white)
     const originalBg = canvas.backgroundColor;
     canvas.backgroundColor = '#ffffff';

     // 2. Hide Highlight
     const highlight = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
     const wasVisible = highlight ? highlight.visible : false;
     if (highlight) highlight.visible = false;

     // 3. Export
     const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
     });

     // 4. Restore State
     if (highlight) highlight.visible = wasVisible;
     canvas.backgroundColor = originalBg;
     canvas.requestRenderAll();

     const link = document.createElement('a');
     link.download = `${title}.png`;
     link.href = dataURL;
     link.click();
  }, []);
  
  const generateThumbnail = useCallback(async () => {
    if (!fabricRef.current) return null;
    const canvas = fabricRef.current;

    // 1. Handle Background
    const originalBg = canvas.backgroundColor;
    canvas.backgroundColor = '#ffffff';
    
    // 2. Hide Highlight
    const highlight = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
    const wasVisible = highlight ? highlight.visible : false;
    if (highlight) highlight.visible = false;

    // 3. Export
    const dataUrl = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.8,
        multiplier: 0.5,
    });

    // 4. Restore
    if (highlight) highlight.visible = wasVisible;
    canvas.backgroundColor = originalBg;
    
    return dataUrl;
  }, []);

  const getJsonState = useCallback(() => {
     if (!fabricRef.current) return null;
     // Standard toJSON
     const json = (fabricRef.current as any).toObject([ 'id', 'excludeFromExport' ]); 
     
     // Filter out highlight manually to be safe
     if (json && json.objects) {
         json.objects = json.objects.filter((obj: any) => obj.id !== 'active-cell-highlight');
     }
     return json;
  }, []);

  // Highlight Active Cell Logic
  const highlightActiveCell = useCallback(() => {
     if (!fabricRef.current) return;
     const canvas = fabricRef.current;
     
     // Remove existing highlight
     const existing = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
     if (existing) {
        canvas.remove(existing);
     }
     
     // Calculate bounds
     const bounds = getCellBounds(activeCell);

     // Create highlight rect
     const rect = new Rect({
        left: bounds.centerX,
        top: bounds.centerY,
        width: bounds.width,
        height: bounds.height,
        originX: 'center',
        originY: 'center',
        fill: 'transparent',
        stroke: '#f97316', 
        strokeWidth: 4,
        selectable: false,
        evented: false, 
        // @ts-ignore
        id: 'active-cell-highlight',
        excludeFromExport: true 
     });

     canvas.add(rect);
     canvas.requestRenderAll();
  }, [activeCell, getCellBounds]);

  // Trigger Highlight on Active Cell Change
  useEffect(() => {
     if (fabricRef.current) {
        highlightActiveCell();
     }
  }, [activeCell, highlightActiveCell]);



  return {
    canvasRef,
    activeCell,
    setActiveCell,
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
    updateActiveObject
  };
}
