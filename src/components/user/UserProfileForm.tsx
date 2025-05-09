
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserProfile, NotificationSettings } from "@/types/user";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useTranslation } from 'react-i18next';

interface UserProfileFormProps {
  initialData?: Partial<UserProfile>;
  onSave: (data: UserProfile) => void;
  onCancel?: () => void;
}

export function UserProfileForm({ initialData, onSave, onCancel }: UserProfileFormProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { profile: user, updateProfile } = useUserProfile();
  const [userData, setUserData] = useState<Partial<UserProfile>>({
    full_name: '',
    email: '',
    phone: '',
    language: 'fr',
    timezone: 'Europe/Paris',
    notification_settings: {
      email: true,
      push: false,
      sms: false
    },
    ...initialData
  });

  useEffect(() => {
    if (user) {
      setUserData({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        email: user.email,
        phone: user.phone,
        language: user.language,
        timezone: user.timezone,
        notification_settings: user.notification_settings,
        created_at: user.created_at,
        updated_at: user.updated_at
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setUserData(prev => ({ ...prev, [id]: value }));
  };

  // Fix the notification settings update to ensure all required properties are present
  const updateNotificationSettings = (type: keyof NotificationSettings, value: boolean) => {
    setUserData(prev => ({
      ...prev,
      notification_settings: {
        email: type === 'email' ? value : Boolean(prev.notification_settings?.email),
        push: type === 'push' ? value : Boolean(prev.notification_settings?.push),
        sms: type === 'sms' ? value : Boolean(prev.notification_settings?.sms)
      } as NotificationSettings
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData.full_name || !userData.email) {
      toast({
        title: t('error'),
        description: t('fullNameAndEmailRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure all required properties are present
      const updatedProfile: UserProfile = {
        id: user?.id || '',
        username: userData.username || '',
        full_name: userData.full_name,
        avatar_url: userData.avatar_url || '',
        email: userData.email,
        phone: userData.phone || '',
        language: userData.language || 'fr',
        timezone: userData.timezone || 'Europe/Paris',
        notification_settings: {
          email: userData.notification_settings?.email !== undefined ? userData.notification_settings.email : true,
          push: userData.notification_settings?.push !== undefined ? userData.notification_settings.push : false,
          sms: userData.notification_settings?.sms !== undefined ? userData.notification_settings.sms : false
        },
        created_at: user?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await updateProfile(updatedProfile);
      
      toast({
        title: t('profileUpdated'),
        description: t('profileUpdatedSuccessfully'),
      });
      
      onSave(updatedProfile);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('profileUpdateFailed'),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="full_name">{t('fullName')}</Label>
        <Input
          type="text"
          id="full_name"
          value={userData.full_name || ''}
          onChange={handleChange}
          placeholder={t('yourFullName')}
        />
      </div>
      <div>
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          type="email"
          id="email"
          value={userData.email || ''}
          onChange={handleChange}
          placeholder={t('yourEmail')}
        />
      </div>
      <div>
        <Label htmlFor="phone">{t('phone')}</Label>
        <Input
          type="tel"
          id="phone"
          value={userData.phone || ''}
          onChange={handleChange}
          placeholder={t('yourPhone')}
        />
      </div>
      <div>
        <Label htmlFor="language">{t('language')}</Label>
        <Input
          type="text"
          id="language"
          value={userData.language || ''}
          onChange={handleChange}
          placeholder={t('yourLanguage')}
        />
      </div>
      <div>
        <Label htmlFor="timezone">{t('timezone')}</Label>
        <Input
          type="text"
          id="timezone"
          value={userData.timezone || ''}
          onChange={handleChange}
          placeholder={t('yourTimezone')}
        />
      </div>
      <div>
        <Label>{t('notificationSettings')}</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email-notifications"
              checked={userData.notification_settings?.email || false}
              onCheckedChange={(checked) => updateNotificationSettings('email', checked as boolean)}
            />
            <Label htmlFor="email-notifications">{t('emailNotifications')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="push-notifications"
              checked={userData.notification_settings?.push || false}
              onCheckedChange={(checked) => updateNotificationSettings('push', checked as boolean)}
            />
            <Label htmlFor="push-notifications">{t('pushNotifications')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sms-notifications"
              checked={userData.notification_settings?.sms || false}
              onCheckedChange={(checked) => updateNotificationSettings('sms', checked as boolean)}
            />
            <Label htmlFor="sms-notifications">{t('smsNotifications')}</Label>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="mr-2">
            {t('cancel')}
          </Button>
        )}
        <Button type="submit">{t('save')}</Button>
      </div>
    </form>
  );
}
