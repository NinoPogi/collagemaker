import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ActiveObjectState } from "@/types/project";
import { Button } from "@/components/ui/button";

interface FontPanelProps {
  activeObject: ActiveObjectState | null;
  changeFontFamily: (fontFamily: string) => void;
}

export default function FontPanel({
  activeObject,
  changeFontFamily,
}: FontPanelProps) {
  if (activeObject?.type !== "textbox")
    return (
      <div className="flex flex-col gap-2 py-4 px-2 items-center justify-center">
        <h3 className="font-bold text-2xl">Change Font</h3>
        <h2 className="text-gray-500">Please select a text</h2>
      </div>
    );
  const activeTextObject = activeObject;

  const fonts = [
    "Arial",
    "Times New Roman",
    "Comic Sans MS",
    "Courier New",
    "Georgia",
    "Impact",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Oswald",
    "Raleway",
    "Nunito",
    "Merriweather",
    "Playfair Display",
    "Lora",
    "PT Serif",
    "Shadows Into Light",
    "Pacifico",
    "Dancing Script",
    "Indie Flower",
    "Caveat",
    "Anton",
    "Bebas Neue",
    "Lobster",
  ];

  const handleFontFamilyChange = (font: string) => {
    changeFontFamily(font);
  };

  return (
    <div className="flex flex-col gap-2 py-4 px-2 items-center justify-center">
      <h3 className="font-bold text-2xl">Change Font</h3>
      <div className="flex flex-col gap-2 overflow-y-auto h-[100vh]">
        {fonts.map((font) => (
          <Button
            key={font}
            variant="outline"
            onClick={() => handleFontFamilyChange(font)}
            className={`mx-2 my-1 p-8 rounded ${activeTextObject?.fontFamily === font ? "border-blue-500" : ""}`}
            style={{ fontFamily: font, fontSize: 32 }}
          >
            {font}
          </Button>
        ))}
      </div>
    </div>
  );
}
