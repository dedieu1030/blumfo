
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
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Réinitialiser les erreurs à l'ouverture du formulaire
    if (open) {
      setAuthError(null);
      
      // S'assurer que l'authentification est complétée avant de tenter de récupérer l'entreprise
      if (!authLoading && isAuthenticated) {
        // Attendre un court instant pour s'assurer que le contexte d'authentification est pleinement chargé
        const timer = setTimeout(() => {
          fetchUserCompany();
        }, 500); // Délai de 500ms pour s'assurer que tout est bien initialisé
        
        return () => clearTimeout(timer);
      } else if (!authLoading && !isAuthenticated) {
        setAuthError("Vous devez être connecté pour créer un client. Veuillez vous connecter.");
      }
    }
  }, [open, authLoading, isAuthenticated]);

  // Fonction pour récupérer l'entreprise de l'utilisateur
  const fetchUserCompany = async () => {
    setIsCompanyLoading(true);
    setAuthError(null);
    
    try {
      console.log("Tentative de récupération de l'entreprise...");
      
      // Obtenir la session utilisateur courante
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur lors de la récupération de la session:", sessionError);
        setAuthError("Impossible de vérifier votre session. Veuillez vous reconnecter.");
        setIsCompanyLoading(false);
        return;
      }
      
      const userId = session?.user?.id;
      
      if (!userId) {
        console.warn("Aucun utilisateur connecté lors de la récupération de l'entreprise");
        setAuthError("Vous devez être connecté pour créer un client. Veuillez vous connecter.");
        setIsCompanyLoading(false);
        return;
      }

      console.log("Utilisateur connecté avec ID:", userId);

      // Récupérer l'entreprise associée à l'utilisateur
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, company_name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (companiesError) {
        console.error("Erreur lors de la récupération de l'entreprise:", companiesError);
        setAuthError("Erreur lors de la récupération de votre entreprise. Veuillez réessayer.");
        setIsCompanyLoading(false);
        return;
      }

      console.log("Entreprises trouvées:", companies?.length);

      if (!companies || companies.length === 0) {
        console.warn("Aucune entreprise trouvée pour l'utilisateur");
        setAuthError("Aucune entreprise trouvée pour votre compte. Veuillez créer une entreprise d'abord.");
        setIsCompanyLoading(false);
        return;
      }

      console.log("Entreprise sélectionnée:", companies[0].company_name, "ID:", companies[0].id);
      setCompanyId(companies[0].id);
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'entreprise:", error);
      setAuthError("Une erreur est survenue. Veuillez réessayer plus tard.");
    } finally {
      setIsCompanyLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!clientName) {
      toast.error("Le nom du client est requis");
      return;
    }

    if (!companyId) {
      toast.error("Impossible de créer un client sans entreprise associée");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      console.log("Création de client avec company ID:", companyId);
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          client_name: clientName,
          email: email || null,
          phone: phone || null,
          address: address || null,
          company_id: companyId
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

        {isCompanyLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Chargement des informations de votre entreprise...</span>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isCompanyLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || isCompanyLoading || !!authError || !companyId}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
