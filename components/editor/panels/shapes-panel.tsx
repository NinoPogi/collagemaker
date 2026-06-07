import { Button } from "@/components/ui/button";
import { SHAPES_LIST } from "@/lib/collage-constants";
import React from "react";

interface ShapesPanelProps {
  addShapeToCanvas: (src: string) => void;
}

function ShapesPanel({ addShapeToCanvas }: ShapesPanelProps) {
  return (
    <div className="flex flex-col gap-2 py-4 px-2 items-center justify-center">
      <div className="grid grid-cols-2 gap-2">
        {SHAPES_LIST.map((shape) => (
          <Button
            key={shape.id}
            variant="ghost"
            className="flex flex-col h-auto"
            onDoubleClick={() => addShapeToCanvas(shape.src)}
          >
            <img src={shape.src} alt={shape.name} className="w-12 h-12" />
            {shape.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default ShapesPanel;
