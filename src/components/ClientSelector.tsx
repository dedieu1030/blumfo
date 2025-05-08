
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Type for a client
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  invoiceCount: number;
}

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
}

export function ClientSelector({ onClientSelect }: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const { data: clientsData, error } = await supabase
          .from('clients')
          .select('*');

        if (error) throw error;

        // Format the data and add invoice count
        const formattedClients = await Promise.all(clientsData.map(async (client) => {
          const { data: countData } = await supabase.rpc(
            'get_client_invoice_count', 
            { client_id: client.id }
          );
          
          return {
            ...client,
            invoiceCount: countData || 0
          } as Client;
        }));

        setClients(formattedClients);
        setFilteredClients(formattedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients. Veuillez réessayer.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchClients();
    }
  }, [isOpen, toast]);

  // Filter clients based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const handleClientSelect = (client: Client) => {
    onClientSelect(client);
    setIsOpen(false);
    toast({
      title: "Client sélectionné",
      description: `${client.name} a été sélectionné pour cette facture.`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Choisir un client existant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sélectionner un client</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full mt-4 mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un client..." 
            className="pl-10 bg-background" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Chargement des clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun client trouvé</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleClientSelect(client)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                    <p className="text-sm text-muted-foreground">{client.address}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.invoiceCount} facture{client.invoiceCount > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setIsOpen(false)}
            size="sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Créer un nouveau client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
