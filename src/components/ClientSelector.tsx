
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewClientForm } from "@/components/NewClientForm";
import { UserPlus } from "lucide-react";

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

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('client_name');
        
        if (error) throw error;
        
        // Adapter les données de Supabase au format Client attendu
        const adaptedClients = (data || []).map(client => ({
          ...client,
          name: client.client_name, // Mapping client_name à name pour la compatibilité
          user_id: client.company_id // Utilisation de company_id comme user_id
        }));
        
        setClients(adaptedClients as Client[]);
        setFilteredClients(adaptedClients as Client[]);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);
  
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
  };

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

