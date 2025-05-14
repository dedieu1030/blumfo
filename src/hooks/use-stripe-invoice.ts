
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/use-user-profile';
import { toast } from 'sonner';

interface CreateInvoiceParams {
  clientId: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate?: string;
  notes?: string;
}

interface StripeInvoice {
  id: string;
  invoiceNumber: string;
  amountDue: number;
  currency: string;
  status: string;
  dueDate: string | null;
  hostedInvoiceUrl: string | null;
}

export function useStripeInvoice() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useUserProfile();

  const createInvoice = async (params: CreateInvoiceParams): Promise<StripeInvoice | null> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!profile) {
        throw new Error('Vous devez être connecté pour créer une facture');
      }
      
      // Appeler la fonction edge pour créer une facture Stripe
      const { data, error: invoiceError } = await supabase.functions.invoke('create-stripe-invoice', {
        body: {
          clientId: params.clientId,
          items: params.items,
          dueDate: params.dueDate,
          notes: params.notes,
          userId: profile.id
        }
      });

      if (invoiceError) {
        throw new Error(invoiceError.message || 'Erreur lors de la création de la facture');
      }
      
      if (!data) {
        throw new Error('Aucune donnée reçue de Stripe');
      }

      toast.success('Facture créée avec succès');
      return data as StripeInvoice;
    } catch (err: any) {
      console.error('Erreur lors de la création de la facture:', err);
      setError(err);
      toast.error(err.message || 'Erreur lors de la création de la facture');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvoice,
    loading,
    error
  };
}
