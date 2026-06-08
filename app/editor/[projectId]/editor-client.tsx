"use client";

import { Project } from "@/types/project";
import { Prisma, ProjectImage } from "@/lib/generated/prisma/client";
import EditorHeader from "@/components/editor/editor-header";
import EditorTools from "@/components/editor/editor-tools";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { PanelLeft, PanelLeftClose, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProject, uploadImage } from "@/app/actions";
import FloatingTopMenu from "@/components/editor/floating-top-menu";
import DrawMenu from "@/components/editor/draw-menu";

interface CollageEditorProps {
  project: Project;
  projectImages: ProjectImage[];
}

export default function CollageEditor({
  project,
  projectImages,
}: CollageEditorProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const handleSaveRef = useRef<() => void>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeColorProperty, setActiveColorProperty] = useState<string>("");
  const [isCustomGrid, setIsCustomGrid] = useState(false);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const handleLoaded = useCallback(() => {
    setIsCanvasReady(true);
  }, [setIsCanvasReady]);
  const handleCanvasChange = useCallback(() => {
    handleSaveRef.current?.();
  }, []);
  const {
    canvasRef,
    addText,
    downloadImage,
    getJson,
    generateThumbnail,
    addImageToCanvas,
    isObjectSelected,
    isGroupSelected,
    activeObject,
    deleteActiveObject,
    addShapeToCanvas,
    toggleDrawingMode,
    changeObjectOrder,
    changeFontWeight,
    changeFontStyle,
    changeFontUnderline,
    changeFontLinethrough,
    changeTextAlignment,
    flipObject,
    changeStrokeWidth,
    getAllColors,
    changeActiveObjectColor,
    changeFontSize,
    changeFontFamily,
    applyImageFilter,
  } = useFabricCanvas({
    canvasState: project.canvasState,
    onLoaded: handleLoaded,
    onCanvasChange: handleCanvasChange,
  });

  type ProjectUpdates = Omit<
    Partial<Project>,
    "canvasState" | "thumbnailUrl"
  > & { canvasState?: Prisma.InputJsonValue; thumbnailUrl?: string };

  const handleUpdate = useCallback(
    async (update: ProjectUpdates) => {
      setIsSaving(true);
      try {
        await updateProject(project.id, update);
      } catch (error) {
        console.error("Update error:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [project.id],
  );

  const handleSave = useCallback(async () => {
    if (!isCanvasReady) return;

    let thumbnailUrl = project.thumbnailUrl;
    const thumbnail = generateThumbnail();
    if (thumbnail) {
      const formData = new FormData();
      formData.append("file", thumbnail);
      formData.append("fileName", `${project.title + " " + project.id}.png`);
      formData.append("useUniqueFileName", "false");
      formData.append("projectId", project.id);
      const response = await uploadImage(formData);
      if (response.success && response.url) {
        thumbnailUrl = response.url;
      } else {
        console.error("Thumbnail upload failed:", response);
      }
    }
    const json = getJson();
    handleUpdate({
      title: title,
      canvasState: json,
      thumbnailUrl: thumbnailUrl ?? undefined,
    });
  }, [
    isCanvasReady,
    project.id,
    project.thumbnailUrl,
    project.title,
    title,
    getJson,
    generateThumbnail,
    handleUpdate,
  ]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    if (canvasAreaRef.current) observer.observe(canvasAreaRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  const padding =
    typeof window !== "undefined" && window.innerWidth < 768 ? 32 : 72;

  const availableWidth = Math.max(0, containerSize.width - padding);
  const availableHeight = Math.max(0, containerSize.height - padding);

  const scale =
    containerSize.width && containerSize.height
      ? Math.min(
          availableWidth / project.canvasWidth,
          availableHeight / project.canvasHeight,
        )
      : 1;

  const canvasWrapperClass =
    "flex-1 flex items-center justify-center overflow-hidden w-full h-full relative bg-gradient-to-r from-purple-500 to-pink-500 " +
    "md:shadow-lg md:rounded-tl-lg md:border md:border-slate-200 dark:md:border-slate-700 md:mt-2 md:ml-2";

  async function handleUpdateGrid(grid: { rows: number; cols: number }) {
    handleUpdate({
      gridRows: grid.rows,
      gridCols: grid.cols,
    });
  }

  const handleUpdateName = useCallback(async () => {
    await handleUpdate({
      title: title,
    });
  }, [title, handleUpdate]);

  const handleTab = (tab: string, property?: string) => {
    const isSameTab = activeTab === tab;
    const isSameProperty = property ? activeColorProperty === property : true;

    const isClickingCurrent =
      isSameTab && (tab === "colors" ? isSameProperty : true);
    if (isClickingCurrent) {
      setIsPanelOpen(false);
      setActiveTab("");
      setActiveColorProperty("");
    } else {
      setActiveColors(getAllColors());
      setIsPanelOpen(true);
      setActiveTab(tab);
      if (property) setActiveColorProperty(property);
    }
  };

  // console.log(activeObject);

  return (
    <div className="flex flex-col h-[100dvh]">
      <header className="col-span-3">
        <EditorHeader
          title={title}
          setTitle={setTitle}
          handleSave={handleSave}
          handleUpdateName={handleUpdateName}
          handleDownload={downloadImage}
          isSaving={isSaving}
        />
      </header>
      <main className="flex-1 flex overflow-hidden">
        <EditorTools
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isExpanded={isPanelOpen}
          setIsExpanded={setIsPanelOpen}
          addText={addText}
          projectId={project.id}
          projectImages={projectImages}
          addImageToCanvas={(url: string) => {
            addImageToCanvas(url);
            if (window.innerWidth < 768) {
              setIsPanelOpen(false);
            }
          }}
          changeActiveObjectColor={changeActiveObjectColor}
          activeColorProperty={activeColorProperty}
          isToolsOpen={isToolsOpen}
          setIsToolsOpen={setIsToolsOpen}
          changeFontFamily={changeFontFamily}
          activeObject={activeObject}
          activeColors={activeColors}
          applyImageFilter={applyImageFilter}
          addShapeToCanvas={(src: string) => {
            addShapeToCanvas(src);
            if (window.innerWidth < 768) {
              setIsPanelOpen(false);
            }
          }}
          projectGrid={{
            rows: project.gridRows,
            cols: project.gridCols,
          }}
          handleUpdateGrid={handleUpdateGrid}
          isCustomGrid={isCustomGrid}
          setIsCustomGrid={setIsCustomGrid}
        />
        <div
          ref={canvasAreaRef}
          className={canvasWrapperClass}
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          {!isCanvasReady && (
            <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
              <LoaderCircle className="animate-spin w-10 h-10 text-orange-500" />
              <span className="ml-2 font-medium text-slate-500">
                Loading Canvas...
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            className="hidden md:flex absolute top-1 left-1 size-12 hover:bg-transparent hover:text-current z-50 "
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            {isPanelOpen ? <PanelLeftClose /> : <PanelLeft />}
          </Button>
          {isToolsOpen && (
            <DrawMenu
              toggleDrawingMode={toggleDrawingMode}
              setIsToolsOpen={setIsToolsOpen}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {(isObjectSelected || isGroupSelected) && (
            <FloatingTopMenu
              activeObject={activeObject}
              deleteObject={deleteActiveObject}
              changeObjectOrder={changeObjectOrder}
              changeFontWeight={changeFontWeight}
              changeFontStyle={changeFontStyle}
              changeFontUnderline={changeFontUnderline}
              changeFontLinethrough={changeFontLinethrough}
              changeTextAlignment={changeTextAlignment}
              flipObject={flipObject}
              changeStrokeWidth={changeStrokeWidth}
              isGroupSelected={isGroupSelected}
              onClick={(e) => e.stopPropagation()}
              handleTab={handleTab}
              changeFontSize={changeFontSize}
            />
          )}

          <div
            style={{
              width: project.canvasWidth * scale,
              height: project.canvasHeight * scale,
            }}
            className="mb-24 md:mb-0 shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: project.canvasWidth,
                height: project.canvasHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="relative"
            >
              <div>
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
