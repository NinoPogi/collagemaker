import { useState, useEffect } from 'react';
import { Palette, ArrowRight, ArrowDown, PaintBucket } from 'lucide-react';

interface ColorGradientPickerProps {
  label: string;
  value: string | any; // string=color, object=gradient
  onChange: (val: string | any) => void;
}

export default function ColorGradientPicker({ label, value, onChange }: ColorGradientPickerProps) {
  const isGradient = typeof value === 'object' && value !== null;
  const [mode, setMode] = useState<'solid' | 'gradient'>(isGradient ? 'gradient' : 'solid');
  
  // Local state for gradient construction
  const [gradStart, setGradStart] = useState('#FF5722');
  const [gradEnd, setGradEnd] = useState('#FFC107');
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  // Sync state with incoming value
  useEffect(() => {
     if (isGradient && value.colorStops) {
         setMode('gradient');
         setGradStart(value.colorStops[0]?.color || '#FF5722');
         setGradEnd(value.colorStops[1]?.color || '#FFC107');
         
         const { coords } = value;
         if (coords) {
             if (Math.abs(coords.x2 - coords.x1) > Math.abs(coords.y2 - coords.y1)) {
                 setDirection('horizontal');
             } else {
                 setDirection('vertical');
             }
         }
     } else if (!isGradient && value && typeof value === 'string') {
         setMode('solid');
         setGradStart(value); // Seed start with current solid color if switching
     }
  }, [value, isGradient]);

  const handleSolidChange = (color: string) => {
      onChange(color);
      setGradStart(color);
  };

  const handleGradientChange = (newStart: string, newEnd: string, newDir: 'horizontal' | 'vertical') => {
      setGradStart(newStart);
      setGradEnd(newEnd);
      setDirection(newDir);

      const coords = newDir === 'horizontal' 
         ? { x1: 0, y1: 0, x2: 1, y2: 0 }
         : { x1: 0, y1: 0, x2: 0, y2: 1 };
         
      onChange({
          type: 'linear',
          gradientUnits: 'percentage', 
          coords,
          colorStops: [
              { offset: 0, color: newStart },
              { offset: 1, color: newEnd }
          ]
      });
  };

  return (
    <div className="space-y-3">
        <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</label>
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
                <button
                    onClick={() => {
                        setMode('solid');
                        onChange(gradStart); // Switch back to solid using start color
                    }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${mode === 'solid' ? 'bg-white dark:bg-slate-600 shadow-sm text-orange-500' : 'text-slate-400'}`}
                >
                    Solid
                </button>
                <button
                    onClick={() => {
                        setMode('gradient');
                        handleGradientChange(gradStart, gradEnd, direction);
                    }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${mode === 'gradient' ? 'bg-white dark:bg-slate-600 shadow-sm text-orange-500' : 'text-slate-400'}`}
                >
                    Gradient
                </button>
            </div>
        </div>

        {mode === 'solid' ? (
             <div className="relative">
                <input
                    type="color"
                    value={typeof value === 'string' ? value : gradStart}
                    onChange={(e) => handleSolidChange(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div 
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors relative overflow-hidden"
                    style={{ backgroundColor: typeof value === 'string' ? value : gradStart }}
                >
                     {/* Checkerboard for transparent fallback if needed, though input color doesn't do alpha well usually */}
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                     <span className="bg-black/20 text-white text-xs font-mono px-2 py-1 rounded backdrop-blur-sm">
                        {typeof value === 'string' ? value : gradStart}
                     </span>
                </div>
            </div>
        ) : (
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                
                {/* Direction */}
                <div className="flex gap-2 justify-center mb-2">
                    <button 
                        onClick={() => handleGradientChange(gradStart, gradEnd, 'horizontal')}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs ${direction === 'horizontal' ? 'bg-orange-100 border-orange-300 text-orange-600' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                    >
                         <ArrowRight size={14} /> Horizontal
                    </button>
                    <button 
                        onClick={() => handleGradientChange(gradStart, gradEnd, 'vertical')}
                        className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs ${direction === 'vertical' ? 'bg-orange-100 border-orange-300 text-orange-600' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                    >
                         <ArrowDown size={14} /> Vertical
                    </button>
                </div>

                <div className="flex gap-2 items-center">
                    {/* Start Color */}
                    <div className="flex-1 space-y-1">
                        <label className="text-[9px] text-slate-400 block text-center">Start</label>
                        <div className="relative h-8 w-full">
                            <input
                                type="color"
                                value={gradStart}
                                onChange={(e) => handleGradientChange(e.target.value, gradEnd, direction)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <div className="w-full h-full rounded-md border border-slate-200 dark:border-slate-600" style={{ backgroundColor: gradStart }} />
                        </div>
                    </div>

                    <ArrowRight size={16} className="text-slate-300" />

                    {/* End Color */}
                    <div className="flex-1 space-y-1">
                         <label className="text-[9px] text-slate-400 block text-center">End</label>
                         <div className="relative h-8 w-full">
                            <input
                                type="color"
                                value={gradEnd}
                                onChange={(e) => handleGradientChange(gradStart, e.target.value, direction)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <div className="w-full h-full rounded-md border border-slate-200 dark:border-slate-600" style={{ backgroundColor: gradEnd }} />
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
