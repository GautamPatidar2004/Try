
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Star } from "lucide-react";

interface ImageUploadStepProps {
  uploadedImages: File[];
  setUploadedImages: (images: File[]) => void;
  primaryImageIndex: number;
  setPrimaryImageIndex: (index: number) => void;
  existingImages?: any[];
  onSetExistingPrimary?: (imageId: string) => void;
  onRemoveExistingImage?: (imageId: string) => void;
  isLoadingImages?: boolean;
  imageLoadError?: string | null;
}

const ImageUploadStep = ({
  uploadedImages,
  setUploadedImages,
  primaryImageIndex,
  setPrimaryImageIndex,
  existingImages = [],
  onSetExistingPrimary,
  onRemoveExistingImage,
  isLoadingImages = false,
  imageLoadError = null,
}: ImageUploadStepProps) => {
  const handleFileUpload = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 40 * 1024 * 1024
    );
    
    const invalidFiles = Array.from(files).filter(
      (file) => !file.type.startsWith("image/") || file.size > 40 * 1024 * 1024
    );
    
    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} file(s) were skipped. Please ensure files are images under 40MB.`);
    }
    
    if (validFiles.length > 0) {
      setUploadedImages([...uploadedImages, ...validFiles].slice(0, 30));
    }
  }, [uploadedImages, setUploadedImages]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const setPrimary = (index: number) => {
    setPrimaryImageIndex(index);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload Images *</h3>
        <p className="text-gray-600 text-sm mb-2">
          Add photos of your property. Click on any existing image to set it as the primary thumbnail.
        </p>
        <p className="text-red-600 text-sm font-medium mb-6">
          * At least one image is required to proceed (existing or newly uploaded)
        </p>
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          uploadedImages.length === 0 
            ? 'border-red-300 hover:border-red-400 bg-red-50/50' 
            : 'border-gray-300 hover:border-brand-green'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop images here
            </p>
            <p className="text-sm text-gray-600 mb-4">
              or click to browse files
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              id="image-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="image-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Maximum 30 images, 40MB each. Supported formats: JPG, PNG, WebP
          </p>
        </CardContent>
      </Card>

      {/* Loading State for Existing Images */}
      {isLoadingImages && (
        <div>
          <h4 className="font-medium mb-4">Loading existing images...</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Error State for Existing Images */}
      {imageLoadError && !isLoadingImages && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">⚠️ Failed to load existing images</h4>
          <p className="text-sm text-red-600">{imageLoadError}</p>
          <p className="text-sm text-red-600 mt-1 font-medium">
            You must upload new images to proceed or the form will be blocked.
          </p>
        </div>
      )}

      {/* Existing Images */}
      {!isLoadingImages && !imageLoadError && existingImages.length > 0 && (
        <div>
          <h4 className="font-medium mb-4">
            Existing Images ({existingImages.length}) 
            <span className="text-sm text-gray-500 font-normal ml-2">Click to set as primary</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <div 
                  className={`aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer transition-all duration-200 ${
                    image.is_primary 
                      ? 'ring-2 ring-yellow-500 ring-offset-2' 
                      : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                  }`}
                  onClick={() => onSetExistingPrimary?.(image.id)}
                >
                  <img
                    src={image.image_url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Primary Badge */}
                {image.is_primary && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600 pointer-events-none">
                    <Star className="w-3 h-3 mr-1" />
                    Primary
                  </Badge>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!image.is_primary && onSetExistingPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetExistingPrimary(image.id);
                      }}
                      title="Set as primary"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                  )}
                  {onRemoveExistingImage && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveExistingImage(image.id);
                      }}
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="font-medium mb-4">New Images ({uploadedImages.length}/30)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadStep;
