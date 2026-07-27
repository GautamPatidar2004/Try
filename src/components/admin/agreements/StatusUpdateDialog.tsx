import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  oldStatus: string;
  newStatus: string;
  agreementDetails: {
    hostName: string;
    influencerName: string;
  };
}

export const StatusUpdateDialog = ({
  open,
  onOpenChange,
  onConfirm,
  oldStatus,
  newStatus,
  agreementDetails,
}: StatusUpdateDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Collaboration Status?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You're about to change the status of the collaboration between{" "}
              <span className="font-medium">{agreementDetails.hostName}</span> and{" "}
              <span className="font-medium">{agreementDetails.influencerName}</span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <span className="capitalize font-medium">{oldStatus}</span>
              <span>→</span>
              <span className="capitalize font-medium text-primary">{newStatus}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This action will notify both parties about the status change.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm Update
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
