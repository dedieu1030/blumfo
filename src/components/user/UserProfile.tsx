
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, Phone, Globe, Clock, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export function UserProfile() {
  const { profile, loading, updateProfile } = useUserProfile();
  const { isAuthenticated, signOut, user } = useAuth();
  const navigate = useNavigate();
  
  // Si on est encore en train de charger, afficher un squelette
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Gestion du cas où l'utilisateur n'est pas authentifié ou le profil n'a pas été trouvé
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil non disponible</CardTitle>
          <CardDescription>
            Vous devez être connecté pour voir votre profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/auth')}>Se connecter</Button>
        </CardContent>
      </Card>
    );
  }
  
  // Si nous avons un utilisateur mais pas de profil complet, utiliser les données minimales
  const displayProfile = profile || {
    full_name: user?.email ? user.email.split('@')[0] : 'Utilisateur',
    email: user?.email || '',
    phone: '', // Ajout de la propriété phone avec une valeur par défaut vide
    language: 'fr',
    timezone: 'Europe/Paris',
    notification_settings: {
      email: true,
      push: false,
      sms: false
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Vous avez été déconnecté avec succès');
      navigate('/auth');
    } catch (error) {
      toast.error('Une erreur est survenue lors de la déconnexion');
      console.error('Erreur de déconnexion:', error);
    }
  };
  
  // Obtention des initiales pour l'avatar
  const initials = displayProfile.full_name
    ? displayProfile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : 'UN';
  
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={displayProfile.full_name} />
              ) : (
                <AvatarFallback className="bg-[#003427] text-white text-lg">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{displayProfile.full_name}</CardTitle>
              <CardDescription className="text-base mt-1">
                {displayProfile.email}
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => navigate('/profile/edit')} variant="outline">
            Modifier mon profil
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations personnelles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{displayProfile.email}</span>
              </div>
            </div>
            
            {displayProfile.phone && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{displayProfile.phone}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Langue</p>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{displayProfile.language}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fuseau horaire</p>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{displayProfile.timezone}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Préférences de notification</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <span>Notifications par email</span>
                <span className={`h-3 w-3 rounded-full ${displayProfile.notification_settings?.email ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {displayProfile.notification_settings?.email ? 'Activées' : 'Désactivées'}
              </p>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <span>Notifications push</span>
                <span className={`h-3 w-3 rounded-full ${displayProfile.notification_settings?.push ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {displayProfile.notification_settings?.push ? 'Activées' : 'Désactivées'}
              </p>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <span>Notifications SMS</span>
                <span className={`h-3 w-3 rounded-full ${displayProfile.notification_settings?.sms ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {displayProfile.notification_settings?.sms ? 'Activées' : 'Désactivées'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
