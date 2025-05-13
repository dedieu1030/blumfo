
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Check, CalendarIcon, SaveIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentTermTemplate } from "@/types/invoice";

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
  const [templates, setTemplates] = useState<PaymentTermTemplate[]>([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dueDate ? new Date(dueDate) : undefined
  );

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('paymentTermsTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Erreur lors du parsing des modèles de conditions de paiement", e);
      }
    }
  }, []);

  // Update dueDate when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      onDueDateChange(format(selectedDate, "yyyy-MM-dd"));
    }
  }, [selectedDate, onDueDateChange]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
    }
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onPaymentDelayChange(template.daysAfterIssue.toString());
      if (template.delay) {
        onPaymentDelayChange(template.delay);
      }
      if (template.customDate) {
        setSelectedDate(new Date(template.customDate));
        onDueDateChange(template.customDate);
      }
      if (template.termsText) {
        onCustomTermsChange(template.termsText);
        onUseCustomTermsChange(true);
      }
    }
  };

  // Handle saving a new template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      return;
    }
    
    const newTemplate: PaymentTermTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription || undefined,
      daysAfterIssue: parseInt(paymentDelay, 10) || 0,
      isDefault: false,
      delay: paymentDelay,
      customDate: paymentDelay === 'custom' ? dueDate : undefined,
      termsText: useCustomTerms ? customTerms : undefined
    };
    
    if (onSaveAsTemplate) {
      onSaveAsTemplate(newTemplate);
    }
    
    setTemplateDescription("");
    setTemplateName("");
    setShowSaveTemplate(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="payment-delay">Délai de paiement</Label>
        <Select 
          value={paymentDelay} 
          onValueChange={onPaymentDelayChange}
        >
          <SelectTrigger id="payment-delay" className="mt-1.5">
            <SelectValue placeholder="Choisir un délai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Paiement immédiat</SelectItem>
            <SelectItem value="7">7 jours</SelectItem>
            <SelectItem value="15">15 jours</SelectItem>
            <SelectItem value="30">30 jours</SelectItem>
            <SelectItem value="45">45 jours</SelectItem>
            <SelectItem value="60">60 jours</SelectItem>
            <SelectItem value="90">90 jours</SelectItem>
            <SelectItem value="custom">Date personnalisée</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {paymentDelay === 'custom' && (
        <div>
          <Label htmlFor="due-date">Date d'échéance</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="due-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1.5",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Sélectionner une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="use-custom-terms" 
          checked={useCustomTerms}
          onCheckedChange={(checked) => onUseCustomTermsChange(checked as boolean)}
        />
        <Label htmlFor="use-custom-terms">Utiliser des conditions de paiement personnalisées</Label>
      </div>
      
      {useCustomTerms && (
        <div>
          <Label htmlFor="custom-terms">Conditions personnalisées</Label>
          <Textarea 
            id="custom-terms"
            value={customTerms}
            onChange={(e) => onCustomTermsChange(e.target.value)}
            placeholder={defaultTerms}
            className="mt-1.5"
            rows={4}
          />
        </div>
      )}
      
      {templates.length > 0 && (
        <div>
          <Label htmlFor="payment-template">Modèles enregistrés</Label>
          <Select 
            value={selectedTemplateId || ""} 
            onValueChange={handleTemplateSelect}
          >
            <SelectTrigger id="payment-template" className="mt-1.5">
              <SelectValue placeholder="Choisir un modèle" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center">
                    <span>{template.name}</span>
                    {template.isDefault && (
                      <Check className="ml-2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {!showSaveTemplate ? (
        <Button variant="outline" onClick={() => setShowSaveTemplate(true)}>
          Enregistrer comme modèle
        </Button>
      ) : (
        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium">Enregistrer comme modèle</h3>
          <div>
            <Label htmlFor="template-name">Nom du modèle</Label>
            <Input 
              id="template-name" 
              value={templateName} 
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Paiement à 30 jours" 
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="template-description">Description (optionnel)</Label>
            <Input 
              id="template-description" 
              value={templateDescription} 
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Ex: Pour les clients réguliers" 
              className="mt-1.5"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTemplate}>
              <SaveIcon className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
