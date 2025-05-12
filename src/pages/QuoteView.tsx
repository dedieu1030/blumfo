
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteSignatureComponent } from '@/components/QuoteSignature';
import { Quote, QuoteSignature } from '@/types/quote';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, FileText, Clock } from 'lucide-react';

export function QuoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQuote = async () => {
      if (!id) {
        setError("Identifiant de devis manquant");
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('get-quote', {
          queryParams: { id }
        });
        
        if (error || !data?.quote) {
          throw new Error(error || "Impossible de charger le devis");
        }
        
        setQuote(data.quote);
      } catch (err: any) {
        console.error("Erreur lors du chargement du devis:", err);
        setError(err.message || "Une erreur est survenue lors du chargement du devis");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuote();
  }, [id]);
  
  const handleSignatureSuccess = (signature: QuoteSignature) => {
    // Mettre à jour le devis avec la signature
    if (quote) {
      setQuote({
        ...quote,
        status: 'signed',
        signatures: [...(quote.signatures || []), signature]
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'sent':
        return <Badge variant="secondary">Envoyé</Badge>;
      case 'viewed':
        return <Badge variant="secondary">Consulté</Badge>;
      case 'signed':
        return <Badge variant="success" className="bg-green-500">Signé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Refusé</Badge>;
      case 'expired':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Expiré</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-blue-500">Accepté</Badge>;
      case 'invoiced':
        return <Badge variant="default">Facturé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-violet rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error || !quote) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Devis non trouvé"}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Devis {quote.quote_number}</CardTitle>
            <CardDescription>
              {getStatusBadge(quote.status)}
              <span className="ml-2">
                Émis le {format(new Date(quote.issue_date), 'PPP', { locale: fr })}
              </span>
            </CardDescription>
          </div>
          
          {quote.company?.logo_url && (
            <img 
              src={quote.company.logo_url} 
              alt={`Logo ${quote.company.company_name}`}
              className="h-16 object-contain"
            />
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informations du devis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-2">Société émettrice</h3>
              <div className="text-sm">
                <p className="font-medium">{quote.company?.company_name}</p>
                {quote.company?.address && <p className="whitespace-pre-line">{quote.company.address}</p>}
                {quote.company?.email && <p>{quote.company.email}</p>}
                {quote.company?.phone && <p>{quote.company.phone}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Client</h3>
              <div className="text-sm">
                <p className="font-medium">{quote.client?.client_name}</p>
                {quote.client?.address && <p className="whitespace-pre-line">{quote.client.address}</p>}
                {quote.client?.email && <p>{quote.client.email}</p>}
                {quote.client?.phone && <p>{quote.client.phone}</p>}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Détails du devis */}
          <div>
            <h3 className="font-medium mb-4">Détails du devis</h3>
            <table className="w-full">
              <thead className="text-xs uppercase text-gray-500 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Quantité</th>
                  <th className="px-4 py-3 text-right">Prix unitaire</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quote.items && quote.items.map(item => (
                  <tr key={item.id} className="text-sm">
                    <td className="px-4 py-4">{item.description}</td>
                    <td className="px-4 py-4 text-right">{item.quantity}</td>
                    <td className="px-4 py-4 text-right">{item.unit_price.toFixed(2)} €</td>
                    <td className="px-4 py-4 text-right">{item.total_price.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-sm font-medium">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right">Sous-total</td>
                  <td className="px-4 py-3 text-right">{quote.subtotal.toFixed(2)} €</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right">TVA</td>
                  <td className="px-4 py-3 text-right">{quote.tax_amount.toFixed(2)} €</td>
                </tr>
                <tr className="text-base">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold">Total</td>
                  <td className="px-4 py-3 text-right font-bold">{quote.total_amount.toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {quote.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Notes et conditions</h3>
                <div className="text-sm whitespace-pre-line">{quote.notes}</div>
              </div>
            </>
          )}
          
          {/* Dates importantes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div className="text-sm">
                <p className="text-gray-500">Date d'émission</p>
                <p className="font-medium">{format(new Date(quote.issue_date), 'PPP', { locale: fr })}</p>
              </div>
            </div>
            
            {quote.validity_date && (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <div className="text-sm">
                  <p className="text-gray-500">Validité</p>
                  <p className="font-medium">{format(new Date(quote.validity_date), 'PPP', { locale: fr })}</p>
                </div>
              </div>
            )}
            
            {quote.status === 'signed' && quote.signatures && quote.signatures.length > 0 && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="text-sm">
                  <p className="text-gray-500">Signé le</p>
                  <p className="font-medium">{format(new Date(quote.signatures[0].signed_at), 'PPP', { locale: fr })}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Zone de signature */}
      <QuoteSignatureComponent 
        quote={quote}
        onSuccess={handleSignatureSuccess}
        readOnly={quote.status === 'signed'}
      />
    </div>
  );
}

export default QuoteView;
