
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Building, FileText, PlusCircle, Loader2 } from "lucide-react";
import { MobileNavigation } from "@/components/MobileNavigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Client } from "@/components/ClientSelector";
import { supabase } from "@/integrations/supabase/client";
import InvoicePaymentAlert from "@/components/InvoicePaymentAlert";

// Composant pour le formulaire d'ajout/modification de client
interface ClientFormProps {
  client: Partial<Client>;
  onSubmit: (client: Partial<Client>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function ClientForm({ client, onSubmit, onCancel, isSubmitting }: ClientFormProps) {
  const [name, setName] = useState(client.name || "");
  const [email, setEmail] = useState(client.email || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [address, setAddress] = useState(client.address || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...client,
      name,
      email,
      phone,
      address,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom / Raison sociale</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          value={phone || ""}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Textarea
          id="address"
          value={address || ""}
          onChange={(e) => setAddress(e.target.value)}
          className="min-h-[80px]"
        />
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting || !name || !email}
          className="bg-violet hover:bg-violet/90"
        >
          {isSubmitting ? "Enregistrement..." : client.id ? "Mettre à jour" : "Ajouter"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Clients() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [overdueCount, setOverdueCount] = useState(0);
  const { toast } = useToast();

  // Charger les clients depuis Supabase
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer la liste des clients
        const { data: clientsData, error } = await supabase
          .from('clients')
          .select('*');

        if (error) throw error;

        // Récupérer le nombre de factures pour chaque client
        const clientsWithCounts = await Promise.all(clientsData.map(async (client) => {
          const { data: countData } = await supabase.rpc(
            'get_client_invoice_count', 
            { client_id: client.id }
          );
          
          return {
            ...client,
            invoiceCount: countData || 0
          } as Client;
        }));

        setClients(clientsWithCounts);
        setFilteredClients(clientsWithCounts);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients. Veuillez réessayer.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Récupérer le nombre de factures en retard de paiement
    const fetchOverdueInvoices = async () => {
      try {
        const now = new Date().toISOString();
        const { count, error } = await supabase
          .from('stripe_invoices')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'unpaid')
          .lt('due_date', now);

        if (error) throw error;
        setOverdueCount(count || 0);
      } catch (error) {
        console.error("Erreur lors du chargement des factures en retard:", error);
      }
    };

    fetchClients();
    fetchOverdueInvoices();
  }, [toast]);

  // Filtrer les clients selon le terme de recherche
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

  // Ouvrir la boîte de dialogue pour ajouter un nouveau client
  const openAddClientDialog = () => {
    setCurrentClient({});
    setIsClientDialogOpen(true);
  };

  // Ouvrir la boîte de dialogue pour modifier un client existant
  const openEditClientDialog = (client: Client) => {
    setCurrentClient(client);
    setIsClientDialogOpen(true);
  };

  // Gérer la soumission du formulaire client
  const handleClientSubmit = async (clientData: Partial<Client>) => {
    setIsSubmitting(true);
    
    try {
      if (clientData.id) {
        // Mise à jour d'un client existant
        const { error } = await supabase
          .from('clients')
          .update({
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientData.id);
          
        if (error) throw error;
          
        toast({
          title: "Client mis à jour",
          description: `Les informations de ${clientData.name} ont été mises à jour avec succès.`
        });
        
        // Mettre à jour l'état local
        setClients(prevClients => 
          prevClients.map(c => 
            c.id === clientData.id ? { ...c, ...clientData } as Client : c
          )
        );
      } else {
        // Ajout d'un nouveau client
        const { data, error } = await supabase
          .from('clients')
          .insert({
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address
          })
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const newClient = {
            ...data[0],
            invoiceCount: 0
          } as Client;
          
          toast({
            title: "Client ajouté",
            description: `${newClient.name} a été ajouté à vos clients avec succès.`
          });
          
          // Ajouter le nouveau client à l'état local
          setClients(prevClients => [...prevClients, newClient]);
        }
      }
      
      setIsClientDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du client:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du client.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour facturer un client
  const invoiceClient = (client: Client) => {
    // Rediriger vers la page de facturation avec les informations du client pré-remplies
    toast({
      title: "Facturation",
      description: `Redirection vers la facturation pour ${client.name}...`
    });
    
    // Dans une vraie application, vous pourriez utiliser la navigation pour rediriger avec les params
    // navigate('/invoicing', { state: { client } });
  };

  // Voir les factures en retard
  const viewOverdueInvoices = () => {
    // Rediriger vers la page des factures avec un filtre pour les factures en retard
    // navigate('/invoices', { state: { filter: 'overdue' } });
    toast({
      title: "Factures en retard",
      description: "Redirection vers les factures en retard..."
    });
  };

  return (
    <>
      <Header 
        title="Clients" 
        description="Gérez vos clients récurrents"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-6">
        {overdueCount > 0 && (
          <InvoicePaymentAlert 
            overdueCount={overdueCount}
            onViewOverdue={viewOverdueInvoices}
          />
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un client..." 
              className="pl-10 bg-background" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            className="bg-violet hover:bg-violet/90"
            onClick={openAddClientDialog}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">Aucun client trouvé</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={openAddClientDialog}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter un client
                </Button>
              </div>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-2">{client.name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-start">
                            <Building className="h-4 w-4 mr-2 mt-0.5" />
                            <span>{client.address}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>{client.invoiceCount} facture{client.invoiceCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t flex">
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-none h-12"
                        onClick={() => openEditClientDialog(client)}
                      >
                        Modifier
                      </Button>
                      <div className="border-l h-12" />
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-none h-12"
                        onClick={() => invoiceClient(client)}
                      >
                        Facturer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Boîte de dialogue pour ajouter/modifier un client */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentClient.id ? "Modifier le client" : "Ajouter un client"}
            </DialogTitle>
          </DialogHeader>
          <ClientForm 
            client={currentClient} 
            onSubmit={handleClientSubmit}
            onCancel={() => setIsClientDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
