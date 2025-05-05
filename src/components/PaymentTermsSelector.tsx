
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PaymentTermTemplate } from '@/types/invoice';
import { Plus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentTermsSelectorProps {
  paymentDelay: string;
  onPaymentDelayChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  customTerms: string;
  onCustomTermsChange: (value: string) => void;
  useCustomTerms: boolean;
  onUseCustomTermsChange: (value: boolean) => void;
  defaultTerms: string;
  onSaveAsTemplate?: (template: PaymentTermTemplate) => void;
  onSelectTemplate?: (templateId: string) => void;
  selectedTemplateId?: string;
}

export function PaymentTermsSelector({
  paymentDelay,
  onPaymentDelayChange,
  dueDate,
  onDueDateChange,
  customTerms,
  onCustomTermsChange,
  useCustomTerms,
  onUseCustomTermsChange,
  defaultTerms,
  onSaveAsTemplate,
  onSelectTemplate,
  selectedTemplateId
}: PaymentTermsSelectorProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PaymentTermTemplate[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Load saved templates on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('paymentTermsTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Error parsing payment terms templates", e);
      }
    }
  }, []);

  const handleTemplateSelection = (templateId: string) => {
    if (templateId === 'custom') {
      // User wants to use custom terms
      onUseCustomTermsChange(true);
      if (onSelectTemplate) onSelectTemplate('');
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (template) {
      onPaymentDelayChange(template.delay);
      if (template.customDate) onDueDateChange(template.customDate);
      onCustomTermsChange(template.termsText);
      onUseCustomTermsChange(true);
      if (onSelectTemplate) onSelectTemplate(templateId);
      
      toast({
        title: "Conditions de paiement chargées",
        description: `Les conditions "${template.name}" ont été appliquées à cette facture.`
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à ce modèle de conditions",
        variant: "destructive"
      });
      return;
    }

    const newTemplate: PaymentTermTemplate = {
      id: Date.now().toString(),
      name: templateName,
      delay: paymentDelay,
      termsText: customTerms,
      ...(paymentDelay === "custom" && { customDate: dueDate })
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('paymentTermsTemplates', JSON.stringify(updatedTemplates));
    
    if (onSaveAsTemplate) onSaveAsTemplate(newTemplate);
    
    toast({
      title: "Modèle enregistré",
      description: "Vos conditions de paiement personnalisées ont été enregistrées"
    });
    
    setShowSaveTemplate(false);
    setTemplateName('');
  };

  return (
    <div className="space-y-6">
      {/* Template selection */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="payment-terms-template">Conditions prédéfinies</Label>
          <Select 
            value={selectedTemplateId || ''} 
            onValueChange={handleTemplateSelection}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez des conditions prédéfinies" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
              <SelectItem value="custom">Définir des conditions personnalisées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="payment-delay">Délai de paiement</Label>
          <Select value={paymentDelay} onValueChange={onPaymentDelayChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un délai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Paiement immédiat</SelectItem>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="15">15 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="45">45 jours</SelectItem>
              <SelectItem value="60">60 jours</SelectItem>
              <SelectItem value="custom">Date spécifique</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {paymentDelay === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="due-date">Date d'échéance</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-custom-terms"
            checked={useCustomTerms}
            onCheckedChange={onUseCustomTermsChange}
          />
          <Label htmlFor="use-custom-terms">Utiliser des conditions personnalisées pour cette facture</Label>
        </div>
        
        {useCustomTerms ? (
          <div className="space-y-2">
            <Label htmlFor="custom-terms">Conditions de paiement personnalisées</Label>
            <Textarea
              id="custom-terms"
              placeholder="Exemple: Paiement à réception de facture. Pénalité de 1.5% par mois de retard."
              value={customTerms}
              onChange={(e) => onCustomTermsChange(e.target.value)}
            />
            
            {!showSaveTemplate ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowSaveTemplate(true)}
              >
                <Save className="mr-2 h-4 w-4" />
                Enregistrer comme modèle
              </Button>
            ) : (
              <div className="mt-2 flex flex-col space-y-2">
                <Label htmlFor="template-name">Nom du modèle</Label>
                <div className="flex space-x-2">
                  <Input
                    id="template-name"
                    placeholder="Conditions standard 30 jours"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                  <Button onClick={handleSaveTemplate}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md text-sm text-muted-foreground">
            <p>Conditions par défaut utilisées :</p>
            <p className="mt-1 font-medium text-foreground">{defaultTerms}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentTermsSelector;
