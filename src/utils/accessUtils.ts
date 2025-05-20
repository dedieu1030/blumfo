
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Répare l'accès aux clients en nettoyant les politiques RLS
 * et en associant les clients sans entreprise à l'entreprise de l'utilisateur
 * @returns {Promise<boolean>} true si la réparation est réussie
 */
export async function fixClientAccess(): Promise<boolean> {
  try {
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return false;
    }

    // Récupérer un token JWT pour l'authentification
    const { data: { session: updatedSession } } = await supabase.auth.refreshSession();
    if (!updatedSession) {
      toast.error("Impossible de rafraîchir votre session");
      return false;
    }

    const token = updatedSession.access_token;
    
    // Appeler la fonction Edge pour réparer l'accès
    toast.loading("Réparation de l'accès aux clients en cours...");
    
    // Utiliser l'URL complète de la fonction Edge déployée
    const response = await fetch(
      `https://svrsfzpkqleyzfllmkcd.supabase.co/functions/v1/fix-client-access`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Erreur lors de la réparation de l'accès aux clients:", result);
      toast.error(result.error || "Impossible de réparer l'accès aux clients");
      return false;
    }
    
    // Afficher les résultats
    if (result.clients_associated && result.clients_associated > 0) {
      toast.success(`${result.clients_associated} clients ont été associés à votre entreprise`);
    } else {
      toast.success("L'accès aux clients a été réparé");
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la réparation de l'accès aux clients:", error);
    toast.error("Une erreur s'est produite lors de la réparation de l'accès aux clients");
    return false;
  }
}
