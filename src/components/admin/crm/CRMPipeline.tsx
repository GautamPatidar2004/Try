import { useState, useCallback } from "react";
import { useCRMPipeline, LIFECYCLE_STAGES, type LifecycleStage, type PipelineUser } from "@/hooks/useCRMPipeline";
import { useCRMLeads } from "@/hooks/useCRMLeads";
import { useCRMNotes } from "@/hooks/useCRMNotes";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, ArrowRight, GripVertical, Plus, StickyNote, UserPlus, AlertCircle, RefreshCw } from "lucide-react";
import { CRMUserDetailPanel } from "./CRMUserDetailPanel";
import { CRMLeadDetailPanel } from "./CRMLeadDetailPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const QuickNotePopover = ({ userId, isLead }: { userId: string; isLead: boolean }) => {
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const { notes, addNote } = useCRMNotes(isLead ? undefined : userId, isLead ? userId : undefined);

  const handleAdd = () => {
    if (!content.trim()) return;
    addNote.mutate({ content });
    setContent("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-0.5 rounded hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
          {notes.length > 0 && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary text-[8px] text-primary-foreground flex items-center justify-center">
              {notes.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <p className="text-xs font-medium">Quick Note</p>
          <Textarea
            placeholder="Add a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60px] text-xs"
          />
          <Button size="sm" className="w-full" onClick={handleAdd} disabled={!content.trim()}>
            Add Note
          </Button>
          {notes.length > 0 && (
            <div className="border-t pt-2 mt-2 max-h-32 overflow-y-auto space-y-1">
              {notes.slice(0, 3).map((note: any) => (
                <p key={note.id} className="text-[10px] text-muted-foreground line-clamp-2">{note.content}</p>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const CRMPipeline = () => {
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [draggedUser, setDraggedUser] = useState<{ user: PipelineUser; fromStage: LifecycleStage } | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({ first_name: "", last_name: "", email: "", company: "", lead_type: "brand", source: "", notes: "" });

  const { data: pipeline, isLoading, isError, error, refetch, updateStage } = useCRMPipeline({ search, userType });
  const { createLead } = useCRMLeads();

  const handleDragStart = useCallback((user: PipelineUser, stage: LifecycleStage) => {
    setDraggedUser({ user, fromStage: stage });
  }, []);

  const handleDrop = useCallback((targetStage: LifecycleStage) => {
    if (draggedUser && draggedUser.fromStage !== targetStage) {
      updateStage({ userId: draggedUser.user.id, stage: targetStage, isLead: draggedUser.user.is_lead });
    }
    setDraggedUser(null);
  }, [draggedUser, updateStage]);

  const handleAddLead = () => {
    if (!newLead.first_name.trim() && !newLead.company.trim()) return;
    createLead.mutate({
      first_name: newLead.first_name || undefined,
      last_name: newLead.last_name || undefined,
      email: newLead.email || undefined,
      company: newLead.company || undefined,
      lead_type: newLead.lead_type,
      source: newLead.source || undefined,
      notes: newLead.notes || undefined,
    });
    setNewLead({ first_name: "", last_name: "", email: "", company: "", lead_type: "brand", source: "", notes: "" });
    setAddLeadOpen(false);
  };

  const handleCardClick = (user: PipelineUser) => {
    if (user.is_lead) {
      setSelectedLeadId(user.id);
    } else {
      setSelectedUserId(user.id);
    }
  };

  const getConversionRate = (fromStage: LifecycleStage, toStage: LifecycleStage) => {
    if (!pipeline) return null;
    const from = pipeline[fromStage]?.length || 0;
    const to = pipeline[toStage]?.length || 0;
    if (from === 0) return "0%";
    return `${Math.round((to / from) * 100)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex gap-3">
          {LIFECYCLE_STAGES.map((stage) => (
            <div key={stage.id} className="min-w-[240px] w-[240px] bg-muted/30 rounded-lg p-3 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">Failed to load pipeline data</p>
        <p className="text-xs text-muted-foreground">{(error as any)?.message || "Unknown error"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CRM Pipeline</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="User Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="influencer">Creator</SelectItem>
              <SelectItem value="brand">Brand</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-1" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="First Name" value={newLead.first_name} onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })} />
                  <Input placeholder="Last Name" value={newLead.last_name} onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })} />
                </div>
                <Input placeholder="Email" type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
                <Input placeholder="Company" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={newLead.lead_type} onValueChange={(v) => setNewLead({ ...newLead, lead_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newLead.source} onValueChange={(v) => setNewLead({ ...newLead, source: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Initial notes..." value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} />
                <Button onClick={handleAddLead} className="w-full" disabled={!newLead.first_name.trim() && !newLead.company.trim()}>
                  Add Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const users = pipeline?.[stage.id] || [];
          const nextStage = LIFECYCLE_STAGES[idx + 1];

          return (
            <div key={stage.id} className="flex items-start gap-1">
              <div
                className="min-w-[240px] w-[240px] flex flex-col bg-muted/30 rounded-lg"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{stage.label}</span>
                    <Badge variant="secondary" className="text-xs">{users.length}</Badge>
                  </div>
                </div>

                <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto flex-1">
                  {users.map((user) => (
                    <Card
                      key={user.id}
                      draggable
                      onDragStart={() => handleDragStart(user, stage.id)}
                      onClick={() => handleCardClick(user)}
                      className={cn(
                        "p-3 cursor-pointer hover:shadow-md transition-shadow",
                        draggedUser?.user.id === user.id && "opacity-50",
                        user.is_lead && "border-dashed border-2"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.first_name || ""} {user.last_name || ""}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {user.is_lead && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-dashed">
                                Lead
                              </Badge>
                            )}
                            {user.user_type && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {user.user_type}
                              </Badge>
                            )}
                            {user.engagement_score != null && (
                              <span className="text-[10px] text-muted-foreground">
                                Score: {user.engagement_score}
                              </span>
                            )}
                          </div>
                        </div>
                        <QuickNotePopover userId={user.id} isLead={!!user.is_lead} />
                      </div>
                    </Card>
                  ))}
                  {users.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No users</p>
                  )}
                </div>
              </div>

              {nextStage && (
                <div className="flex flex-col items-center justify-center pt-16 px-1">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {getConversionRate(stage.id, nextStage.id)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedUserId && (
        <CRMUserDetailPanel
          userId={selectedUserId}
          open={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {selectedLeadId && (
        <CRMLeadDetailPanel
          leadId={selectedLeadId}
          open={!!selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
};
