export interface Offer {
  id: string;
  title: string;
  description: string;
  link: string;
  video_link?: string;
  icon_url: string;
  steps: string[];
  terms: string[];
  is_active: boolean;
  created_at: string;
}

export interface OfferClick {
  id: string;
  user_id: string;
  offer_id: string;
  clicked_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UserStat extends UserProfile {
  total_clicks: number;
}

export interface AuthError {
  message: string;
}