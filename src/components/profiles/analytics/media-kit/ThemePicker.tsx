import { MediaKitDoc, MediaKitTheme } from './types';
import { Label } from '@/components/ui/label';

interface Props {
  doc: MediaKitDoc;
  setDoc: (d: MediaKitDoc) => void;
}

const PALETTES: Array<{ name: string; theme: Partial<MediaKitTheme> }> = [
  { name: 'Mono Teal', theme: { primary: '#1A1A1A', accent: '#2DD4BF', background: '#FFFFFF', text: '#1A1A1A' } },
  { name: 'Editorial', theme: { primary: '#0D0D0D', accent: '#C9A84C', background: '#F5F3EE', text: '#0D0D0D' } },
  { name: 'Coral', theme: { primary: '#1A1A1A', accent: '#FF6B6B', background: '#FFFFFF', text: '#1A1A1A' } },
  { name: 'Midnight', theme: { primary: '#FFFFFF', accent: '#4F46E5', background: '#0A0A1A', text: '#FFFFFF' } },
  { name: 'Sage', theme: { primary: '#2C5F2D', accent: '#97BC62', background: '#F5F0E8', text: '#1A2A1A' } },
  { name: 'Berry', theme: { primary: '#6D2E46', accent: '#A26769', background: '#ECE2D0', text: '#3A1A2A' } },
];

const FONTS: Array<{ id: MediaKitTheme['fontPair']; label: string }> = [
  { id: 'modern', label: 'Modern' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'bold', label: 'Bold' },
];

export const ThemePicker = ({ doc, setDoc }: Props) => {
  const setTheme = (patch: Partial<MediaKitTheme>) =>
    setDoc({ ...doc, theme: { ...doc.theme, ...patch } });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Palette</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              onClick={() => setTheme(p.theme)}
              className="rounded-md p-2 border hover:border-primary text-left"
              title={p.name}
            >
              <div className="flex h-8 rounded overflow-hidden">
                <div className="flex-1" style={{ background: p.theme.background }} />
                <div className="flex-1" style={{ background: p.theme.primary }} />
                <div className="flex-1" style={{ background: p.theme.accent }} />
              </div>
              <div className="text-[10px] mt-1 truncate">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Accent color</Label>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={doc.theme.accent}
            onChange={(e) => setTheme({ accent: e.target.value })}
            className="h-8 w-10 rounded border cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">{doc.theme.accent}</span>
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Typography</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTheme({ fontPair: f.id })}
              className={`rounded-md py-2 text-xs border ${
                doc.theme.fontPair === f.id ? 'border-primary bg-primary/5' : ''
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Density</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(['comfortable', 'compact'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setTheme({ density: d })}
              className={`rounded-md py-2 text-xs border capitalize ${
                doc.theme.density === d ? 'border-primary bg-primary/5' : ''
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};