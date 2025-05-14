
export interface UserProfile {
  id: string;
  username?: string;
  full_name: string;
  avatar_url?: string;
  email: string;
  phone?: string;
  language: string;
  timezone: string;
  notification_settings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Email type et profile type pour la sécurité de typage
export type EmailType = 'personal' | 'professional' | 'company';
export type ProfileType = 'personal' | 'business';
