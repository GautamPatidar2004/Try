import { useLayoutEffect, useRef, useState } from 'react';
import { MediaKitDoc, FONT_PAIRS, SectionId, DEFAULT_PAGE_ASSIGNMENTS } from './types';
import { InlineEditable } from './InlineEditable';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  doc: MediaKitDoc;
  setDoc: (d: MediaKitDoc) => void;
  editable?: boolean;
  onUploadImage?: (target: 'cover' | 'profile' | 'portfolio', index?: number) => void;
  exportMode?: boolean;
  rootId?: string;
}

const A4_WIDTH = 794; // px @ 96dpi
const A4_HEIGHT = 1123; // px @ 96dpi

// Parse hex (#rgb / #rrggbb) → {r,g,b}; falls back to white on bad input.
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!hex) return { r: 255, g: 255, b: 255 };
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return { r: 255, g: 255, b: 255 };
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return { r: 255, g: 255, b: 255 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// Perceived luminance 0–1.
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// Pick black or white text for the highest contrast against `bgHex`.
function readableText(bgHex: string): string {
  return luminance(bgHex) < 0.5 ? '#FFFFFF' : '#0A0A0A';
}

export const MediaKitPreview = ({
  doc,
  setDoc,
  editable = true,
  onUploadImage,
  exportMode = false,
  rootId = 'media-kit-preview-root',
}: Props) => {
  const fonts = FONT_PAIRS[doc.theme.fontPair];
  const pad = doc.theme.density === 'compact' ? 'px-10 py-8' : 'px-14 py-12';

  // Auto-derive contrast-safe colors so the saved doc can never produce
  // dark-on-dark or light-on-light output (in preview or exported PDF).
  const textColor = readableText(doc.theme.background);
  const contactTextColor = readableText(doc.theme.primary);

  // Applied to every captured section so html2canvas never produces
  // transparent (which JPEG/flatten renders as black).
  const sectionBaseStyle: React.CSSProperties = {
    background: doc.theme.background,
    color: textColor,
  };

  const update = <K extends keyof MediaKitDoc>(key: K, value: MediaKitDoc[K]) =>
    setDoc({ ...doc, [key]: value });

  const renderSection = (id: SectionId) => {
    if (!doc.enabledSections[id]) return null;
    switch (id) {
      case 'hero':
        return (
          <section key={id} className="relative" style={sectionBaseStyle}>
            <div
              className="h-56 w-full relative overflow-hidden cursor-pointer group"
              style={{
                background: doc.hero.coverPhotoUrl
                  ? `url(${doc.hero.coverPhotoUrl}) center/cover`
                  : `linear-gradient(135deg, ${doc.theme.primary}, ${doc.theme.accent})`,
              }}
              onClick={() => editable && onUploadImage?.('cover')}
            >
              {editable && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 text-white text-sm transition">
                  Click to {doc.hero.coverPhotoUrl ? 'replace' : 'add'} cover photo
                </div>
              )}
            </div>
            <div className={`${pad} pt-0 -mt-12 relative`}>
              <div
                className="w-24 h-24 rounded-full border-4 cursor-pointer overflow-hidden bg-border"
                style={{ borderColor: doc.theme.background }}
                onClick={() => editable && onUploadImage?.('profile')}
              >
                {doc.hero.profilePhotoUrl && (
                  <img src={doc.hero.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <InlineEditable
                as="h1"
                value={doc.hero.name}
                onChange={(v) => update('hero', { ...doc.hero, name: v })}
                placeholder="Your name"
                editable={editable}
                className="mt-4 text-4xl font-bold leading-tight"
              />
              <InlineEditable
                as="p"
                value={doc.hero.tagline}
                onChange={(v) => update('hero', { ...doc.hero, tagline: v })}
                placeholder="Your tagline"
                editable={editable}
                className="mt-1 text-lg opacity-70"
                style={{ fontFamily: fonts.body } as any}
              />
              <InlineEditable
                as="p"
                value={doc.hero.location}
                onChange={(v) => update('hero', { ...doc.hero, location: v })}
                placeholder="Location"
                editable={editable}
                className="mt-1 text-sm opacity-50"
              />
            </div>
          </section>
        );
      case 'about':
        return (
          <section key={id} className={pad} style={sectionBaseStyle}>
            <SectionTitle color={doc.theme.accent}>About</SectionTitle>
            <InlineEditable
              as="p"
              multiline
              value={doc.about.bio}
              onChange={(v) => update('about', { ...doc.about, bio: v })}
              placeholder="Tell brands about yourself..."
              editable={editable}
              className="mt-3 leading-relaxed whitespace-pre-wrap"
            />
            {(doc.about.specialties.length > 0 || editable) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {doc.about.specialties.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1"
                    style={{ background: doc.theme.accent + '22', color: doc.theme.primary }}
                  >
                    {s}
                    {editable && (
                      <button
                        onClick={() => update('about', {
                          ...doc.about,
                          specialties: doc.about.specialties.filter((_, j) => j !== i),
                        })}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
                {editable && (
                  <button
                    onClick={() => {
                      const v = prompt('Add specialty');
                      if (v) update('about', { ...doc.about, specialties: [...doc.about.specialties, v] });
                    }}
                    className="px-3 py-1 rounded-full text-xs border border-dashed border-current opacity-50 hover:opacity-100"
                  >
                    + Add
                  </button>
                )}
              </div>
            )}
          </section>
        );
      case 'stats':
        return (
          <section key={id} className={pad} style={sectionBaseStyle}>
            <SectionTitle color={doc.theme.accent}>By the Numbers</SectionTitle>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {doc.stats.map((s, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg text-center"
                  style={{ background: doc.theme.primary + '08' }}
                >
                  <InlineEditable
                    as="div"
                    value={s.value}
                    onChange={(v) => {
                      const next = [...doc.stats];
                      next[i] = { ...s, value: v };
                      update('stats', next);
                    }}
                    editable={editable}
                    className="text-2xl font-bold"
                    style={{ color: doc.theme.accent } as any}
                  />
                  <InlineEditable
                    as="div"
                    value={s.label}
                    onChange={(v) => {
                      const next = [...doc.stats];
                      next[i] = { ...s, label: v };
                      update('stats', next);
                    }}
                    editable={editable}
                    className="text-xs uppercase tracking-wider mt-1 opacity-60"
                  />
                </div>
              ))}
            </div>
          </section>
        );
      case 'services':
        return (
          <section key={id} className={pad} style={sectionBaseStyle}>
            <SectionTitle color={doc.theme.accent}>Services & Rates</SectionTitle>
            <div className="mt-3 space-y-2">
              {doc.services.map((svc, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-4 p-3 rounded-md border"
                  style={{ borderColor: doc.theme.primary + '20' }}
                >
                  <div className="flex-1">
                    <div className="flex gap-2 text-sm font-medium">
                      <InlineEditable
                        as="span"
                        value={svc.platform}
                        onChange={(v) => updateArr('services', i, { ...svc, platform: v })}
                        editable={editable}
                      />
                      <span className="opacity-30">·</span>
                      <InlineEditable
                        as="span"
                        value={svc.serviceType}
                        onChange={(v) => updateArr('services', i, { ...svc, serviceType: v })}
                        editable={editable}
                      />
                    </div>
                    <InlineEditable
                      as="div"
                      value={svc.description}
                      onChange={(v) => updateArr('services', i, { ...svc, description: v })}
                      editable={editable}
                      className="text-xs opacity-60 mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <InlineEditable
                      as="span"
                      value={svc.price}
                      onChange={(v) => updateArr('services', i, { ...svc, price: v })}
                      editable={editable}
                      className="font-bold"
                      style={{ color: doc.theme.accent } as any}
                    />
                    {editable && (
                      <button onClick={() => removeArr('services', i)} className="opacity-40 hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {editable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    update('services', [
                      ...doc.services,
                      { platform: 'Instagram', serviceType: 'Post', price: '$0', description: '' },
                    ])
                  }
                >
                  <Plus className="h-3 w-3 mr-1" /> Add service
                </Button>
              )}
            </div>
          </section>
        );
      case 'deliverables':
        return (
          <section key={id} className={pad} style={sectionBaseStyle}>
            <SectionTitle color={doc.theme.accent}>What You'll Get</SectionTitle>
            <ul className="mt-3 space-y-2">
              {doc.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span style={{ color: doc.theme.accent }}>●</span>
                  <InlineEditable
                    as="span"
                    value={d}
                    onChange={(v) => {
                      const next = [...doc.deliverables];
                      next[i] = v;
                      update('deliverables', next);
                    }}
                    editable={editable}
                    className="flex-1"
                  />
                  {editable && (
                    <button
                      onClick={() => update('deliverables', doc.deliverables.filter((_, j) => j !== i))}
                      className="opacity-40 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => update('deliverables', [...doc.deliverables, 'New deliverable'])}
              >
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            )}
          </section>
        );
      case 'portfolio':
        return (
          <section key={id} className={pad} style={sectionBaseStyle}>
            <SectionTitle color={doc.theme.accent}>Portfolio</SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {doc.portfolio.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md overflow-hidden bg-muted relative group cursor-pointer"
                  onClick={() => editable && onUploadImage?.('portfolio', i)}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  {editable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        update('portfolio', doc.portfolio.filter((_, j) => j !== i));
                      }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              {editable && (
                <button
                  onClick={() => onUploadImage?.('portfolio')}
                  className="aspect-square rounded-md border-2 border-dashed flex items-center justify-center text-xs opacity-50 hover:opacity-100"
                  style={{ borderColor: doc.theme.primary + '40' }}
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
          </section>
        );
      case 'collabs':
        return (
          <section key={id} className={pad} style={sectionBaseStyle}>
            <SectionTitle color={doc.theme.accent}>Past Collaborations</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {doc.collabs.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-md border"
                  style={{ borderColor: doc.theme.primary + '20' }}
                >
                  <InlineEditable
                    as="div"
                    value={c.brandName}
                    onChange={(v) => updateArr('collabs', i, { ...c, brandName: v })}
                    editable={editable}
                    className="font-semibold text-sm"
                  />
                  <InlineEditable
                    as="div"
                    value={c.description}
                    onChange={(v) => updateArr('collabs', i, { ...c, description: v })}
                    editable={editable}
                    className="text-xs opacity-60 mt-1"
                  />
                </div>
              ))}
              {editable && (
                <button
                  onClick={() =>
                    update('collabs', [...doc.collabs, { brandName: 'Brand Name', description: 'What you did' }])
                  }
                  className="p-3 rounded-md border-2 border-dashed text-xs opacity-50 hover:opacity-100"
                  style={{ borderColor: doc.theme.primary + '40' }}
                >
                  + Add collab
                </button>
              )}
            </div>
          </section>
        );
      case 'contact':
        return (
          <section
            key={id}
            className={pad}
            style={{
              background: doc.theme.primary,
              color: contactTextColor,
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <SectionTitle color={doc.theme.accent}>Let's Work Together</SectionTitle>
            <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              {(['email', 'instagram', 'tiktok', 'website'] as const).map((k) => (
                <div key={k} className="flex gap-2">
                  <span className="opacity-50 capitalize w-20">{k}:</span>
                  <InlineEditable
                    as="span"
                    value={doc.contact[k]}
                    onChange={(v) => update('contact', { ...doc.contact, [k]: v })}
                    editable={editable}
                    placeholder={`your ${k}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </section>
        );
    }
  };

  function updateArr<K extends 'services' | 'collabs'>(key: K, i: number, value: MediaKitDoc[K][number]) {
    const arr = [...(doc[key] as any[])];
    arr[i] = value;
    update(key, arr as any);
  }
  function removeArr<K extends 'services' | 'collabs'>(key: K, i: number) {
    update(key, (doc[key] as any[]).filter((_, j) => j !== i) as any);
  }

  const assignments = doc.pageAssignments || DEFAULT_PAGE_ASSIGNMENTS;
  const page1Sections = doc.sectionOrder.filter(
    (id) => doc.enabledSections[id] && (assignments[id] ?? DEFAULT_PAGE_ASSIGNMENTS[id]) === 1,
  );
  const page2Sections = doc.sectionOrder.filter(
    (id) => doc.enabledSections[id] && (assignments[id] ?? DEFAULT_PAGE_ASSIGNMENTS[id]) === 2,
  );

  return (
    <div
      id={rootId}
      className="mx-auto space-y-6"
      style={{ width: A4_WIDTH, fontFamily: fonts.body }}
    >
      <style>{`
        #${rootId} h1, #${rootId} h2, #${rootId} h3 {
          font-family: ${fonts.heading};
        }
      `}</style>
      <PageFrame
        background={doc.theme.background}
        textColor={textColor}
        pageNumber={1}
        exportMode={exportMode}
      >
        {page1Sections.map(renderSection)}
      </PageFrame>
      <PageFrame
        background={doc.theme.background}
        textColor={textColor}
        pageNumber={2}
        exportMode={exportMode}
      >
        {page2Sections.map(renderSection)}
      </PageFrame>
    </div>
  );
};

const PageFrame = ({
  children,
  background,
  textColor,
  pageNumber,
  exportMode = false,
}: {
  children: React.ReactNode;
  background: string;
  textColor: string;
  pageNumber: number;
  exportMode?: boolean;
}) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (exportMode) return;
    const el = innerRef.current;
    if (!el) return;
    const measure = () => {
      // Reset transform before measuring natural height
      el.style.transform = 'none';
      const natural = el.scrollHeight;
      const next = natural > A4_HEIGHT ? Math.max(0.5, A4_HEIGHT / natural) : 1;
      setScale(next);
      el.style.transform = next < 1 ? `scale(${next})` : 'none';
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [exportMode]);

  return (
    <div
      data-pdf-page={pageNumber}
      className="shadow-2xl relative overflow-hidden"
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        background,
        color: textColor,
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: A4_WIDTH,
          minHeight: A4_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          transformOrigin: 'top left',
          transform: !exportMode && scale < 1 ? `scale(${scale})` : 'none',
        }}
      >
        {children}
      </div>
      {!exportMode && scale < 0.75 && (
        <div className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded bg-amber-500/90 text-white pointer-events-none">
          Page {pageNumber} content is tight — move a section or trim text
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <h2 className="text-xs uppercase tracking-[0.2em] font-semibold pb-2 border-b" style={{ borderColor: color + '40', color }}>
    {children}
  </h2>
);