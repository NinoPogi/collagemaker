import { deleteImage, uploadImage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ProjectImage } from "@/lib/generated/prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";

interface UploadPanelProps {
  projectId: string;
  projectImages: ProjectImage[];
  addImageToCanvas: (url: string) => void;
}

export default function UploadPanel({
  projectId,
  projectImages,
  addImageToCanvas,
}: UploadPanelProps) {
  const [images, setImages] = useState<ProjectImage[]>(projectImages);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 20,
    onDrop: useCallback(
      async (acceptedFiles: File[]) => {
        try {
          setIsUploading(true);
          for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append("file", await toBase64(file));
            formData.append("fileName", `${projectId + "/" + file.name}.png`);
            formData.append("projectId", projectId);
            const response = await uploadImage(formData, projectId);

            if (response.success && response.url) {
              const newImage: ProjectImage = {
                id: "temp-" + Date.now(),
                url: response.url,
                fileId: null,
                thumbnail: null,
                projectId: projectId,
                createdAt: new Date(),
              };

              setImages((prev) => [newImage, ...prev]);
              router.refresh();
            }
          }
        } catch (error) {
          console.error("Upload error:", error);
        } finally {
          setIsUploading(false);
        }
      },
      [projectId, router],
    ),
  });

  return (
    <div className="flex flex-col gap-2 py-4 px-5 md:px-2 overflow-y-auto h-full">
      <div
        {...getRootProps({
          className:
            "border border-gray-200 rounded-md p-4 flex items-center justify-center",
        })}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <h3 className="text-xl ">Uploaded Images</h3>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative rounded-lg overflow-hidden"
            draggable
            onDragStart={(e: React.DragEvent) => {
              e.dataTransfer.setData(
                "payload",
                JSON.stringify({
                  type: "image",
                  url: image.url,
                  aspectRatio: 1,
                }),
              );
              e.dataTransfer.effectAllowed = "copy";
            }}
            onDoubleClick={() => {
              addImageToCanvas(image.url);
            }}
          >
            <Image
              src={image.url}
              alt="Uploaded Image"
              width={100}
              height={100}
              className="w-24 h-24 object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-[-10px] right-[-10px] z-50"
              onClick={async (e: React.MouseEvent) => {
                e.stopPropagation();
                setImages((prev) => prev.filter((p) => p.id !== image.id));
                await deleteImage(image.id);
                router.refresh();
              }}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
