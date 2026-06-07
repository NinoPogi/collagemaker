import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActiveObjectState } from "@/types/project";
import {
  Bold,
  Italic,
  Strikethrough,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  Underline,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import React from "react";

interface TextMenuProps {
  activeObject: ActiveObjectState | null;
  changeFontWeight: (newWeight: "bold" | "normal") => void;
  changeFontStyle: (newStyle: "italic" | "normal") => void;
  changeFontUnderline: () => void;
  changeFontLinethrough: () => void;
  changeTextAlignment: (
    newAlignment: "left" | "center" | "right" | "justify",
  ) => void;
  handleTab: (tab: string, property?: "fill" | "stroke") => void;
  changeFontSize: (fontSize: number) => void;
}

export default function TextMenu({
  activeObject,
  changeFontWeight,
  changeFontStyle,
  changeFontUnderline,
  changeFontLinethrough,
  changeTextAlignment,
  handleTab,
  changeFontSize,
}: TextMenuProps) {
  if (activeObject?.type !== "textbox") return null;
  const activeTextObject = activeObject;
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= 100) {
      changeFontSize(value);
    }
  };
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-2"
        onClick={() => handleTab("font")}
      >
        <Input
          type="text"
          value={activeTextObject.fontFamily || "Arial"}
          readOnly
          style={{
            fieldSizing: "content",
            fontFamily: activeTextObject.fontFamily,
          }}
          className="w-auto min-w-[2rem]"
        />
      </div>

      <Input
        type="number"
        value={activeTextObject.fontSize?.toString() || "16"}
        style={{ fieldSizing: "content" }}
        className="w-auto min-w-[3rem]"
        onChange={handleFontSizeChange}
        min={1}
        max={100}
      />

      {typeof activeObject.fill === "string" ? (
        <div className="flex items-center gap-2 relative">
          <Label className="text-xs absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
            Fill
          </Label>
          <Button variant="ghost" size="icon">
            <div
              className="w-6 h-6 rounded-full hover:bg-transparent hover:text-current"
              style={{ backgroundColor: activeObject.fill }}
              onClick={() => handleTab("colors", "fill")}
            />
          </Button>
        </div>
      ) : null}

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent hover:text-current"
        onClick={() =>
          changeFontWeight(
            activeObject.fontWeight === "bold" ? "normal" : "bold",
          )
        }
      >
        <Bold
          {...(activeObject.fontWeight === "bold"
            ? { strokeWidth: 4, color: "orange" }
            : {})}
        />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent hover:text-current"
        onClick={() =>
          changeFontStyle(
            activeObject.fontStyle === "italic" ? "normal" : "italic",
          )
        }
      >
        <Italic
          {...(activeObject.fontStyle === "italic" ? { color: "orange" } : {})}
        />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent hover:text-current"
        onClick={() => changeFontUnderline()}
      >
        <Underline {...(activeObject.underline ? { color: "orange" } : {})} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent hover:text-current"
        onClick={() => changeFontLinethrough()}
      >
        <Strikethrough
          {...(activeObject.linethrough ? { color: "orange" } : {})}
        />
      </Button>
      <Select
        value={activeObject.textAlign}
        onValueChange={(e: "left" | "center" | "right" | "justify") =>
          changeTextAlignment(e)
        }
      >
        <SelectTrigger>
          <span>
            {activeObject.textAlign === "left" ? (
              <TextAlignStart />
            ) : activeObject.textAlign === "center" ? (
              <TextAlignCenter />
            ) : activeObject.textAlign === "right" ? (
              <TextAlignEnd />
            ) : (
              <TextAlignJustify />
            )}
            <span className="sr-only">
              <SelectValue />
            </span>
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">
            <div className="flex items-center gap-2">
              <TextAlignStart className="w-4 h-4" />
              <span>Left</span>
            </div>
          </SelectItem>
          <SelectItem value="right">
            <div className="flex items-center gap-2">
              <TextAlignEnd className="w-4 h-4" />
              <span>Right</span>
            </div>
          </SelectItem>
          <SelectItem value="center">
            <div className="flex items-center gap-2">
              <TextAlignCenter className="w-4 h-4" />
              <span>Center</span>
            </div>
          </SelectItem>
          <SelectItem value="justify">
            <div className="flex items-center gap-2">
              <TextAlignJustify className="w-4 h-4" />
              <span>Justify</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
