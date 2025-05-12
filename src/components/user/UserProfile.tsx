
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Button } from '@/components/ui/button';
import { UserCircle, Mail, Phone, Globe, Clock, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function UserProfile() {
  const { profile, loading } = useUserProfile();
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  
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
  
  if (!isAuthenticated || !profile) {
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
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon profil</CardTitle>
        <CardDescription>
          Vos informations personnelles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.full_name} 
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium">{profile.full_name}</h3>
            {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>
          
          {profile.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{profile.language}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{profile.timezone}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Préférences de notification</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${profile.notification_settings.email ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Notifications par email: {profile.notification_settings.email ? 'Activées' : 'Désactivées'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${profile.notification_settings.push ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Notifications push: {profile.notification_settings.push ? 'Activées' : 'Désactivées'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${profile.notification_settings.sms ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Notifications SMS: {profile.notification_settings.sms ? 'Activées' : 'Désactivées'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button onClick={() => navigate('/profile/edit')} variant="outline">
            Modifier mon profil
          </Button>
          <Button onClick={handleLogout} variant="destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
