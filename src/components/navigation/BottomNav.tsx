
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, FileText, Users, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigationItems = [
    { icon: BarChart2, name: t('dashboard'), path: "/" },
    { icon: FileText, name: t('invoices'), path: "/invoices" },
    { icon: Users, name: t('clients'), path: "/clients" },
    { icon: User, name: t('profile'), path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center",
              isActive(item.path) 
                ? "text-primary" 
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
