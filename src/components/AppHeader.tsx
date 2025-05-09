
import React from "react";
import { SearchBar } from "./SearchBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { NotificationBell } from "./NotificationBell";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const AppHeader = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-[#F0EBE7]/50 border-b border-border h-16 flex items-center px-8">
      <div className="flex items-center justify-between w-full">
        <div className="w-64 flex items-center">
          <h1 className="font-['Space_Mono'] font-bold text-3xl tracking-tighter text-[#003427]">
            blumfo<span className="inline-flex items-center">
              <span className="h-1.5 w-1.5 ml-0.5 rounded-full bg-[#FA7043]"></span>
            </span>
          </h1>
        </div>
        
        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => navigate("/invoicing")}
            className="bg-[#003427] hover:bg-[#003427]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> {t('newInvoice')}
          </Button>
          <LanguageSelector />
          <NotificationBell />
        </div>
      </div>
    </div>
  );
};
