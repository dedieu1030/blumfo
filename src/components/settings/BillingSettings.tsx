
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { InvoiceNumberingConfig, Currency } from "@/types/invoice";
import { 
  getInvoiceNumberingConfig, 
  saveInvoiceNumberingConfig,
  getDefaultCurrency,
  saveDefaultCurrency,
  availableCurrencies
} from "@/services/invoiceSettingsService";
import { toast } from "sonner";

export function BillingSettings({ 
  showReminderConfig, 
  onToggleReminders 
}: { 
  showReminderConfig: boolean; 
  onToggleReminders: (enabled: boolean) => void; 
}) {
  const [numberingConfig, setNumberingConfig] = useState<InvoiceNumberingConfig>(getInvoiceNumberingConfig());
  const [defaultCurrency, setDefaultCurrency] = useState<string>(getDefaultCurrency());
  const [previewNumber, setPreviewNumber] = useState<string>("");
  
  // Générer l'aperçu du numéro de facture
  useEffect(() => {
    const paddedNumber = numberingConfig.nextNumber.toString().padStart(numberingConfig.padding, '0');
    setPreviewNumber(`${numberingConfig.prefix}${paddedNumber}${numberingConfig.suffix || ''}`);
  }, [numberingConfig]);
  
  const handleSaveConfig = () => {
    saveInvoiceNumberingConfig(numberingConfig);
    saveDefaultCurrency(defaultCurrency);
    toast.success("Paramètres de facturation enregistrés");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de facturation</CardTitle>
        <CardDescription>Personnalisez vos paramètres de facturation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration de la numérotation des factures */}
          <div className="md:col-span-2 border p-4 rounded-md space-y-4">
            <h3 className="font-medium text-lg">Numérotation des factures</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Définissez le format des numéros de facture qui seront générés automatiquement
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-prefix">Préfixe</Label>
                <Input 
                  id="invoice-prefix" 
                  value={numberingConfig.prefix}
                  onChange={(e) => setNumberingConfig({...numberingConfig, prefix: e.target.value})}
                  placeholder="Ex: FACT-"
                />
                <p className="text-xs text-muted-foreground">Texte apparaissant avant le numéro</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="next-invoice-number">Prochain numéro</Label>
                <Input 
                  id="next-invoice-number" 
                  type="number"
                  min="1"
                  value={numberingConfig.nextNumber}
                  onChange={(e) => setNumberingConfig({...numberingConfig, nextNumber: parseInt(e.target.value) || 1})}
                />
                <p className="text-xs text-muted-foreground">Numéro de la prochaine facture</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="padding">Remplissage</Label>
                <Select 
                  value={numberingConfig.padding.toString()} 
                  onValueChange={(value) => setNumberingConfig({...numberingConfig, padding: parseInt(value)})}
                >
                  <SelectTrigger id="padding">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sans zéros (1, 2, 3...)</SelectItem>
                    <SelectItem value="2">2 chiffres (01, 02...)</SelectItem>
                    <SelectItem value="3">3 chiffres (001, 002...)</SelectItem>
                    <SelectItem value="4">4 chiffres (0001, 0002...)</SelectItem>
                    <SelectItem value="5">5 chiffres (00001, 00002...)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Nombre de chiffres avec zéros</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoice-suffix">Suffixe (optionnel)</Label>
                <Input 
                  id="invoice-suffix" 
                  value={numberingConfig.suffix || ""}
                  onChange={(e) => setNumberingConfig({...numberingConfig, suffix: e.target.value})}
                  placeholder="Ex: -FR"
                />
                <p className="text-xs text-muted-foreground">Texte apparaissant après le numéro</p>
              </div>
              
              <div className="md:col-span-2 flex items-center space-x-2 pt-6">
                <Switch 
                  id="reset-annually" 
                  checked={numberingConfig.resetAnnually}
                  onCheckedChange={(checked) => setNumberingConfig({...numberingConfig, resetAnnually: checked})}
                />
                <Label htmlFor="reset-annually">
                  Réinitialiser la numérotation chaque année
                </Label>
              </div>
            </div>
            
            <div className="mt-4 bg-muted p-3 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium">Aperçu du format:</span>
              <span className="font-mono bg-background px-3 py-1 rounded border">{previewNumber}</span>
            </div>
          </div>
          
          {/* Devise par défaut */}
          <div className="space-y-2">
            <Label htmlFor="currency">Devise par défaut</Label>
            <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une devise" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {availableCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{currency.name}</span>
                      <span className="font-medium ml-2">{currency.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Cette devise sera utilisée par défaut pour toutes les factures</p>
          </div>
          
          {/* Délai de paiement par défaut */}
          <div className="space-y-2">
            <Label htmlFor="default-payment-term">Délai de paiement par défaut</Label>
            <Select defaultValue="15">
              <SelectTrigger>
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
            <p className="text-xs text-muted-foreground">Ce délai sera proposé par défaut lors de la création d'une facture</p>
          </div>
          
          <div className="flex items-center space-x-2 md:col-span-2">
            <Switch 
              id="auto-reminder" 
              checked={showReminderConfig}
              onCheckedChange={onToggleReminders}
            />
            <div>
              <Label htmlFor="auto-reminder">Relancer automatiquement les factures impayées</Label>
              <p className="text-xs text-muted-foreground">Configure l'envoi automatique d'emails de relance pour les factures non payées</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveConfig}>
            Enregistrer les paramètres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
