import React, { useEffect, useState } from "react";
import { Subscription, fetchSubscription, updateSubscriptionStatus, formatRecurringInterval, formatDate } from "@/services/subscriptionService";
import { formatPrice } from "@/services/productService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SubscriptionViewProps {
  subscriptionId: string;
  onUpdate: () => void;
  // Add new props to match what's being passed in SubscriptionsList
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  subscription?: Subscription;
  onEdit?: () => void;
}

export function SubscriptionView({ 
  subscriptionId, 
  onUpdate,
  open,
  onOpenChange,
  subscription: initialSubscription,
  onEdit
}: SubscriptionViewProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(initialSubscription || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSubscription);

  useEffect(() => {
    const loadSubscription = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSubscription(subscriptionId);
        setSubscription(data);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (subscriptionId && !initialSubscription) {
      loadSubscription();
    }
  }, [subscriptionId, initialSubscription]);

  const handleStatusChange = async (status: 'active' | 'paused' | 'cancelled' | 'completed') => {
    if (subscription) {
      await updateSubscriptionStatus(subscription.id, status);
      onUpdate();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-green-500/10 text-green-600";
      case 'paused':
        return "bg-amber-500/10 text-amber-600";
      case 'cancelled':
        return "bg-red-500/10 text-red-600";
      case 'completed':
        return "bg-gray-500/10 text-gray-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const content = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
        </div>
      );
    }
  
    if (!subscription) {
      return (
        <div className="text-center p-8">
          <p>Cet abonnement n'existe pas ou a été supprimé.</p>
        </div>
      );
    }
  
    const totalPriceHT = subscription.items?.reduce(
      (sum, item) => sum + (item.price_cents || 0) * item.quantity,
      0
    ) || 0;
  
    const recurringDisplay = subscription.recurring_interval === 'custom' && subscription.custom_days
      ? `Tous les ${subscription.custom_days} jours`
      : formatRecurringInterval(
          subscription.recurring_interval,
          subscription.recurring_interval_count
        );
  
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold">{subscription.name}</h2>
            <p className="text-muted-foreground">{subscription.client_name}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(subscription.status)}>
              {subscription.status === 'active' && "Actif"}
              {subscription.status === 'paused' && "En pause"}
              {subscription.status === 'cancelled' && "Annulé"}
              {subscription.status === 'completed' && "Terminé"}
            </Badge>
            
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  Modifier
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Gérer</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {subscription.status !== 'active' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                      Activer
                    </DropdownMenuItem>
                  )}
                  
                  {subscription.status !== 'paused' && subscription.status !== 'cancelled' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                      Mettre en pause
                    </DropdownMenuItem>
                  )}
                  
                  {subscription.status !== 'cancelled' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
                      Annuler
                    </DropdownMenuItem>
                  )}
                  
                  {subscription.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                      Marquer comme terminé
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Périodicité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{recurringDisplay}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Prochaine facturation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatDate(subscription.next_invoice_date)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Montant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatPrice(totalPriceHT)}</p>
            </CardContent>
          </Card>
        </div>
        
        {subscription.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{subscription.description}</p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'abonnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de début</p>
                <p>{formatDate(subscription.start_date)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de fin</p>
                <p>{subscription.end_date ? formatDate(subscription.end_date) : "Non définie"}</p>
              </div>
              
              {subscription.last_invoice_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dernière facturation</p>
                  <p>{formatDate(subscription.last_invoice_date)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Produits et services</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="items">
                <AccordionTrigger>
                  {subscription.items?.length || 0} produit(s) / service(s)
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {subscription.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price_cents)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatPrice((item.price_cents || 0) * item.quantity)}
                          </p>
                          {item.tax_rate && (
                            <p className="text-sm text-muted-foreground">
                              TVA: {item.tax_rate}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between pt-2 font-bold">
                      <p>Total HT</p>
                      <p>{formatPrice(totalPriceHT)}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Wrap with Dialog if open prop is provided
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          {content()}
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise just return the content directly
  return content();
}
