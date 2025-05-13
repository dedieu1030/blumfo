
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
import { toast } from "@/components/ui/use-toast";
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
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  // Réinitialiser les états lorsque la modal s'ouvre
  useEffect(() => {
    if (open) {
      // Réinitialisation des champs et des erreurs
      setClientName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setAuthError(null);

      if (!authLoading && isAuthenticated) {
        fetchUserCompany();
      } else if (!authLoading && !isAuthenticated) {
        setAuthError("Vous devez être connecté pour créer un client");
      }
    }
  }, [open, authLoading, isAuthenticated]);

  // Fonction pour récupérer l'entreprise de l'utilisateur
  const fetchUserCompany = async () => {
    setIsCompanyLoading(true);
    setAuthError(null);
    
    try {
      // Log pour vérifier si la fonction est appelée
      console.log("Tentative de récupération de l'entreprise de l'utilisateur");
      
      // Obtenir la session utilisateur courante
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur lors de la récupération de la session:", sessionError);
        setAuthError("Impossible de vérifier votre session. Veuillez vous reconnecter.");
        setIsCompanyLoading(false);
        return;
      }
      
      if (!sessionData.session || !sessionData.session.user) {
        console.warn("Aucun utilisateur connecté dans fetchUserCompany");
        setAuthError("Vous devez être connecté pour créer un client");
        setIsCompanyLoading(false);
        return;
      }

      const userId = sessionData.session.user.id;
      console.log("ID utilisateur récupéré:", userId);
      
      // Vérifier que l'utilisateur a bien un ID
      if (!userId) {
        console.error("ID utilisateur non disponible");
        setAuthError("Impossible d'identifier votre compte utilisateur");
        setIsCompanyLoading(false);
        return;
      }
      
      // Récupérer l'entreprise associée à l'utilisateur avec plus de détails pour le debug
      console.log("Exécution de la requête pour récupérer l'entreprise avec user_id =", userId);
      
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, company_name, user_id')
        .eq('user_id', userId);

      console.log("Résultat de la requête companies:", { data: companies, error: companiesError });
      
      if (companiesError) {
        console.error("Erreur détaillée lors de la récupération de l'entreprise:", companiesError);
        setAuthError(`Erreur lors de la récupération de votre entreprise: ${companiesError.message || 'Erreur inconnue'}`);
        setIsCompanyLoading(false);
        return;
      }

      if (!companies || companies.length === 0) {
        console.warn("Aucune entreprise trouvée pour l'utilisateur");
        setAuthError("Aucune entreprise trouvée pour votre compte. Veuillez créer une entreprise d'abord.");
        
        // Vérifions si l'utilisateur existe bien dans la base de données - correction de l'erreur ici
        try {
          const { count, error: countError } = await supabase
            .from('companies')
            .select('*', { count: 'exact', head: true });
            
          console.log("Vérification des entreprises disponibles:", { 
            count, 
            error: countError 
          });
        } catch (countError) {
          console.error("Erreur lors du comptage des entreprises:", countError);
        }
        
        setIsCompanyLoading(false);
        return;
      }

      // Sélection de la première entreprise par défaut
      setCompanyId(companies[0].id);
      console.log("Entreprise récupérée avec succès:", companies[0].company_name, "ID:", companies[0].id);
    } catch (error: any) {
      console.error("Exception non gérée lors de la récupération de l'entreprise:", error);
      setAuthError(`Une erreur inattendue est survenue: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsCompanyLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!clientName) {
      toast({
        title: "Erreur",
        description: "Le nom du client est requis",
        variant: "destructive"
      });
      return;
    }

    if (!companyId) {
      toast({
        title: "Erreur",
        description: "Impossible de créer un client sans entreprise associée",
        variant: "destructive"
      });
      console.error("Tentative de création de client sans company_id défini");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      console.log("Création de client avec company ID:", companyId);
      
      // Vérification supplémentaire de l'authentification
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Session expirée, veuillez vous reconnecter");
      }
      
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
        console.error("Détails de l'erreur lors de la création du client:", error);
        throw error;
      }

      toast({
        title: "Succès",
        description: "Client créé avec succès",
        variant: "success"
      });
      
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
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du client",
        variant: "destructive"
      });
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
