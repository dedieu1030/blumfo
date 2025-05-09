
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/use-user-profile';
import { Loader2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, NotificationSettings } from '@/types/user';

// Liste des langues disponibles
const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
];

// Liste des fuseaux horaires
const timezones = [
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
];

export function UserProfileForm() {
  const { profile, loading, error, updateProfile } = useUserProfile();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Initialiser les données du formulaire lorsque le profil est chargé
  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        username: profile.username,
        phone: profile.phone,
        language: profile.language,
        timezone: profile.timezone,
        notification_settings: profile.notification_settings,
      });
    }
  }, [profile]);
  
  // Gérer les changements dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Gérer les changements de langue
  const handleLanguageChange = (value: string) => {
    setFormData(prev => ({ ...prev, language: value }));
  };
  
  // Gérer les changements de fuseau horaire
  const handleTimezoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, timezone: value }));
  };
  
  // Gérer les changements de paramètres de notification
  const handleNotificationChange = (type: keyof NotificationSettings, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_settings: {
        ...(prev.notification_settings || {}),
        [type]: value
      }
    }));
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été enregistrées avec succès",
        });
        
        // Rediriger vers la page de profil
        navigate('/profile');
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur s'est produite lors de la mise à jour du profil",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Modifier mon profil</CardTitle>
          <CardDescription>Chargement de vos informations...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
          <CardDescription>Impossible de charger votre profil</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error?.message || "Vous devez être connecté pour modifier votre profil"}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/profile')}>Retour</Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Modifier mon profil</CardTitle>
          <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleChange}
                placeholder="Votre nom complet"
              />
            </div>
            
            <div>
              <Label htmlFor="username">Nom d'utilisateur (optionnel)</Label>
              <Input
                id="username"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                placeholder="Votre nom d'utilisateur"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                L'adresse email ne peut pas être modifiée directement
              </p>
            </div>
            
            <div>
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="Votre numéro de téléphone"
              />
            </div>
          </div>
          
          {/* Préférences */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Préférences</h3>
            
            <div>
              <Label htmlFor="language">Langue</Label>
              <Select
                value={formData.language || 'fr'}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une langue" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <Select
                value={formData.timezone || 'Europe/Paris'}
                onValueChange={handleTimezoneChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un fuseau horaire" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Préférences de notification</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotif" className="cursor-pointer">Notifications par email</Label>
              <Switch
                id="emailNotif"
                checked={formData.notification_settings?.email || false}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotif" className="cursor-pointer">Notifications push</Label>
              <Switch
                id="pushNotif"
                checked={formData.notification_settings?.push || false}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotif" className="cursor-pointer">Notifications SMS</Label>
              <Switch
                id="smsNotif"
                checked={formData.notification_settings?.sms || false}
                onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => navigate('/profile')}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
