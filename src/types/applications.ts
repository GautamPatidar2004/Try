export interface Application {
  id: string;
  influencer_id: string;
  property_id: string;
  status: string;
  proposal_message?: string;
  proposed_dates_start?: string;
  proposed_dates_end?: string;
  content_deliverables?: string[];
  content_deadline?: string;
  created_at: string;
  [key: string]: any;
}
