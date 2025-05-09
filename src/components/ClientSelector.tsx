import React, { useState, useEffect } from "react";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { NewClientForm } from "./NewClientForm";
import { DbClient } from "@/types/invoice";

// Export the Client type so it can be imported elsewhere
export interface Client {
  id: string;
  name: string;  // Corresponds to client_name in the database
  email: string;
  phone?: string;
  address?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: string;  // Corresponds to company_id in the database
  invoiceCount?: number;
}

// Function to map DbClient to Client
export const mapDbClientToClient = (dbClient: DbClient): Client => {
  return {
    id: dbClient.id,
    name: dbClient.client_name,
    email: dbClient.email || "",
    phone: dbClient.phone || undefined,
    address: dbClient.address || undefined,
    notes: dbClient.notes || null,
    created_at: dbClient.created_at,
    updated_at: dbClient.updated_at,
    user_id: dbClient.company_id || "",
    invoiceCount: 0
  };
};

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
}

export function ClientSelector({ onClientSelect }: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isNewClientFormOpen, setIsNewClientFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*');
        
        if (error) {
          console.error("Error fetching clients:", error);
          return;
        }
        
        const mappedClients = data.map((dbClient: DbClient) => mapDbClientToClient(dbClient));
        setClients(mappedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);
  
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    client.email.toLowerCase().includes(searchValue.toLowerCase())
  );
  
  const handleClientSelect = (client: Client) => {
    onClientSelect(client);
    setOpen(false);
  };
  
  const handleClientCreated = (newClient: Client) => {
    setClients([...clients, newClient]);
    onClientSelect(newClient);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            disabled={loading}
          >
            {onClientSelect ? (
              clients.find((client) => client.id === onClientSelect)?.name || "Sélectionner un client..."
            ) : (
              "Sélectionner un client..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Rechercher un client..." value={searchValue} onValueChange={setSearchValue} />
            {filteredClients.length > 0 ? (
              <CommandList>
                {filteredClients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={client.name}
                    onSelect={() => handleClientSelect(client)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        onClientSelect === client ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {client.name}
                  </CommandItem>
                ))}
              </CommandList>
            ) : (
              <CommandEmpty>Aucun client trouvé.</CommandEmpty>
            )}
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  setIsNewClientFormOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un nouveau client
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      <NewClientForm
        open={isNewClientFormOpen}
        onOpenChange={setIsNewClientFormOpen}
        onClientCreated={handleClientCreated}
      />
    </>
  );
}
