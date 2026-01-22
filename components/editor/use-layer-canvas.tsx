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
    // Custom Grid Logic
    if (initialState?.customGrid && initialState.customGrid[index]) {
       const cell = initialState.customGrid[index];
       return {
          left: cell.x * canvasWidth,
          top: cell.y * canvasHeight,
          centerX: (cell.x * canvasWidth) + (cell.width * canvasWidth) / 2,
          centerY: (cell.y * canvasHeight) + (cell.height * canvasHeight) / 2,
          width: cell.width * canvasWidth,
          height: cell.height * canvasHeight,
       };
    }

    // Legacy Uniform Grid Logic
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;
    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
      left: col * cellWidth,
      top: row * cellHeight,
      centerX: (col * cellWidth) + (cellWidth / 2),
      centerY: (row * cellHeight) + (cellHeight / 2),
      width: cellWidth,
      height: cellHeight,
    };
  }, [rows, cols, canvasWidth, canvasHeight, initialState]);

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
      absolutePositioned: true, 
      strokeWidth: 0,
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
      preserveObjectStacking: true, 
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
      let index = -1;

      // Check Custom Grid
      if (initialState?.customGrid) {
          index = initialState.customGrid.findIndex((cell: any) => {
              const x = cell.x * canvasWidth;
              const y = cell.y * canvasHeight;
              const w = cell.width * canvasWidth;
              const h = cell.height * canvasHeight;
              return pointer.x >= x && pointer.x <= x + w && pointer.y >= y && pointer.y <= y + h;
          });
      } else {
         // Legacy Check
         const col = Math.floor(pointer.x / (canvasWidth / cols));
         const row = Math.floor(pointer.y / (canvasHeight / rows));
         index = row * cols + col;
      }

      if (index >= 0) {
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
      handleSelection(); 
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

    const handleTransformStart = () => {
      handleSelection();
      setIsDragging(true);
    };

    const handleInteractionEnd = () => {
      setIsDragging(false);
      handleSelection(); 
      triggerSave(); 
    };

    canvas.on('object:moving', handleTransformStart);
    canvas.on('object:scaling', handleTransformStart);
    canvas.on('object:rotating', handleTransformStart);
    canvas.on('object:resizing', handleTransformStart);

    canvas.on('mouse:up', handleInteractionEnd);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:removed', (e) => {
      // @ts-ignore
      if (e.target && (e.target.id === 'grid-line' || e.target.id === 'active-cell-highlight')) return;
      triggerSave();
    });

    canvas.renderAll();

    const upperCanvasEl = canvas.upperCanvasEl;
    const wrapper = upperCanvasEl.parentElement; 

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
  }, [canvasWidth, canvasHeight]); // Removed unstable dependencies to prevent re-init loop

  // Separate Effect for Grid Rendering (Responsive to Config Changes)
  useEffect(() => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      
      const addGrid = () => {
        // Clear existing grid lines
        canvas.getObjects().forEach(obj => {
           // @ts-ignore
           if (obj.id === 'grid-line' || (obj.type === 'path' && obj.stroke === '#e0e0e0' && !obj.selectable) || (obj.id === 'custom-grid-border')) {
              canvas.remove(obj);
           }
        });
  
        const gridGroup: FabricObject[] = [];

        // Custom Grid Rendering
        if (initialState?.customGrid) {
            initialState.customGrid.forEach((_cell: any, index: number) => {
                const bounds = getCellBounds(index);
                
                // Draw rect for each cell border
                const rect = new Rect({
                    left: bounds.centerX,
                    top: bounds.centerY,
                    width: bounds.width,
                    height: bounds.height,
                    originX: 'center',
                    originY: 'center',
                    fill: 'transparent',
                    stroke: gridConfig.color,
                    strokeWidth: gridConfig.thickness,
                    selectable: false,
                    evented: false,
                    // @ts-ignore
                    id: 'grid-line',
                    excludeFromExport: false 
                });
                gridGroup.push(rect);
            });

        } else {
             // Legacy Uniform Grid Rendering
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
        }
        
        gridGroup.forEach(obj => canvas.add(obj));

        // Layering Enforcement
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'image') canvas.sendObjectToBack(obj);
        });
  
         canvas.getObjects().forEach(obj => {
            // @ts-ignore
            if (obj.id === 'grid-line') canvas.bringObjectToFront(obj);
        });
  
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'i-text' || obj.type === 'text') canvas.bringObjectToFront(obj);
        });
        
        const highlight = canvas.getObjects().find((obj: any) => obj.id === 'active-cell-highlight');
        if (highlight) canvas.bringObjectToFront(highlight);
        
        canvas.requestRenderAll();
      };
      
      addGrid();

  }, [gridConfig, canvasWidth, canvasHeight, rows, cols, initialState]);


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

    let index = -1;
    if (initialState?.customGrid) {
        index = initialState?.customGrid.findIndex((cell: any) => {
            const cx = cell.x * canvasWidth;
            const cy = cell.y * canvasHeight;
            const cw = cell.width * canvasWidth;
            const ch = cell.height * canvasHeight;
            return x >= cx && x <= cx + cw && y >= cy && y <= cy + ch;
        });
    } else {
        const col = Math.floor(x / (canvasWidth / cols));
        const row = Math.floor(y / (canvasHeight / rows));
        index = row * cols + col;
    }

    if (index >= 0) {
      setActiveCell(index);
      addImageToCell(index, url);
    }

  }, [canvasWidth, canvasHeight, cols, rows, initialState]);

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

    if (initialState?.customGrid) {
      json.customGrid = initialState.customGrid;
    }

    return json;
  }, [gridConfig, initialState]);

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
