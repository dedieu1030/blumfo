
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleStripeConnectCallback } from "@/services/stripeConnectClient";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StripeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Connexion avec Stripe en cours...');
  
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // If code or state is missing, something went wrong
    if (!code || !state) {
      setStatus('error');
      setMessage('Paramètres de connexion manquants ou invalides.');
      return;
    }
    
    const processCallback = async () => {
      try {
        const success = await handleStripeConnectCallback(code, state);
        
        if (success) {
          setStatus('success');
          setMessage('Votre compte Stripe a été connecté avec succès!');
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/settings?tab=stripe');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Impossible de connecter votre compte Stripe. Veuillez réessayer.');
        }
      } catch (error) {
        console.error("Erreur lors de la connexion Stripe:", error);
        setStatus('error');
        setMessage('Une erreur s\'est produite lors de la connexion avec Stripe.');
      }
    };
    
    processCallback();
  }, [searchParams, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Connexion Stripe</h1>
          
          <div className="flex flex-col items-center justify-center mt-8 space-y-4">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-violet animate-spin" />
            )}
            
            {status === 'success' && (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            )}
            
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
            
            <p className="mt-4 text-lg">{message}</p>
            
            {status === 'error' && (
              <div className="mt-6">
                <Button 
                  onClick={() => navigate('/settings?tab=stripe')}
                  className="bg-violet hover:bg-violet/90"
                >
                  Retourner aux paramètres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
