export interface SupportCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category_id: string | null;
  search_keywords: string[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: SupportCategory;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category_id: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_admin_id: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  category?: SupportCategory;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin_reply: boolean;
  attachments: string[] | null;
  created_at: string;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category_id: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}