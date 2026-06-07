import { Button } from "@/components/ui/button";
import { GRID_LAYOUTS } from "@/lib/collage-constants";
import React, { useState } from "react";

interface GridPanelProps {
  projectGrid: {
    rows: number;
    cols: number;
  };
  handleUpdateGrid: (grid: { rows: number; cols: number }) => void;
  isCustomGrid: boolean;
  setIsCustomGrid: (isCustomGrid: boolean) => void;
}

export default function GridPanel({
  projectGrid,
  handleUpdateGrid,
  isCustomGrid,
  setIsCustomGrid,
}: GridPanelProps) {
  const [grid, setGrid] = useState(projectGrid);
  const [isChanging, setIsChanging] = useState(false);

  const handleSelectLayout = (layout: { rows: number; cols: number }) => {
    setIsChanging(true);
    setGrid(layout);
    handleUpdateGrid(layout);
    setIsChanging(false);
  };

  const isLayoutMatch = GRID_LAYOUTS.some((layout) => {
    return (
      layout.rows > 0 &&
      layout.cols > 0 &&
      layout.rows === grid.rows &&
      layout.cols === grid.cols
    );
  });

  return (
    <div className="flex flex-col gap-2 py-4 px-2 items-center justify-center ">
      <h3 className="font-bold text-2xl">Select a Layout</h3>
      <div className="grid grid-cols-2 gap-3 w-full px-2">
        {GRID_LAYOUTS.map((layout) => {
          const rows = layout.rows > 0 ? layout.rows : 1;
          const cols = layout.cols > 0 ? layout.cols : 1;
          const totalCells =
            layout.rows > 0 && layout.cols > 0 ? rows * cols : 1;
          let isActive = false;

          if (layout.rows === 0 && layout.cols === 0) {
            isActive = !isLayoutMatch;
          } else {
            isActive = layout.rows === grid.rows && layout.cols === grid.cols;
          }

          return layout.id !== "custom-grid" ? (
            <Button
              variant="outline"
              onClick={() => {
                handleSelectLayout({ rows: layout.rows, cols: layout.cols });
                setIsCustomGrid(false);
              }}
              key={layout.id}
              disabled={isChanging}
              className={`flex flex-col gap-2 h-full ${isActive ? "border-blue-500" : ""}`}
            >
              <div
                className="grid gap-1 w-16 h-16 bg-white p-1 border border-slate-200 rounded-md"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: totalCells }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      "rounded-[2px] w-full h-full bg-slate-200 group-hover:bg-blue-400/50 transition-colors"
                    }
                  />
                ))}
              </div>
              {/* Layout Name */}
              <span className="text-xs font-medium text-slate-700 text-center">
                {layout.name}
              </span>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                handleSelectLayout({ rows: layout.rows, cols: layout.cols });
                setIsCustomGrid(true);
              }}
              key={layout.id}
              disabled={isChanging}
              className={`flex flex-col gap-2 h-full ${isCustomGrid ? "border-blue-500" : ""}`}
            >
              <div
                className="grid gap-1 w-16 h-16 bg-white p-1 border border-slate-200 rounded-md"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: totalCells }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      "rounded-[2px] w-full h-full bg-transparent border border-dashed border-slate-300"
                    }
                  />
                ))}
              </div>
              {/* Layout Name */}
              <span className="text-xs font-medium text-slate-700 text-center">
                {layout.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
