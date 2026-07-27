export type SectionId =
  | 'hero'
  | 'about'
  | 'stats'
  | 'services'
  | 'deliverables'
  | 'portfolio'
  | 'collabs'
  | 'contact';

export interface ServiceItem {
  platform: string;
  serviceType: string;
  price: string;
  description: string;
}

export interface BrandCollab {
  brandName: string;
  description: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface MediaKitTheme {
  primary: string; // hex
  accent: string; // hex
  background: string; // hex
  text: string; // hex
  fontPair: 'modern' | 'editorial' | 'bold';
  density: 'comfortable' | 'compact';
}

export interface MediaKitDoc {
  template: 'minimal' | 'editorial' | 'bold';
  theme: MediaKitTheme;
  sectionOrder: SectionId[];
  enabledSections: Record<SectionId, boolean>;
  pageAssignments: Record<SectionId, 1 | 2>;
  hero: {
    name: string;
    tagline: string;
    location: string;
    coverPhotoUrl: string;
    profilePhotoUrl: string;
  };
  about: {
    bio: string;
    languages: string[];
    specialties: string[];
  };
  stats: StatItem[];
  services: ServiceItem[];
  deliverables: string[];
  portfolio: string[]; // image urls
  collabs: BrandCollab[];
  contact: {
    email: string;
    instagram: string;
    tiktok: string;
    website: string;
  };
}

export const DEFAULT_THEME: MediaKitTheme = {
  primary: '#1A1A1A',
  accent: '#2DD4BF',
  background: '#FFFFFF',
  text: '#1A1A1A',
  fontPair: 'modern',
  density: 'comfortable',
};

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  'hero',
  'about',
  'stats',
  'services',
  'deliverables',
  'portfolio',
  'collabs',
  'contact',
];

export const DEFAULT_PAGE_ASSIGNMENTS: Record<SectionId, 1 | 2> = {
  hero: 1,
  about: 1,
  stats: 1,
  services: 2,
  deliverables: 2,
  portfolio: 2,
  collabs: 2,
  contact: 2,
};

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: 'Hero',
  about: 'About',
  stats: 'Stats',
  services: 'Services & Rates',
  deliverables: 'Deliverables',
  portfolio: 'Portfolio',
  collabs: 'Brand Collabs',
  contact: 'Contact',
};

export const FONT_PAIRS: Record<MediaKitTheme['fontPair'], { heading: string; body: string }> = {
  modern: { heading: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  editorial: { heading: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif" },
  bold: { heading: "'Archivo Black', Impact, sans-serif", body: "'Inter', system-ui, sans-serif" },
};

export function createDefaultDoc(opts: {
  name?: string;
  bio?: string;
  profilePhotoUrl?: string;
}): MediaKitDoc {
  return {
    template: 'minimal',
    theme: { ...DEFAULT_THEME },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    enabledSections: {
      hero: true,
      about: true,
      stats: true,
      services: true,
      deliverables: true,
      portfolio: true,
      collabs: true,
      contact: true,
    },
    pageAssignments: { ...DEFAULT_PAGE_ASSIGNMENTS },
    hero: {
      name: opts.name || 'Your Name',
      tagline: 'Content Creator & Storyteller',
      location: '',
      coverPhotoUrl: '',
      profilePhotoUrl: opts.profilePhotoUrl || '',
    },
    about: {
      bio: opts.bio || 'Tell brands who you are and what makes your content special.',
      languages: ['English'],
      specialties: [],
    },
    stats: [
      { label: 'Followers', value: '0' },
      { label: 'Avg. Engagement', value: '0%' },
      { label: 'Avg. Reach', value: '0' },
    ],
    services: [
      { platform: 'Instagram', serviceType: 'Reel', price: '$500', description: 'Vertical video walkthrough' },
    ],
    deliverables: [
      '2–3 vertical short-form videos',
      '5–8 photo assets for listing use',
      '3–6 Instagram stories',
      'Content usage rights for organic reposting',
    ],
    portfolio: [],
    collabs: [],
    contact: {
      email: '',
      instagram: '',
      tiktok: '',
      website: '',
    },
  };
}