
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { LanguageSelector } from "./LanguageSelector";
import { NotificationBell } from "./NotificationBell";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div className="h-16 border-b border-border flex items-center px-4 bg-background">
      <div className="flex items-center justify-between w-full md:w-auto md:ml-64">
        {/* Logo or brand for mobile */}
        <div className="md:hidden font-semibold">Blumfo</div>
      </div>
      
      <div className="hidden md:flex flex-1 justify-center px-4">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm"
          className="hidden md:flex"
          onClick={() => navigate("/invoicing")}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('newInvoice')}
        </Button>
        <LanguageSelector />
        <NotificationBell />
      </div>
    </div>
  );
};
