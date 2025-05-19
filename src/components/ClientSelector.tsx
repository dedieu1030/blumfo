
import React, { useState, useEffect } from "react";
import { supabase, handleSupabaseError, isAuthenticated, verifyCompaniesTable } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewClientForm } from "@/components/NewClientForm";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";
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

  useEffect(() => {
    // Vérifier l'authentification et les tables nécessaires avant de charger les données
    async function checkAuthAndLoadData() {
      setIsLoading(true);
      try {
        const isUserAuthenticated = await isAuthenticated();
        setAuthenticated(isUserAuthenticated);
        
        if (isUserAuthenticated) {
          // Vérifier si la table companies existe et contient des données pour l'utilisateur
          const { exists, message } = await verifyCompaniesTable();
          if (!exists) {
            setError(message || "Configuration d'entreprise requise avant d'accéder aux clients.");
            console.log("Problème avec la table companies:", message);
            return;
          }
          
          // Vérifier si la table clients existe avant de tenter de la requêter
          const clientsExist = await supabase
            .from('clients')
            .select('count(*)', { count: 'exact', head: true })
            .then(({ error }) => !error);
            
          if (!clientsExist) {
            setError("La table des clients n'existe pas ou n'est pas accessible. Veuillez contacter l'administrateur.");
            console.error("La table clients n'existe pas ou n'est pas accessible");
            return;
          }
          
          // Si toutes les vérifications sont passées, charger les clients
          await fetchClients();
        } else {
          setError("Vous devez être connecté pour accéder à cette fonctionnalité.");
          console.log("Utilisateur non authentifié dans ClientSelector");
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification ou des tables:", err);
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
      console.log("Récupération des clients...");
      
      // Récupérer d'abord l'entreprise associée à l'utilisateur actuel
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;
      
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
        
      if (companiesError) {
        handleSupabaseError(companiesError, "récupération de l'entreprise");
        setError("Impossible de déterminer votre entreprise. Veuillez vérifier la configuration.");
        return;
      }
      
      if (!companies || companies.length === 0) {
        setError("Aucune entreprise trouvée pour votre compte. Veuillez créer une entreprise d'abord.");
        return;
      }
      
      const companyId = companies[0].id;
      console.log(`Récupération des clients pour l'entreprise ${companyId}`);
      
      // Maintenant récupérer les clients associés à cette entreprise
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId)
        .order('client_name');
      
      if (error) {
        handleSupabaseError(error, "chargement des clients");
        setError("Impossible de charger la liste des clients.");
        return;
      }
      
      // Adapter les données de Supabase au format Client attendu
      const adaptedClients = (data || []).map(client => ({
        ...client,
        name: client.client_name, // Mapping client_name à name pour la compatibilité
        user_id: client.company_id // Utilisation de company_id comme user_id
      }));
      
      console.log(`${adaptedClients.length} clients récupérés avec succès`);
      setClients(adaptedClients as Client[]);
      setFilteredClients(adaptedClients as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError("Une erreur est survenue lors du chargement des clients.");
    } finally {
      setIsLoading(false);
    }
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
        <Loader2 className="h-6 w-6 animate-spin inline-block text-primary" />
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
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
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
          <Loader2 className="h-6 w-6 animate-spin inline-block text-primary" />
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
