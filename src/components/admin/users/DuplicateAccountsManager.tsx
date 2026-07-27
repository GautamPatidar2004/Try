import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, Merge } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Skeleton } from "@/components/ui/skeleton";
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

interface DuplicateGroup {
  id: string;
  user_ids: string[];
  similarity_score: number;
  matching_fields: any;
  status: string;
}

export const DuplicateAccountsManager = () => {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const { toast } = useToast();
  const { detectDuplicates, mergeAccounts, isLoading } = useUserManagement();

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("duplicate_account_groups")
        .select("*")
        .eq("status", "pending")
        .order("similarity_score", { ascending: false });

      if (error) throw error;
      setDuplicates((data || []).map(d => ({
        ...d,
        matching_fields: Array.isArray(d.matching_fields) ? d.matching_fields : []
      })));
    } catch (error) {
      console.error("Error fetching duplicates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleDetect = async () => {
    try {
      await detectDuplicates();
      await fetchDuplicates();
    } catch (error) {
      console.error("Error detecting duplicates:", error);
    }
  };

  const handleMerge = async () => {
    if (!selectedGroup || selectedGroup.user_ids.length < 2) return;

    try {
      const [primaryId, ...secondaryIds] = selectedGroup.user_ids;
      await mergeAccounts(primaryId, secondaryIds);

      // Mark as merged
      await supabase
        .from("duplicate_account_groups")
        .update({ status: "merged" })
        .eq("id", selectedGroup.id);

      toast({
        title: "Success",
        description: "Accounts merged successfully",
      });

      setShowMergeDialog(false);
      setSelectedGroup(null);
      await fetchDuplicates();
    } catch (error) {
      console.error("Error merging accounts:", error);
    }
  };

  const dismissGroup = async (groupId: string) => {
    try {
      await supabase
        .from("duplicate_account_groups")
        .update({ status: "dismissed" })
        .eq("id", groupId);

      toast({
        title: "Success",
        description: "Duplicate group dismissed",
      });

      await fetchDuplicates();
    } catch (error) {
      console.error("Error dismissing group:", error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <CardTitle>Duplicate Accounts</CardTitle>
              {duplicates.length > 0 && (
                <Badge variant="destructive">{duplicates.length}</Badge>
              )}
            </div>
            <Button
              onClick={handleDetect}
              disabled={isLoading || loading}
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Detect Duplicates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : duplicates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No duplicate accounts detected
            </div>
          ) : (
            <div className="space-y-3">
              {duplicates.map((group) => (
                <div
                  key={group.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="bg-orange-500/10 text-orange-500"
                        >
                          {group.similarity_score}% match
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {group.user_ids.length} accounts
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {group.matching_fields.map((field: string, index: number) => (
                          <Badge key={`${field}-${index}`} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        User IDs: {group.user_ids.join(", ")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowMergeDialog(true);
                        }}
                      >
                        <Merge className="w-4 h-4 mr-2" />
                        Merge
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissGroup(group.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Duplicate Accounts?</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge {selectedGroup?.user_ids.length} accounts into one.
              The first account will be kept as the primary account, and data from
              other accounts will be transferred to it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMerge}>
              Merge Accounts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
