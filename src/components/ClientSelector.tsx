
import React, { useState, useEffect } from "react";
import { supabase, handleSupabaseError, isAuthenticated } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewClientForm } from "@/components/NewClientForm";
import { UserPlus, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface Client {
  id: string;
  name?: string;
  email: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
  invoiceCount?: number;
  // Champs de la table clients dans Supabase
  client_name?: string;
  company_id?: string | null;
  group_id?: string | null;
  reference_number?: string | null;
}

export interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
  buttonText?: string; // Propriété optionnelle pour personnaliser le texte du bouton
}

export const ClientSelector = ({ onClientSelect, buttonText }: ClientSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewClientFormOpen, setIsNewClientFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification avant de charger les données
    async function checkAuthAndLoadData() {
      setIsLoading(true);
      try {
        const isUserAuthenticated = await isAuthenticated();
        setAuthenticated(isUserAuthenticated);
        
        if (isUserAuthenticated) {
          await fetchClients();
        } else {
          setError("Vous devez être connecté pour accéder à cette fonctionnalité.");
          console.log("Utilisateur non authentifié dans ClientSelector");
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification:", err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthAndLoadData();
  }, []);
  
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Tentative de récupération des clients...");
      
      // Vérifier si la table clients existe avant de faire la requête
      const clientsTableExists = await supabase
        .from('clients')
        .select('count(*)', { count: 'exact', head: true })
        .then(({ error }) => !error);
        
      if (!clientsTableExists) {
        console.error("La table clients n'existe pas ou n'est pas accessible");
        setError("La table des clients n'est pas accessible. Veuillez contacter l'administrateur.");
        return;
      }

      // Récupérer l'ID de l'entreprise de l'utilisateur actuel
      const { data: sessionData } = await supabase.auth.getSession();
      let userId = sessionData.session?.user?.id;
      
      if (!userId) {
        setError("Impossible d'identifier l'utilisateur actuel.");
        setIsLoading(false);
        return;
      }
      
      // Récupérer l'entreprise de l'utilisateur
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (companyError && companyError.code !== 'PGRST116') {
        console.error("Erreur lors de la récupération de l'entreprise:", companyError);
        setError("Erreur lors de la récupération de votre entreprise.");
        setIsLoading(false);
        return;
      }
      
      const companyId = companyData?.id;
      
      // Récupérer tous les clients, filtrer côté client si company_id est disponible
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('client_name');
      
      if (error) {
        handleSupabaseError(error, "chargement des clients");
        setError("Impossible de charger la liste des clients.");
        return;
      }
      
      // Adapter les données de Supabase au format Client attendu
      // Si company_id est disponible, filtrer les clients par company_id
      const adaptedClients = (data || [])
        .map(client => ({
          ...client,
          name: client.client_name, // Mapping client_name à name pour la compatibilité
          user_id: client.company_id // Utilisation de company_id comme user_id
        }))
        .filter(client => !companyId || client.company_id === null || client.company_id === companyId);
      
      console.log(`${adaptedClients.length} clients récupérés avec succès`);
      
      // Afficher un avertissement si des clients n'ont pas de company_id
      const clientsWithoutCompany = adaptedClients.filter(client => !client.company_id).length;
      if (clientsWithoutCompany > 0 && companyId) {
        console.warn(`${clientsWithoutCompany} clients n'ont pas d'entreprise associée`);
        // Optionnel: associer automatiquement ces clients à l'entreprise actuelle
        try {
          const clientsToUpdate = data?.filter(c => !c.company_id).map(c => c.id) || [];
          if (clientsToUpdate.length > 0) {
            const { error: updateError } = await supabase
              .from('clients')
              .update({ company_id: companyId })
              .in('id', clientsToUpdate);
              
            if (!updateError) {
              console.log(`${clientsToUpdate.length} clients ont été associés à votre entreprise`);
              toast.success(`${clientsToUpdate.length} clients ont été associés à votre entreprise`);
              
              // Mettre à jour les données locales
              adaptedClients.forEach(client => {
                if (!client.company_id && clientsToUpdate.includes(client.id)) {
                  client.company_id = companyId;
                }
              });
            }
          }
        } catch (updateErr) {
          console.error("Erreur lors de l'association des clients:", updateErr);
        }
      }
      
      setClients(adaptedClients as Client[]);
      setFilteredClients(adaptedClients as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError("Une erreur est survenue lors du chargement des clients.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour forcer la mise à jour des données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClients();
    setIsRefreshing(false);
  };
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        (client.name?.toLowerCase().includes(lowercaseQuery) || client.client_name?.toLowerCase().includes(lowercaseQuery)) || 
        (client.email && client.email.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const handleNewClientCreated = (newClient: Client) => {
    setClients(prevClients => [...prevClients, newClient]);
    onClientSelect(newClient);
    setIsNewClientFormOpen(false);
    toast.success("Nouveau client créé avec succès");
  };

  // Si l'authentification est en cours de vérification
  if (authenticated === null && isLoading) {
    return (
      <div className="text-center p-4">
        <span className="animate-spin inline-block h-6 w-6 border-t-2 border-primary rounded-full" />
        <p className="mt-2">Vérification de votre session...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié
  if (authenticated === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vous devez être connecté pour accéder à cette fonctionnalité.
        </AlertDescription>
      </Alert>
    );
  }

  // Si une erreur s'est produite
  if (error) {
    return (
      <Alert variant="destructive">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Réessayer
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="search"
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {isLoading ? (
        <div className="text-center p-4">
          <span className="animate-spin inline-block h-6 w-6 border-t-2 border-primary rounded-full" />
          <p className="mt-2">Chargement des clients...</p>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-3 border-b last:border-0 flex items-center justify-between hover:bg-muted/50 cursor-pointer"
              onClick={() => onClientSelect(client)}
            >
              <div>
                <div className="font-medium">{client.name || client.client_name}</div>
                {client.email && (
                  <div className="text-sm text-muted-foreground">{client.email}</div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClientSelect(client)}>
                Sélectionner
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border rounded-md space-y-4">
          <p className="text-muted-foreground">Aucun client trouvé</p>
          
          <Button 
            variant="outline" 
            onClick={() => setIsNewClientFormOpen(true)}
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Créer un nouveau client
          </Button>
        </div>
      )}

      {/* Toujours afficher le bouton de création, même si des clients sont trouvés */}
      {filteredClients.length > 0 && (
        <Button 
          variant="outline" 
          onClick={() => setIsNewClientFormOpen(true)} 
          className="w-full"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un nouveau client
        </Button>
      )}

      <NewClientForm
        open={isNewClientFormOpen}
        onOpenChange={setIsNewClientFormOpen}
        onClientCreated={handleNewClientCreated}
      />
    </div>
  );
};
