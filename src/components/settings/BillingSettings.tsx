import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { InvoiceNumberingConfig } from "@/types/invoice";

export function BillingSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [numberingConfig, setNumberingConfig] = useState<InvoiceNumberingConfig>({
    prefix: "INV",
    suffix: "",
    digits: 3,
    separator: "-",
    nextNumber: 1,
    pattern: "PREFIX-YEAR-NUMBER",
    resetPeriod: "never",
    lastReset: "",
    padding: 3,
    resetAnnually: false
  });

  useEffect(() => {
    const storedConfig = localStorage.getItem("invoiceNumberingConfig");
    if (storedConfig) {
      setNumberingConfig(JSON.parse(storedConfig));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("invoiceNumberingConfig", JSON.stringify(numberingConfig));
  }, [numberingConfig]);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Configuration enregistrée",
        description: "La configuration de la numérotation des factures a été mise à jour.",
      });
    }, 1000);
  };

  const handlePrefixChange = (value: string) => {
    setNumberingConfig(prev => ({ ...prev, prefix: value }));
  };

  const handleSuffixChange = (value: string) => {
    setNumberingConfig(prev => ({ ...prev, suffix: value }));
  };

  const handleDigitsChange = (value: string) => {
    const digits = parseInt(value, 10);
    setNumberingConfig(prev => ({
      ...prev,
      digits: isNaN(digits) ? 3 : digits
    }));
  };

  const handleSeparatorChange = (value: string) => {
    setNumberingConfig(prev => ({ ...prev, separator: value }));
  };

  const handlePatternChange = (value: string) => {
    setNumberingConfig(prev => ({ ...prev, pattern: value }));
  };

  const handleNextNumberChange = (value: string) => {
    const nextNumber = parseInt(value, 10);
    setNumberingConfig(prev => ({
      ...prev,
      nextNumber: isNaN(nextNumber) ? 1 : nextNumber
    }));
  };

  const handleResetPeriodChange = (value: string) => {
    setNumberingConfig(prev => ({ 
      ...prev, 
      resetPeriod: value as 'never' | 'yearly' | 'monthly' 
    }));
  };

  const handlePaddingChange = (value: string) => {
    const padding = parseInt(value, 10);
    setNumberingConfig(prev => ({
      ...prev,
      padding: isNaN(padding) ? 3 : padding
    }));
  };

  const handleResetAnnuallyChange = (checked: boolean) => {
    setNumberingConfig(prev => ({
      ...prev,
      resetAnnually: checked,
      resetPeriod: checked ? 'yearly' : 'never'
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Numérotation des factures</CardTitle>
        <CardDescription>
          Configurez la numérotation automatique de vos factures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prefix">Préfixe</Label>
            <Input
              id="prefix"
              value={numberingConfig.prefix}
              onChange={(e) => handlePrefixChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="suffix">Suffixe</Label>
            <Input
              id="suffix"
              value={numberingConfig.suffix}
              onChange={(e) => handleSuffixChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="digits">Nombre de chiffres</Label>
            <Input
              id="digits"
              type="number"
              value={numberingConfig.digits.toString()}
              onChange={(e) => handleDigitsChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="separator">Séparateur</Label>
            <Input
              id="separator"
              value={numberingConfig.separator}
              onChange={(e) => handleSeparatorChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nextNumber">Prochain numéro</Label>
            <Input
              id="nextNumber"
              type="number"
              value={numberingConfig.nextNumber.toString()}
              onChange={(e) => handleNextNumberChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="padding">Remplissage (padding)</Label>
            <Input
              id="padding"
              type="number"
              value={numberingConfig.padding?.toString() || "3"}
              onChange={(e) => handlePaddingChange(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="pattern">Pattern</Label>
          <Input
            id="pattern"
            value={numberingConfig.pattern}
            onChange={(e) => handlePatternChange(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="resetPeriod">Réinitialiser la numérotation</Label>
          <Select value={numberingConfig.resetPeriod} onValueChange={handleResetPeriodChange}>
            <SelectTrigger id="resetPeriod">
              <SelectValue placeholder="Jamais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Jamais</SelectItem>
              <SelectItem value="yearly">Annuellement</SelectItem>
              <SelectItem value="monthly">Mensuellement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="resetAnnually">Réinitialiser annuellement</Label>
          <Switch id="resetAnnually" checked={numberingConfig.resetAnnually} onCheckedChange={handleResetAnnuallyChange} />
        </div>
      </CardContent>
      <div className="p-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-current rounded-full" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </Card>
  );
}
