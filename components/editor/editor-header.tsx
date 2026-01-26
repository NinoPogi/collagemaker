'use client';

import { ArrowLeft, Cloud, Download, Save, Loader2 } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

interface EditorHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  isSaving: boolean;
  onBack: () => void;
  onDownload: () => void;
  onManualSave: () => void;
}

export default function EditorHeader({
  title,
  setTitle,
  isSaving,
  onBack,
  onDownload,
  onManualSave
}: EditorHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-30 relative shadow-sm">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300 flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex flex-col min-w-0 flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-bold text-lg bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 rounded-lg px-2 -ml-2 text-slate-800 dark:text-white w-full truncate"
          />
          <div className="flex items-center gap-2 px-2 flex-shrink-0">
            {isSaving ? (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-orange-500">
                <Loader2 size={10} className="animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                <Cloud size={10} />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Manual Save (Desktop only, or hidden if autosave is trusted) */}
        <button
          onClick={onManualSave}
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Manual Save"
        >
          <Save size={18} />
          <span className="hidden lg:inline">Save</span>
        </button>

        {/* Download Button */}
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/10"
        >
          <Download size={18} />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* Profile */}
        <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700" suppressHydrationWarning>
            <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
