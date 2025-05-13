
// Add or update the NotificationSettings interface in user.ts
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string;
  phone: string;
  language: string;
  timezone: string;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}
