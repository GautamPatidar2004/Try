import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Save, Download, Palette, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { MediaKitDoc, createDefaultDoc } from './types';
import { MediaKitPreview } from './MediaKitPreview';
import { SectionsPanel } from './SectionsPanel';
import { ThemePicker } from './ThemePicker';
import { exportMediaKitPdf } from '@/utils/exportMediaKitPdf';

interface Props {
  userId: string;
  existingId?: string;
  initialDoc?: MediaKitDoc;
  defaultName?: string;
  defaultBio?: string;
  defaultAvatarUrl?: string;
  onBack: () => void;
}

export const MediaKitEditor = ({
  userId,
  existingId,
  initialDoc,
  defaultName,
  defaultBio,
  defaultAvatarUrl,
  onBack,
}: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [doc, setDoc] = useState<MediaKitDoc>(
    initialDoc ||
      createDefaultDoc({
        name: defaultName,
        bio: defaultBio,
        profilePhotoUrl: defaultAvatarUrl,
      }),
  );
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [recordId, setRecordId] = useState<string | undefined>(existingId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<{ target: 'cover' | 'profile' | 'portfolio'; index?: number } | null>(null);

  // Auto-fetch profile defaults once
  useEffect(() => {
    if (initialDoc) return;
    (async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, profile_photo_url, bio, location')
        .eq('id', userId)
        .single();
      if (profile) {
        setDoc((d) => ({
          ...d,
          hero: {
            ...d.hero,
            name: d.hero.name === 'Your Name'
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || d.hero.name
              : d.hero.name,
            profilePhotoUrl: d.hero.profilePhotoUrl || profile.profile_photo_url || '',
            location: d.hero.location || profile.location || '',
          },
          about: {
            ...d.about,
            bio: d.about.bio === createDefaultDoc({}).about.bio ? profile.bio || d.about.bio : d.about.bio,
          },
        }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleUpload = (target: 'cover' | 'profile' | 'portfolio', index?: number) => {
    uploadTargetRef.current = { target, index };
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetRef.current) return;
    const { target } = uploadTargetRef.current;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${target}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media-kits').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      return;
    }
    const { data: pub } = supabase.storage.from('media-kits').getPublicUrl(path);
    const url = pub.publicUrl;
    if (target === 'cover') setDoc({ ...doc, hero: { ...doc.hero, coverPhotoUrl: url } });
    else if (target === 'profile') setDoc({ ...doc, hero: { ...doc.hero, profilePhotoUrl: url } });
    else setDoc({ ...doc, portfolio: [...doc.portfolio, url] });
    e.target.value = '';
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload: any = {
        influencer_id: userId,
        title: `${doc.hero.name || 'My'}'s Media Kit`,
        bio: doc.about.bio,
        builder_config: doc as any,
        last_generated_at: new Date().toISOString(),
      };
      if (recordId) {
        const { error } = await supabase.from('media_kits').update(payload).eq('id', recordId);
        if (error) throw error;
      } else {
        payload.pdf_url = '';
        const { data, error } = await supabase.from('media_kits').insert(payload).select().single();
        if (error) throw error;
        setRecordId(data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['mediaKits', userId] });
      toast({ title: 'Draft saved' });
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Wait for the hidden export clone to mount & paint
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const root =
        document.getElementById('media-kit-export-root') ||
        document.getElementById('media-kit-preview-root');
      if (!root) throw new Error('Preview not found');
      const blob = await exportMediaKitPdf(root);
      const fileName = `${doc.hero.name || 'media-kit'}-${Date.now()}.pdf`.replace(/\s+/g, '-');
      const path = `${userId}/${fileName}`;
      const { error: upErr } = await supabase.storage
        .from('media-kits')
        .upload(path, blob, { contentType: 'application/pdf', upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('media-kits').getPublicUrl(path);
      const pdf_url = pub.publicUrl;

      const payload: any = {
        influencer_id: userId,
        title: `${doc.hero.name || 'My'}'s Media Kit`,
        bio: doc.about.bio,
        builder_config: doc as any,
        pdf_url,
        last_generated_at: new Date().toISOString(),
      };
      if (recordId) {
        const { error } = await supabase.from('media_kits').update(payload).eq('id', recordId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('media_kits').insert(payload).select().single();
        if (error) throw error;
        setRecordId(data.id);
      }
      queryClient.invalidateQueries({ queryKey: ['mediaKits', userId] });
      // Trigger local download too
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      toast({ title: 'Media kit exported', description: 'PDF saved and downloaded.' });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] -mx-4 -my-4 md:-mx-6 md:-my-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold">Media Kit Editor</h2>
            <p className="text-xs text-muted-foreground">Click any text or image to edit</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
          <Button size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-72 border-r bg-card overflow-y-auto p-4">
          <Tabs defaultValue="sections">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="sections">
                <Layers className="h-3.5 w-3.5 mr-1" /> Sections
              </TabsTrigger>
              <TabsTrigger value="theme">
                <Palette className="h-3.5 w-3.5 mr-1" /> Theme
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sections" className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Drag to reorder. Toggle to show/hide.</p>
              <SectionsPanel doc={doc} setDoc={setDoc} />
            </TabsContent>
            <TabsContent value="theme" className="mt-4">
              <ThemePicker doc={doc} setDoc={setDoc} />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Preview */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <MediaKitPreview doc={doc} setDoc={setDoc} onUploadImage={handleUpload} />
        </main>
      </div>

      {/* Hidden off-screen clone used only for clean PDF export */}
      {exporting && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: -10000,
            top: 0,
            pointerEvents: 'none',
            opacity: 1,
          }}
        >
          <MediaKitPreview
            doc={doc}
            setDoc={() => {}}
            editable={false}
            exportMode
            rootId="media-kit-export-root"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />
    </div>
  );
};