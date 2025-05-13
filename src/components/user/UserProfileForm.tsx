import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserProfile, NotificationSettings } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface UserProfileFormProps {
  profile: Partial<UserProfile>;
  onSave: (profile: Partial<UserProfile>) => void;
  editMode: boolean;
}

export function UserProfileForm({ profile, onSave, editMode }: UserProfileFormProps) {
  const { userProfile, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile);

  // Mettre à jour le formulaire lorsque le profil change
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNotificationChange = (
    key: keyof NotificationSettings,
    checked: boolean
  ) => {
    setFormData({
      ...formData,
      notification_settings: {
        ...(formData.notification_settings || {
          email: false,
          push: false,
          sms: false,
        }),
        [key]: checked,
      },
    });
  };

  const handleLanguageChange = (language: string) => {
    setFormData({ ...formData, language });
  };

  const handleSaveClick = () => {
    // Préserve les champs created_at et updated_at
    const updatedProfile = {
      ...formData,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
    onSave(updatedProfile);
  };

  const getInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return "U";
  };

  return (
    <div className="space-y-6">
      {/* Photo de profil */}
      <div className="flex justify-center mb-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={formData.avatar_url || ""} />
          <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
        </Avatar>
      </div>

      {/* Formulaire */}
      <div className="grid gap-4">
        {/* Informations de base */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>

            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              disabled
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              disabled={!editMode}
            />
          </div>

          <div>
            <Label htmlFor="language">Langue</Label>
            <LanguageSelector
              currentLanguage={formData.language || "fr"}
              onLanguageChange={handleLanguageChange}
              disabled={!editMode}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Notifications par email</div>
              <div className="text-sm text-muted-foreground">
                Recevoir des notifications par email
              </div>
            </div>
            <Switch
              checked={formData.notification_settings?.email || false}
              onCheckedChange={(checked) =>
                handleNotificationChange("email", checked)
              }
              disabled={!editMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Notifications push</div>
              <div className="text-sm text-muted-foreground">
                Recevoir des notifications dans l'application
              </div>
            </div>
            <Switch
              checked={formData.notification_settings?.push || false}
              onCheckedChange={(checked) =>
                handleNotificationChange("push", checked)
              }
              disabled={!editMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Notifications SMS</div>
              <div className="text-sm text-muted-foreground">
                Recevoir des notifications par SMS
              </div>
            </div>
            <Switch
              checked={formData.notification_settings?.sms || false}
              onCheckedChange={(checked) =>
                handleNotificationChange("sms", checked)
              }
              disabled={!editMode}
            />
          </div>
        </div>
      </div>

      {editMode && (
        <div className="flex justify-end">
          <Button onClick={handleSaveClick}>Sauvegarder</Button>
        </div>
      )}
    </div>
  );
}
