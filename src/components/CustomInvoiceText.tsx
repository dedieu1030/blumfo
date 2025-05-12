
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomInvoiceTextProps {
  introText?: string;
  onIntroTextChange: (text: string) => void;
  conclusionText?: string;
  onConclusionTextChange: (text: string) => void;
  footerText?: string;
  onFooterTextChange: (text: string) => void;
}

export function CustomInvoiceText({
  introText = "",
  onIntroTextChange,
  conclusionText = "",
  onConclusionTextChange,
  footerText = "",
  onFooterTextChange,
}: CustomInvoiceTextProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="intro" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="intro">Introduction</TabsTrigger>
          <TabsTrigger value="conclusion">Conclusion</TabsTrigger>
          <TabsTrigger value="footer">Pied de page</TabsTrigger>
        </TabsList>
        
        <TabsContent value="intro" className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="intro-text">Texte d'introduction</Label>
            <span className="text-xs text-muted-foreground">
              {introText?.length || 0}/500
            </span>
          </div>
          <Textarea
            id="intro-text"
            placeholder="Texte à afficher en haut de votre facture..."
            value={introText}
            onChange={(e) => onIntroTextChange(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            Ce texte apparaîtra au début de votre facture, avant les détails des services.
          </p>
        </TabsContent>
        
        <TabsContent value="conclusion" className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="conclusion-text">Texte de conclusion</Label>
            <span className="text-xs text-muted-foreground">
              {conclusionText?.length || 0}/500
            </span>
          </div>
          <Textarea
            id="conclusion-text"
            placeholder="Texte à afficher après la liste des services..."
            value={conclusionText}
            onChange={(e) => onConclusionTextChange(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            Ce texte apparaîtra après les détails de la facture, avant les informations de paiement.
          </p>
        </TabsContent>
        
        <TabsContent value="footer" className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="footer-text">Texte de pied de page</Label>
            <span className="text-xs text-muted-foreground">
              {footerText?.length || 0}/300
            </span>
          </div>
          <Textarea
            id="footer-text"
            placeholder="Texte à afficher en bas de votre facture..."
            value={footerText}
            onChange={(e) => onFooterTextChange(e.target.value)}
            className="min-h-[80px]"
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground">
            Ce texte apparaîtra en bas de votre facture, comme note de pied de page.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
