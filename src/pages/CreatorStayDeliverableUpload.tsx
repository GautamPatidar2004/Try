import { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Upload, X, Image as ImageIcon, Video } from "lucide-react";
import { StayStatusPill } from "@/components/stays/StayStatusPill";
import {
  useStayDeliverable,
  useUploadStayDeliverable,
} from "@/hooks/useStayDeliverableUpload";

const CreatorStayDeliverableUpload = () => {
  const { agreementId, dayNumber } = useParams<{
    agreementId: string;
    dayNumber: string;
  }>();
  const dayNum = Number(dayNumber);
  const navigate = useNavigate();

  const { data, isLoading } = useStayDeliverable(agreementId, dayNum);
  const upload = useUploadStayDeliverable(agreementId!, dayNum);

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mentions, setMentions] = useState("");

  useEffect(() => {
    if (data?.post) {
      setCaption(data.post.caption || "");
      setHashtags((data.post.hashtags || []).map((h: string) => `#${h}`).join(" "));
      setMentions((data.post.mentions || []).map((m: string) => `@${m}`).join(" "));
    }
  }, [data?.post]);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    if (!file) return;
    upload.mutate(
      { file, caption, hashtags, mentions },
      { onSuccess: () => navigate(`/creator/stays/${agreementId}`) },
    );
  };

  if (isLoading || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </>
    );
  }

  if (!data.deliverable) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Card>
            <CardContent className="py-8 text-center">
              <p>Deliverable not found.</p>
              <Button asChild className="mt-4">
                <Link to={`/creator/stays/${agreementId}`}>Back to stay</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const propertyTitle =
    (data.agreement as any)?.application?.property?.title || "your stay";
  const existingMedia = data.post?.media_url;
  const existingType = data.post?.media_type;

  return (
    <>
      <SEO title={`Day ${dayNum} deliverable`} noIndex />
      <Navigation />
      <div className="min-h-screen bg-muted/30 pt-20 pb-12">
        <div className="container max-w-2xl px-4 space-y-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to={`/creator/stays/${agreementId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to stay
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xl">
                  Day {dayNum} · {data.deliverable.deliverable_type}
                </CardTitle>
                <StayStatusPill status={data.deliverable.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload content for {propertyTitle}. The host will review and approve.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {data.deliverable.host_feedback && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                  <p className="font-medium mb-1">Host feedback</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {data.deliverable.host_feedback}
                  </p>
                </div>
              )}

              {existingMedia && !preview && (
                <div className="rounded-lg overflow-hidden border bg-card">
                  {existingType === "video" ? (
                    <video src={existingMedia} controls className="w-full max-h-72" />
                  ) : (
                    <img src={existingMedia} alt="Submitted" className="w-full max-h-72 object-cover" />
                  )}
                  <div className="p-2 text-xs text-muted-foreground">
                    Currently submitted. Upload a new file to replace.
                  </div>
                </div>
              )}

              <div
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <div className="relative">
                    {file?.type.startsWith("video") ? (
                      <video src={preview} controls className="rounded-lg max-h-64 mx-auto" />
                    ) : (
                      <img src={preview} alt="Preview" className="rounded-lg max-h-64 mx-auto" />
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">{file?.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm">Tap to add your content</p>
                    <p className="text-xs text-muted-foreground">Image or video</p>
                    <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" /> Images
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" /> Videos
                      </span>
                    </div>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              <div>
                <label className="block text-sm font-medium mb-1">Caption</label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  placeholder="Tell the story..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Hashtags</label>
                  <Input
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#travel #boutiquehotel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mentions</label>
                  <Input
                    value={mentions}
                    onChange={(e) => setMentions(e.target.value)}
                    placeholder="@hostname"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to={`/creator/stays/${agreementId}`}>Cancel</Link>
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!file || upload.isPending}
                  className="flex-1"
                >
                  {upload.isPending
                    ? "Submitting..."
                    : existingMedia
                      ? "Resubmit"
                      : "Submit for review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreatorStayDeliverableUpload;