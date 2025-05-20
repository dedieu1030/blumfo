import React, { useState, useEffect, useMemo } from "react";
import { supabase, handleSupabaseError, isAuthenticated } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Trash2, Edit, AlertCircle, RefreshCw, MoreHorizontal, Wrench } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ClientSelector, Client } from "@/components/ClientSelector";
import { NewClientForm } from "@/components/NewClientForm";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { associateClientsToCompany, getCurrentUserCompanyId } from "@/utils/clientUtils";
import { fixClientAccess } from "@/utils/accessUtils";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [isNewClientFormOpen, setIsNewClientFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isFixingClients, setIsFixingClients] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier l'authentification avant de charger les données
    const checkAuthAndFetchData = async () => {
      try {
        setIsLoading(true);
        const isUserAuthenticated = await isAuthenticated();
        setAuthenticated(isUserAuthenticated);
        
        if (isUserAuthenticated) {
          await checkTablesAndFetchData();
        } else {
          console.log("Utilisateur non authentifié, redirection vers /auth");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setError("Une erreur est survenue lors de la vérification de votre session.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndFetchData();
  }, [navigate]);

  const checkTablesAndFetchData = async () => {
    try {
      // Récupérer l'ID de l'entreprise de l'utilisateur
      const userCompanyId = await getCurrentUserCompanyId();
      setCompanyId(userCompanyId);
      
      // Vérifier si les tables nécessaires existent
      console.log("Vérification des tables nécessaires...");
      
      const [clientsTableExists, companiesTableExists] = await Promise.all([
        checkTable('clients'),
        checkTable('companies')
      ]);
      
      if (!clientsTableExists) {
        setError("La table des clients n'existe pas ou n'est pas accessible. Veuillez contacter l'administrateur.");
        return;
      }
      
      if (!companiesTableExists) {
        toast.warning("La table des entreprises semble manquante. Certaines fonctionnalités pourraient être limitées.");
      }
      
      // Si les tables nécessaires existent, charger les données
      await fetchClients(userCompanyId);
    } catch (error) {
      console.error("Erreur lors de la vérification des tables:", error);
      setError("Une erreur est survenue lors de la vérification des tables.");
    }
  };
  
  const checkTable = async (tableName: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .select('count(*)', { count: 'exact', head: true });
        
      if (error) {
        console.error(`Erreur lors de la vérification de la table ${tableName}:`, error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error(`Erreur lors de la vérification de la table ${tableName}:`, err);
      return false;
    }
  };

  const fetchClients = async (userCompanyId: string | null = null) => {
    setIsLoading(true);
    try {
      console.log("Récupération des clients...");
      
      // Si nous avons un ID d'entreprise et que nous sommes sûrs des politiques RLS,
      // nous pouvons filtrer côté serveur
      const query = supabase.from('clients').select('*');
      
      if (userCompanyId) {
        // Nous pouvons soit filtrer par company_id, soit inclure les clients sans company_id
        query.or(`company_id.eq.${userCompanyId},company_id.is.null`);
      }
      
      const { data, error } = await query.order('client_name');

      if (error) {
        handleSupabaseError(error, "chargement des clients");
        setError("Impossible de charger la liste des clients.");
        return;
      }

      // Vérifier s'il y a des clients sans company_id
      const clientsWithoutCompany = data?.filter(client => !client.company_id).length || 0;
      if (clientsWithoutCompany > 0 && userCompanyId) {
        console.warn(`${clientsWithoutCompany} clients n'ont pas d'entreprise associée`);
        toast.warning(`${clientsWithoutCompany} clients n'ont pas d'entreprise associée. Utilisez "Associer les clients" pour les rattacher à votre entreprise.`);
      }

      // Adapter les données de Supabase au format Client attendu
      const adaptedClients = (data || []).map(client => ({
        ...client,
        name: client.client_name, // Mapping client_name à name pour la compatibilité
        user_id: client.company_id // Utilisation de company_id comme user_id
      }));

      console.log(`${adaptedClients.length} clients récupérés avec succès`);
      setClients(adaptedClients as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError("Une erreur est survenue lors du chargement des clients.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixClients = async () => {
    if (!companyId) {
      toast.error("Impossible d'associer les clients sans entreprise");
      return;
    }

    setIsFixingClients(true);
    try {
      const updatedCount = await associateClientsToCompany(companyId);
      if (updatedCount > 0) {
        toast.success(`${updatedCount} clients ont été associés à votre entreprise`);
        fetchClients(companyId);
      } else {
        toast.info("Aucun client à associer");
      }
    } catch (error: any) {
      console.error('Error fixing clients:', error);
      toast.error(error.message || "Erreur lors de l'association des clients");
    } finally {
      setIsFixingClients(false);
    }
  };

  // Nouvelle fonction pour réparer les politiques RLS et l'accès aux clients
  const handleFixAccess = async () => {
    try {
      const success = await fixClientAccess();
      if (success) {
        // Recharger les clients après la réparation
        await fetchClients(companyId);
      }
    } catch (error) {
      console.error("Erreur lors de la réparation de l'accès:", error);
      toast.error("La réparation de l'accès a échoué");
    }
  };

  const fetchClientCategories = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_client_categories', { p_client_id: clientId });

      if (error) {
        handleSupabaseError(error, "récupération des catégories");
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching client categories:', error);
      return [];
    }
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id);

      if (error) {
        handleSupabaseError(error, "suppression du client");
        return;
      }

      toast.success('Client supprimé avec succès');
      setClients(clients.filter(client => client.id !== selectedClient.id));
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erreur lors de la suppression du client');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm({
      id: client.id,
      name: client.name || client.client_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      reference_number: client.reference_number,
      company_id: client.company_id || companyId  // Assurez-vous que company_id est défini
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient || !editForm) return;

    setUpdateLoading(true);

    try {
      // S'assurer que company_id est défini
      const updateData = {
        client_name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        notes: editForm.notes,
        reference_number: editForm.reference_number,
        company_id: editForm.company_id || companyId // Utiliser l'ID de l'entreprise actuelle si non défini
      };

      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', selectedClient.id)
        .select();

      if (error) {
        handleSupabaseError(error, "mise à jour du client");
        return;
      }

      toast.success('Client mis à jour avec succès');

      // Mettre à jour la liste des clients avec les données mises à jour
      const updatedClient = {
        ...data[0],
        name: data[0].client_name, // Ajout du champ name pour la compatibilité
        user_id: data[0].company_id // Ajout du champ user_id pour la compatibilité
      };

      setClients(clients.map((client) => 
        client.id === updatedClient.id ? updatedClient as Client : client
      ));
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erreur lors de la mise à jour du client');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    console.log('Selected client:', client);
    setIsClientSelectorOpen(false);
  };

  const handleNewClientCreated = (newClient: Client) => {
    setClients(prevClients => [...prevClients, newClient]);
    setIsNewClientFormOpen(false);
  };

  const handleRefresh = async () => {
    setError(null);
    await checkTablesAndFetchData();
  };
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <>
        <Header
          title="Clients"
          description="Gérez vos clients"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleFixAccess}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Réparer l'accès
                </Button>
              </div>
            </div>
          </Alert>
        </div>
        <MobileNavigation
          isOpen={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
        />
      </>
    );
  }

  return (
    <>
      <Header
        title="Clients"
        description="Gérez vos clients"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold">Liste des clients</h2>
            
            <div className="flex flex-wrap gap-2">
              {/* Bouton pour réparer l'accès aux clients */}
              <Button 
                variant="outline" 
                onClick={handleFixAccess}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Réparer l'accès
              </Button>
              
              {/* Bouton pour associer tous les clients sans entreprise */}
              {companyId && (
                <Button 
                  variant="outline" 
                  onClick={handleFixClients}
                  disabled={isFixingClients}
                >
                  {isFixingClients ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Association en cours...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Associer les clients sans entreprise
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full">
            <Button 
              onClick={() => setIsNewClientFormOpen(true)} 
              className="flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Ajouter un client
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsClientSelectorOpen(true)}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-5 w-5" />
              Sélectionner un client
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
              <p className="text-sm text-muted-foreground">Chargement des clients...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link to={`/clients/${client.id}`} className="hover:underline">
                        {client.name || client.client_name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      {client.company_id ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Associé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Non associé
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClient(client)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {clients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteClient} className="bg-red-600">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Client Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier le client</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={editForm.address || ""}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editForm.notes || ""}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_number">Numéro de référence</Label>
                <Input
                  id="reference_number"
                  value={editForm.reference_number || ""}
                  onChange={(e) => setEditForm({ ...editForm, reference_number: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateClient} disabled={updateLoading}>
                {updateLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-current rounded-full" />
                    Traitement...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Client Selector Modal */}
        <Dialog open={isClientSelectorOpen} onOpenChange={setIsClientSelectorOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Sélectionner un client</DialogTitle>
            </DialogHeader>
            <ClientSelector onClientSelect={handleClientSelect} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClientSelectorOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Client Form Modal */}
        <NewClientForm 
          open={isNewClientFormOpen} 
          onOpenChange={setIsNewClientFormOpen} 
          onClientCreated={handleNewClientCreated} 
        />
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
};

// Ajouter l'icône manquante pour le bouton d'association de clients
const CheckSquare = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export default Clients;
