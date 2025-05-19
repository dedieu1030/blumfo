
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { UserProfile } from '@/components/user/UserProfile';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tablesChecked, setTablesChecked] = useState(false);
  
  // Vérifier les tables nécessaires
  useEffect(() => {
    async function checkTables() {
      if (isAuthenticated && !tablesChecked) {
        try {
          // Vérifier si les tables existent avec une requête SQL directe
          const { data: companiesExist, error: companiesError } = await supabase
            .rpc('check_table_exists', { table_name: 'companies' });
            
          const { data: profilesExist, error: profilesError } = await supabase
            .rpc('check_table_exists', { table_name: 'profiles' });
          
          if (companiesError || profilesError || !companiesExist || !profilesExist) {
            setError(`Les tables requises n'existent pas dans la base de données. Veuillez configurer votre base de données.`);
          }
          
          setTablesChecked(true);
        } catch (err) {
          console.error("Erreur lors de la vérification des tables:", err);
        }
      }
    }
    
    checkTables();
  }, [isAuthenticated, tablesChecked]);

  // Gérer le rafraîchissement de la page
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Rafraîchir la session
      await supabase.auth.refreshSession();
      
      // Rafraîchir les vérifications de table avec la nouvelle approche SQL
      const { data: companiesExist, error: companiesError } = await supabase
        .rpc('check_table_exists', { table_name: 'companies' });
        
      const { data: profilesExist, error: profilesError } = await supabase
        .rpc('check_table_exists', { table_name: 'profiles' });
      
      if (companiesError || profilesError || !companiesExist || !profilesExist) {
        setError(`Les tables requises n'existent pas dans la base de données. Veuillez configurer votre base de données.`);
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(`Erreur lors du rafraîchissement: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Header
        title="Mon Profil"
        description="Consultez et gérez vos informations personnelles"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {error ? (
        <div className="container mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2">Rafraîchir</span>
            </Button>
          </Alert>
          
          <div className="p-6 bg-muted rounded-md">
            <h2 className="text-lg font-medium mb-4">Configuration requise</h2>
            <p className="mb-2">Pour utiliser cette page, vous devez configurer votre base de données avec les tables nécessaires.</p>
            <p>Veuillez exécuter la migration SQL pour créer les tables requises.</p>
          </div>
        </div>
      ) : (
        <div>
          <UserProfile />
        </div>
      )}

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
