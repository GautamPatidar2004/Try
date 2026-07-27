import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
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
import { useState } from 'react';

interface ConversationItemProps {
  conversation: {
    id: string;
    title: string;
    updated_at: string;
  };
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const ConversationItem = ({ conversation, isActive, onClick, onDelete }: ConversationItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        onClick={onClick}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
          transition-all duration-200
          ${isActive 
            ? 'bg-primary/10 text-primary border border-primary/20' 
            : 'hover:bg-muted/50 text-foreground'
          }
        `}
      >
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
            {conversation.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 h-7 w-7 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{conversation.title}" and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConversationItem;
