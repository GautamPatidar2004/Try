import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, UserCheck, UserX, Ban, Download } from "lucide-react";
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
import { useState } from "react";

interface BulkOperationsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkActivate: () => Promise<void>;
  onBulkDeactivate: () => Promise<void>;
  onBulkBan: (reason: string) => Promise<void>;
  onBulkExport: () => void;
}

export const BulkOperationsBar = ({
  selectedCount,
  onClearSelection,
  onBulkActivate,
  onBulkDeactivate,
  onBulkBan,
  onBulkExport,
}: BulkOperationsBarProps) => {
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try {
      await action();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBan = async () => {
    if (!banReason) return;
    await handleBulkAction(() => onBulkBan(banReason));
    setShowBanDialog(false);
    setBanReason("");
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-lg border-primary/20">
        <div className="flex items-center gap-4 p-4">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction(onBulkActivate)}
              disabled={isProcessing}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Activate
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction(onBulkDeactivate)}
              disabled={isProcessing}
            >
              <UserX className="w-4 h-4 mr-2" />
              Deactivate
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowBanDialog(true)}
              disabled={isProcessing}
            >
              <Ban className="w-4 h-4 mr-2" />
              Ban
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onBulkExport}
              disabled={isProcessing}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban {selectedCount} users?</AlertDialogTitle>
            <AlertDialogDescription>
              Please select a reason for banning these users. This action can be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Select value={banReason} onValueChange={setBanReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select ban reason..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spam">Spam or abusive behavior</SelectItem>
              <SelectItem value="fraud">Fraudulent activity</SelectItem>
              <SelectItem value="terms">Terms of service violation</SelectItem>
              <SelectItem value="security">Security concern</SelectItem>
              <SelectItem value="other">Other reason</SelectItem>
            </SelectContent>
          </Select>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={!banReason}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ban Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
