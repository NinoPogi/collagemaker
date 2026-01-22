import { useState, useRef, useEffect, useCallback } from 'react';
import { Columns, Rows, RotateCcw } from 'lucide-react';

// Types for our Grid Tree
export type GridNode = {
  id: string;
  type: 'leaf' | 'split';
  direction?: 'horizontal' | 'vertical'; // Only if type is split
  splitRatio?: number; // 0-1 (e.g., 0.5 for half)
  children?: [GridNode, GridNode];
};

// Simplified Cell for final output
export type GridCell = {
  id: string;
  x: number; // Percentage 0-1
  y: number; // Percentage 0-1
  width: number; // Percentage 0-1
  height: number; // Percentage 0-1
};

interface GridSplitterProps {
  onChange: (cells: GridCell[]) => void;
  rows?: number; // Initial hint (not strictly used if we start blank)
  cols?: number; 
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Min/Max ratio constraints
const MIN_RATIO = 0.15;
const MAX_RATIO = 0.85;

export default function GridSplitter({ onChange, aspectRatio = 1.5 }: GridSplitterProps & { aspectRatio?: number }) {
  // Initial State: Single Root Node
  const [root, setRoot] = useState<GridNode>({ id: generateId(), type: 'leaf' });
  
  // Ref to track last emitted value string to prevent loops
  const lastEmittedRef = useRef<string>('');

  // Convert Tree to Flat Cells (Recursive)
  const flattenTree = useCallback((node: GridNode, x: number, y: number, w: number, h: number): GridCell[] => {
    if (node.type === 'leaf') {
      return [{
        id: node.id,
        x, y, width: w, height: h
      }];
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

  // Effect to bubble up changes safely
  useEffect(() => {
    const cells = flattenTree(root, 0, 0, 1, 1);
    const cellsString = JSON.stringify(cells);
    
    // Prevent infinite loops by checking deep equality via JSON string
    if (lastEmittedRef.current !== cellsString) {
        lastEmittedRef.current = cellsString;
        onChange(cells);
    }
  }, [root, flattenTree, onChange]);

  // Actions
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
        return {
          ...node,
          children: [update(node.children[0]), update(node.children[1])]
        };
      }
      return node;
    };
    setRoot(update(root));
  };
  
  // Update split ratio for a node
  const updateRatio = useCallback((nodeId: string, newRatio: number) => {
    const clampedRatio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, newRatio));
    
    const update = (node: GridNode): GridNode => {
      if (node.id === nodeId && node.type === 'split') {
        return { ...node, splitRatio: clampedRatio };
      }
      if (node.children) {
        return {
          ...node,
          children: [update(node.children[0]), update(node.children[1])]
        };
      }
      return node;
    };
    setRoot(update(root));
  }, [root]);
  
  const reset = () => {
     setRoot({ id: generateId(), type: 'leaf' });
  };

  return (
    <div className="flex flex-col h-full w-full gap-4 items-center">
       <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-lg w-full">
           <span className="text-xs font-bold uppercase text-slate-500">Grid Builder</span>
           <button 
              onClick={reset}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded"
            >
               <RotateCcw size={12}/> Reset
           </button>
       </div>

       {/* Container with Aspect Ratio */}
       <div 
          className="bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-300 dark:border-slate-600 relative"
          style={{ 
             aspectRatio: aspectRatio,
             height: '100%', 
             maxHeight: '100%',
             width: 'auto' 
          }}
       >
          <RecursiveBox 
             node={root} 
             onSplit={splitNode}
             onUpdateRatio={updateRatio}
          />
       </div>
       
       <div className="text-center text-xs text-slate-500 w-full">
          Tap cells to split. Drag dividers to resize.
       </div>
    </div>
  );
}

// Recursive Box Component
function RecursiveBox({ 
  node, 
  onSplit,
  onUpdateRatio 
}: { 
  node: GridNode, 
  onSplit: (id: string, dir: 'horizontal' | 'vertical') => void,
  onUpdateRatio: (id: string, ratio: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  // Handle drag move (attached to window when dragging)
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
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
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
            {/* Split Controls Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-2 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-[1px]">
                  <div className="flex gap-2">
                     <button 
                        onClick={(e) => { e.stopPropagation(); onSplit(node.id, 'horizontal'); }}
                        className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg hover:bg-orange-100 hover:text-orange-600 border border-slate-200"
                        title="Split Left/Right"
                     >
                        <Columns size={20} className="md:rotate-0" /> 
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

  // Render Split
  const isRow = node.direction === 'horizontal';

  return (
    <div ref={containerRef} className={`flex w-full h-full ${isRow ? 'flex-row' : 'flex-col'}`}>
       <div style={{ flex: node.splitRatio, position: 'relative' }}>
          <RecursiveBox node={node.children![0]} onSplit={onSplit} onUpdateRatio={onUpdateRatio} />
       </div>
       
       {/* Draggable Divider */}
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
          {/* Drag Handle Visual */}
          <div className={`${isRow ? 'h-8 w-1' : 'w-8 h-1'} bg-white/50 rounded-full`} />
       </div>
       
       <div style={{ flex: 1 - (node.splitRatio || 0.5), position: 'relative' }}>
          <RecursiveBox node={node.children![1]} onSplit={onSplit} onUpdateRatio={onUpdateRatio} />
       </div>
    </div>
  );
}
