import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Save, Trash2, Zap, FolderOpen, Plus } from "lucide-react";
import { useSavedSegments, SMART_SEGMENTS } from "@/hooks/useSavedSegments";
import { SegmentFilters, useSegmentRecipientCount } from "./SegmentBuilder";

interface SavedSegmentsManagerProps {
  currentFilters: SegmentFilters;
  onLoadSegment: (filters: SegmentFilters) => void;
}

const SmartSegmentCard = ({ segment, onLoad }: { segment: typeof SMART_SEGMENTS[0]; onLoad: () => void }) => {
  const { count, isLoading } = useSegmentRecipientCount(segment.filter_json);
  
  return (
    <div
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onLoad}
    >
      <div className="flex items-center gap-3">
        <Zap className="h-4 w-4 text-amber-500" />
        <div>
          <p className="font-medium text-sm">{segment.name}</p>
          <p className="text-xs text-muted-foreground">{segment.description}</p>
        </div>
      </div>
      <Badge variant="secondary" className="text-xs">
        {isLoading ? "..." : `${count ?? 0} users`}
      </Badge>
    </div>
  );
};

export const SavedSegmentsManager = ({ currentFilters, onLoadSegment }: SavedSegmentsManagerProps) => {
  const { segments, isLoading, saveSegment, deleteSegment } = useSavedSegments();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    saveSegment.mutate(
      { name, description, filters: currentFilters },
      {
        onSuccess: () => {
          setIsSaving(false);
          setName("");
          setDescription("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Save Current Segment */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Current Segment
            </CardTitle>
            <Dialog open={isSaving} onOpenChange={setIsSaving}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Save As
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Segment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="e.g., Active Creators" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea placeholder="Describe this segment..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsSaving(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name.trim() || saveSegment.isPending}>
                      {saveSegment.isPending ? "Saving..." : "Save Segment"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Smart Segments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Smart Segments
          </CardTitle>
          <CardDescription>Pre-built segments that update automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {SMART_SEGMENTS.map((seg, idx) => (
            <SmartSegmentCard key={idx} segment={seg} onLoad={() => onLoadSegment(seg.filter_json)} />
          ))}
        </CardContent>
      </Card>

      {/* Saved Segments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            My Segments
          </CardTitle>
          <CardDescription>Your custom saved segments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : segments && segments.length > 0 ? (
            <div className="space-y-2">
              {segments.map((seg) => (
                <div key={seg.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 cursor-pointer" onClick={() => onLoadSegment(seg.filter_json)}>
                    <p className="font-medium text-sm">{seg.name}</p>
                    {seg.description && <p className="text-xs text-muted-foreground">{seg.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSegment.mutate(seg.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No saved segments yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
