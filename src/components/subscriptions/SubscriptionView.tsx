
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, X, CheckCircle, Edit } from "lucide-react";
import { 
  Subscription, 
  formatDate, 
  updateSubscriptionStatus,
  formatRecurringInterval 
} from "@/services/subscriptionService";
import { formatPrice } from "@/services/productService";

interface SubscriptionViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription;
  onUpdate?: () => void;
  onEdit?: () => void;
}

export function SubscriptionView({ open, onOpenChange, subscription, onUpdate, onEdit }: SubscriptionViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStatusChange = async (newStatus: 'active' | 'paused' | 'cancelled' | 'completed') => {
    setIsLoading(true);
    
    try {
      await updateSubscriptionStatus(subscription.id, newStatus);
      
      // Callback to refresh data
      if (onUpdate) {
        onUpdate();
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'paused':
        return <Pause className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const calculateTotal = () => {
    if (!subscription.items || subscription.items.length === 0) return 0;
    
    return subscription.items.reduce((total, item) => {
      const price = item.price_cents || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };
  
  const formattedTotal = formatPrice(calculateTotal());
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{subscription.name}</span>
            {getStatusBadge(subscription.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client information */}
          <div>
            <h3 className="text-lg font-medium">Client</h3>
            <div className="mt-2 p-4 border rounded-md">
              <p className="font-medium">{subscription.client_name}</p>
              {subscription.client_email && (
                <p className="text-sm text-muted-foreground">{subscription.client_email}</p>
              )}
            </div>
          </div>
          
          {/* Subscription details */}
          <div>
            <h3 className="text-lg font-medium">Détails de l'abonnement</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Périodicité</p>
                <p>{formatRecurringInterval(
                  subscription.recurring_interval,
                  subscription.recurring_interval_count
                )}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(subscription.status)}
                  <span>
                    {subscription.status === 'active' ? 'Actif' :
                     subscription.status === 'paused' ? 'Suspendu' :
                     subscription.status === 'cancelled' ? 'Annulé' :
                     subscription.status === 'completed' ? 'Terminé' :
                     'Inconnu'}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Date de début</p>
                <p>{formatDate(subscription.start_date)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Date de fin</p>
                <p>{subscription.end_date ? formatDate(subscription.end_date) : 'Non définie'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Prochaine facture</p>
                <p>{formatDate(subscription.next_invoice_date)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Dernière facture</p>
                <p>{subscription.last_invoice_date ? formatDate(subscription.last_invoice_date) : 'Aucune'}</p>
              </div>
            </div>
          </div>
          
          {/* Products */}
          <div>
            <h3 className="text-lg font-medium">Produits/Services</h3>
            <div className="mt-2 space-y-2">
              {subscription.items && subscription.items.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 px-4">Produit</th>
                        <th className="text-right p-2">Qté</th>
                        <th className="text-right p-2">Prix</th>
                        <th className="text-right p-2 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscription.items.map((item, index) => (
                        <tr key={item.id || index} className="border-t">
                          <td className="p-2 px-4">
                            <div>
                              {item.product?.name || "Produit inconnu"}
                              {item.product?.description && (
                                <p className="text-xs text-muted-foreground">
                                  {item.product.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2 text-right">
                            {formatPrice(item.price_cents)}
                          </td>
                          <td className="p-2 px-4 text-right">
                            {formatPrice((item.price_cents || 0) * (item.quantity || 1))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-medium">
                        <td colSpan={3} className="p-2 px-4 text-right">
                          Total récurrent
                        </td>
                        <td className="p-2 px-4 text-right">{formattedTotal}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center p-4 border rounded-md">
                  Aucun produit associé à cet abonnement
                </p>
              )}
            </div>
          </div>
          
          {/* Description */}
          {subscription.description && (
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="mt-2 p-4 border rounded-md whitespace-pre-wrap">
                {subscription.description}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
          <div className="flex-1 flex justify-start">
            {subscription.status === 'active' ? (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('paused')}
                disabled={isLoading}
              >
                <Pause className="h-4 w-4 mr-2" />
                Suspendre
              </Button>
            ) : subscription.status === 'paused' ? (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('active')}
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                Réactiver
              </Button>
            ) : null}
            
            {(subscription.status === 'active' || subscription.status === 'paused') && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('cancelled')}
                disabled={isLoading}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            
            {onEdit && (
              <Button onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
