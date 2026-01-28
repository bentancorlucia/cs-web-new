"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - value.length;
      if (remainingSlots <= 0) {
        setError(`Máximo ${maxImages} imágenes permitidas`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      // Validate files
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          setError("Solo se permiten archivos de imagen");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Las imágenes deben ser menores a 5MB");
          return;
        }
      }

      setError(null);
      setUploading(true);

      try {
        const uploadPromises = filesToUpload.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Error al subir imagen");
          }

          const data = await response.json();
          return data.url;
        });

        const newUrls = await Promise.all(uploadPromises);
        onChange([...value, ...newUrls]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir imágenes");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, maxImages]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    const newUrls = [...value];
    const [removed] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, removed);
    onChange(newUrls);
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer",
          "transition-all duration-300",
          dragActive
            ? "border-bordo bg-bordo/5 scale-[1.01]"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
          uploading && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-bordo/20 border-t-bordo rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Subiendo imágenes...</p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                dragActive ? "bg-bordo/10" : "bg-slate-75"
              )}
            >
              <svg
                className={cn(
                  "w-8 h-8 transition-colors",
                  dragActive ? "text-bordo" : "text-gray-400"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              <span className="font-semibold text-bordo">Click para subir</span> o arrastrá imágenes aquí
            </p>
            <p className="mt-2 text-xs text-gray-400">
              PNG, JPG, WEBP hasta 5MB ({value.length}/{maxImages})
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 rounded-2xl">
          <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-75"
            >
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                {/* Move left */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                    className="p-2.5 bg-white rounded-xl hover:bg-slate-75 transition-colors shadow-soft-sm"
                    title="Mover a la izquierda"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Delete */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="p-2.5 bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors shadow-soft-sm"
                  title="Eliminar imagen"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Move right */}
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                    className="p-2.5 bg-white rounded-xl hover:bg-slate-75 transition-colors shadow-soft-sm"
                    title="Mover a la derecha"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-bordo text-white text-xs font-semibold rounded-full shadow-soft-sm">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          La primera imagen será la imagen principal del producto. Usá los botones para reordenar.
        </p>
      )}
    </div>
  );
}
