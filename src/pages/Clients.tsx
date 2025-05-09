
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Phone, Building, FileText, PlusCircle, Loader2, Tag } from "lucide-react";
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
import { Client, DbClient } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import InvoicePaymentAlert from "@/components/InvoicePaymentAlert";
import { checkOverdueInvoices } from "@/services/reminderService";
import { Badge } from "@/components/ui/badge";
import { mapDbClientToClient } from "@/components/ClientSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Type definitions
interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface ClientWithCategories extends Client {
  categories: {
    category_id: string;
    category_name: string;
    category_color: string;
  }[];
}

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
  const [notes, setNotes] = useState(client.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...client,
      name,
      email,
      phone,
      address,
      notes,
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
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes || ""}
          onChange={(e) => setNotes(e.target.value)}
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
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clients, setClients] = useState<ClientWithCategories[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientWithCategories[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [overdueCount, setOverdueCount] = useState(0);
  const [nearDueCount, setNearDueCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger les clients depuis Supabase
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Handle the case where there's no logged-in user
          setClients([]);
          setFilteredClients([]);
          setIsLoading(false);
          return;
        }
        
        // Récupérer la liste des clients
        const { data: clientsData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        // Fetch categories for all clients
        const clientsWithCategories = await Promise.all((clientsData || []).map(async (dbClient: any) => {
          // Récupérer le nombre de factures pour chaque client
          // Using type assertion to bypass type checking issues with Supabase client
          const { data: countData } = await (supabase as any).rpc(
            'get_client_invoice_count', 
            { client_id: dbClient.id }
          );
          
          // Récupérer les catégories pour chaque client
          const { data: categoryData, error: categoryError } = await supabase.rpc(
            'get_client_categories',
            { p_client_id: dbClient.id }
          );
          
          if (categoryError) {
            console.error("Error fetching client categories:", categoryError);
          }
          
          // Convertir en format Client
          const client = mapDbClientToClient(dbClient as DbClient, countData || 0);
          
          return {
            ...client,
            categories: categoryData || []
          } as ClientWithCategories;
        }));

        setClients(clientsWithCategories);
        setFilteredClients(clientsWithCategories);
        
        // Also fetch all categories for the filter dropdown
        const { data: allCategories, error: categoriesError } = await supabase
          .from('client_categories')
          .select('id, name, color')
          .order('name');
          
        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
        } else {
          setCategories(allCategories || []);
        }
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

    // Check for overdue invoices
    const fetchOverdueData = async () => {
      try {
        const result = await checkOverdueInvoices();
        if (result.success) {
          setOverdueCount(result.overdueCount);
          setNearDueCount(result.nearDueCount);
        }
      } catch (error) {
        console.error("Error checking overdue invoices:", error);
      }
    };

    fetchClients();
    fetchOverdueData();
  }, [toast]);

  // Apply filters (search and category)
  useEffect(() => {
    let result = [...clients];
    
    // Apply search term filter
    if (searchTerm.trim()) {
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.notes && client.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategoryId) {
      result = result.filter(client => 
        client.categories.some(cat => cat.category_id === selectedCategoryId)
      );
    }

    setFilteredClients(result);
  }, [searchTerm, selectedCategoryId, clients]);

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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non authentifié");
      }
      
      if (clientData.id) {
        // Mise à jour d'un client existant - convertir en format compatible avec la DB
        const dbClientData = {
          client_name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          notes: clientData.notes,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('clients')
          .update(dbClientData)
          .eq('id', clientData.id);
          
        if (error) throw error;
          
        toast({
          title: "Client mis à jour",
          description: `Les informations de ${clientData.name} ont été mises à jour avec succès.`
        });
        
        // Mettre à jour l'état local
        setClients(prevClients => 
          prevClients.map(c => 
            c.id === clientData.id ? { ...c, ...clientData as Client } as ClientWithCategories : c
          )
        );
      } else {
        // Ajout d'un nouveau client
        const dbClientData = {
          client_name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          notes: clientData.notes,
          user_id: user.id // Add the user_id field
        };
        
        const { data, error } = await supabase
          .from('clients')
          .insert(dbClientData)
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const newDbClient = data[0] as DbClient;
          const newClient = mapDbClientToClient(newDbClient, 0);
          
          const newClientWithCategories = {
            ...newClient,
            categories: []
          } as ClientWithCategories;
          
          toast({
            title: "Client ajouté",
            description: `${newClient.name} a été ajouté à vos clients avec succès.`
          });
          
          // Ajouter le nouveau client à l'état local
          setClients(prevClients => [...prevClients, newClientWithCategories]);
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

  // Fonction pour voir les détails d'un client
  const viewClientDetails = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  // Fonction pour facturer un client
  const invoiceClient = (client: Client) => {
    navigate(`/invoicing?client=${client.id}`);
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

  // Voir les factures proches de l'échéance
  const viewNearDueInvoices = () => {
    toast({
      title: "Factures à échéance proche",
      description: "Redirection vers les factures à échéance proche..."
    });
    // Dans une vraie application, vous redirigeriez vers /invoices avec un filtre approprié
  };
  
  // Reset category filter
  const clearCategoryFilter = () => {
    setSelectedCategoryId(null);
  };

  return (
    <>
      <Header 
        title="Clients" 
        description="Gérez vos clients récurrents"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-6">
        {(overdueCount > 0 || nearDueCount > 0) && (
          <InvoicePaymentAlert 
            overdueCount={overdueCount}
            nearDueCount={nearDueCount}
            onViewOverdue={viewOverdueInvoices}
            onViewNearDue={viewNearDueInvoices}
          />
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un client..." 
                className="pl-10 bg-background" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={selectedCategoryId ? "secondary" : "outline"}>
                    <Tag className="mr-2 h-4 w-4" />
                    {selectedCategoryId 
                      ? categories.find(c => c.id === selectedCategoryId)?.name || "Catégorie"
                      : "Catégories"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtrer par catégorie</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map(category => (
                    <DropdownMenuItem 
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className="cursor-pointer flex items-center"
                    >
                      {category.color && (
                        <span 
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></span>
                      )}
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                  {selectedCategoryId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={clearCategoryFilter}
                        className="cursor-pointer text-primary"
                      >
                        Effacer le filtre
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={openAddClientDialog}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau client
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                      <h3 className="text-lg font-medium mb-1">{client.name}</h3>
                      
                      {client.categories && client.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {client.categories.map(category => (
                            <Badge 
                              key={category.category_id} 
                              variant="outline"
                              style={{ 
                                backgroundColor: category.category_color || undefined,
                                color: category.category_color ? '#ffffff' : undefined 
                              }}
                              className="text-xs"
                            >
                              {category.category_name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
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
                        onClick={() => viewClientDetails(client)}
                      >
                        Détails
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
