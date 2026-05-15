import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadImage } from '../utils/api';

interface ImageUploaderProps {
  /** Current image URL (controlled) */
  value?: string;
  /** Called with the uploaded image URL on success */
  onChange: (url: string, publicId?: string) => void;
  /** Folder on Cloudinary (e.g. 'destinations', 'reviews'). Default 'gobro/uploads' */
  folder?: string;
  /** Allow drag-and-drop. Default true */
  allowDrop?: boolean;
  /** Show URL text input alongside the upload button. Default true */
  showUrlInput?: boolean;
  /** Max file size in MB. Default 5 */
  maxSizeMB?: number;
  /** Optional label */
  label?: string;
  /** Optional helper text */
  helperText?: string;
  /** className for outer container */
  className?: string;
}

/**
 * Reusable image uploader.
 *
 * Behaviour:
 *   - Click to pick file, or drag-and-drop
 *   - Calls /api/uploads/image (which goes to Cloudinary if env vars set,
 *     or returns a base64 data URL in dev mode)
 *   - Shows preview, loading state, and clear error messages
 *   - Optionally lets user paste a URL directly (showUrlInput)
 */
export function ImageUploader({
  value = '',
  onChange,
  folder = 'gobro/uploads',
  allowDrop = true,
  showUrlInput = true,
  maxSizeMB = 5,
  label,
  helperText,
  className = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large (max ${maxSizeMB}MB)`);
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      onChange(result.url, result.publicId);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={uploading}
      />

      {/* Empty state — full drop zone */}
      {!value && (
        <div
          onDragOver={(e) => { if (allowDrop) { e.preventDefault(); setDragOver(true); } }}
          onDragLeave={() => setDragOver(false)}
          onDrop={allowDrop ? handleDrop : undefined}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
            ${uploading ? 'opacity-60 cursor-wait' : ''}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-purple-600 mx-auto mb-3 animate-spin" />
              <p className="text-sm text-gray-600">Uploading…</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload {allowDrop && 'or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP up to {maxSizeMB}MB</p>
            </>
          )}
        </div>
      )}

      {/* With value — preview + actions */}
      {value && (
        <div className="space-y-2">
          <div className="relative group rounded-xl overflow-hidden bg-gray-100">
            <img
              src={value}
              alt="Upload preview"
              className="w-full h-48 object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-white text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="w-4 h-4" /> Replace</>
                )}
              </button>
              <button
                onClick={() => onChange('', undefined)}
                disabled={uploading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>

          {showUrlInput && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
              placeholder="https://… (or upload above)"
            />
          )}
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export default ImageUploader;
