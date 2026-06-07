import React, { useState } from "react";
import { ActiveObjectState } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface PathMenuProps {
  activeObject: ActiveObjectState | null;
  changeStrokeWidth: (newWidth: number) => void;
  handleTab: (tab: string, property?: "fill" | "stroke") => void;
}

export default function pathMenu({
  activeObject,
  changeStrokeWidth,
  handleTab,
}: PathMenuProps) {
  if (
    activeObject?.type !== "path" &&
    activeObject?.type !== "circle" &&
    activeObject?.type !== "rect" &&
    activeObject?.type !== "group"
  ) {
    return;
  }
  const [strokeWidth, setStrokeWidth] = useState(
    activeObject?.strokeWidth || 0,
  );
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 relative">
        <Label className="text-xs absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          Stroke Width
        </Label>
        <Slider
          value={[strokeWidth]}
          max={10}
          min={0.1}
          step={0.1}
          className="w-32"
          onValueChange={(value) => {
            changeStrokeWidth(value[0]);
            setStrokeWidth(value[0]);
          }}
        />
      </div>

      {typeof activeObject.stroke === "string" ? (
        <div className="flex items-center gap-2 relative">
          <Label className="text-xs absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
            Stroke
          </Label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleTab("colors", "stroke")}
          >
            <div
              className="w-6 h-6 rounded-full hover:bg-transparent hover:text-current"
              style={{ backgroundColor: activeObject.stroke }}
            />
          </Button>
        </div>
      ) : null}
      {typeof activeObject.fill === "string" ? (
        <div className="flex items-center gap-2 relative">
          <Label className="text-xs absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
            Fill
          </Label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleTab("colors", "fill")}
          >
            <div
              className={`w-6 h-6 rounded-full hover:bg-transparent hover:text-current ${activeObject.fill === "transparent" ? "border border-gray-400" : ""}`}
              style={{
                backgroundColor:
                  activeObject.fill !== "transparent" ? activeObject.fill : "",
                backgroundImage:
                  activeObject.fill === "transparent"
                    ? "conic-gradient(#eee 0.25turn, white 0.25turn 0.5turn, #eee 0.5turn 0.75turn, white 0.75turn)"
                    : "",
                backgroundSize:
                  activeObject.fill === "transparent" ? "20px 20px" : "",
              }}
            />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
