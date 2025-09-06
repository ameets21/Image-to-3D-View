import React, { useState, useCallback, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (imageDataUrl: string) => void;
  disabled: boolean;
}

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            onImageUpload(result);
        };
        reader.readAsDataURL(file);
    }
  }, [onImageUpload, disabled]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleClick = () => {
    if(!disabled) {
        fileInputRef.current?.click();
    }
  }

  return (
    <div 
        className={`w-full p-6 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      {preview ? (
        <div className="flex flex-col items-center">
            <img src={preview} alt="Image preview" className="max-h-64 w-auto object-contain rounded-lg shadow-lg" />
            <p className="mt-4 text-slate-400">Click or drag another image to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
            <UploadIcon className="w-10 h-10" />
            <p className="font-semibold text-slate-300">Click to upload or drag & drop</p>
            <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
        </div>
      )}
    </div>
  );
};
