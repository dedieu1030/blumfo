
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  language: string;
  timezone: string;
  username?: string;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}
