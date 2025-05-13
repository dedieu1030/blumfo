
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

  useEffect(() => {
    // Réinitialiser les erreurs à l'ouverture du formulaire
    if (open) {
      setAuthError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!clientName) {
      toast.error("Le nom du client est requis");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      // Obtenir la session utilisateur courante
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur lors de la récupération de la session:", sessionError);
        throw new Error("Impossible de vérifier votre session. Veuillez vous reconnecter.");
      }
      
      const userId = session?.user?.id;
      
      if (!userId) {
        console.warn("Aucun utilisateur connecté lors de la création du client");
        setAuthError("Vous devez être connecté pour créer un client. Veuillez vous connecter.");
        return;
      }

      // Log pour débogage
      console.log("Création de client avec user ID:", userId);
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          client_name: clientName,
          email: email || null,
          phone: phone || null,
          address: address || null,
          company_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du client:", error);
        if (error.code === '42501') {
          throw new Error("Vous n'avez pas les permissions nécessaires pour créer un client");
        } else {
          throw error;
        }
      }

      toast.success("Client créé avec succès");
      
      // Mapper les propriétés pour assurer la compatibilité
      const clientData: Client = {
        ...data,
        name: data.client_name,
        user_id: data.company_id
      };
      
      // Pass the new client back to parent component
      onClientCreated(clientData);
      
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
