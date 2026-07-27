import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAdminBrands } from "@/hooks/useAdminBrands";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BrandDocumentsProps {
  brandId: string;
}

export const BrandDocuments = ({ brandId }: BrandDocumentsProps) => {
  const { getBrandDocuments, updateDocument } = useAdminBrands();
  const { toast } = useToast();

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["brand-documents", brandId],
    queryFn: () => getBrandDocuments(brandId),
  });

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (docId: string, status: string, reason?: string) => {
    updateDocument.mutate(
      { 
        id: docId, 
        updates: { 
          status,
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id 
        } 
      },
      { onSuccess: () => refetch() }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading documents...</div>;
  }

  if (!documents || documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No documents uploaded yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{doc.file_name}</h4>
                  <Badge variant={getStatusVariant(doc.status)} className="flex items-center gap-1">
                    {getStatusIcon(doc.status)}
                    <span className="capitalize">{doc.status}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {doc.document_type.replace('_', ' ')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploaded {format(new Date(doc.uploaded_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
                {doc.rejection_reason && (
                  <p className="text-sm text-destructive mt-2">
                    Rejection reason: {doc.rejection_reason}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(doc.document_url, doc.file_name)}
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {doc.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleStatusUpdate(doc.id, "approved")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const reason = prompt("Rejection reason:");
                      if (reason) handleStatusUpdate(doc.id, "rejected", reason);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
