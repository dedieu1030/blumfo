import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TaxConfiguration {
  type: 'none' | 'region' | 'custom';
  rate: number;
  defaultTaxRate: string;
  region: string;
  country: string;
  customTax: {
    enabled: boolean;
    rates: any[];
  };
}

interface CompanyProfile {
  taxConfiguration?: TaxConfiguration;
}

interface TaxSettingsProps {
  companyProfile: CompanyProfile | null;
  onSave: (profile: CompanyProfile) => void;
}

export function TaxSettings({ companyProfile, onSave }: TaxSettingsProps) {
  const [taxType, setTaxType] = useState<'none' | 'region' | 'custom'>(
    companyProfile?.taxConfiguration?.type || 'region'
  );
  const [customRate, setCustomRate] = useState<number>(
    companyProfile?.taxConfiguration?.rate || 20
  );
  const [defaultTaxRate, setDefaultTaxRate] = useState<string>(
    companyProfile?.taxConfiguration?.defaultTaxRate || ''
  );
  const [region, setRegion] = useState<string>(
    companyProfile?.taxConfiguration?.region || ''
  );
  const [country, setCountry] = useState<string>(
    companyProfile?.taxConfiguration?.country || ''
  );

  const { toast } = useToast();

  const handleSave = () => {
    const updatedProfile = {
      ...companyProfile,
      taxConfiguration: {
        type: taxType,
        rate: taxType === 'custom' ? customRate : 0,
        defaultTaxRate: defaultTaxRate,
        region: region,
        country: country,
        customTax: {
          enabled: taxType === 'custom',
          rates: []
        }
      }
    };

    onSave(updatedProfile);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="tax-type">Type de TVA</Label>
        <Select value={taxType} onValueChange={(value) => setTaxType(value as 'none' | 'region' | 'custom')}>
          <SelectTrigger id="tax-type" className="w-[180px]">
            <SelectValue placeholder="Sélectionnez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Pas de TVA</SelectItem>
            <SelectItem value="region">TVA Régionale</SelectItem>
            <SelectItem value="custom">TVA Personnalisée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {taxType === 'region' && (
        <>
          <div>
            <Label htmlFor="tax-region">Région</Label>
            <Input
              type="text"
              id="tax-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Entrez la région"
            />
          </div>
          <div>
            <Label htmlFor="tax-country">Pays</Label>
            <Input
              type="text"
              id="tax-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Entrez le pays"
            />
          </div>
          <div>
            <Label htmlFor="default-tax-rate">Taux de TVA par défaut</Label>
            <Input
              type="text"
              id="default-tax-rate"
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(e.target.value)}
              placeholder="Entrez le taux de TVA par défaut"
            />
          </div>
        </>
      )}

      {taxType === 'custom' && (
        <div>
          <Label htmlFor="custom-tax-rate">Taux de TVA personnalisé (%)</Label>
          <Input
            type="number"
            id="custom-tax-rate"
            value={customRate}
            onChange={(e) => setCustomRate(Number(e.target.value))}
            placeholder="Entrez le taux"
          />
        </div>
      )}

      <Button onClick={handleSave}>Enregistrer</Button>
    </div>
  );
}
