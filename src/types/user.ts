
export interface UserProfile {
  id: string;
  username?: string;
  full_name: string;
  avatar_url?: string;
  email: string;
  phone?: string;
  language: string;
  timezone: string;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  [key: string]: boolean;  // Add index signature for compatibility with Json
}
