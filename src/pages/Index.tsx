
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/use-user-profile';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useStripeInvoice } from '@/hooks/use-stripe-invoice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { createInvoice, loading: invoiceLoading } = useStripeInvoice();
  const [isQuickActionLoading, setIsQuickActionLoading] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleQuickInvoice = async () => {
    setIsQuickActionLoading(true);
    try {
      // Cette action est juste un exemple et devrait être remplacée par une vraie sélection de client
      navigate('/invoicing');
    } finally {
      setIsQuickActionLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-0">
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Bienvenue {profile?.full_name || ''}</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Factures</CardTitle>
              <CardDescription>Créez et gérez vos factures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <div className="bg-muted rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M8 7h8" /><path d="M8 11h8" /><path d="M8 15h5" /></svg>
                  </div>
                </AspectRatio>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleNavigate('/invoices')}>
                Voir mes factures
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
              <CardDescription>Gérez votre portefeuille clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <div className="bg-muted rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                </AspectRatio>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleNavigate('/clients')}>
                Gérer mes clients
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Action rapide</CardTitle>
              <CardDescription>Créez rapidement une facture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <div className="bg-muted rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M15 5v14M9 5v14M4 5h16M4 19h16" /><path d="m10 10 4 4M10 14l4-4" /></svg>
                  </div>
                </AspectRatio>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleQuickInvoice} 
                disabled={isQuickActionLoading || invoiceLoading}
              >
                {isQuickActionLoading ? 'Chargement...' : 'Nouvelle facture'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
