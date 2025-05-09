import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Client, DbClient } from "@/types/invoice";
import { mapDbClientToClient } from "@/components/ClientSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ClientCategory {
  id: string;
  name: string;
  color: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<ClientCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };

    fetchSession();
  }, []);

  useEffect(() => {
    fetchClients();
    fetchCategories();
  }, [fetchClients]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.phone && client.phone.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('clients')
        .select('*');

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Convertir les données en format Client et ajouter les catégories
      const clientsWithCategories = await Promise.all(
        data.map(async (dbClient: DbClient) => {
          // Récupérer les catégories associées à ce client
          const { data: clientCategories, error: categoryError } = await supabase
            .from('client_category_mappings')
            .select('category_id')
            .eq('client_id', dbClient.id);

          if (categoryError) {
            console.error("Erreur lors de la récupération des catégories du client:", categoryError);
            return { ...mapDbClientToClient(dbClient), categories: [] };
          }

          const categoryIds = clientCategories?.map(mapping => mapping.category_id) || [];
          const categories = categories.filter(cat => categoryIds.includes(cat.id));

          // Convertir en format Client
          const client = mapDbClientToClient(dbClient);

          // Ajouter les catégories au client
          return {
            ...client,
            categories
          };
        })
      );

      setClients(clientsWithCategories);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Erreur!",
        description: "Erreur lors du chargement des clients",
        variant: "destructive"
      })
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('client_categories')
        .select('*');

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Erreur!",
        description: "Erreur lors du chargement des catégories",
        variant: "destructive"
      })
    }
  };

  const handleCreateClient = async (formData: any) => {
    setIsCreateDialogOpen(false);
    try {
      // Ajuster le format des données
      const clientData = {
        client_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        company_id: user?.id // Lier au compte utilisateur
      };

      const { data: newClientData, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Convertir en format Client
      const newClient = mapDbClientToClient(newClientData as DbClient);
      newClient.invoiceCount = 0;

      setClients([...clients, newClient]);
      toast({
        title: "Succès!",
        description: "Client créé avec succès",
      })
    } catch (error: any) {
      console.error("Error creating client:", error);
      toast({
        title: "Erreur!",
        description: "Erreur lors de la création du client",
        variant: "destructive"
      })
    } finally {
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateClient = async (formData: any) => {
    setIsEditDialogOpen(false);
    if (!selectedClient) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          client_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
        })
        .eq('id', selectedClient.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Mettre à jour le client dans l'état local
      setClients(clients.map(client => client.id === selectedClient.id ? {
        ...client,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
      } : client));
      toast({
        title: "Succès!",
        description: "Client mis à jour avec succès",
      })
    } catch (error: any) {
      console.error("Error updating client:", error);
      toast({
        title: "Erreur!",
        description: "Erreur lors de la mise à jour du client",
        variant: "destructive"
      })
    } finally {
      setIsEditDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        throw error;
      }

      // Supprimer le client de l'état local
      setClients(clients.filter(client => client.id !== clientId));
      toast({
        title: "Succès!",
        description: "Client supprimé avec succès",
      })
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast({
        title: "Erreur!",
        description: "Erreur lors de la suppression du client",
        variant: "destructive"
      })
    }
  };

  if (loading) return <div>Chargement des clients...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Créer un nouveau client</DialogTitle>
                <DialogDescription>
                  Ajoutez les informations du nouveau client ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <ClientForm onSubmit={handleCreateClient} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrer par catégorie</CardTitle>
          <CardDescription>Sélectionnez une catégorie pour filtrer les clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Toutes les catégories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedClient(client);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Modifiez les informations du client ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            client={selectedClient}
            onSubmit={handleUpdateClient}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: any) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit }) => {
  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [address, setAddress] = useState(client?.address || '');
  const [notes, setNotes] = useState(client?.notes || '');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ name, email, phone, address, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="submit">
          {client ? 'Mettre à jour' : 'Créer'}
        </Button>
      </DialogFooter>
    </form>
  );
};
