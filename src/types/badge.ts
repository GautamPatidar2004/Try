export interface BadgeTask {
  id: string;
  title: string;
  description: string;
  action: string;
  route?: string;
  checkField?: string;
  completed?: boolean;
}

export interface BadgeCriteria {
  type: string;
  tasks: BadgeTask[];
  total_steps: number;
}

export interface BadgeChallenge {
  id: string;
  user_id: string;
  badge_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  started_at?: string;
  completed_at?: string;
  steps_data: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  points_reward: number;
  criteria: BadgeCriteria;
  is_active: boolean;
  display_order: number;
}

export interface BadgeProgress {
  id: string;
  user_id: string;
  badge_id: string;
  current_progress: number;
  target_progress: number;
  progress_percentage: number;
  last_updated: string;
  badge?: BadgeDefinition;
}
