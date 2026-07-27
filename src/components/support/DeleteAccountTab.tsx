import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DeleteAccountTab = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDeleteRequest = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to request account deletion",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: 'Account Deletion Request',
          description: 'User has requested to delete their account via the Help & Support panel.',
          priority: 'high',
          status: 'open',
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Request submitted",
        description: "Your account deletion request has been received.",
      });
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      toast({
        title: "Error",
        description: "Failed to submit deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h3 className="text-xl font-semibold">Request Submitted</h3>
        <p className="text-muted-foreground max-w-md">
          Your account deletion request has been received. Your account will be deleted within 7–10 business days. You will receive an email confirmation once your account has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive text-lg">
            <AlertTriangle className="w-5 h-5" />
            Delete Your Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We're sorry to see you go. Before you proceed, please review what happens when your account is deleted:
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
          <div className="mt-0.5 rounded-full bg-primary/10 p-2">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Processing Time</h4>
            <p className="text-sm text-muted-foreground">
              Account deletion takes 7–10 business days to complete after your request is submitted.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
          <div className="mt-0.5 rounded-full bg-primary/10 p-2">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Email Confirmation</h4>
            <p className="text-sm text-muted-foreground">
              You will receive an email once your account has been successfully deleted.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
          <div className="mt-0.5 rounded-full bg-primary/10 p-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm">What Gets Deleted</h4>
            <p className="text-sm text-muted-foreground">
              All your personal data, profile information, collaborations, messages, and associated content will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full" disabled={loading}>
            Request Account Deletion
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will submit a request to permanently delete your account. Your account will be deleted within 7–10 business days and you will receive an email confirmation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAccountTab;
