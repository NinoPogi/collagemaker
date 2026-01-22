import { useState, useRef, useEffect, useCallback } from 'react';
import { Columns, Rows, RotateCcw, Circle, Heart, Star, Hexagon, Trash2, Move } from 'lucide-react';

// Types for our Grid Tree
export type GridNode = {
  id: string;
  type: 'leaf' | 'split';
  direction?: 'horizontal' | 'vertical';
  splitRatio?: number;
  children?: [GridNode, GridNode];
};

// Simplified Cell for final output
export type GridCell = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

// Shape Cell type
export type ShapeCell = {
  id: string;
  shapeType: 'circle' | 'heart' | 'star' | 'hexagon';
  x: number;
  y: number;
  width: number;
  height: number;
};

interface GridSplitterProps {
  onChange: (cells: GridCell[], shapes: ShapeCell[]) => void;
  rows?: number;
  cols?: number;
  aspectRatio?: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const MIN_RATIO = 0.15;
const MAX_RATIO = 0.85;
const MIN_SHAPE_SIZE = 0.1;
const MAX_SHAPE_SIZE = 0.8;
const DEFAULT_SHAPE_SIZE = 0.25;

const SHAPE_TYPES = ['circle', 'heart', 'star', 'hexagon'] as const;

export default function GridSplitter({ onChange, aspectRatio = 1.5 }: GridSplitterProps) {
  const [root, setRoot] = useState<GridNode>({ id: generateId(), type: 'leaf' });
  const [shapes, setShapes] = useState<ShapeCell[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [currentShapeType, setCurrentShapeType] = useState<ShapeCell['shapeType']>('circle');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<string>('');

  // Convert Tree to Flat Cells
  const flattenTree = useCallback((node: GridNode, x: number, y: number, w: number, h: number): GridCell[] => {
    if (node.type === 'leaf') {
      return [{ id: node.id, x, y, width: w, height: h }];
    }
    if (node.children && node.direction && node.splitRatio) {
      if (node.direction === 'horizontal') {
        const w1 = w * node.splitRatio;
        const w2 = w - w1;
        return [
          ...flattenTree(node.children[0], x, y, w1, h),
          ...flattenTree(node.children[1], x + w1, y, w2, h)
        ];
      } else {
        const h1 = h * node.splitRatio;
        const h2 = h - h1;
        return [
          ...flattenTree(node.children[0], x, y, w, h1),
          ...flattenTree(node.children[1], x, y + h1, w, h2)
        ];
      }
    }
    return [];
  }, []);

  // Emit changes
  useEffect(() => {
    const cells = flattenTree(root, 0, 0, 1, 1);
    const dataString = JSON.stringify({ cells, shapes });
    
    if (lastEmittedRef.current !== dataString) {
      lastEmittedRef.current = dataString;
      onChange(cells, shapes);
    }
  }, [root, shapes, flattenTree, onChange]);

  // Grid Actions
  const splitNode = (nodeId: string, direction: 'horizontal' | 'vertical') => {
    const update = (node: GridNode): GridNode => {
      if (node.id === nodeId && node.type === 'leaf') {
        return {
          id: node.id,
          type: 'split',
          direction,
          splitRatio: 0.5,
          children: [
            { id: generateId(), type: 'leaf' },
            { id: generateId(), type: 'leaf' }
          ]
        };
      }
      if (node.children) {
        return { ...node, children: [update(node.children[0]), update(node.children[1])] };
      }
      return node;
    };
    setRoot(update(root));
  };

  const updateRatio = useCallback((nodeId: string, newRatio: number) => {
    const clampedRatio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, newRatio));
    const update = (node: GridNode): GridNode => {
      if (node.id === nodeId && node.type === 'split') {
        return { ...node, splitRatio: clampedRatio };
      }
      if (node.children) {
        return { ...node, children: [update(node.children[0]), update(node.children[1])] };
      }
      return node;
    };
    setRoot(update(root));
  }, [root]);

  const reset = () => {
    setRoot({ id: generateId(), type: 'leaf' });
    setShapes([]);
    setSelectedShapeId(null);
  };

