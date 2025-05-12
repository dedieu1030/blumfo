
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/icon";
import { hasStreamlineEquivalent, getStreamlineIcon } from "@/lib/icon-mapping";

interface MenuItemProps {
  icon: string;
  name: string;
  path: string;
}

export function SidebarMenuItems() {
  const location = useLocation();
  const { t } = useTranslation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigationItems: MenuItemProps[] = [
    { icon: "BarChart2", name: t('dashboard'), path: "/" },
    { icon: "CreditCard", name: t('invoicing'), path: "/invoicing" },
    { icon: "FileText", name: t('invoices'), path: "/invoices" },
    { icon: "FilePlus", name: "Devis", path: "/quotes" },
    { icon: "LayoutTemplate", name: t('templates'), path: "/templates" },
    { icon: "Users", name: t('clients'), path: "/clients" },
    { icon: "Package", name: t('products'), path: "/products" },
    { icon: "Settings", name: t('settings'), path: "/settings" }
  ];

  return (
    <div className="flex-1 px-4 py-6 space-y-1">
      {navigationItems.map((item) => {
        // Check if the icon has a Streamline equivalent
        const hasStreamline = hasStreamlineEquivalent(item.icon);
        const streamlineIcon = hasStreamline ? getStreamlineIcon(item.icon) : undefined;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive(item.path)
                ? "bg-white/50 text-[#003427]"
                : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
            }`}
          >
            <Icon 
              name={hasStreamline ? streamlineIcon! : item.icon}
              isStreamline={hasStreamline}
              size={20}
              className={`mr-3 ${isActive(item.path) ? "text-[#003427]" : ""}`}
            />
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
