
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, X, Loader2 } from "lucide-react";

interface ProfileAvatarUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  initials: string;
  onPhotoUpdated: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

const ProfileAvatarUpload = ({ 
  userId, 
  currentPhotoUrl, 
  initials, 
  onPhotoUpdated,
  size = "lg" 
}: ProfileAvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const checkSession = async (): Promise<boolean> => {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error || !session) {
      console.error('Session validation failed');
      return false;
    }
    
    return true;
  };

  const uploadWithRetry = async (
    filePath: string, 
    processedImage: Blob, 
    maxRetries: number = 3
  ): Promise<void> => {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(500 * Math.pow(2, attempt), 2000);
          await new Promise(resolve => setTimeout(resolve, delay));
          await checkSession();
        }
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, processedImage);
        
        if (uploadError) {
          lastError = uploadError;
          
          if (uploadError.message?.includes('row-level security') || 
              uploadError.message?.includes('policy')) {
            if (attempt < maxRetries - 1) {
              continue;
            }
          }
          
          throw uploadError;
        }
        
        return;
        
      } catch (error) {
        lastError = error;
        if (!error.message?.includes('row-level security') && 
            !error.message?.includes('policy')) {
          throw error;
        }
      }
    }
    
    throw new Error(`Upload failed after ${maxRetries} attempts. ${lastError?.message || 'Unknown error'}`);
  };

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const processImageFile = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        // Create square canvas (800x800 for good quality)
        const size = 800;
        canvas.width = size;
        canvas.height = size;
        
        // Calculate crop dimensions to maintain aspect ratio
        const scale = Math.max(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;
        
        // Draw and crop image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Canvas conversion failed')),
          'image/jpeg',
          0.9
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;
    
    if (!userId || userId === '') {
      console.error('Upload failed: userId is empty or undefined');
      toast({
        title: "Upload failed",
        description: "User session not ready. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sessionValid = await checkSession();
      if (!sessionValid) {
        toast({
          title: "Session not ready",
          description: "Please wait a moment and try again.",
          variant: "destructive",
        });
        return;
      }

      const processedImage = await processImageFile(file);

      if (currentPhotoUrl) {
        const oldPath = currentPhotoUrl.split('/').pop();
        if (oldPath) {
          try {
            await supabase.storage
              .from('profile-photos')
              .remove([`${userId}/${oldPath}`]);
          } catch (deleteError) {
            console.warn('Failed to delete old photo:', deleteError);
          }
        }
      }

      const fileName = `${Date.now()}.jpg`;
      const filePath = `${userId}/${fileName}`;
      
      await uploadWithRetry(filePath, processedImage);

      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: data.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onPhotoUpdated(data.publicUrl);
      toast({
        title: "Profile photo updated!",
        description: "Your new headshot has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      if (error && typeof error === 'object') {
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
      
      toast({
        title: "Upload failed",
        description: (error as any)?.message || "Failed to upload your photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removePhoto = async () => {
    if (!currentPhotoUrl) return;

    setUploading(true);
    try {
      // Delete from storage
      const oldPath = currentPhotoUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('profile-photos')
          .remove([`${userId}/${oldPath}`]);
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ profile_photo_url: null })
        .eq('id', userId);

      if (error) throw error;

      onPhotoUpdated('');
      toast({
        title: "Photo removed",
        description: "Your profile photo has been removed.",
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: "Failed to remove photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div
        className={`relative ${sizeClasses[size]} group cursor-pointer`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className={`${sizeClasses[size]} ${dragOver ? 'ring-2 ring-brand-green' : ''}`}>
          <AvatarImage src={currentPhotoUrl} />
          <AvatarFallback className="bg-brand-green text-white text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
          <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-1" />
          {currentPhotoUrl ? 'Change' : 'Upload'}
        </Button>
        
        {currentPhotoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removePhoto}
            disabled={uploading}
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, or WebP up to 5MB
      </p>
    </div>
  );
};

export default ProfileAvatarUpload;
