export interface PortfolioCreator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  location: string;
  bio: string;
  niches: string[];
  platforms: {
    instagram?: {
      username: string;
      followers: number;
      verified: boolean;
    };
    tiktok?: {
      username: string;
      followers: number;
      verified: boolean;
    };
    youtube?: {
      username: string;
      followers: number;
      verified: boolean;
    };
  };
}

export type PortfolioTab = 'overview' | 'instagram' | 'tiktok' | 'reviews' | 'contact';

export interface ContentFilters {
  dateRange: '30' | '60' | '90';
  type: 'all' | 'reel' | 'post' | 'story' | 'video';
  sortBy: 'reach' | 'impressions' | 'views' | 'engagements' | 'likes' | 'date';
}

export interface ContactFormData {
  name: string;
  brandName: string;
  email: string;
  budget?: string;
  timeline?: string;
  projectDescription: string;
  files?: File[];
}
