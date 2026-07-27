 import { useRef, useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Card, CardContent } from "@/components/ui/card";
 import { Upload, Image, Video, X, ArrowRight, SkipForward } from "lucide-react";
 import { ContentData } from "@/hooks/useCollaborationCompletion";
 
 interface ContentUploadStepProps {
   contentData: ContentData;
   onContentChange: (data: Partial<ContentData>) => void;
   onContinue: () => void;
   onSkip: () => void;
   propertyTitle: string;
 }
 
 const ContentUploadStep = ({
   contentData,
   onContentChange,
   onContinue,
   onSkip,
   propertyTitle
 }: ContentUploadStepProps) => {
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [dragActive, setDragActive] = useState(false);
   const [preview, setPreview] = useState<string | null>(null);
 
   const handleFileSelect = (file: File) => {
     if (file) {
       onContentChange({ file });
       const url = URL.createObjectURL(file);
       setPreview(url);
     }
   };
 
   const handleDrop = (e: React.DragEvent) => {
     e.preventDefault();
     setDragActive(false);
     if (e.dataTransfer.files?.[0]) {
       handleFileSelect(e.dataTransfer.files[0]);
     }
   };
 
   const handleDragOver = (e: React.DragEvent) => {
     e.preventDefault();
     setDragActive(true);
   };
 
   const handleDragLeave = () => {
     setDragActive(false);
   };
 
   const handleRemoveFile = () => {
     onContentChange({ file: null });
     setPreview(null);
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   const isVideo = contentData.file?.type?.startsWith('video');
 
   return (
     <div className="space-y-6">
       <div className="text-center mb-4">
         <h3 className="text-lg font-semibold">Upload Your Content</h3>
         <p className="text-sm text-muted-foreground">
           Share the content you created for <span className="font-medium">{propertyTitle}</span>
         </p>
       </div>
 
       {/* File Upload Area */}
       <Card 
         className={`border-2 border-dashed transition-colors cursor-pointer ${
           dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
         }`}
         onClick={() => fileInputRef.current?.click()}
         onDrop={handleDrop}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
       >
         <CardContent className="p-8">
           {preview ? (
             <div className="relative">
               {isVideo ? (
                 <video 
                   src={preview} 
                   className="w-full max-h-64 object-contain rounded-lg"
                   controls
                 />
               ) : (
                 <img 
                   src={preview} 
                   alt="Preview" 
                   className="w-full max-h-64 object-contain rounded-lg"
                 />
               )}
               <Button
                 size="icon"
                 variant="destructive"
                 className="absolute top-2 right-2"
                 onClick={(e) => {
                   e.stopPropagation();
                   handleRemoveFile();
                 }}
               >
                 <X className="w-4 h-4" />
               </Button>
               <p className="text-center mt-2 text-sm text-muted-foreground">
                 {contentData.file?.name}
               </p>
             </div>
           ) : (
             <div className="text-center">
               <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
               <p className="font-medium mb-1">Drop your file here or click to browse</p>
               <p className="text-sm text-muted-foreground">
                 Supports images and videos
               </p>
               <div className="flex justify-center gap-4 mt-4">
                 <div className="flex items-center gap-1 text-sm text-muted-foreground">
                   <Image className="w-4 h-4" /> Images
                 </div>
                 <div className="flex items-center gap-1 text-sm text-muted-foreground">
                   <Video className="w-4 h-4" /> Videos
                 </div>
               </div>
             </div>
           )}
         </CardContent>
       </Card>
 
       <input
         ref={fileInputRef}
         type="file"
         accept="image/*,video/*"
         className="hidden"
         onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
       />
 
       {/* Content Details */}
       <div className="space-y-4">
         <div>
           <label className="block text-sm font-medium mb-1">Caption</label>
           <Textarea
             placeholder="Describe your content..."
             value={contentData.caption}
             onChange={(e) => onContentChange({ caption: e.target.value })}
             rows={3}
           />
         </div>
 
         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-1">Hashtags</label>
             <Input
               placeholder="#travel, #luxury, #hotel"
               value={contentData.hashtags}
               onChange={(e) => onContentChange({ hashtags: e.target.value })}
             />
           </div>
           <div>
             <label className="block text-sm font-medium mb-1">Mentions</label>
             <Input
               placeholder="@hotel, @brand"
               value={contentData.mentions}
               onChange={(e) => onContentChange({ mentions: e.target.value })}
             />
           </div>
         </div>
       </div>
 
       {/* Action Buttons */}
       <div className="flex gap-3 pt-4">
         <Button
           variant="outline"
           onClick={onSkip}
           className="flex-1"
         >
           <SkipForward className="w-4 h-4 mr-2" />
           Skip for Now
         </Button>
         <Button
           onClick={onContinue}
           className="flex-1"
         >
           Continue
           <ArrowRight className="w-4 h-4 ml-2" />
         </Button>
       </div>
     </div>
   );
 };
 
 export default ContentUploadStep;