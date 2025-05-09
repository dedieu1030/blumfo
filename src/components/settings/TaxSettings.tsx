import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";

interface TaxSettingsProps {
  companyProfile: CompanyProfile | null;
  onSave: (data: CompanyProfile) => void;
}

export function TaxSettings({ companyProfile, onSave }: TaxSettingsProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    taxRate: "20",
  });

  useEffect(() => {
    if (companyProfile) {
      setFormData({ taxRate: companyProfile.taxRate });
    }
  }, [companyProfile]);

  const handleUpdate = async (profile: CompanyProfile) => {
    // Convert the numeric tax rate to string before saving
    onSave({
      ...profile,
      taxRate: String(profile.taxRate)
    });
    
    toast({
      title: "Taux de TVA enregistré",
      description: "Le taux de TVA a été mis à jour avec succès."
    });
  };
  
  const updateTaxRate = (value: string) => {
    // Convert the string value to a number for the form state
    setFormData(prev => ({
      ...prev,
      taxRate: parseFloat(value)
    }));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taux de TVA par défaut</CardTitle>
        <CardDescription>
          Ce taux sera appliqué par défaut à toutes vos factures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tax-rate">Taux de TVA (%)</Label>
          <Input
            id="tax-rate"
            placeholder="20"
            value={formData.taxRate || ""}
            onChange={(e) => updateTaxRate(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => handleUpdate(companyProfile as CompanyProfile)}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}
