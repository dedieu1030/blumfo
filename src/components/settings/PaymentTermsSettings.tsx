
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentTermTemplate } from "@/types/invoice";
import { toast } from "sonner";
import { getDefaultPaymentTerms } from "@/services/invoiceSettingsService";

export interface PaymentTermsSettingsProps {
  onSave: (templates: PaymentTermTemplate[]) => void;
  initialTemplates?: PaymentTermTemplate[];
}

export function PaymentTermsSettings({ onSave, initialTemplates = [] }: PaymentTermsSettingsProps) {
  const [templates, setTemplates] = useState<PaymentTermTemplate[]>(initialTemplates.length > 0 ? initialTemplates : getDefaultPaymentTerms());
  const [templateName, setTemplateName] = useState("");
  const [templateDelay, setTemplateDelay] = useState("");
  const [templateCustomDate, setTemplateCustomDate] = useState("");
  const [templateTerms, setTemplateTerms] = useState("");
  const [isCustomDate, setIsCustomDate] = useState(false);

  useEffect(() => {
    if (initialTemplates && initialTemplates.length > 0) {
      setTemplates(initialTemplates);
    }
  }, [initialTemplates]);

  const addTemplate = () => {
    if (!templateName || !templateDelay) return;

    const newTemplate: PaymentTermTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName,
      delay: templateDelay,
      daysAfterIssue: parseInt(templateDelay) || 0,
      customDate: templateCustomDate,
      termsText: templateTerms,
      isDefault: false
    };

    setTemplates([...templates, newTemplate]);
    setTemplateName("");
    setTemplateDelay("");
    setTemplateCustomDate("");
    setTemplateTerms("");
    setIsCustomDate(false);
  };

  const removeTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const setDefaultTemplate = (id: string) => {
    const updatedTemplates = templates.map(template => ({
      ...template,
      isDefault: template.id === id
    }));
    setTemplates(updatedTemplates);
  };

  const saveTemplate = () => {
    if (!templateName || !templateDelay) return;

    const newTemplate: PaymentTermTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName,
      delay: templateDelay,
      daysAfterIssue: parseInt(templateDelay) || 0,
      customDate: templateCustomDate,
      termsText: templateTerms,
      isDefault: false
    };

    setTemplates([...templates, newTemplate]);
    setTemplateName("");
    setTemplateDelay("");
    setTemplateCustomDate("");
    setTemplateTerms("");
    setIsCustomDate(false);

    toast({
      description: `Le modèle "${templateName}" a été créé avec succès`
    });
  };

  const handleSave = () => {
    onSave(templates);
    toast({
      description: "Les conditions de paiement ont été mises à jour"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Modèles existants</h3>
        <p className="text-sm text-muted-foreground">
          Gérez vos modèles de conditions de paiement.
        </p>
      </div>

      <Table>
        <TableCaption>Vos modèles de conditions de paiement.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nom</TableHead>
            <TableHead>Délai</TableHead>
            <TableHead>Par défaut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.delay} jours</TableCell>
              <TableCell>
                <Checkbox
                  checked={template.isDefault}
                  onCheckedChange={() => setDefaultTemplate(template.id)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => removeTemplate(template.id)}>
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>
              <Button onClick={handleSave}>Enregistrer les conditions</Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium">Ajouter un modèle</h3>
        <p className="text-sm text-muted-foreground">
          Créez un nouveau modèle de conditions de paiement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nom du modèle</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Fin de mois"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-delay">Délai de paiement (en jours)</Label>
            <Select value={templateDelay} onValueChange={setTemplateDelay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un délai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="15">15 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="45">45 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <Checkbox id="custom-date" checked={isCustomDate} onCheckedChange={(checked) => setIsCustomDate(checked as boolean)} />
          <Label htmlFor="custom-date">Date personnalisée</Label>
        </div>

        {isCustomDate && (
          <div className="mt-2 space-y-2">
            <Label htmlFor="template-custom-date">Date personnalisée</Label>
            <Input
              id="template-custom-date"
              type="date"
              value={templateCustomDate}
              onChange={(e) => setTemplateCustomDate(e.target.value)}
            />
          </div>
        )}

        <div className="mt-4 space-y-2">
          <Label htmlFor="template-terms">Conditions générales</Label>
          <Textarea
            id="template-terms"
            value={templateTerms}
            onChange={(e) => setTemplateTerms(e.target.value)}
            placeholder="Ex: Paiement à réception de facture."
          />
        </div>

        <Button className="mt-4" onClick={saveTemplate}>
          Ajouter un modèle
        </Button>
      </div>
    </div>
  );
}
