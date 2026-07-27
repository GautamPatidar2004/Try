export interface SocialAccount {
  id: string;
  influencer_id: string;
  platform: string;
  username: string;
  follower_count: number;
  is_verified?: boolean;
  profile_url?: string;
  access_token?: string;
  created_at: string;
  [key: string]: any;
}
