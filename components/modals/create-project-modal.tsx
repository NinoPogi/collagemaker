'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/app/actions';
import { COLLAGE_SIZES } from '@/lib/collage-constants';
import GridSplitter, { GridCell } from '../grid-builder/grid-splitter';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'size' | 'grid' | 'title'>('size');
  const [title, setTitle] = useState('');
  const [selectedSize, setSelectedSize] = useState(COLLAGE_SIZES[0]);
  const [customWidth, setCustomWidth] = useState('1200');
  const [customHeight, setCustomHeight] = useState('800');
  const [customCells, setCustomCells] = useState<GridCell[]>([]);
  // We no longer strictly select a predefined grid, so we remove selectedGrid state or keep it as a fallback/mode switch if we want to support both.
  // Requirement says "replace", so we drop the old selection.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Determine final canvas size
      const width = selectedSize.name === 'Custom' ? parseInt(customWidth) : selectedSize.width;
      const height = selectedSize.name === 'Custom' ? parseInt(customHeight) : selectedSize.height;

      // Generate initial canvas state for multi-canvas grid
      // Each cell will be initialized with an empty canvas state
      // Generate initial canvas state for CUSTOM grid
      const canvasState = { 
         customGrid: customCells, // Save the array of cells
         objects: [] // Standard objects array
      };

      const result = await createProject({
        title: title || 'Untitled Collage',
        canvasState: canvasState,
        canvasWidth: width,
        canvasHeight: height,
        gridRows: 1, // Custom grid uses json state
        gridCols: 1,
      });

      if (!result.success) {
        setError(result.error || 'Failed to create project');
        setIsLoading(false);
        return;
      }

      // Success! Close modal and navigate
      handleClose();
      router.push(`/editor/${result.project?.id}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('size');
      setTitle('');
      setSelectedSize(COLLAGE_SIZES[0]);
      setCustomWidth('1200');
      setCustomHeight('800');
      setCustomCells([]);
      setError('');
      onClose();
    }
  };

  const handleNext = () => {
    if (step === 'size') setStep('grid');
    else if (step === 'grid') setStep('title');
  };

  const handleBack = () => {
    if (step === 'grid') setStep('size');
    else if (step === 'title') setStep('grid');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 
              className="text-2xl font-black bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              Create New Collage
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {step === 'size' && 'Step 1 of 3: Choose canvas size'}
              {step === 'grid' && 'Step 2 of 3: Select grid layout'}
              {step === 'title' && 'Step 3 of 3: Name your project'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Size Selection */}
          {step === 'size' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Choose Canvas Size
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {COLLAGE_SIZES.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedSize.name === size.name
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{size.icon}</div>
                    <div className="font-bold text-sm text-slate-800 dark:text-white mb-1">
                      {size.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      {size.description}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-mono">
                      {size.width} × {size.height}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Size Inputs */}
              {selectedSize.name === 'Custom' && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    Custom Dimensions
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        min="100"
                        max="5000"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-orange-400 focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        min="100"
                        max="5000"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:border-orange-400 focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Grid Selection */}
          {step === 'grid' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Create Grid Layout
              </h3>
              <div className="h-[400px] flex justify-center items-center bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                  <GridSplitter 
                    onChange={setCustomCells} 
                    aspectRatio={
                      selectedSize.name === 'Custom' 
                        ? (parseInt(customWidth) || 1200) / (parseInt(customHeight) || 800)
                        : selectedSize.width / selectedSize.height
                    }
                  />
              </div>
            </div>
          )}

          {/* Step 3: Title */}
          {step === 'title' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Name Your Project
              </h3>
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Collage"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-slate-900 dark:text-white text-lg"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Project Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Canvas Size:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedSize.name === 'Custom' ? `${customWidth} × ${customHeight}` : `${selectedSize.width} × ${selectedSize.height}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Grid Layout:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                       Custom Grid ({customCells.length} cells)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Format:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedSize.name}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          {step !== 'size' && (
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={step === 'title' ? handleSubmit : handleNext}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : step === 'title' ? (
              'Create Project'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
