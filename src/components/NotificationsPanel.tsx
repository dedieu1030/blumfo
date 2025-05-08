
import { useState } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const NotificationsPanel: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>("all");
  const navigate = useNavigate();
  
  const handleNotificationClick = async (notification: any) => {
    // Mark notification as read
    await markAsRead(notification.id);
    
    // Navigate to the relevant page based on notification type
    if (notification.reference_type === 'invoice' && notification.reference_id) {
      navigate(`/invoices?highlight=${notification.reference_id}`);
    }
  };
  
  // Filter notifications based on the active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.is_read;
    return notification.type === activeTab;
  });
  
  // Count notifications by type
  const paymentCount = notifications.filter(n => n.type === 'payment_received').length;
  const invoiceCount = notifications.filter(n => n.type === 'invoice_created').length;
  const dueCount = notifications.filter(n => 
    n.type === 'invoice_due_soon' || n.type === 'invoice_overdue'
  ).length;
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <Badge variant="default" className="bg-green-500">Paiement</Badge>;
      case 'invoice_created':
        return <Badge variant="default" className="bg-blue-500">Facture</Badge>;
      case 'invoice_due_soon':
        return <Badge variant="default" className="bg-yellow-500">Échéance</Badge>;
      case 'invoice_overdue':
        return <Badge variant="default" className="bg-red-500">Retard</Badge>;
      default:
        return <Badge variant="default">Info</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <Button 
          variant="outline"
          size="sm"
          disabled={unreadCount === 0 || isLoading}
          onClick={markAllAsRead}
        >
          <Check className="mr-2 h-4 w-4" />
          Tout marquer comme lu
        </Button>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Toutes ({notifications.length})
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Non lues ({unreadCount})
          </TabsTrigger>
          <TabsTrigger 
            value="payment_received" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Paiements ({paymentCount})
          </TabsTrigger>
          <TabsTrigger 
            value="invoice_created" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Factures ({invoiceCount})
          </TabsTrigger>
          <TabsTrigger 
            value="invoice_due_soon" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
          >
            Échéances ({dueCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="pt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Aucune notification à afficher.
            </Card>
          ) : (
            <ScrollArea className="max-h-[500px] pr-4">
              <div className="space-y-2">
                {filteredNotifications.map(notification => (
                  <Card
                    key={notification.id}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                      !notification.is_read && "bg-muted/20"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <h4 className={cn("text-base", !notification.is_read && "font-medium")}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true,
                            locale: fr 
                          })}
                        </span>
                        {!notification.is_read && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
