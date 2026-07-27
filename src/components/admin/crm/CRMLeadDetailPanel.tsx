import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRMNotes } from "@/hooks/useCRMNotes";
import { LIFECYCLE_STAGES } from "@/hooks/useCRMPipeline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pin, Trash2, UserPlus, Mail, Phone, Building2 } from "lucide-react";
import { format } from "date-fns";

interface Props {
  leadId: string;
  open: boolean;
  onClose: () => void;
}

export const CRMLeadDetailPanel = ({ leadId, open, onClose }: Props) => {
  const [noteContent, setNoteContent] = useState("");
  const queryClient = useQueryClient();

  const leadQuery = useQuery({
    queryKey: ["crm-lead-detail", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_leads")
        .select("*")
        .eq("id", leadId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
  });

  const { notes, addNote, togglePin, deleteNote } = useCRMNotes(undefined, leadId);
  const lead = leadQuery.data;

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addNote.mutate({ content: noteContent });
    setNoteContent("");
  };

  const handleStageChange = async (stage: string) => {
    await supabase.from("crm_leads").update({ lifecycle_stage: stage }).eq("id", leadId);
    leadQuery.refetch();
    queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {lead?.first_name || ""} {lead?.last_name || ""}
            <Badge variant="outline" className="border-dashed ml-1">Lead</Badge>
          </SheetTitle>
        </SheetHeader>

        {lead && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{lead.lead_type}</Badge>
              <Select value={lead.lifecycle_stage || "lead"} onValueChange={handleStageChange}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFECYCLE_STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {lead.source && <Badge variant="secondary" className="text-xs">{lead.source}</Badge>}
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              {lead.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{lead.company}</span>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="p-3 rounded-md bg-muted/50 text-sm">
                <p className="text-xs font-medium mb-1 text-muted-foreground">Initial Notes</p>
                <p className="whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Added</div>
              <div>{lead.created_at ? format(new Date(lead.created_at), "MMM d, yyyy") : "—"}</div>
            </div>
          </div>
        )}

        <Tabs defaultValue="notes" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="notes" className="flex-1">
              Notes {notes.length > 0 && `(${notes.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-3 space-y-3">
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="min-h-[60px]"
              />
              <Button size="sm" onClick={handleAddNote} disabled={!noteContent.trim()}>Add</Button>
            </div>
            {notes.map((note: any) => (
              <div key={note.id} className="p-3 rounded-md border bg-card">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => togglePin.mutate({ noteId: note.id, isPinned: !note.is_pinned })}
                    >
                      <Pin className={`h-3 w-3 ${note.is_pinned ? "text-primary" : "text-muted-foreground"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteNote.mutate(note.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {note.author?.first_name} {note.author?.last_name} · {format(new Date(note.created_at), "MMM d, HH:mm")}
                </p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
