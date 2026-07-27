export interface TrendInsights {
  content: string;
  disclaimer: string;
  topic: string;
  platform: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  creators?: any[];
  properties?: any[];
  brands?: any[];
  tool_calls?: any[];
  trendInsights?: TrendInsights;
}

export interface DiscoveryConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}
