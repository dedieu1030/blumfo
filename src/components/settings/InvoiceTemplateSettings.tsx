
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  accent: string;
}

export function InvoiceTemplateSettings() {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [footerText, setFooterText] = useState("");
  
  useEffect(() => {
    // Chargement du modèle et du texte de pied de page depuis le stockage local
    const savedTemplate = localStorage.getItem('invoiceTemplate');
    const savedFooter = localStorage.getItem('invoiceFooterText');
    
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
    
    if (savedFooter) {
      setFooterText(savedFooter);
    } else {
      setFooterText("Merci pour votre confiance. Pour toute question concernant cette facture, veuillez nous contacter.");
    }
  }, []);
  
  const saveTemplateSettings = () => {
    localStorage.setItem('invoiceTemplate', selectedTemplate);
    localStorage.setItem('invoiceFooterText', footerText);
  };
  
  const invoiceTemplates: InvoiceTemplate[] = [
    {
      id: "classic",
      name: "Classique",
      description: "Un design professionnel et intemporel",
      previewBg: "bg-bleuclair",
      accent: "border-credornoir",
    },
    {
      id: "modern",
      name: "Moderne",
      description: "Un style épuré et minimaliste",
      previewBg: "bg-white",
      accent: "border-violet",
    },
    {
      id: "elegant",
      name: "Élégant",
      description: "Sophistiqué avec une typographie raffinée",
      previewBg: "bg-gray-50",
      accent: "border-credornoir",
    },
    {
      id: "colorful",
      name: "Dynamique",
      description: "Utilisation audacieuse des couleurs",
      previewBg: "bg-white",
      accent: "border-vertlime",
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template de facture</CardTitle>
        <CardDescription>Choisissez l'apparence de vos factures parmi nos modèles prédéfinis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          value={selectedTemplate} 
          onValueChange={setSelectedTemplate} 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {invoiceTemplates.map(template => (
            <div
              key={template.id}
              className={`relative flex flex-col rounded-lg border-2 p-2 cursor-pointer transition-all ${
                selectedTemplate === template.id ? `ring-2 ring-violet ${template.accent}` : "border-gray-200"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center">
                {selectedTemplate === template.id && (
                  <div className="h-3 w-3 rounded-full bg-violet flex items-center justify-center">
                    <Check className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
              
              <div className={`${template.previewBg} h-40 w-full mb-3 rounded flex items-center justify-center overflow-hidden`}>
                {/* Template preview */}
                <div className="w-4/5 h-4/5 bg-white rounded shadow-sm p-3">
                  <div className="w-full flex justify-between items-start">
                    <div className="w-10 h-3 bg-gray-200 rounded"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="w-full h-2 bg-gray-200 rounded"></div>
                    <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
                    <div className="w-3/5 h-2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full h-10 bg-gray-100 rounded flex justify-between px-2">
                      <div className="w-1/3 h-2 bg-gray-200 self-center rounded"></div>
                      <div className="w-1/5 h-2 bg-gray-200 self-center rounded"></div>
                    </div>
                  </div>
                  
                  {template.id === 'colorful' && (
                    <div className="mt-2 w-full h-1 bg-vertlime rounded"></div>
                  )}
                  
                  {template.id === 'elegant' && (
                    <div className="mt-3 w-1/3 h-4 bg-gray-200 mx-auto rounded"></div>
                  )}
                </div>
              </div>
              
              <RadioGroupItem
                value={template.id}
                id={template.id}
                className="sr-only"
              />
              <div className="text-left">
                <h3 className="font-medium text-base">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
        
        <div className="mt-6">
          <Label htmlFor="footer-text">Texte de pied de page</Label>
          <Textarea 
            id="footer-text" 
            placeholder="Merci pour votre confiance. Pour toute question concernant cette facture, veuillez nous contacter." 
            className="min-h-[80px] mt-2"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ce texte apparaîtra en bas de toutes vos factures.
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={saveTemplateSettings}>
            Enregistrer le template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
