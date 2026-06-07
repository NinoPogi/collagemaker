import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ActiveObjectState } from "@/types/project";
import React, { useState } from "react";

interface ImagePanelProps {
  activeObject: ActiveObjectState | null;
  applyImageFilter: (filter: string, value?: number) => void;
}

export default function ImagePanel({
  activeObject,
  applyImageFilter,
}: ImagePanelProps) {
  if (activeObject?.type !== "image")
    return (
      <div className="flex flex-col gap-2 py-4 px-2 items-center justify-center">
        <h3 className="font-bold text-2xl">Image Adjustments</h3>
        <h2 className="text-gray-500">Please select an image</h2>
      </div>
    );

  const [adjusments, setAdjusments] = useState({
    brightness: activeObject?.filters?.brightness || 0,
    contrast: activeObject?.filters?.contrast || 0,
    saturation: activeObject?.filters?.saturation || 0,
    hue: activeObject?.filters?.hue || 0,
    blur: activeObject?.filters?.blur || 0,
    noise: activeObject?.filters?.noise || 0,
    pixelate: activeObject?.filters?.pixelate || 0,
    grayscale: activeObject?.filters?.grayscale || false,
    invert: activeObject?.filters?.invert || false,
    sepia: activeObject?.filters?.sepia || false,
    kodachrome: activeObject?.filters?.kodachrome || false,
    vintage: activeObject?.filters?.vintage || false,
    technicolor: activeObject?.filters?.technicolor || false,
    polaroid: activeObject?.filters?.polaroid || false,
    brownie: activeObject?.filters?.brownie || false,
    blackWhite: activeObject?.filters?.blackWhite || false,
  });

  const handleFilterSlider = (filter: string, value?: number) => {
    setAdjusments((prev) => ({
      ...prev,
      [filter]: value,
    }));
    applyImageFilter(filter, value);
  };

  const handleFilerSelect = (filter: string) => {
    const filterArray = [
      "grayscale",
      "invert",
      "sepia",
      "kodachrome",
      "vintage",
      "technicolor",
      "polaroid",
      "brownie",
      "blackWhite",
    ];
    filterArray.forEach((f) => {
      setAdjusments((prev) => ({
        ...prev,
        [f]: false,
      }));
    });
    setAdjusments((prev) => ({
      ...prev,
      [filter]: true,
    }));
    applyImageFilter(filter);
  };

  const handleReset = () => {
    setAdjusments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      noise: 0,
      pixelate: 0,
      grayscale: false,
      invert: false,
      sepia: false,
      kodachrome: false,
      vintage: false,
      technicolor: false,
      polaroid: false,
      brownie: false,
      blackWhite: false,
    });
    applyImageFilter("none");
  };

  return (
    <div className="flex flex-col gap-4 py-4 px-2 items-center justify-center">
      <h3 className="font-bold text-2xl">Image Adjustments </h3>
      <div className="flex gap-2 p-2 items-center justify-center">
        <h2>Color Preset</h2>
        <Select
          onValueChange={(value) => applyImageFilter(value)}
          value={activeObject?.filters?.name}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Filter" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectItem value="grayscale">Grayscale</SelectItem>
              <SelectItem value="invert">Invert</SelectItem>
              <SelectItem value="sepia">Sepia</SelectItem>
              <SelectItem value="kodachrome">Kodachrome</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="technicolor">Technicolor</SelectItem>
              <SelectItem value="polaroid">Polaroid</SelectItem>
              <SelectItem value="brownie">Brownie</SelectItem>
              <SelectItem value="black-white">Black & White</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>{" "}
      </div>

      <h2>Brightness</h2>
      <Slider
        step={0.1}
        min={-1}
        max={1}
        value={[adjusments.brightness]}
        onValueChange={(value: number[]) => {
          handleFilterSlider("brightness", value[0]);
        }}
      />
      <h2>Contrast</h2>
      <Slider
        step={0.1}
        min={-1}
        max={1}
        value={[adjusments.contrast]}
        onValueChange={(value: number[]) =>
          handleFilterSlider("contrast", value[0])
        }
      />
      <h2>Saturation</h2>
      <Slider
        step={0.1}
        min={-1}
        max={1}
        value={[adjusments.saturation]}
        onValueChange={(value: number[]) =>
          handleFilterSlider("saturation", value[0])
        }
      />
      <h2>Hue</h2>
      <Slider
        step={0.1}
        min={-1}
        max={1}
        value={[adjusments.hue]}
        onValueChange={(value: number[]) => handleFilterSlider("hue", value[0])}
        className="[&>span:first-child]:bg-[linear-gradient(to_right,#00ffff,#0000ff,#ff00ff,#ff0000,#ffff00,#00ff00,#00ffff)] 
             [&>span:first-child>span]:bg-transparent"
      />
      <h2>Blur</h2>
      <Slider
        step={0.2}
        min={0}
        max={1}
        value={[adjusments.blur]}
        onValueChange={(value: number[]) =>
          handleFilterSlider("blur", value[0])
        }
      />
      <h2>Noise</h2>
      <Slider
        step={10}
        min={0}
        max={1000}
        value={[adjusments.noise]}
        onValueChange={(value: number[]) =>
          handleFilterSlider("noise", value[0])
        }
      />
      <h2>Pixelate</h2>
      <Slider
        step={1}
        min={1}
        max={50}
        value={[adjusments.pixelate]}
        onValueChange={(value: number[]) =>
          handleFilterSlider("pixelate", value[0])
        }
      />
      <Button onClick={handleReset}>Reset</Button>
    </div>
  );
}
