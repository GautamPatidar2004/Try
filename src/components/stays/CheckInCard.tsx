import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { StayCheckIn, useStayCheckIn } from "@/hooks/useStayDetail";

interface Props {
  agreementId: string;
  creatorId?: string;
  checkIn: StayCheckIn | null;
}

export const CheckInCard = ({ agreementId, creatorId, checkIn }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState(false);
  const mutation = useStayCheckIn(agreementId, creatorId);

  const handleFile = (f: File) => {
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  };

  if (checkIn?.checked_in_at && !editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Checked in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {format(new Date(checkIn.checked_in_at), "PPP 'at' p")}
          </p>
          {checkIn.check_in_photo_url && (
            <img
              src={checkIn.check_in_photo_url}
              alt="Check-in"
              className="rounded-lg max-h-64 object-cover w-full"
            />
          )}
          {checkIn.check_in_notes && (
            <p className="text-sm whitespace-pre-wrap">{checkIn.check_in_notes}</p>
          )}
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit check-in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Check in to your stay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Snap a quick arrival photo and add a note. Checking in unlocks your daily content slots.
        </p>

        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="rounded-lg max-h-56 mx-auto" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhoto(null);
                  setPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm">Tap to add an arrival photo (optional)</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <Textarea
          placeholder="First impressions, room number, anything the host should know..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="flex gap-2">
          {editing && (
            <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={() =>
              mutation.mutate(
                { notes, photo },
                { onSuccess: () => setEditing(false) }
              )
            }
            disabled={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? "Checking in..." : "Check in now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};