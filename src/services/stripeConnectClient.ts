
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StripeConnectionStatus {
  connected: boolean;
  accountId?: string;
  details?: {
    id: string;
    business_name?: string;
    business_type?: string;
    livemode: boolean;
    payouts_enabled?: boolean;
    charges_enabled?: boolean;
    connected_at: string;
  };
  message?: string;
}

interface StripeConnectResponse {
  url: string;
  state: string;
}

/**
 * Initiates the Stripe Connect OAuth flow
 * @returns URL to redirect the user to for authorization
 */
export const initiateStripeConnect = async (redirectUrl: string): Promise<StripeConnectResponse | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('initiate-stripe-connect', {
      body: { returnUrl: redirectUrl }
    });

    if (error) {
      console.error('Error initiating Stripe Connect:', error);
      toast.error('Impossible d\'initier la connexion Stripe');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error initiating Stripe Connect:', error);
    toast.error('Impossible d\'initier la connexion Stripe');
    return null;
  }
};

/**
 * Handles the callback from Stripe Connect OAuth
 * @param code Authorization code from Stripe
 * @param state State value for security validation
 * @returns Connection status
 */
export const handleStripeConnectCallback = async (code: string, state: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-connect-callback', {
      body: { code, state }
    });

    if (error) {
      console.error('Error handling Stripe Connect callback:', error);
      toast.error('Erreur lors de la connexion avec Stripe');
      return false;
    }

    if (data.success) {
      toast.success('Votre compte Stripe a été connecté avec succès');
      return true;
    } else {
      toast.error(data.message || 'Erreur lors de la connexion avec Stripe');
      return false;
    }
  } catch (error) {
    console.error('Error handling Stripe Connect callback:', error);
    toast.error('Erreur lors de la connexion avec Stripe');
    return false;
  }
};

/**
 * Checks the current user's Stripe connection status
 * @returns Connection status details
 */
export const checkStripeConnection = async (): Promise<StripeConnectionStatus> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-stripe-connection');

    if (error) {
      console.error('Error checking Stripe connection:', error);
      return { connected: false, message: 'Erreur lors de la vérification de la connexion Stripe' };
    }

    return data;
  } catch (error) {
    console.error('Error checking Stripe connection:', error);
    return { connected: false, message: 'Erreur lors de la vérification de la connexion Stripe' };
  }
};

/**
 * Disconnects a Stripe connected account
 * @param accountId Stripe account ID to disconnect
 * @returns Success status
 */
export const disconnectStripeAccount = async (accountId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('disconnect-stripe-account', {
      body: { accountId }
    });

    if (error) {
      console.error('Error disconnecting Stripe account:', error);
      toast.error('Impossible de déconnecter votre compte Stripe');
      return false;
    }

    if (data.success) {
      toast.success('Votre compte Stripe a été déconnecté avec succès');
      return true;
    } else {
      toast.error(data.message || 'Erreur lors de la déconnexion de votre compte Stripe');
      return false;
    }
  } catch (error) {
    console.error('Error disconnecting Stripe account:', error);
    toast.error('Impossible de déconnecter votre compte Stripe');
    return false;
  }
};
