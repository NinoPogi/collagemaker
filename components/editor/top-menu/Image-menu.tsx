import React from "react";
import { ActiveObjectState } from "@/types/project";
import { Button } from "@/components/ui/button";
import { FlipHorizontal, FlipVertical, Images } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ImageMenuProps {
  activeObject: ActiveObjectState | null;
  flipObject: (axis: "x" | "y") => void;
  handleTab: (tab: string, property?: "fill" | "stroke") => void;
}

export default function ImageMenu({
  activeObject,
  flipObject,
  handleTab,
}: ImageMenuProps) {
  return activeObject?.type == "image" ? (
    <div className="flex items-center gap-2 pl-4">
      <Button
        variant="outline"
        size="icon"
        className="hover:bg-transparent hover:text-current w-auto min-w-3rem px-2"
        style={{ fieldSizing: "content" }}
        onClick={() => handleTab("image")}
      >
        <Images /> Image
      </Button>
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent hover:text-current"
        onClick={() => flipObject("x")}
      >
        <FlipHorizontal />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-transparent hover:text-current"
        onClick={() => flipObject("y")}
      >
        <FlipVertical />
      </Button>
    </div>
  ) : null;
}
