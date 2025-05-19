
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
import { supabase, checkTableExists } from "@/integrations/supabase/client";
import { Client } from "./ClientSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [tablesChecked, setTablesChecked] = useState<{[key: string]: boolean}>({});
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
      setCompanyId(null);
      setDebugInfo(null);
      setTablesChecked({});

      if (!authLoading && isAuthenticated) {
        fetchUserCompany();
      } else if (!authLoading && !isAuthenticated) {
        setAuthError("Vous devez être connecté pour créer un client");
      }
    }
  }, [open, authLoading, isAuthenticated]);

  // Fonction pour forcer la vérification de l'entreprise
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setAuthError(null);
    setCompanyId(null);
    setDebugInfo(null);
    setTablesChecked({});
    
    // Force reconnection check
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Erreur de rafraîchissement de session:", error);
          setAuthError("Impossible de rafraîchir votre session. Veuillez vous reconnecter.");
          setDebugInfo(`Erreur session: ${error.message}`);
          setIsRefreshing(false);
          return;
        }
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de la session:", err);
    }
    
    await fetchUserCompany(true);
    setIsRefreshing(false);
  };

  // Vérifier l'existence de la table companies
  const checkCompaniesTable = async (): Promise<boolean> => {
    try {
      if (tablesChecked.companies) {
        return tablesChecked.companies;
      }
      
      // Log pour vérification
      console.log("Vérification de la table companies...");
      
      // Test simple pour vérifier si la table companies existe
      const tableExists = await checkTableExists('companies');
      console.log("La table companies existe-t-elle ?", tableExists);
      
      setTablesChecked(prev => ({...prev, companies: tableExists}));
      
      if (!tableExists) {
        console.error("La table companies n'existe pas");
        setAuthError("La table des entreprises n'existe pas. Veuillez configurer votre base de données.");
        setDebugInfo(`La vérification de la structure de la base de données a échoué.`);
        return false;
      }
      
      // Si pas d'erreur, la table existe
      console.log("La table companies existe");
      return true;
    } catch (error: any) {
      console.error("Exception lors de la vérification de la table companies:", error);
      setAuthError(`Erreur système: ${error.message || 'Erreur inconnue'}`);
      setDebugInfo(`Exception: ${JSON.stringify(error)}`);
      return false;
    }
  };

  // Fonction pour créer une entreprise par défaut
  const createDefaultCompany = async (userId: string): Promise<string | null> => {
    try {
      console.log("Tentative de création d'une entreprise par défaut pour l'utilisateur:", userId);
      
      const { data: newCompany, error: createError } = await supabase
        .from('companies')
        .insert({
          company_name: 'Mon Entreprise',
          user_id: userId,
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Erreur lors de la création d'une entreprise par défaut:", createError);
        setAuthError(`Impossible de créer une entreprise: ${createError.message}`);
        setDebugInfo(`Erreur création: ${JSON.stringify(createError)}`);
        return null;
      }
      
      console.log("Entreprise par défaut créée:", newCompany);
      toast.success("Une entreprise par défaut a été créée pour vous");
      return newCompany.id;
    } catch (error: any) {
      console.error("Exception lors de la création d'une entreprise:", error);
      setAuthError(`Erreur lors de la création d'une entreprise: ${error.message || 'Erreur inconnue'}`);
      setDebugInfo(`Exception création: ${JSON.stringify(error)}`);
      return null;
    }
  };

  // Fonction pour récupérer l'entreprise de l'utilisateur
  const fetchUserCompany = async (forceRefresh = false) => {
    setIsCompanyLoading(true);
    setAuthError(null);
    
    try {
      // Log pour vérifier si la fonction est appelée
      console.log("Tentative de récupération de l'entreprise de l'utilisateur", forceRefresh ? "(rafraîchissement forcé)" : "");
      
      // Vérifier d'abord que la table existe
      const tableExists = await checkCompaniesTable();
      if (!tableExists) {
        setIsCompanyLoading(false);
        return;
      }
      
      // Obtenir la session utilisateur courante
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur lors de la récupération de la session:", sessionError);
        setAuthError("Impossible de vérifier votre session. Veuillez vous reconnecter.");
        setDebugInfo(`Erreur session: ${JSON.stringify(sessionError)}`);
        setIsCompanyLoading(false);
        return;
      }
      
      if (!sessionData.session || !sessionData.session.user) {
        console.warn("Aucun utilisateur connecté dans fetchUserCompany");
        setAuthError("Vous devez être connecté pour créer un client");
        setDebugInfo("Pas de session utilisateur active");
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
      
      // Récupérer l'entreprise associée à l'utilisateur
      console.log("Exécution de la requête pour récupérer l'entreprise avec user_id =", userId);
      
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, company_name, user_id')
        .eq('user_id', userId);

      console.log("Résultat de la requête companies:", { data: companies, error: companiesError });
      
      if (companiesError) {
        console.error("Erreur détaillée lors de la récupération de l'entreprise:", companiesError);
        
        if (companiesError.code === '42P01') {
          setAuthError("La table des entreprises n'existe pas encore. Veuillez exécuter la migration SQL pour configurer votre base de données.");
          setDebugInfo(`Erreur table: ${JSON.stringify(companiesError)}`);
        } else {
          setAuthError(`Erreur lors de la récupération de votre entreprise: ${companiesError.message || 'Erreur inconnue'}`);
          setDebugInfo(`Erreur récupération: ${JSON.stringify(companiesError)}`);
        }
        
        setIsCompanyLoading(false);
        return;
      }

      if (!companies || companies.length === 0) {
        console.warn("Aucune entreprise trouvée pour l'utilisateur, tentative de création");
        setDebugInfo("Aucune entreprise trouvée. Création d'une entreprise par défaut...");
        
        // Créer automatiquement une entreprise par défaut
        const newCompanyId = await createDefaultCompany(userId);
        
        if (newCompanyId) {
          setCompanyId(newCompanyId);
          setAuthError(null);
        }
        
        setIsCompanyLoading(false);
        return;
      }

      // Sélection de la première entreprise par défaut
      console.log("Entreprise récupérée avec succès:", companies[0].company_name, "ID:", companies[0].id);
      setCompanyId(companies[0].id);
      setDebugInfo(`Entreprise trouvée: ${companies[0].company_name}`);
      setAuthError(null);
    } catch (error: any) {
      console.error("Exception non gérée lors de la récupération de l'entreprise:", error);
      setAuthError(`Une erreur inattendue est survenue: ${error.message || 'Erreur inconnue'}`);
      setDebugInfo(`Exception générale: ${JSON.stringify(error)}`);
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
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2">Rafraîchir</span>
            </Button>
          </Alert>
        )}

        {debugInfo && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-xs font-mono">{debugInfo}</AlertDescription>
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
