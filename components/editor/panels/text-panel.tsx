import { Type, Heading1, AlignLeft, AlignCenter, AlignRight, Check } from 'lucide-react';
import ColorGradientPicker from './color-gradient-picker';

interface TextPanelProps {
  onAddText: () => void;
  properties?: {
    fontFamily: string;
    fontSize: number;
    fill: string | object;
    textAlign: string;
    fontWeight: string | number;
    fontStyle: string;
    stroke?: string | object;
    strokeWidth?: number;
  };
  onUpdate: (updates: any) => void;
}

import { Bold, Italic, Palette } from 'lucide-react';

export default function TextPanel({ onAddText, properties, onUpdate }: TextPanelProps) {
  const isSelected = !!properties;
  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4">Typography</h3>
      


         <button 
           onClick={onAddText}
           className="w-full p-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl flex items-center gap-3 transition-colors group"
        >
           <Type size={24} className="text-slate-600 dark:text-slate-300 group-hover:text-orange-500" />
           <div className="text-left">
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">Add Text</p>
           </div>
        </button>


      <div className={`mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <p className="text-xs font-semibold mb-3 text-slate-500 uppercase tracking-wider">Parameters</p>
          
          {/* Alignment */}
          <div className="mb-4">
             <label className="text-[10px] text-slate-400 mb-1 block">Alignment</label>
             <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                {['left', 'center', 'right'].map((align) => (
                    <button
                       key={align}
                       onClick={() => onUpdate({ textAlign: align })}
                       className={`flex-1 p-2 rounded-md transition-all ${
                          properties?.textAlign === align 
                             ? 'bg-white dark:bg-slate-600 shadow-sm text-orange-500' 
                             : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                       }`}
                    >
                       {align === 'left' && <AlignLeft size={16} />}
                       {align === 'center' && <AlignCenter size={16} />}
                       {align === 'right' && <AlignRight size={16} />}
                    </button>
                ))}
             </div>
          </div>

          
          {/* Font Family & Size */}
          <div className="flex gap-2 mb-4">
               <div className="flex-[2]">
                  <label className="text-[10px] text-slate-400 mb-1 block">Font Family</label>
                  <select
                      value={properties?.fontFamily || 'Inter, sans-serif'}
                      onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                      className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Open Sans, sans-serif">Open Sans</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                      <option value="Playfair Display, serif">Playfair Display</option>
                      <option value="Lato, sans-serif">Lato</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Times New Roman, serif">Times New Roman</option>
                      <option value="Courier New, monospace">Courier New</option>
                      <option value="Brush Script MT, cursive">Brush Script</option>
                  </select>
               </div>
               <div className="flex-1">
                  <label className="text-[10px] text-slate-400 mb-1 block">Size</label>
                  <input 
                      type="number"
                      value={properties?.fontSize || 40}
                      onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
                      className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  />
               </div>
          </div>

          {/* Style Controls (Bold/Italic) */}
          <div className="flex gap-2 mb-4">
               <button
                  onClick={() => onUpdate({ fontWeight: properties?.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`p-2 rounded-lg border flex-1 flex items-center justify-center gap-2 transition-all ${
                     properties?.fontWeight === 'bold'
                        ? 'bg-orange-50 border-orange-200 text-orange-500 dark:bg-orange-900/20 dark:border-orange-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
               >
                  <Bold size={16} /> <span className="text-xs">Bold</span>
               </button>

               <button
                  onClick={() => onUpdate({ fontStyle: properties?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                   className={`p-2 rounded-lg border flex-1 flex items-center justify-center gap-2 transition-all ${
                     properties?.fontStyle === 'italic'
                        ? 'bg-orange-50 border-orange-200 text-orange-500 dark:bg-orange-900/20 dark:border-orange-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
               >
                  <Italic size={16} /> <span className="text-xs">Italic</span>
               </button>
          </div>

          {/* Text Color */}
          <div className="mb-6">
              <ColorGradientPicker 
                  label="Text Color" 
                  value={properties?.fill || '#000000'} 
                  onChange={(val) => onUpdate({ fill: val })} 
              />
          </div>

          {/* Outline / Stroke */}
          <div className="mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Outline</label>
                 
                 {/* Enable/Disable Toggle effectively via Width */}
              </div>
              
              <div className="space-y-3">
                 <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-[10px] text-slate-400">Width</label>
                        <span className="text-[10px] text-slate-500">{properties?.strokeWidth || 0}px</span>
                    </div>
                    <input
                       type="range"
                       min="0"
                       max="20"
                       step="0.5"
                       value={properties?.strokeWidth || 0}
                       onChange={(e) => onUpdate({ strokeWidth: parseFloat(e.target.value) })}
                       className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                 </div>
                 
                 <ColorGradientPicker 
                     label="Outline Color" 
                     value={properties?.stroke || '#000000'} 
                     onChange={(val) => onUpdate({ stroke: val })} 
                 />
              </div>
          </div>



          {!isSelected && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-20">
                  <p className="text-xs font-semibold bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm text-slate-500">
                      Select specific text to edit
                  </p>
              </div>
          )}
      </div>
    </div>
  );
}
