
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

export interface Client {
  id: string;
  name: string; // Maps to client_name in DB
  email: string;
  address: string;
  phone?: string;
}

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
}

export function ClientSelector({ onClientSelect }: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase.from('clients').select('*');
        
        if (error) {
          console.error('Error fetching clients:', error);
          return;
        }
        
        // Map database fields to Client interface
        const mappedClients = data.map(client => ({
          id: client.id,
          name: client.client_name, // Map client_name to name
          email: client.email || '',
          address: client.address || '',
          phone: client.phone || ''
        }));
        
        setClients(mappedClients);
        setFilteredClients(mappedClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    
    fetchClients();
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (!value) {
      setFilteredClients(clients);
      return;
    }
    
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(value.toLowerCase()) || 
      client.email.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredClients(filtered);
  };

  return (
    <div className="flex flex-col">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {searchValue || "Sélectionner un client existant..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput 
              placeholder="Rechercher un client..." 
              onValueChange={handleSearch} 
              value={searchValue}
            />
            <CommandEmpty>Aucun client trouvé.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-auto">
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onClientSelect(client);
                    setSearchValue(client.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      searchValue === client.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{client.name}</span>
                    {client.email && <span className="text-xs text-muted-foreground">{client.email}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
