
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/context/NotificationsContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Icon } from "@/components/ui/icon";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleNotificationClick = async (notification: any) => {
    // Mark notification as read
    await markAsRead(notification.id);
    
    // Navigate to the relevant page based on notification type
    if (notification.reference_type === 'invoice' && notification.reference_id) {
      navigate(`/invoices?highlight=${notification.reference_id}`);
    }
    
    // Close the popover
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", isMobile && "border border-input h-9 w-9")}
        >
          <Icon 
            name="interface-alert-bell-2" 
            isStreamline={true} 
            size={20} 
          />
          {unreadCount > 0 && (
            <Badge
              className="absolute top-0 right-0 h-[18px] min-w-[18px] flex items-center justify-center rounded-full p-0 text-[10px] leading-none"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-2 border-b border-border">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Notifications</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7" 
              onClick={() => navigate("/notifications")}
            >
              Voir tout
            </Button>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm">
            Aucune notification
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    !notification.is_read && "bg-muted/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <h5 className={cn("text-sm", !notification.is_read && "font-medium")}>
                      {notification.title}
                    </h5>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true,
                        locale: fr
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  {!notification.is_read && (
                    <div className="h-2 w-2 bg-primary rounded-full absolute top-3 right-3" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};
