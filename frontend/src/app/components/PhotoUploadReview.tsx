import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface PhotoUploadReviewProps {
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
}

export const PhotoUploadReview: React.FC<PhotoUploadReviewProps> = ({
  onPhotosChange,
  maxPhotos = 5,
}) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos = Array.from(files).filter(
      (file) => file.type.startsWith('image/')
    );

    if (photos.length + newPhotos.length > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = newPhotos.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each photo must be under 5MB');
      return;
    }

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);

    // Generate previews
    newPhotos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    setPreviews(updatedPreviews);
    onPhotosChange(updatedPhotos);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <ImageIcon className="w-4 h-4 inline mr-2" />
        Add Photos (Optional)
      </label>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragging
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="photo-upload"
          disabled={photos.length >= maxPhotos}
        />
        <label
          htmlFor="photo-upload"
          className={`cursor-pointer ${
            photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">
            {dragging ? 'Drop photos here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG up to 5MB each (max {maxPhotos} photos)
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {photos.length} / {maxPhotos} photos uploaded
          </p>
        </label>
      </div>

      {/* Photo Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AnimatePresence>
            {previews.map((preview, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all"></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
