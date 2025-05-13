
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  language: string;
  timezone: string;
  username?: string;
  notification_settings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
