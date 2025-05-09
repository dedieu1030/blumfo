
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { NewClientForm } from "./NewClientForm";
import { DbClient } from "@/types/invoice";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  invoiceCount?: number;
}

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
  buttonText?: string;
}

// Fonction d'adaptation depuis les données de la base Supabase vers notre modèle Client
// Exporter la fonction pour la réutiliser ailleurs (y compris dans NewClientForm)
export const mapDbClientToClient = (dbClient: DbClient, invoiceCount: number = 0): Client => {
  return {
    id: dbClient.id,
    name: dbClient.client_name,
    email: dbClient.email || "",
    phone: dbClient.phone || undefined,
    address: dbClient.address || undefined,
    notes: dbClient.notes,
    created_at: dbClient.created_at,
    updated_at: dbClient.updated_at,
    user_id: dbClient.company_id || "", // Utilisation de company_id comme une sorte de user_id
    invoiceCount
  };
};

export const ClientSelector = ({ onClientSelect, buttonText = "Créer un nouveau client" }: ClientSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('client_name');
        
        if (error) throw error;
        
        // Adapter les données de la base de données pour correspondre à notre modèle Client
        const mappedClients = (data || []).map((dbClient: DbClient) => 
          mapDbClientToClient(dbClient)
        );
        
        setClients(mappedClients);
        setFilteredClients(mappedClients);
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
        client.name.toLowerCase().includes(lowercaseQuery) || 
        (client.email && client.email.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);
  
  const handleClientCreated = (newClient: Client) => {
    // Add the new client to the clients list
    setClients(prevClients => [...prevClients, newClient]);
    
    // Select the newly created client
    onClientSelect(newClient);
    
    // Close the form
    setShowNewClientForm(false);
  };

  return (
    <>
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
                  <div className="font-medium">{client.name}</div>
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
          <div className="text-center p-4 border rounded-md">
            <p className="text-muted-foreground">Aucun client trouvé</p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => setShowNewClientForm(true)}
        >
          <User className="h-4 w-4" />
          {buttonText}
        </Button>
      </div>

      <NewClientForm 
        open={showNewClientForm} 
        onOpenChange={setShowNewClientForm} 
        onClientCreated={handleClientCreated} 
      />
    </>
  );
};
