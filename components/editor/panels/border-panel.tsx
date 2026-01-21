import { LayoutGrid, Palette, Scaling } from 'lucide-react';

interface BorderPanelProps {
  config: {
    color: string;
    thickness: number;
  };
  onUpdate: (updates: Partial<{ color: string; thickness: number }>) => void;
}

export default function BorderPanel({ config, onUpdate }: BorderPanelProps) {
  // Safe defaults
  const color = config?.color || '#e0e0e0';
  const thickness = config?.thickness || 1;

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <h3 className="font-bold text-slate-800 dark:text-white mb-6">Grid & Borders</h3>

      <div className="space-y-6">
        
        {/* Color Control */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <span className="flex items-center gap-1"><Palette size={14}/> Grid Color</span>
            </div>
            <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <input 
                   type="color"
                   value={color}
                   onChange={(e) => onUpdate({ color: e.target.value })}
                   className="flex-1 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer px-1 py-1"
                />
            </div>
        </div>

        {/* Thickness Control */}
         <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <span className="flex items-center gap-1"><Scaling size={14}/> Thickness</span>
               <span>{thickness}px</span>
            </div>
             <input 
               type="range" 
               min="1" 
               max="20" 
               step="1"
               value={thickness}
               onChange={(e) => onUpdate({ thickness: parseInt(e.target.value) })}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
             <div className="flex justify-between text-[10px] text-slate-400 px-1">
                <span>Thin</span>
                <span>Thick</span>
            </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
            <p className="text-xs text-blue-600 dark:text-blue-300">
               Grid lines will always appear <strong>above</strong> images but <strong>behind</strong> text for clean readability.
            </p>
        </div>

      </div>
    </div>
  );
}
