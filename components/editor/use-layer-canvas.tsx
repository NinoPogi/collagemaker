import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, FabricImage, IText, Rect, FabricObject, Path, InteractiveFabricObject, filters } from 'fabric';
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
  const [activeObjectFilters, setActiveObjectFilters] = useState<any>(null);
  const [gridConfig, setGridConfig] = useState({ color: '#e0e0e0', thickness: 1 });
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


    // Helper defined inside to access local scope vars easily, 
    // but better if outside so we can call it when config changes.
    // However, to fix the structure quickly, I'll define it here for init, 
    // and rely on updateGridConfig to trigger refreshes via modified/re-add logic.
    // Actually, let's keep it here for INIT.
    const addGrid = () => {
       // Defined below but reused here for initial load?
       // Just call the reusable function if possible.
       // But reusable function needs closure vars.
       // Let's rely on the separate `useEffect` for grid rendering.
    };
    
    // Load State Logic
    if (initialState) {
         if (initialState.gridConfig) {
             setGridConfig(initialState.gridConfig);
         }
         
         canvas.loadFromJSON(initialState).then(() => {
             canvas.renderAll();
         }).catch(console.warn);
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
    }, 1000); 

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
          setActiveObjectProperties(null);
        }

        // Extract Filters if Image
        if (active.type === 'image') {
          const img = active as FabricImage;
          const filtersState: any = {
            saturation: 0,
            contrast: 0,
            hue: 0,
            pixelate: 0,
            sepia: false
          };

          img.filters?.forEach((f: any) => {
            if (f.type === 'Saturation') filtersState.saturation = f.saturation;
            if (f.type === 'Contrast') filtersState.contrast = f.contrast;
            if (f.type === 'HueRotation') filtersState.hue = f.rotation;
            if (f.type === 'Pixelate') filtersState.pixelate = f.blocksize;
            if (f.type === 'Sepia') filtersState.sepia = true;
          });
          setActiveObjectFilters(filtersState);
        } else {
          setActiveObjectFilters(null);
        }

      } else {
        setActiveObjectRect(null);
        setActiveObjectProperties(null);
        setActiveObjectFilters(null);
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
      setActiveObjectFilters(null);
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
  }, [canvasWidth, canvasHeight, rows, cols]);

  // Separate Effect for Grid Rendering (Responsive to Config Changes)
  useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      
      // Grid Creation Logic
      const addGrid = () => {
        // Clear existing grid lines first to prevent stacking
        canvas.getObjects().forEach(obj => {
           // @ts-ignore
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
            stroke: gridConfig.color,
            strokeWidth: gridConfig.thickness,
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'top',
            // @ts-ignore
            id: 'grid-line',
            excludeFromExport: true 
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
            stroke: gridConfig.color,
            strokeWidth: gridConfig.thickness,
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

        // Layering Enforcement: Images < Grid < Text
        // 1. Send all images to back first
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'image') canvas.sendObjectToBack(obj);
        });
  
        // 2. Bring grid lines forward (above images)
         canvas.getObjects().forEach(obj => {
            // @ts-ignore
            if (obj.id === 'grid-line') canvas.bringObjectToFront(obj);
        });
  
        // 3. Bring text to very front (above grid)
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'i-text' || obj.type === 'text') canvas.bringObjectToFront(obj);
        });
        
        // 4. Highlight always on top
        const highlight = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
        if (highlight) canvas.bringObjectToFront(highlight);
        
        canvas.requestRenderAll();
      };
      
      addGrid();

  }, [gridConfig, canvasWidth, canvasHeight, rows, cols]);


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

    const canvas = fabricRef.current;
    const upperCanvasEl = canvas.upperCanvasEl;
    const rect = upperCanvasEl.getBoundingClientRect();

    const x = (e.clientX - rect.left) / (rect.width / canvasWidth);
    const y = (e.clientY - rect.top) / (rect.height / canvasHeight);

    const col = Math.floor(x / (canvasWidth / cols));
    const row = Math.floor(y / (canvasHeight / rows));
    const index = row * cols + col;

    if (index >= 0 && index < rows * cols) {
      setActiveCell(index);
      addImageToCell(index, url);
    }

  }, [canvasWidth, canvasHeight, cols, rows]);

  // Refactor addImage to take index
  const addImageToCell = useCallback((cellIndex: number, url: string) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
      const bounds = getCellBounds(cellIndex);

      const scale = Math.max(
        bounds.width / img.width!,
        bounds.height / img.height!
      );

      img.scale(scale);

      img.set({
        left: bounds.centerX,
        top: bounds.centerY,
        originX: 'center',
        originY: 'center',
        clipPath: createClipRect(cellIndex)
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      
      // Ensure layering is respected on add
      canvas.sendObjectToBack(img);
      // But wait, if we send to back, we might hide it behind background? 
      // Background is color.
      // We want behind grid.
      // Re-trigger grid layering logic?
      // Or just ensure grid is on top.
      const gridLines = canvas.getObjects().filter((o: any) => o.id === 'grid-line');
      gridLines.forEach(l => canvas.bringObjectToFront(l));
      
      // And Text on top of Grid
      const texts = canvas.getObjects().filter((o: any) => o.type === 'i-text' || o.type === 'text');
      texts.forEach(t => canvas.bringObjectToFront(t));
      
      const highlight = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
      if (highlight) canvas.bringObjectToFront(highlight);

      canvas.renderAll();
      canvas.fire('object:added', { target: img });
    });
  }, [getCellBounds, createClipRect]);


  // Actions
  const addImageToActiveCell = useCallback((url: string) => {
    addImageToCell(activeCell, url);
  }, [activeCell, addImageToCell]);

  const addTextToActiveCell = useCallback(() => {
    if (!fabricRef.current) return;

    const bounds = getCellBounds(activeCell);

    const text = new IText('Type your text', {
      left: bounds.centerX,
      top: bounds.centerY,
      originX: 'center',
      originY: 'center',
      fontSize: 40,
      fontFamily: 'Inter, sans-serif',
      fill: '#333333',
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
      fabricRef.current.renderAll();
      setIsObjectSelected(false);
    }
  }, []);

  const updateActiveObject = useCallback((updates: Partial<FabricObject>) => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      active.set(updates);
      active.setCoords();
      fabricRef.current.requestRenderAll();

      if (active.type === 'i-text' || active.type === 'text') {
        setActiveObjectProperties((prev: any) => ({ ...prev, ...updates }));
      }

      fabricRef.current.fire('object:modified', { target: active });
    }
  }, []);

  const updateActiveImageFilter = useCallback((type: string, value: number | boolean) => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject() as FabricImage;
    if (!active || active.type !== 'image') return;

    if (!active.filters) active.filters = [];

    // @ts-ignore
    const FilterClass = filters[type];
    if (!FilterClass) return;

    const index = active.filters.findIndex(f => f.type === type);

    if (type === 'Sepia') {
      if (value) {
        if (index === -1) active.filters.push(new FilterClass());
      } else {
        if (index > -1) active.filters.splice(index, 1);
      }
    } else {
      let options: any = {};
      if (type === 'Saturation') options.saturation = value;
      if (type === 'Contrast') options.contrast = value;
      if (type === 'HueRotation') options.rotation = value;
      if (type === 'Pixelate') options.blocksize = value;

      if (index > -1) {
          active.filters[index] = new FilterClass(options);
      } else {
          active.filters.push(new FilterClass(options));
      }
    }

    active.applyFilters();
    fabricRef.current.requestRenderAll();
    setActiveObjectFilters((prev: any) => ({ ...prev, [type.toLowerCase().replace('rotation', '')]: value }));
    fabricRef.current.fire('object:modified', { target: active });

  }, []);

  const updateGridConfig = useCallback((updates: Partial<{ color: string, thickness: number }>) => {
    setGridConfig(prev => ({ ...prev, ...updates }));
    if (fabricRef.current) {
        setTimeout(() => {
           if (fabricRef.current) fabricRef.current.fire('object:modified');
        }, 100);
    }
  }, []);

  const downloadCanvas = useCallback(async (title: string) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    const originalBg = canvas.backgroundColor;
    canvas.backgroundColor = '#ffffff';

    const highlight = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
    const wasVisible = highlight ? highlight.visible : false;
    if (highlight) highlight.visible = false;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

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

    const originalBg = canvas.backgroundColor;
    canvas.backgroundColor = '#ffffff';

    const highlight = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
    const wasVisible = highlight ? highlight.visible : false;
    if (highlight) highlight.visible = false;

    const dataUrl = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.8,
      multiplier: 0.5,
    });

    if (highlight) highlight.visible = wasVisible;
    canvas.backgroundColor = originalBg;

    return dataUrl;
  }, []);

  const getJsonState = useCallback(() => {
    if (!fabricRef.current) return null;
    const json = (fabricRef.current as any).toObject(['id', 'excludeFromExport']);

    if (json && json.objects) {
      json.objects = json.objects.filter((obj: any) => obj.id !== 'active-cell-highlight');
    }

    json.gridConfig = gridConfig;

    return json;
  }, [gridConfig]);

  const highlightActiveCell = useCallback(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    const existing = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
    if (existing) {
      canvas.remove(existing);
    }

    const bounds = getCellBounds(activeCell);

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
    updateActiveObject,
    activeObjectFilters,
    updateActiveImageFilter,
    gridConfig,
    updateGridConfig
  };
}
