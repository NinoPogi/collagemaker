"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions";
import { COLLAGE_SIZES, GRID_LAYOUTS } from "@/lib/collage-constants";
import { X, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"size" | "grid">("size");
  const [title, setTitle] = useState("Untitled");
  const [selectedSize, setSelectedSize] = useState(COLLAGE_SIZES[0]);
  const [selectedGrid, setSelectedGrid] = useState(GRID_LAYOUTS[0]);
  const [customWidth, setCustomWidth] = useState("1200");
  const [customHeight, setCustomHeight] = useState("800");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Determine final canvas size
      const width =
        selectedSize.name === "Custom"
          ? parseInt(customWidth)
          : selectedSize.width;
      const height =
        selectedSize.name === "Custom"
          ? parseInt(customHeight)
          : selectedSize.height;

      const result = await createProject({
        title: title,
        canvasState: {
          width: width,
          height: height,
          backgroundColor: "#ffffff",
        },
        canvasWidth: width,
        canvasHeight: height,
        gridRows: 1,
        gridCols: 2,
      });

      if (!result.success) {
        setError(result.error || "Failed to create project");
        setIsLoading(false);
        return;
      }

      // Success! Close modal and navigate
      handleClose();
      router.push(`/editor/${result.project?.id}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep("size");
      setTitle("");
      setSelectedSize(COLLAGE_SIZES[0]);
      setCustomWidth("1200");
      setCustomHeight("800");
      setError("");
      onClose();
    }
  };

  const handleNext = () => {
    if (step === "size") setStep("grid");
  };

  const handleBack = () => {
    if (step === "grid") setStep("size");
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
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <main className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Size Selection */}
          {step === "size" && (
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
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-orange-300"
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
              {selectedSize.name === "Custom" && (
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

          {/* Step 2: Grid Selection*/}
          {step === "grid" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                Choose Grid Size
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GRID_LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedGrid(layout)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedGrid.name === layout.name
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-orange-300"
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-800 dark:text-white mb-1">
                      {layout.name}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-mono">
                      {layout.rows} × {layout.cols}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          {step !== "size" && (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={isLoading}
              className="px-6 py-5 rounded-xl transition-colors"
            >
              Back
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-5 rounded-xl transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={step === "grid" ? handleSubmit : handleNext}
            disabled={isLoading}
            className="flex-1 px-6 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 border-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="animate-spin h-5 w-5" />
                <p className="hidden sm:block">Creating...</p>
              </span>
            ) : step === "grid" ? (
              "Create Project"
            ) : (
              "Next"
            )}
          </Button>
        </footer>
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
