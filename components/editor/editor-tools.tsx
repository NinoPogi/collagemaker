import { Button } from "@/components/ui/button";
import { TOOL_ITEMS } from "@/lib/collage-constants";
import ShapesPanel from "./panels/shapes-panel";
import FontPanel from "./panels/font-panel";
import UploadPanel from "./panels/upload-panel";
import { X } from "lucide-react";
import { ProjectImage } from "@/lib/generated/prisma/client";
import ColorsPanel from "./panels/colors-panel";
import { Separator } from "../ui/separator";
import { ActiveObjectState, ToolItem } from "@/types/project";
import ImagePanel from "./panels/image-panel";
import GridPanel from "./panels/grid-panel";

interface EditorToolsProps {
  activeObject: ActiveObjectState | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  addText: (textString: string) => void;
  projectId: string;
  projectImages: ProjectImage[];
  addImageToCanvas: (url: string) => void;
  isToolsOpen: boolean;
  setIsToolsOpen: (isToolsOpen: boolean) => void;
  addShapeToCanvas: (src: string) => void;
  activeColors: string[];
  changeActiveObjectColor: (property: string, color: string) => void;
  activeColorProperty: string;
  changeFontFamily: (fontFamily: string) => void;
  applyImageFilter: (filter: string, value?: number) => void;
  projectGrid: {
    rows: number;
    cols: number;
  };
  handleUpdateGrid: (grid: { rows: number; cols: number }) => void;
  isCustomGrid: boolean;
  setIsCustomGrid: (isCustomGrid: boolean) => void;
}

export default function EditorTools({
  activeObject,
  activeTab,
  setActiveTab,
  isExpanded,
  setIsExpanded,
  addText,
  projectId,
  projectImages,
  addImageToCanvas,
  isToolsOpen,
  setIsToolsOpen,
  addShapeToCanvas,
  activeColors,
  changeActiveObjectColor,
  changeFontFamily,
  activeColorProperty,
  applyImageFilter,
  projectGrid,
  handleUpdateGrid,
  isCustomGrid,
  setIsCustomGrid,
}: EditorToolsProps) {
  const handleToolClick = (tool: ToolItem) => {
    if (tool.withPanel) {
      setActiveTab(tool.id);
      setIsExpanded(true);
      if (isExpanded && activeTab === tool.id) {
        setIsExpanded(false);
      }
    } else {
      switch (tool.id) {
        case "text":
          addText("Type your text here");
          break;
        case "draw":
          setIsToolsOpen(!isToolsOpen);
          break;
      }
    }
  };

  const ToolButton = ({ tool }: { tool: ToolItem }) => (
    <Button
      key={tool.id}
      variant="ghost"
      className={`flex flex-col h-auto ${activeTab === tool.id ? "bg-slate-200 dark:bg-slate-800" : ""}`}
      disabled={tool.disabled}
      onClick={() => handleToolClick(tool)}
    >
      <tool.icon />
      {tool.name}
    </Button>
  );

  const renderPanel = () => {
    switch (activeTab) {
      case "upload":
        return (
          <UploadPanel
            projectId={projectId}
            projectImages={projectImages}
            addImageToCanvas={addImageToCanvas}
          />
        );
      case "shapes":
        return <ShapesPanel addShapeToCanvas={addShapeToCanvas} />;
      case "font":
        return (
          <FontPanel
            activeObject={activeObject}
            changeFontFamily={changeFontFamily}
          />
        );
      case "colors":
        return (
          <ColorsPanel
            activeColors={activeColors}
            changeActiveObjectColor={changeActiveObjectColor}
            activeColorProperty={activeColorProperty}
          />
        );
      case "image":
        return (
          <ImagePanel
            activeObject={activeObject}
            applyImageFilter={applyImageFilter}
          />
        );
      case "grid":
        return (
          <GridPanel
            projectGrid={projectGrid}
            handleUpdateGrid={handleUpdateGrid}
            isCustomGrid={isCustomGrid}
            setIsCustomGrid={setIsCustomGrid}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Large Screen */}
      <div className="hidden md:flex flex-col items-center pt-4 gap-2 ">
        {TOOL_ITEMS.map(
          (tool) => tool.withPanel && <ToolButton key={tool.id} tool={tool} />,
        )}
        <Separator className="mb-10" />
        {TOOL_ITEMS.map(
          (tool) => !tool.withPanel && <ToolButton key={tool.id} tool={tool} />,
        )}
      </div>
      <div
        className={`hidden md:flex overflow-hidden animation-all ease-in-out duration-300 ${!isExpanded ? "w-0 opacity-0 p-0 pointer-events-none" : "w-80 opacity-100"}`}
      >
        <div className="min-w-[20px] p-6">
          <h3 className="font-bold text-2xl">
            {TOOL_ITEMS.find((tool) => tool.id === activeTab)?.name}
          </h3>

          {renderPanel()}
        </div>
      </div>

      {/* Mobile Screen */}
      <div className="fixed md:hidden bottom-1 left-4 right-4 z-50">
        <div className="flex items-center justify-center gap-2 m-5 backdrop-blur-sm rounded-2xl border dark:border-slate-700 bg-white/80 backdrop-blur-sm">
          {TOOL_ITEMS.map((tool) => (
            <Button
              key={tool.id}
              variant="ghost"
              className="flex flex-col h-auto "
              disabled={tool.disabled}
              onClick={() => handleToolClick(tool)}
            >
              <tool.icon />
              {tool.name}
            </Button>
          ))}
        </div>
      </div>
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 overflow-hidden animation-all ease-in-out duration-300 ${!isExpanded ? "h-0 opacity-0 p-0 pointer-events-none" : "h-80 opacity-100"}`}
      >
        <div className="min-h-[20px] bg-white dark:bg-slate-900 h-full rounded-2xl">
          <div className="flex items-center justify-between p-4">
            <h3 className="font-bold text-2xl">
              {TOOL_ITEMS.find((tool) => tool.id === activeTab)?.name}
            </h3>
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className=""
            >
              <X />
            </Button>
          </div>
          {renderPanel()}
        </div>
      </div>
    </>
  );
}
