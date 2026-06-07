import { useState } from "react";
import { Button } from "../ui/button";
import { Pen, Pencil, SprayCan, Eraser, MousePointer2, X } from "lucide-react";

interface DrawMenuProps {
  toggleDrawingMode: (
    tool: "pencil" | "sharpie" | "spray" | "eraser" | "select",
  ) => void;
  setIsToolsOpen: (value: boolean) => void;
  onClick: (e: React.MouseEvent) => void;
}

export default function DrawMenu({
  toggleDrawingMode,
  setIsToolsOpen,
  onClick,
}: DrawMenuProps) {
  const [activeTool, setActiveTool] = useState<
    "select" | "pencil" | "sharpie" | "spray" | "eraser"
  >("select");
  const handleToolClick = (
    tool: "select" | "pencil" | "sharpie" | "spray" | "eraser",
  ) => {
    setActiveTool(tool);
    toggleDrawingMode(tool);
  };
  const toolArray: {
    tool: "select" | "pencil" | "sharpie" | "spray" | "eraser";
    icon: React.ReactNode;
  }[] = [
    { tool: "select", icon: <MousePointer2 /> },
    { tool: "pencil", icon: <Pencil /> },
    { tool: "sharpie", icon: <Pen /> },
    { tool: "spray", icon: <SprayCan /> },
    { tool: "eraser", icon: <Eraser /> },
  ];
  return (
    <div
      className="absolute top-1/10 left-0 z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom"
      onClick={onClick}
    >
      <div className="flex flex-row md:flex-col border border-slate-200 p-2 rounded-2xl bg-white/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={() => {
            setIsToolsOpen(false);
            toggleDrawingMode("select");
          }}
        >
          <X />
        </Button>
        {toolArray.map((tool) => (
          <Button
            key={tool.tool}
            variant="ghost"
            className={`flex flex-col h-auto ${activeTool == tool.tool ? "bg-orange-200" : ""}`}
            onClick={() => handleToolClick(tool.tool)}
          >
            {tool.icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
