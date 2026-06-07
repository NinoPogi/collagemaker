import React from "react";
import { useState } from "react";
import { ChromePicker, CirclePicker } from "react-color";

interface ColorsPanelProps {
  activeColors: string[];
  changeActiveObjectColor: (property: string, color: string) => void;
  activeColorProperty: string;
}
export default function ColorsPanel({
  activeColors,
  changeActiveObjectColor,
  activeColorProperty,
}: ColorsPanelProps) {
  const [color, setColor] = useState("#000000");
  return (
    <div className="flex flex-col gap-2 py-4 px-2 items-center justify-center">
      <h3 className="font-bold text-2xl pb-4">
        Change {activeColorProperty === "fill" ? "Fill" : "Stroke"} Color
      </h3>
      <div className="flex items-center justify-center flex-col gap-2">
        <div>
          <ChromePicker
            color={color}
            onChange={(color: any) => {
              changeActiveObjectColor(activeColorProperty, color.hex);
              setColor(color.hex);
            }}
            styles={{
              default: {
                picker: {
                  boxShadow: "none",
                },
              },
            }}
          />
        </div>
        <div className="flex items-center justify-center p-4 rounded-lg border border-slate-200">
          <CirclePicker
            colors={Array.from(new Set(["#000000", ...activeColors]))}
            onChange={(color: any) => {
              changeActiveObjectColor(activeColorProperty, color.hex);
              setColor(color.hex);
            }}
          />
        </div>
      </div>
    </div>
  );
}
