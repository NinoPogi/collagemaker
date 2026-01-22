import { Sliders, SunMedium, CloudLightning, Palette, Grid, RotateCw, Contrast, Layers } from 'lucide-react';

interface TransformPanelProps {
  activeFilters?: {
    saturation: number;
    contrast: number;
    hue: number;
    pixelate: number;
    sepia: boolean;
  };
  onUpdateFilter: (type: string, value: number | boolean) => void;
  onBringToFront: () => void;
}

export default function TransformPanel({ activeFilters, onUpdateFilter, onBringToFront }: TransformPanelProps) {
  if (!activeFilters) {
     return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Sliders size={32} />
          </div>
          <h3 className="font-bold text-slate-600 dark:text-slate-300 mb-2">Image Properties</h3>
          <p className="text-sm">Select an image on the canvas to adjust brightness, contrast, and filters.</p>
        </div>
     );
  }

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <h3 className="font-bold text-slate-800 dark:text-white mb-6">Image Filters</h3>

      <div className="space-y-6">
        {/* Saturation */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <span className="flex items-center gap-1"><SunMedium size={14}/> Saturation</span>
               <span>{Math.round(activeFilters.saturation * 100)}%</span>
            </div>
            <input 
               type="range" 
               min="-1" 
               max="1" 
               step="0.1"
               value={activeFilters.saturation || 0}
               onChange={(e) => onUpdateFilter('Saturation', parseFloat(e.target.value))}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <span className="flex items-center gap-1"><Contrast size={14}/> Contrast</span>
               <span>{Math.round(activeFilters.contrast * 100)}%</span>
            </div>
            <input 
               type="range" 
               min="-1" 
               max="1" 
               step="0.1"
               value={activeFilters.contrast || 0}
               onChange={(e) => onUpdateFilter('Contrast', parseFloat(e.target.value))}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
        </div>

        {/* Hue */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <span className="flex items-center gap-1"><RotateCw size={14}/> Hue</span>
               <span>{Math.round(activeFilters.hue * 100)}%</span>
            </div>
             <input 
               type="range" 
               min="-1" 
               max="1" 
               step="0.1"
               value={activeFilters.hue || 0}
               onChange={(e) => onUpdateFilter('HueRotation', parseFloat(e.target.value))}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
        </div>

        {/* Pixelate */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <span className="flex items-center gap-1"><Grid size={14}/> Pixelate</span>
               <span>{activeFilters.pixelate > 0 ? activeFilters.pixelate + 'px' : 'Off'}</span>
            </div>
             <input 
               type="range" 
               min="0" 
               max="20" 
               step="1"
               value={activeFilters.pixelate || 0}
               onChange={(e) => {
                  const val = parseInt(e.target.value);
                  // 0 or 1 usually basically off or barely visible, keep 0 as explicit off logic upstream?
                  // Logic upstream: pixelate sets blocksize.
                  // If 0, maybe remove filter? Fabric pixelate blocksize 0 might error or do nothing.
                  // Let's pass it, use useLayerCanvas to handle limits if needed.
                  onUpdateFilter('Pixelate', val <= 1 ? 0.01 : val); 
               }}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
        </div>

         {/* Sepia */}
         <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
             <div className="flex items-center gap-2">
                 <Palette size={18} className="text-amber-700" />
                 <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sepia Tone</span>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activeFilters.sepia || false} 
                  onChange={(e) => onUpdateFilter('Sepia', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
             </label>
         </div>

         {/* Bring to Front (Layer Control) */}
         <button
           onClick={onBringToFront}
           className="w-full flex items-center justify-center gap-2 p-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
         >
           <Layers size={18} />
           Bring to Front
         </button>

      </div>
    </div>
  );
}
