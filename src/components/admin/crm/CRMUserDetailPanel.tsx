import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRMNotes } from "@/hooks/useCRMNotes";
import { useCRMTags, useCRMUserTags } from "@/hooks/useCRMTags";
import { LIFECYCLE_STAGES, type LifecycleStage } from "@/hooks/useCRMPipeline";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pin, Trash2, Plus, X, Calendar, User, ClipboardList } from "lucide-react";
import { format } from "date-fns";

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export const CRMUserDetailPanel = ({ userId, open, onClose }: Props) => {
  const [noteContent, setNoteContent] = useState("");

  const profileQuery = useQuery({
    queryKey: ["crm-user-detail", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const activityQuery = useQuery({
    queryKey: ["crm-user-activity", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_activity_timeline")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { notes, addNote, togglePin, deleteNote } = useCRMNotes(userId);
  const { tags } = useCRMTags();
  const { userTags, assignTag, removeTag } = useCRMUserTags(userId);

  const profile = profileQuery.data;
  const assignedTagIds = userTags.map((ut: any) => ut.tag_id);

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    addNote.mutate({ content: noteContent });
    setNoteContent("");
  };

  const handleStageChange = async (stage: string) => {
    await supabase.from("profiles").update({ lifecycle_stage: stage } as any).eq("id", userId);
    profileQuery.refetch();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {profile?.first_name || ""} {profile?.last_name || ""}
          </SheetTitle>
        </SheetHeader>

        {profile && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {profile.user_type && <Badge variant="outline">{profile.user_type}</Badge>}
              <Select value={(profile as any).lifecycle_stage || "signed_up"} onValueChange={handleStageChange}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFECYCLE_STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Engagement Score</div>
              <div>{profile.engagement_score ?? "—"}</div>
              <div className="text-muted-foreground">Joined</div>
              <div>{profile.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "—"}</div>
              <div className="text-muted-foreground">Last Login</div>
              <div>{profile.last_login_at ? format(new Date(profile.last_login_at), "MMM d, yyyy HH:mm") : "—"}</div>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            <TabsTrigger value="notes" className="flex-1">
              Notes {notes.length > 0 && <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[9px]">{notes.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex-1">Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3 space-y-4">
            <div className="p-4 rounded-lg border bg-card space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Quick Info
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">User Type</div>
                <div>{profile?.user_type || "—"}</div>
                <div className="text-muted-foreground">Stage</div>
                <div>{LIFECYCLE_STAGES.find(s => s.id === (profile as any)?.lifecycle_stage)?.label || "Signed Up"}</div>
                <div className="text-muted-foreground">Login Count</div>
                <div>{(profile as any)?.login_count ?? "—"}</div>
                <div className="text-muted-foreground">Engagement</div>
                <div>{profile?.engagement_score ?? "—"}</div>
              </div>
            </div>
            {notes.filter((n: any) => n.is_pinned).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Pin className="h-4 w-4" /> Pinned Notes
                </h4>
                {notes.filter((n: any) => n.is_pinned).map((note: any) => (
                  <div key={note.id} className="p-2 rounded-md border bg-muted/30 text-sm">
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {note.author?.first_name} · {format(new Date(note.created_at), "MMM d")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-3 space-y-2">
            {activityQuery.data?.map((event: any) => (
              <div key={event.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                <Calendar className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{event.activity_description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.created_at), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            ))}
            {(!activityQuery.data || activityQuery.data.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No activity recorded</p>
            )}
          </TabsContent>

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

          <TabsContent value="tags" className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {userTags.map((ut: any) => (
                <Badge key={ut.id} style={{ backgroundColor: ut.tag?.color }} className="text-white gap-1">
                  {ut.tag?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag.mutate(ut.tag_id)} />
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.filter((t: any) => !assignedTagIds.includes(t.id)).map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => assignTag.mutate(tag.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
