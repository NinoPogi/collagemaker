import { Button } from "../ui/button";
import { Trash2, BringToFront, SendToBack } from "lucide-react";
import { Separator } from "../ui/separator";
import { ActiveObjectState } from "@/types/project";
import { Input } from "../ui/input";
import TextMenu from "./top-menu/text-menu";
import ImageMenu from "./top-menu/Image-menu";
import PathMenu from "./top-menu/path-menu";

interface FloatingTopMenuProps {
  activeObject: ActiveObjectState | null;
  deleteObject: () => void;
  changeTextAlignment: (
    newAlignment: "left" | "center" | "right" | "justify",
  ) => void;
  changeObjectOrder: (
    action: "bringForward" | "bringToFront" | "sendBackward" | "sendToBack",
  ) => void;
  changeFontWeight: (newWeight: "bold" | "normal") => void;
  changeFontStyle: (newStyle: "italic" | "normal") => void;
  changeFontUnderline: () => void;
  changeFontLinethrough: () => void;
  changeStrokeWidth: (newWidth: number) => void;
  isGroupSelected: boolean;
  flipObject: (axis: "x" | "y") => void;
  onClick: (e: React.MouseEvent) => void;
  handleTab: (tab: string, property?: "fill" | "stroke") => void;
  changeFontSize: (fontSize: number) => void;
}

export default function FloatingTopMenu({
  activeObject,
  deleteObject,
  changeStrokeWidth,
  changeObjectOrder,
  changeFontWeight,
  changeFontStyle,
  changeFontUnderline,
  changeFontLinethrough,
  changeTextAlignment,
  flipObject,
  isGroupSelected,
  onClick,
  handleTab,
  changeFontSize,
}: FloatingTopMenuProps) {
  const shapeMenu = (
    <PathMenu
      activeObject={activeObject}
      changeStrokeWidth={changeStrokeWidth}
      handleTab={handleTab}
    />
  );
  const renderMenu = {
    image: (
      <ImageMenu
        activeObject={activeObject}
        flipObject={flipObject}
        handleTab={handleTab}
      />
    ),
    textbox: (
      <TextMenu
        activeObject={activeObject}
        changeFontWeight={changeFontWeight}
        changeFontStyle={changeFontStyle}
        changeFontUnderline={changeFontUnderline}
        changeFontLinethrough={changeFontLinethrough}
        changeTextAlignment={changeTextAlignment}
        handleTab={handleTab}
        changeFontSize={changeFontSize}
      />
    ),
    path: shapeMenu,
    circle: shapeMenu,
    rect: shapeMenu,
    group: shapeMenu,
  };

  return (
    <div
      className="absolute z-50 left-[50%] top-[1%] -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200 origin-bottom"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2 border border-slate-200 p-2 rounded-2xl bg-white/80 backdrop-blur-sm">
        {isGroupSelected ? null : (
          <>
            {renderMenu[activeObject?.type as keyof typeof renderMenu]}
            <Separator orientation="vertical" />
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changeObjectOrder("bringToFront")}
        >
          <BringToFront />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changeObjectOrder("sendToBack")}
        >
          <SendToBack />
        </Button>
        <Button variant="ghost" size="icon" onClick={deleteObject}>
          <Trash2 className="text-red-500" />
        </Button>
      </div>
    </div>
  );
}
