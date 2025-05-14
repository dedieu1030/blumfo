
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur de vérification de session:', error);
          navigate('/auth');
          return;
        }
        
        if (session) {
          console.log('Session trouvée, redirection vers le profil');
          navigate('/profile');
        } else {
          console.log('Pas de session, redirection vers la page d\'authentification');
          navigate('/auth');
        }
      } catch (err) {
        console.error('Erreur inattendue lors de la vérification de session:', err);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  return null; // Cette page ne rend rien car elle redirige toujours
};

export default Index;
