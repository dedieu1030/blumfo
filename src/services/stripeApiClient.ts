
import { InvoiceData } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";

// Envoyer une facture via email depuis Stripe
export const sendInvoice = async (stripeInvoiceId: string) => {
  try {
    // Appeler la fonction Edge pour envoyer la facture
    const { data, error } = await supabase.functions.invoke('send-invoice', {
      body: { stripeInvoiceId }
    });

    if (error) {
      console.error('Erreur lors de l\'appel à la fonction send-invoice:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la facture:', error);
    return { success: false, error: "Une erreur est survenue lors de l'envoi de la facture" };
  }
};

// Créer un lien de paiement pour une facture
export const createPaymentLink = async (stripeInvoiceId: string) => {
  try {
    // Appeler la fonction Edge pour créer un lien de paiement
    const { data, error } = await supabase.functions.invoke('create-payment-link', {
      body: { stripeInvoiceId }
    });

    if (error) {
      console.error('Erreur lors de l\'appel à la fonction create-payment-link:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la création du lien de paiement:', error);
    return { success: false, error: "Une erreur est survenue lors de la création du lien de paiement" };
  }
};

// Créer une nouvelle facture avec Stripe
export const createStripeInvoice = async (invoiceData: InvoiceData) => {
  try {
    // Appeler la fonction Edge pour créer une facture
    const { data, error } = await supabase.functions.invoke('create-stripe-invoice', {
      body: { invoiceData }
    });

    if (error) {
      console.error('Erreur lors de l\'appel à la fonction create-stripe-invoice:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return { success: false, error: "Une erreur est survenue lors de la création de la facture" };
  }
};
