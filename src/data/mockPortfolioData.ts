export interface InstagramMetrics {
  followers: number;
  engagementRate: number;
  impressions: number;
  reach: number;
  totalEngagements: number;
  avgLikes: number;
  avgComments: number;
  avgReelsViews: number;
  avgStoryViews: number;
  watchTimeHours: number;
  postCount: { lifetime: number; last30Days: number };
  lastSynced: string;
  verified: boolean;
}

export interface TikTokMetrics {
  followers: number;
  engagementRate: number;
  views: number;
  impressions: number;
  totalEngagements: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  videoCount: { lifetime: number; last30Days: number };
  lastSynced: string;
  verified: boolean;
}

export interface AudienceData {
  gender: { male: number; female: number; other: number };
  age: Record<string, number>;
  topCities: Array<{ name: string; percentage: number }>;
  topCountries: Array<{ name: string; percentage: number }>;
}

export interface ContentItem {
  id: string;
  platform: 'instagram' | 'tiktok';
  type: 'reel' | 'post' | 'story' | 'video';
  thumbnail: string;
  caption: string;
  date: string;
  reach?: number;
  impressions?: number;
  views?: number;
  likes: number;
  comments: number;
  saves?: number;
  shares?: number;
  featured: boolean;
  permalink?: string;
}

export const mockInstagramMetrics: InstagramMetrics = {
  followers: 125000,
  engagementRate: 4.8,
  impressions: 850000,
  reach: 620000,
  totalEngagements: 42000,
  avgLikes: 5200,
  avgComments: 340,
  avgReelsViews: 85000,
  avgStoryViews: 15000,
  watchTimeHours: 2400,
  postCount: { lifetime: 342, last30Days: 28 },
  lastSynced: new Date().toISOString(),
  verified: true
};

export const mockTikTokMetrics: TikTokMetrics = {
  followers: 280000,
  engagementRate: 6.2,
  views: 3200000,
  impressions: 2800000,
  totalEngagements: 198400,
  avgViews: 114000,
  avgLikes: 8500,
  avgComments: 450,
  avgShares: 1200,
  videoCount: { lifetime: 156, last30Days: 18 },
  lastSynced: new Date().toISOString(),
  verified: true
};

export const mockAudienceData: AudienceData = {
  gender: { male: 35, female: 62, other: 3 },
  age: {
    '13-17': 8,
    '18-24': 42,
    '25-34': 35,
    '35-44': 12,
    '45+': 3
  },
  topCities: [
    { name: 'New York, NY', percentage: 18 },
    { name: 'Los Angeles, CA', percentage: 15 },
    { name: 'Miami, FL', percentage: 12 },
    { name: 'Chicago, IL', percentage: 8 },
    { name: 'Austin, TX', percentage: 7 }
  ],
  topCountries: [
    { name: 'United States', percentage: 78 },
    { name: 'Canada', percentage: 12 },
    { name: 'United Kingdom', percentage: 6 },
    { name: 'Australia', percentage: 4 }
  ]
};

export const mockContentGallery: ContentItem[] = [
  {
    id: '1',
    platform: 'instagram',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop',
    caption: 'Amazing brunch experience at this incredible rooftop spot! 🌅 The vibes were immaculate and the food was even better. #brunch #foodie #rooftop',
    date: '2024-11-15',
    reach: 125000,
    impressions: 145000,
    likes: 8200,
    comments: 450,
    saves: 1200,
    shares: 340,
    featured: true,
    permalink: 'https://instagram.com/p/example1'
  },
  {
    id: '2',
    platform: 'instagram',
    type: 'post',
    thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop',
    caption: 'Sunset dinner dates hit different at this beachfront restaurant ✨',
    date: '2024-11-12',
    reach: 98000,
    impressions: 115000,
    likes: 6800,
    comments: 320,
    saves: 890,
    shares: 210,
    featured: true,
    permalink: 'https://instagram.com/p/example2'
  },
  {
    id: '3',
    platform: 'tiktok',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=600&fit=crop',
    caption: 'POV: You found the best hidden gem in the city 🤫 #hiddengem #foodtok',
    date: '2024-11-10',
    views: 245000,
    likes: 12500,
    comments: 680,
    shares: 2100,
    featured: true,
    permalink: 'https://tiktok.com/@user/video/example3'
  },
  {
    id: '4',
    platform: 'instagram',
    type: 'reel',
    thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=600&fit=crop',
    caption: 'When the aesthetic matches the energy 💫 This place is a MUST visit!',
    date: '2024-11-08',
    reach: 156000,
    impressions: 178000,
    likes: 9400,
    comments: 520,
    saves: 1800,
    shares: 450,
    featured: false,
    permalink: 'https://instagram.com/p/example4'
  },
  {
    id: '5',
    platform: 'tiktok',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop',
    caption: 'Rating viral menu items at [Restaurant] 🍔 Which would you try?',
    date: '2024-11-05',
    views: 189000,
    likes: 10200,
    comments: 890,
    shares: 1800,
    featured: false,
    permalink: 'https://tiktok.com/@user/video/example5'
  },
  {
    id: '6',
    platform: 'instagram',
    type: 'post',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=600&fit=crop',
    caption: 'Obsessed with this new spot! Already planning my next visit 🎯',
    date: '2024-11-02',
    reach: 87000,
    impressions: 102000,
    likes: 5900,
    comments: 280,
    saves: 720,
    shares: 180,
    featured: false,
    permalink: 'https://instagram.com/p/example6'
  }
];
