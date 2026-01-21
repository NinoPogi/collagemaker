'use client';

import { Trash2 } from 'lucide-react';

interface FloatingMenuProps {
  onDelete: () => void;
  position?: { top: number; left: number };
  label?: string;
}

export default function FloatingMenu({ onDelete, position, label }: FloatingMenuProps) {
  const style = position 
    ? { 
        top: position.top - 10, // 10px spacing above object
        left: position.left, 
        transform: 'translate(-50%, -100%)' 
      }
    : undefined;

  const className = position
    ? "absolute z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom"
    : "absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200";

  return (
    <div className={className} style={style}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl ring-1 ring-black/5 dark:ring-white/10 p-1.5 flex items-center gap-2">
        {label && (
             <span className="text-xs font-semibold px-2 text-slate-500 uppercase tracking-wider border-r border-slate-200 dark:border-slate-700">
                {label}
             </span>
        )}
        <button
          onClick={(e) => {
             e.stopPropagation(); // Prevent canvas click-through
             onDelete();
          }}
          className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors"
          title="Delete Selection"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
