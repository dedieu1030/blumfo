import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Play, Pause, X, CheckCircle, Clock } from "lucide-react";
import { 
  fetchSubscriptions, 
  Subscription, 
  formatDate, 
  formatRecurringInterval,
  updateSubscriptionStatus
} from "@/services/subscriptionService";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionForm } from "./SubscriptionForm";
import { SubscriptionView } from "./SubscriptionView";

export function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Load subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      setIsLoading(true);
      const data = await fetchSubscriptions();
      setSubscriptions(data);
      setFilteredSubscriptions(data);
      setIsLoading(false);
    };

    loadSubscriptions();
  }, []);

  // Filter subscriptions based on search term and status
  useEffect(() => {
    let filtered = [...subscriptions];

    if (searchTerm) {
      filtered = filtered.filter(subscription => 
        subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        subscription.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(subscription => subscription.status === selectedStatus);
    }

    setFilteredSubscriptions(filtered);
  }, [searchTerm, selectedStatus, subscriptions]);

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormDialogOpen(true);
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setViewDialogOpen(true);
  };

  const handleSubscriptionUpdated = () => {
    // Refresh data
    fetchSubscriptions().then(data => {
      setSubscriptions(data);
      setFilteredSubscriptions(data);
    });
    setFormDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleStatusChange = async (subscription: Subscription, newStatus: 'active' | 'paused' | 'cancelled' | 'completed') => {
    const updated = await updateSubscriptionStatus(subscription.id, newStatus);
    if (updated) {
      // Update in the local state
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscription.id ? { ...sub, status: newStatus } : sub
      );
      setSubscriptions(updatedSubscriptions);
      setFilteredSubscriptions(
        filteredSubscriptions.map(sub => 
          sub.id === subscription.id ? { ...sub, status: newStatus } : sub
        )
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Actif</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Suspendu</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Annulé</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Terminé</Badge>;
      default:
        return <Badge className="bg-gray-500">Inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des abonnements...</p>
        </div>
      );
    }

    if (filteredSubscriptions.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Aucun abonnement trouvé</h3>
          <p className="mt-1 text-muted-foreground">
            Créez votre premier abonnement en cliquant sur "Nouvel abonnement".
          </p>
          <Button className="mt-4" onClick={() => {
            setSelectedSubscription(null);
            setFormDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel abonnement
          </Button>
        </div>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nom</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Périodicité</TableHead>
                <TableHead>Prochaine facture</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.name}</TableCell>
                  <TableCell>{subscription.client_name || "-"}</TableCell>
                  <TableCell>
                    {formatRecurringInterval(
                      subscription.recurring_interval,
                      subscription.recurring_interval_count
                    )}
                  </TableCell>
                  <TableCell>{formatDate(subscription.next_invoice_date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(subscription.status)}
                      {getStatusBadge(subscription.status)}
                    </div>
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
                        <DropdownMenuItem onClick={() => handleViewSubscription(subscription)}>
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSubscription(subscription)}>
                          <Edit className="h-4 w-4 mr-2" /> Modifier
                        </DropdownMenuItem>
                        {subscription.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(subscription, 'paused')}>
                            <Pause className="h-4 w-4 mr-2" /> Suspendre
                          </DropdownMenuItem>
                        )}
                        {subscription.status === 'paused' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(subscription, 'active')}>
                            <Play className="h-4 w-4 mr-2" /> Réactiver
                          </DropdownMenuItem>
                        )}
                        {(subscription.status === 'active' || subscription.status === 'paused') && (
                          <DropdownMenuItem onClick={() => handleStatusChange(subscription, 'cancelled')}>
                            <X className="h-4 w-4 mr-2" /> Annuler
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Statut: {selectedStatus === 'all' ? 'Tous' : 
                        selectedStatus === 'active' ? 'Actif' : 
                        selectedStatus === 'paused' ? 'Suspendu' : 
                        selectedStatus === 'cancelled' ? 'Annulé' : 
                        selectedStatus === 'completed' ? 'Terminé' : 'Tous'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedStatus("all")}>
                Tous
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus("active")}>
                Actif
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus("paused")}>
                Suspendu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus("cancelled")}>
                Annulé
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>
                Terminé
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => {
            setSelectedSubscription(null);
            setFormDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel abonnement
          </Button>
        </div>
      </div>

      {renderContent()}

      <SubscriptionForm 
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        subscription={selectedSubscription}
        onUpdate={handleSubscriptionUpdated}
      />
      
      {selectedSubscription && (
        <SubscriptionView
          subscriptionId={selectedSubscription.id}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          subscription={selectedSubscription}
          onUpdate={handleSubscriptionUpdated}
          onEdit={() => {
            setViewDialogOpen(false);
            setFormDialogOpen(true);
          }}
        />
      )}
    </div>
  );
}