  // Shape Actions
  const addShape = (x: number, y: number, typeOverride?: ShapeCell['shapeType']) => {
    const newShape: ShapeCell = {
      id: generateId(),
      shapeType: typeOverride || currentShapeType,
      x: Math.max(0, Math.min(1 - DEFAULT_SHAPE_SIZE, x - DEFAULT_SHAPE_SIZE / 2)),
      y: Math.max(0, Math.min(1 - DEFAULT_SHAPE_SIZE, y - DEFAULT_SHAPE_SIZE / 2)),
      width: DEFAULT_SHAPE_SIZE,
      height: DEFAULT_SHAPE_SIZE
    };
    setShapes(prev => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
  };

  const updateShape = useCallback((id: string, updates: Partial<ShapeCell>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteShape = (id: string) => {
    setShapes(prev => prev.filter(s => s.id !== id));
    if (selectedShapeId === id) setSelectedShapeId(null);
  };

  // Handle canvas drop for shapes
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData('shapeType');
    if (shapeType && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setCurrentShapeType(shapeType as ShapeCell['shapeType']);
      addShape(x, y);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect shape if clicking on the canvas background
    if ((e.target as HTMLElement).dataset.canvasBackground) {
      setSelectedShapeId(null);
    }
  };

  const cycleShapeType = () => {
    const idx = SHAPE_TYPES.indexOf(currentShapeType);
    setCurrentShapeType(SHAPE_TYPES[(idx + 1) % SHAPE_TYPES.length]);
  };

  const ShapeIcon = ({ type, size = 20 }: { type: ShapeCell['shapeType'], size?: number }) => {
    switch (type) {
      case 'circle': return <Circle size={size} />;
      case 'heart': return <Heart size={size} />;
      case 'star': return <Star size={size} />;
      case 'hexagon': return <Hexagon size={size} />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-3 items-center">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-lg w-full">
        <span className="text-xs font-bold uppercase text-slate-500">Grid Builder</span>
        <div className="flex gap-2">
          {/* Shape Palette */}
          <div className="flex gap-1 border-r border-slate-300 dark:border-slate-600 pr-2 mr-2">
            {SHAPE_TYPES.map(type => (
              <button
                key={type}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('shapeType', type)}
                onClick={() => {
                  setCurrentShapeType(type);
                  // Add to center on click (supports mobile/tap)
                  addShape(0.5, 0.5, type);
                }}
                className={`p-1.5 rounded-lg border transition-all ${
                  currentShapeType === type 
                    ? 'bg-orange-100 dark:bg-orange-900/50 border-orange-400 text-orange-600' 
                    : 'bg-white dark:bg-slate-600 border-slate-200 dark:border-slate-500 hover:border-orange-300'
                }`}
                title={`Drag ${type} to canvas`}
              >
                <ShapeIcon type={type} size={16} />
              </button>
            ))}
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-600 relative"
        style={{ aspectRatio, height: '100%', maxHeight: '100%', width: 'auto' }}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        onClick={handleCanvasClick}
        data-canvas-background="true"
      >
        {/* Grid Cells */}
        <RecursiveBox node={root} onSplit={splitNode} onUpdateRatio={updateRatio} />

        {/* Shape Overlays */}
        {shapes.map(shape => (
          <ShapeOverlay
            key={shape.id}
            shape={shape}
            isSelected={selectedShapeId === shape.id}
            onSelect={() => setSelectedShapeId(shape.id)}
            onUpdate={updateShape}
            onDelete={() => deleteShape(shape.id)}
          />
        ))}
      </div>

      <div className="text-center text-xs text-slate-500 w-full">
        Drag shapes from toolbar. Tap cells to split. Drag dividers to resize.
      </div>
    </div>
  );
}

// Shape Overlay Component
function ShapeOverlay({
  shape,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}: {
  shape: ShapeCell;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<ShapeCell>) => void;
  onDelete: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle shape drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - shape.width / 2;
      const y = (clientY - rect.top) / rect.height - shape.height / 2;
      onUpdate(shape.id, {
        x: Math.max(0, Math.min(1 - shape.width, x)),
        y: Math.max(0, Math.min(1 - shape.height, y))
      });
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, shape, onUpdate]);

  // Handle shape resize
  useEffect(() => {
    if (!isResizing) return;

    const handleResize = (clientX: number, clientY: number) => {
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const newWidth = (clientX - rect.left) / rect.width - shape.x;
      const newHeight = (clientY - rect.top) / rect.height - shape.y;
      const size = Math.max(MIN_SHAPE_SIZE, Math.min(MAX_SHAPE_SIZE, Math.max(newWidth, newHeight)));
      onUpdate(shape.id, {
        width: Math.min(size, 1 - shape.x),
        height: Math.min(size, 1 - shape.y)
      });
    };

    const onMouseMove = (e: MouseEvent) => handleResize(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleResize(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onEnd = () => setIsResizing(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isResizing, shape, onUpdate]);

  const ShapeIcon = () => {
    switch (shape.shapeType) {
      case 'circle': return <Circle className="w-full h-full" />;
      case 'heart': return <Heart className="w-full h-full" />;
      case 'star': return <Star className="w-full h-full" />;
      case 'hexagon': return <Hexagon className="w-full h-full" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute z-30 flex items-center justify-center cursor-move transition-all ${
        isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : ''
      }`}
      style={{
        left: `${shape.x * 100}%`,
        top: `${shape.y * 100}%`,
        width: `${shape.width * 100}%`,
        height: `${shape.height * 100}%`,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
      onTouchStart={(e) => { e.stopPropagation(); setIsDragging(true); }}
    >
      {/* Shape Visual */}
      <div className="w-full h-full text-orange-500 bg-white/80 dark:bg-slate-800/80 border-2 border-orange-400 rounded-lg flex items-center justify-center p-2">
        <ShapeIcon />
      </div>

      {/* Controls (visible when selected) */}
      {isSelected && (
        <>
          {/* Delete Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 z-40"
          >
            <Trash2 size={12} />
          </button>

          {/* Resize Handle */}
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full cursor-se-resize z-40"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }}
            onTouchStart={(e) => { e.stopPropagation(); setIsResizing(true); }}
          />
        </>
      )}
    </div>
  );
}

// Recursive Box Component (unchanged logic)
function RecursiveBox({
  node,
  onSplit,
  onUpdateRatio
}: {
  node: GridNode;
  onSplit: (id: string, dir: 'horizontal' | 'vertical') => void;
  onUpdateRatio: (id: string, ratio: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging || !containerRef.current || node.type !== 'split') return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const isHorizontal = node.direction === 'horizontal';

    const handleMove = (clientX: number, clientY: number) => {
      let newRatio: number;
      if (isHorizontal) {
        newRatio = (clientX - rect.left) / rect.width;
      } else {
        newRatio = (clientY - rect.top) / rect.height;
      }
      onUpdateRatio(node.id, newRatio);
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, node, onUpdateRatio]);

  if (node.type === 'leaf') {
    return (
      <div className="w-full h-full relative group border border-slate-400 dark:border-slate-500/50 bg-white dark:bg-slate-800 transition-all hover:bg-orange-50 dark:hover:bg-orange-900/10 active:scale-[0.98]">
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-2 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-[1px]">
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onSplit(node.id, 'horizontal'); }}
              className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg hover:bg-orange-100 hover:text-orange-600 border border-slate-200"
              title="Split Left/Right"
            >
              <Columns size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSplit(node.id, 'vertical'); }}
              className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg hover:bg-orange-100 hover:text-orange-600 border border-slate-200"
              title="Split Top/Bottom"
            >
              <Rows size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRow = node.direction === 'horizontal';

  return (
    <div ref={containerRef} className={`flex w-full h-full ${isRow ? 'flex-row' : 'flex-col'}`}>
      <div style={{ flex: node.splitRatio, position: 'relative' }}>
        <RecursiveBox node={node.children![0]} onSplit={onSplit} onUpdateRatio={onUpdateRatio} />
      </div>

      <div
        className={`
          ${isRow ? 'w-2 h-full cursor-col-resize' : 'w-full h-2 cursor-row-resize'}
          bg-slate-400 dark:bg-slate-500 z-20
          hover:bg-orange-400 active:bg-orange-500
          flex items-center justify-center
          transition-colors
          ${isDragging ? 'bg-orange-500' : ''}
        `}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className={`${isRow ? 'h-8 w-1' : 'w-8 h-1'} bg-white/50 rounded-full`} />
      </div>

      <div style={{ flex: 1 - (node.splitRatio || 0.5), position: 'relative' }}>
        <RecursiveBox node={node.children![1]} onSplit={onSplit} onUpdateRatio={onUpdateRatio} />
      </div>
    </div>
  );
}

