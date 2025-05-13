
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "./ClientSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface NewClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: Client) => void;
}

export function NewClientForm({ open, onOpenChange, onClientCreated }: NewClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Réinitialiser les erreurs et les données à l'ouverture du formulaire
    if (open) {
      setAuthError(null);
      setDebugInfo(null);
    }
  }, [open]);

  // Fonction pour vérifier la session utilisateur courante
  const checkUserSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Session check:", session ? "Session active" : "Pas de session", error ? `Erreur: ${error.message}` : "Pas d'erreur");
      return { session, error };
    } catch (err) {
      console.error("Erreur lors de la vérification de session:", err);
      return { session: null, error: err };
    }
  };

  const handleSubmit = async () => {
    if (!clientName) {
      toast.error("Le nom du client est requis");
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setDebugInfo(null);

    try {
      // Vérifier la session utilisateur
      const { session, error: sessionError } = await checkUserSession();
      
      if (sessionError) {
        console.error("Erreur lors de la récupération de la session:", sessionError);
        setAuthError("Impossible de vérifier votre session. Veuillez vous reconnecter.");
        setDebugInfo({ type: "session_error", details: sessionError });
        return;
      }
      
      const userId = session?.user?.id;
      
      if (!userId) {
        console.warn("Aucun utilisateur connecté lors de la création du client");
        setAuthError("Vous devez être connecté pour créer un client. Veuillez vous connecter.");
        // Pour le débogage temporaire, permettre la création du client même sans utilisateur connecté
        // Décommenter la ligne ci-dessous pour les tests
        // const tempUserId = "00000000-0000-0000-0000-000000000000";
        // toast.info("Mode test: Utilisation d'un ID temporaire");
        return;
      }

      // Log pour débogage
      console.log("Création de client avec user ID:", userId);
      
      const clientData = {
        client_name: clientName,
        email: email || null,
        phone: phone || null,
        address: address || null,
        company_id: userId
      };
      
      console.log("Données du client à insérer:", clientData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du client:", error);
        setDebugInfo({ 
          type: "insert_error", 
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === '42501') {
          throw new Error("Vous n'avez pas les permissions nécessaires pour créer un client");
        } else if (error.code === '23503') {
          throw new Error("Erreur de référence: L'utilisateur n'existe pas dans la base de données");
        } else if (error.code === '23505') {
          throw new Error("Un client avec ces informations existe déjà");
        } else {
          throw error;
        }
      }

      toast.success("Client créé avec succès");
      
      // Mapper les propriétés pour assurer la compatibilité
      const clientResponse: Client = {
        ...data,
        name: data.client_name,
        user_id: data.company_id
      };
      
      // Pass the new client back to parent component
      onClientCreated(clientResponse);
      
      // Reset form fields
      setClientName("");
      setEmail("");
      setPhone("");
      setAddress("");
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast.error(error.message || "Erreur lors de la création du client");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
        </DialogHeader>

        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {debugInfo && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <details>
              <summary className="font-medium cursor-pointer">Informations de débogage</summary>
              <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Nom *</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nom du client ou entreprise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-phone">Téléphone</Label>
            <Input
              id="client-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-address">Adresse</Label>
            <Textarea
              id="client-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse postale"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !!authError}>
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-current rounded-full" />
                Traitement...
              </>
            ) : (
              "Créer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
