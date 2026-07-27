import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';
import { useMediaKit } from '@/hooks/useMediaKit';
import { MediaKitCard } from './MediaKitCard';
import { MediaKitEditor } from './media-kit/MediaKitEditor';
import type { MediaKitDoc } from './media-kit/types';
import { PdfViewerModal } from './PdfViewerModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { FeatureGate } from '@/components/subscription/FeatureGate';

interface MediaKitGeneratorProps {
  userId: string;
  defaultTitle?: string;
  defaultBio?: string;
  defaultAvatarUrl?: string;
}

export const MediaKitGenerator = ({ userId, defaultTitle, defaultBio, defaultAvatarUrl }: MediaKitGeneratorProps) => {
  return (
    <FeatureGate feature="mediaKit">
      <MediaKitGeneratorInner
        userId={userId}
        defaultTitle={defaultTitle}
        defaultBio={defaultBio}
        defaultAvatarUrl={defaultAvatarUrl}
      />
    </FeatureGate>
  );
};

const MediaKitGeneratorInner = ({ userId, defaultTitle, defaultBio, defaultAvatarUrl }: MediaKitGeneratorProps) => {
  const [editorState, setEditorState] = useState<
    | { open: false }
    | { open: true; existingId?: string; initialDoc?: MediaKitDoc }
  >({ open: false });
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');
  const { toast } = useToast();

  const {
    mediaKits,
    isLoading,
    isGenerating,
    togglePublic,
    deleteMediaKit,
  } = useMediaKit(userId);

  const handleDownload = (id: string) => {
    const kit = mediaKits.find((k) => k.id === id);
    if (kit?.pdf_url) {
      setViewingPdfUrl(kit.pdf_url);
      setViewingPdfTitle(kit.title);
    }
  };

  const handleEdit = (id: string) => {
    const kit = mediaKits.find((k) => k.id === id);
    setEditorState({
      open: true,
      existingId: id,
      initialDoc: (kit?.builder_config as MediaKitDoc) || undefined,
    });
  };

  const handleCopyLink = (id: string) => {
    const kit = mediaKits.find((k) => k.id === id);
    if (kit?.pdf_url) {
      navigator.clipboard.writeText(kit.pdf_url);
      toast({
        title: 'Link Copied',
        description: 'Media kit link copied to clipboard.',
      });
    }
  };

  const handleTogglePublic = async (id: string) => {
    setTogglingId(id);
    await togglePublic(id);
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteMediaKit(id);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (editorState.open) {
    return (
      <MediaKitEditor
        userId={userId}
        existingId={editorState.existingId}
        initialDoc={editorState.initialDoc}
        onBack={() => setEditorState({ open: false })}
        defaultName={defaultTitle}
        defaultBio={defaultBio}
        defaultAvatarUrl={defaultAvatarUrl}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Media Kit Generator</h2>
          <p className="text-muted-foreground">
            Create professional media kits to showcase your value to brands
          </p>
        </div>
        <Button onClick={() => setEditorState({ open: true })} disabled={isGenerating}>
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      {mediaKits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Media Kits Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first professional media kit to showcase your statistics,
              portfolio, and collaboration history to potential brand partners.
            </p>
            <Button onClick={() => setEditorState({ open: true })}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Media Kit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {mediaKits.map((mediaKit) => (
            <MediaKitCard
              key={mediaKit.id}
              mediaKit={mediaKit}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onTogglePublic={handleTogglePublic}
              onDelete={handleDelete}
              onCopyLink={handleCopyLink}
              isTogglingPublic={togglingId === mediaKit.id}
              isDeleting={deletingId === mediaKit.id}
            />
          ))}
        </div>
      )}

      <PdfViewerModal
        open={!!viewingPdfUrl}
        onClose={() => setViewingPdfUrl(null)}
        pdfUrl={viewingPdfUrl || ''}
        title={viewingPdfTitle}
      />
    </div>
  );
};
