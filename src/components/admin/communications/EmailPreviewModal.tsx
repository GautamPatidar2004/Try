import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Smartphone, Send, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  content: string;
}

export const EmailPreviewModal = ({
  open,
  onOpenChange,
  subject,
  content,
}: EmailPreviewModalProps) => {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Replace variables with sample data for preview
  const previewContent = content
    .replace(/\{firstName\}/g, "John")
    .replace(/\{lastName\}/g, "Doe")
    .replace(/\{email\}/g, "john.doe@example.com")
    .replace(/\{userType\}/g, "Creator");

  const previewSubject = subject
    .replace(/\{firstName\}/g, "John")
    .replace(/\{lastName\}/g, "Doe");

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter a test email address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-broadcast-email", {
        body: {
          campaignId: "test-preview",
          subject: `[TEST] ${previewSubject}`,
          content: previewContent,
          targetSegment: {},
          testEmail: testEmail,
        },
      });

      if (error) throw error;

      toast({
        title: "Test email sent",
        description: `Preview sent to ${testEmail}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send test",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 { margin-top: 0; }
        a { color: #10b981; }
        blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 0;
          padding-left: 16px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      ${previewContent}
      <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666; text-align: center;">
        You're receiving this email because you're a member of HostFluencer.
        <br><a href="#" style="color: #666;">Unsubscribe</a>
      </p>
    </body>
    </html>
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Preview
          </DialogTitle>
          <DialogDescription>
            Preview how your email will appear to recipients
          </DialogDescription>
        </DialogHeader>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "desktop" | "mobile")} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <TabsList>
              <TabsTrigger value="desktop" className="gap-2">
                <Monitor className="h-4 w-4" />
                Desktop
              </TabsTrigger>
              <TabsTrigger value="mobile" className="gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Subject Preview */}
          <div className="border rounded-t-lg bg-muted/30 px-4 py-2">
            <div className="text-xs text-muted-foreground mb-1">Subject:</div>
            <div className="font-medium">{previewSubject}</div>
          </div>

          {/* Email Preview */}
          <div className="flex-1 overflow-hidden border border-t-0 rounded-b-lg">
            <TabsContent value="desktop" className="h-full m-0">
              <div className="h-full overflow-auto bg-white">
                <iframe
                  srcDoc={emailHtml}
                  className="w-full h-full min-h-[400px] border-0"
                  title="Email Preview"
                />
              </div>
            </TabsContent>

            <TabsContent value="mobile" className="h-full m-0 flex justify-center bg-muted/30 p-4">
              <div className="w-[375px] bg-white rounded-lg shadow-lg overflow-hidden border">
                <div className="bg-muted p-2 text-center text-xs text-muted-foreground border-b">
                  iPhone Preview
                </div>
                <iframe
                  srcDoc={emailHtml}
                  className="w-full h-[500px] border-0"
                  title="Mobile Email Preview"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-4 pt-4 border-t">
          <div className="flex-1 flex items-center gap-2">
            <Label htmlFor="test-email" className="whitespace-nowrap">Send test to:</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleSendTest}
              disabled={isSending || !testEmail.trim()}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
