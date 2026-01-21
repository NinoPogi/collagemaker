import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { ProjectImage } from '@/lib/generated/prisma/client';
import { uploadImage, deleteProjectImage } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface ImagesPanelProps {
  projectId: string;
  images: ProjectImage[];
  onUploadSuccess: (newImage: ProjectImage) => void;
  onSelectImage: (image: ProjectImage) => void;
}

export default function ImagesPanel({ projectId, images: initialImages, onUploadSuccess, onSelectImage }: ImagesPanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [localImages, setLocalImages] = useState<ProjectImage[]>(initialImages);

  const router = useRouter(); 

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', await toBase64(file));
      formData.append('fileName', file.name);
      
      const res = await uploadImage(formData, projectId);
      
      if (res.success && res.url) {
        // Optimistic Update
        const newImage: ProjectImage = {
            id: 'temp-' + Date.now(),
            url: res.url,
            fileId: null,
            thumbnail: null,
            projectId: projectId,
            createdAt: new Date()
        };
        
        setLocalImages(prev => [newImage, ...prev]);
        router.refresh(); // Sync with server for real ID
      }
    }
    setIsUploading(false);
  }, [projectId, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []} });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Project Images</h3>
        
        {/* Upload Area */}
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-xl p-4 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-center
            ${isDragActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'}
          `}
        >
          <input {...getInputProps()} />
          <Upload size={20} className="text-slate-400" />
          <p className="text-xs text-slate-500">
            {isUploading ? 'Uploading...' : 'Drop images here or click to upload'}
          </p>
        </div>
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2">
        {localImages.map((img) => (
          <div 
            key={img.id}
            onClick={() => onSelectImage(img)}
            draggable
            onDragStart={(e) => {
               e.dataTransfer.setData('payload', JSON.stringify({ type: 'image', url: img.url, aspectRatio: 1 })); 
               e.dataTransfer.effectAllowed = 'copy';
            }}
            className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-orange-400 transition-all relative group"
          >
            <img 
               src={img.thumbnail || img.url} 
               alt="Project Asset" 
               className="w-full h-full object-cover pointer-events-none" 
            />
            {/* Delete Button Overlay */}
            <button
               onClick={async (e) => {
                  e.stopPropagation();
                  // Optimistic remove
                  setLocalImages(prev => prev.filter(p => p.id !== img.id));
                  await deleteProjectImage(img.id);
                  router.refresh();
               }}
               className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10"
               title="Delete Image"
            >
               <X size={12} />
            </button>
          </div>
        ))}
        {localImages.length === 0 && !isUploading && (
           <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
              No images yet. Upload some to start dragging!
           </div>
        )}
      </div>
    </div>
  );
}

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});
