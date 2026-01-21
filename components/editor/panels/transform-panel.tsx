import { Sliders } from 'lucide-react';

export default function TransformPanel() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Sliders size={32} />
      </div>
      <h3 className="font-bold text-slate-600 dark:text-slate-300 mb-2">Image Properties</h3>
      <p className="text-sm">Select an image on the canvas to adjust brightness, contrast, and filters.</p>
      <div className="mt-4 px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-wide">
         Coming Soon
      </div>
    </div>
  );
}
