import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye as EyeIcon, Link2, Eye, EyeOff, Trash2, Loader2, Pencil } from 'lucide-react';
import { MediaKit } from '@/hooks/useMediaKit';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface MediaKitCardProps {
  mediaKit: MediaKit;
  onDownload: (id: string) => void;
  onEdit: (id: string) => void;
  onTogglePublic: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyLink: (id: string) => void;
  isTogglingPublic?: boolean;
  isDeleting?: boolean;
}

export const MediaKitCard = ({
  mediaKit,
  onDownload,
  onEdit,
  onTogglePublic,
  onDelete,
  onCopyLink,
  isTogglingPublic = false,
  isDeleting = false,
}: MediaKitCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(mediaKit.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{mediaKit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(mediaKit.created_at), 'MMM d, yyyy')}
              </p>
            </div>
            <Badge variant={mediaKit.is_public ? 'default' : 'secondary'}>
              {mediaKit.is_public ? 'Public' : 'Private'}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Generated:</span>
              <span className="font-medium">
                {format(new Date(mediaKit.last_generated_at), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">Ready to Share</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => onEdit(mediaKit.id)}
            className="flex-1"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(mediaKit.id)}
            className="flex-1"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            View
          </Button>

          {mediaKit.is_public && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyLink(mediaKit.id)}
              className="flex-1"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onTogglePublic(mediaKit.id)}
            disabled={isTogglingPublic}
          >
            {isTogglingPublic ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mediaKit.is_public ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 text-destructive" />
            )}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media Kit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{mediaKit.title}" and remove the PDF file from storage.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
