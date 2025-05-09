
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { NewClientForm } from "./NewClientForm";

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
          .order('name');
        
        if (error) throw error;
        
        setClients(data || []);
        setFilteredClients(data || []);
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
