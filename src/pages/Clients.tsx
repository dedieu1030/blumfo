
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Building, FileText, PlusCircle } from "lucide-react";
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
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Textarea
          id="address"
          value={address}
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
  const { toast } = useToast();

  // Charger les clients depuis le localStorage (ou une API dans une application réelle)
  useEffect(() => {
    const loadClients = () => {
      const savedClients = localStorage.getItem('clients');
      
      // Utiliser des données mockées si aucun client n'est sauvegardé
      const mockClients = [
        {
          id: "1",
          name: "SCI Legalis",
          email: "contact@scilegalis.fr",
          phone: "01 23 45 67 89",
          address: "15 rue du Palais, 75001 Paris",
          invoiceCount: 3,
        },
        {
          id: "2",
          name: "Cabinet Lefort",
          email: "contact@cabinet-lefort.fr",
          phone: "01 23 45 67 90",
          address: "24 avenue des Avocats, 75008 Paris",
          invoiceCount: 1,
        },
        {
          id: "3",
          name: "Me. Dubois",
          email: "dubois@avocat.fr",
          phone: "01 23 45 67 91",
          address: "5 place de la Justice, 75016 Paris",
          invoiceCount: 2,
        }
      ];
      
      const clientsList = savedClients ? JSON.parse(savedClients) : mockClients;
      setClients(clientsList);
      setFilteredClients(clientsList);
    };

    loadClients();
  }, []);

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
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // Sauvegarder les clients dans localStorage
  const saveClientsToStorage = (updatedClients: Client[]) => {
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

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
  const handleClientSubmit = (clientData: Partial<Client>) => {
    setIsSubmitting(true);
    
    try {
      // Simulation d'un appel API avec setTimeout
      setTimeout(() => {
        let updatedClients: Client[];
        
        if (clientData.id) {
          // Mise à jour d'un client existant
          updatedClients = clients.map(c => 
            c.id === clientData.id ? { ...c, ...clientData } as Client : c
          );
          
          toast({
            title: "Client mis à jour",
            description: `Les informations de ${clientData.name} ont été mises à jour avec succès.`
          });
        } else {
          // Ajout d'un nouveau client
          const newClient = {
            id: Date.now().toString(),
            name: clientData.name || "",
            email: clientData.email || "",
            phone: clientData.phone || "",
            address: clientData.address || "",
            invoiceCount: 0
          } as Client;
          
          updatedClients = [...clients, newClient];
          
          toast({
            title: "Client ajouté",
            description: `${newClient.name} a été ajouté à vos clients avec succès.`
          });
        }
        
        setClients(updatedClients);
        saveClientsToStorage(updatedClients);
        setIsClientDialogOpen(false);
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du client:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du client.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // Fonction pour facturer un client
  const invoiceClient = (client: Client) => {
    // Ici, vous redirigeriez vers la page de facturation avec les informations du client pré-remplies
    // Pour l'instant, nous affichons simplement une notification
    toast({
      title: "Facturation",
      description: `Redirection vers la facturation pour ${client.name}...`
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
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <Building className="h-4 w-4 mr-2 mt-0.5" />
                        <span>{client.address}</span>
                      </div>
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
