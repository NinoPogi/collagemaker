import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { CanvasState, ActiveObjectState } from "@/types/project";
import { log } from "console";

interface CanvasProps {
  canvasState: CanvasState;
  onLoaded: () => void;
  onCanvasChange: () => void;
}

export function useFabricCanvas({ canvasState, onLoaded, onCanvasChange }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeObjectsRef = useRef<fabric.Object[] | null>(null);
  const [isObjectSelected, setIsObjectSelected] = useState(false);  
  const [isGroupSelected, setIsGroupSelected] = useState(false);
  const [activeObject, setActiveObject] = useState<ActiveObjectState | null>(null);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateObjectState = (active: fabric.Object) => {
    if (active.type === 'textbox') {
      const textObject = active as fabric.Textbox;
      setActiveObject({type: active.type,
        fontFamily: textObject.fontFamily || 'Arial',
        fontSize: textObject.fontSize || 16,
        fill: textObject.fill as string || '#000000',
        fontWeight: textObject.fontWeight as "bold" | "normal" || 'normal',
        fontStyle: textObject.fontStyle as string || 'normal',
        underline: textObject.underline || false,
        linethrough: textObject.linethrough || false,
        textAlign: textObject.textAlign as string || 'left',
      })
    } else if (active.type === 'image') {
      const imageObject = active as fabric.Image;
      const filters = imageObject.filters;
      setActiveObject({type: active.type, src: imageObject.getSrc(), scaleX: imageObject.scaleX, scaleY: imageObject.scaleY, filters: filters})
    } else {
      setActiveObject({type: active.type as 'path' | 'circle' | 'rect' | 'group', scaleX: active.scaleX, scaleY: active.scaleY, stroke: active.stroke as string || "currentColor", strokeWidth: active.strokeWidth as number || 2, fill: active.fill as string || "currentColor"})
    }
  }

  const handleCanvasSelection = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const group = canvas.getActiveObjects();
      
    if (group.length === 0) {
      setIsObjectSelected(false);
      setIsGroupSelected(false);
    } else if (group.length === 1) {
      setIsObjectSelected(true);
      activeObjectsRef.current = group;
      const active = group[0];
      updateObjectState(active);
       // console.log(active);

    } else {
      setIsGroupSelected(true);
      activeObjectsRef.current = group;
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !canvasState) return;

    const canvas = new fabric.Canvas(canvasRef.current);
    canvas.setDimensions({
      width: canvasState.width,
      height: canvasState.height,
    });

    canvas.loadFromJSON(canvasState).then(() => {
      if (canvasState.backgroundColor) {
        canvas.backgroundColor = canvasState.backgroundColor;
      }
      canvas.renderAll();
      onLoaded?.();
    });


    fabricCanvasRef.current = canvas;

    const handleTransformStart = () => {
      handleCanvasSelection();
    };

    const handleInteractionEnd = () => {
      handleCanvasSelection(); 
    };



    // canvas.on('object:moving', () => console.log('object:moving'));
    // canvas.on('object:scaling', () => console.log('object:scaling'));
    // canvas.on('object:rotating', () => console.log('object:rotating'));
    canvas.on('selection:created', handleCanvasSelection);
    canvas.on('selection:updated', handleCanvasSelection);
    canvas.on('selection:cleared', handleCanvasSelection);

 
    
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    };
  }, [canvasState]);



  const autoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onCanvasChange?.();
    }, 3000);
  };

  const addText = (textString: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    const text = new fabric.Textbox(textString, {
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      fill: "black",
      width: 300,
      splitByGrapheme: true,
   
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const getJson = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const json = canvas.toJSON();
    json.width = canvas.width;
    json.height = canvas.height;
    return json;
  };

  const downloadImage = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataAuth = canvas.toDataURL({
      format: "png",
      quality: 0.8,
      multiplier: 1,
    });

    const timestamp = new Date().getTime();
    const fileName = `collage-${timestamp}.png`;

    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataAuth;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateThumbnail = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    return canvas.toDataURL({
      format: "jpeg",
      quality: 0.6,
      multiplier: 0.5,
    });
  };

  const addImageToCanvas = (url: string, options?: {left?: number, top?: number}) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      img.set({
        left: options?.left || canvasWidth / 2,
        top: options?.top || canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        scaleX: 0.2,
        scaleY: 0.2,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
  })};

  const deleteActiveObject = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
        activeObjects.forEach((obj) => {
            canvas.remove(obj);
        });
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        canvas.renderAll();
    }
  };

  const addShapeToCanvas = (url: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    fabric.loadSVGFromURL(url).then(({ objects, options }) => {
      if (objects && options) {
        const validObjects = objects.filter((obj): obj is fabric.FabricObject => obj !== null);
        const svg = fabric.util.groupSVGElements(validObjects, options);
        svg.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: 10,
          scaleY: 10,
          stroke: 'black',
          strokeWidth: 1,
          fill: 'transparent',
        });
        canvas.add(svg);
        canvas.setActiveObject(svg);
        canvas.renderAll();
      }
    });
  };

  const toggleDrawingMode = (mode: 'pencil' | 'sharpie' | 'spray'|'eraser'|'select') => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      canvas.isDrawingMode = mode !== 'select'? true : false;

    if (mode === 'pencil') { 
      const brush = new fabric.PatternBrush(canvas);
      const img = new Image();
      img.src = '/textures/pencil.png';

      img.onload = () => {
        brush.getPatternSrc = function() {
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = img.width;
            patternCanvas.height = img.height;
            const ctx = patternCanvas.getContext('2d');
            
            if (ctx) {
                ctx.drawImage(img, 0, 0);
            }
            return patternCanvas;
        };
        brush.width = 2;
        brush.color = 'black';
      canvas.freeDrawingBrush = brush;}
    } else if (mode === 'sharpie') {
      const marker = new fabric.PencilBrush(canvas);
      marker.width = 10;
      marker.color = "red";
      marker.strokeLineCap = 'square';
      canvas.freeDrawingBrush = marker;
    } else if (mode === 'spray') {
      const spray = new fabric.SprayBrush(canvas);
      spray.width = 50;
      spray.color = "green";
      spray.density = 10;
      canvas.freeDrawingBrush = spray;
    } else if (mode === 'eraser') {
      const eraser = new fabric.PencilBrush(canvas);
      eraser.width = 20;
      eraser.color = "white";
      canvas.freeDrawingBrush = eraser;
    } 
  };   
  
  const changeObjectOrder = (action: 'bringForward' | 'bringToFront' | 'sendBackward' | 'sendToBack') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (action === 'bringForward') {
          canvas.bringObjectForward(obj);
        } else if (action === 'bringToFront') {
          canvas.bringObjectToFront(obj);
        } else if (action === 'sendBackward') {
          canvas.sendObjectBackwards(obj);
        } else if (action === 'sendToBack') {
          canvas.sendObjectToBack(obj);
        }
      });
      canvas.renderAll();
    }
  };

  const changeFontWeight = (newWeight: 'bold' | 'normal') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'textbox') {
          const textObj = obj as fabric.Textbox;
          textObj.set({ 'fontWeight': newWeight });
          
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
    }
  };

  const changeFontStyle = (newStyle: 'italic' | 'normal') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'textbox') {
          const textObj = obj as fabric.Textbox;
          textObj.set({ 'fontStyle': newStyle });
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
    }
  };

  const changeFontUnderline = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'textbox') {
          const textObj = obj as fabric.Textbox;
          textObj.set({ 'underline': !textObj.underline });
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
    }
  };

  const changeFontLinethrough = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'textbox') {
          const textObj = obj as fabric.Textbox;
          textObj.set({ 'linethrough': !textObj.linethrough });
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
    }
  };

  const changeTextAlignment = (newAlignment: 'left' | 'center' | 'right' | 'justify') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'textbox') {
          const textObj = obj as fabric.Textbox;
          textObj.set({ 'textAlign': newAlignment });
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
    }
  };

  const flipObject = (axis: 'x' | 'y') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (axis === 'x') {
          obj.set({ 'flipX': !obj.flipX });
        } else if (axis === 'y') {
          obj.set({ 'flipY': !obj.flipY });
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
    }
  };

  const changeStrokeWidth = (newWidth: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        obj.set({ 'strokeWidth': newWidth });
         if (obj.type === 'group') {
             (obj as fabric.Group).getObjects().forEach(child => {
                  child.set('strokeWidth', newWidth);
             });
             obj.set('dirty', true);
        }
      });
      canvas.requestRenderAll();
    }
  };

  const getAllColors = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return [];

    const colors = new Set<string>();

    canvas.getObjects().forEach((obj) => {
      if (obj.type !== 'image') {
        const fill = obj.fill;
        if (fill && typeof fill === 'string' && fill !== 'transparent') {
          colors.add(fill);
        }
      }

      const stroke = obj.stroke;
      if (stroke && typeof stroke === 'string' && stroke !== 'transparent') {
        colors.add(stroke);
      }
    });

    const uniqueColors = Array.from(colors);
    setActiveColors(uniqueColors);
  };

  const changeActiveObjectColor = ( property: string,color: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    if (!isObjectSelected) {setIsObjectSelected(true)
      canvas.setActiveObject(activeObjectsRef.current[0]);
    };

    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        obj.set({ [property]: color });
         if (obj.type === 'group') {
             (obj as fabric.Group).getObjects().forEach(child => {
                  child.set(property, color);
             });
             obj.set('dirty', true);
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
      
    }
  };

  const changeFontSize = (fontSize: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    if (!isObjectSelected) {setIsObjectSelected(true)
      canvas.setActiveObject(activeObjectsRef.current[0]);
    };

    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        obj.set({ 'fontSize': fontSize });
         if (obj.type === 'group') {
             (obj as fabric.Group).getObjects().forEach(child => {
                  child.set('fontSize', fontSize);
             });
             obj.set('dirty', true);
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
      
    }
  };

  const changeFontFamily = (fontFamily: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    if (!isObjectSelected) {setIsObjectSelected(true)
      canvas.setActiveObject(activeObjectsRef.current[0]);
    };

    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        obj.set({ 'fontFamily': fontFamily });
         if (obj.type === 'group') {
             (obj as fabric.Group).getObjects().forEach(child => {
                  child.set('fontFamily', fontFamily);
             });
             obj.set('dirty', true);
        }
      });
      canvas.renderAll();
      updateObjectState(activeObjects[0]);
      
    }
  };  

  const changeImageSource = (newUrl:string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    if (!isObjectSelected) {setIsObjectSelected(true)
      canvas.setActiveObject(activeObjectsRef.current[0]);
    };
    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'image') {
          const imgObj = obj as fabric.Image;
          imgObj.setSrc(newUrl, {crossOrigin: 'anonymous'}).then(() => {
            imgObj.set({dirty: true});
            canvas.renderAll();
            updateObjectState(activeObjects[0]);
          });
        }
      });
      
    }
  }

  const applyImageFilter = (filterType: string, value?: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (!activeObjectsRef.current) return;
    if (!isObjectSelected) {setIsObjectSelected(true)
      canvas.setActiveObject(activeObjectsRef.current[0]);
    };

    const activeObjects = activeObjectsRef.current;
    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (obj.type === 'image') {
          const imgObj = obj as fabric.Image;
          let filters = imgObj.filters || [];

          const baseFilter = filters.find((filter) => filter.type === filterType);
          switch (filterType) {
            case 'none':
              imgObj.set({filters: [], dirty: true});
              filters = [];
              break;
            case 'brightness':
              if (baseFilter instanceof fabric.filters.Brightness) {
                baseFilter.brightness = value || 0;
              } else {
                filters.push(new fabric.filters.Brightness({ brightness: value }));
              }
              break;
            case 'contrast':
              if (baseFilter instanceof fabric.filters.Contrast) {
                baseFilter.contrast = value || 0;
              } else {
                filters.push(new fabric.filters.Contrast({ contrast: value }));
              }
              break;
            case 'saturation':
              if (baseFilter instanceof fabric.filters.Saturation) {
                baseFilter.saturation = value || 0;
              } else {
                filters.push(new fabric.filters.Saturation({ saturation: value }));
              }
              break;
            case 'hue':
              if (baseFilter instanceof fabric.filters.HueRotation) {
                baseFilter.rotation = value || 0;
              } else {
                filters.push(new fabric.filters.HueRotation({ rotation: value }));
              }
              break;
            case 'blur':
              if (baseFilter instanceof fabric.filters.Blur) {
                baseFilter.blur = value || 0;
              } else {
                filters.push(new fabric.filters.Blur({ blur: value }));
              }
              break;
            case 'noise':
              if (baseFilter instanceof fabric.filters.Noise) {
                baseFilter.noise = value || 0;
              } else {
                filters.push(new fabric.filters.Noise({ noise: value }));
              }
              break;
            case 'pixelate':
              if (baseFilter instanceof fabric.filters.Pixelate) {
                baseFilter.blocksize = value || 0;
              } else {
                filters.push(new fabric.filters.Pixelate({ blocksize: value }));
              }
              break;  
            case 'grayscale':
                filters.push(new fabric.filters.Grayscale());            
              break;
            case 'invert':      
                filters.push(new fabric.filters.Invert());            
              break;
            case 'sepia':       
                filters.push(new fabric.filters.Sepia());
              break;
            case 'kodachrome':         
                filters.push(new fabric.filters.Kodachrome());           
              break;
            case 'vintage':
                filters.push(new fabric.filters.Vintage());             
              break;
            case 'technicolor':       
                filters.push(new fabric.filters.Technicolor());
              break;
            case 'polaroid':
                filters.push(new fabric.filters.Polaroid());
              break;
            case 'brownie':
                filters.push(new fabric.filters.Brownie());
              break;
            case 'black-white':
                filters.push(new fabric.filters.BlackWhite());
              break;
          }
          if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);

          const cleanFilters = [...new Map(filters.map(f=>[f.type, f])).values()];
          filterTimeoutRef.current = setTimeout(() => {
            imgObj.set({filters: cleanFilters, dirty: true});
            imgObj.applyFilters();
            canvas.requestRenderAll();
          }, 750);

        }
      });
      
    }
  }

  return { 
    canvasRef,
     addText, 
     getJson, 
     downloadImage, 
     generateThumbnail, 
     addImageToCanvas, 
     deleteActiveObject, 
     isObjectSelected,
     isGroupSelected, 
     activeObject,
     addShapeToCanvas, 
     toggleDrawingMode,
     changeObjectOrder,
     changeFontWeight,
     changeFontStyle,
     changeFontUnderline,
     changeFontLinethrough,
     changeTextAlignment,
     flipObject,
     changeStrokeWidth,
     getAllColors,
     activeColors,
     changeActiveObjectColor,
     changeFontSize,
     changeFontFamily,
     changeImageSource,
     applyImageFilter
    };
}
