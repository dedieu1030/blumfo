
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";
import { RegionalTaxSelector } from "@/components/settings/RegionalTaxSelector";

interface TaxSettingsProps {
  companyProfile: CompanyProfile | null;
  onSave: (data: CompanyProfile) => void;
}

export function TaxSettings({ companyProfile, onSave }: TaxSettingsProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    taxRate: 20,
    taxRegion: "",
  });

  useEffect(() => {
    if (companyProfile) {
      // Ensure taxRate is a number
      const taxRate = typeof companyProfile.taxRate === 'string' 
        ? parseFloat(companyProfile.taxRate)
        : companyProfile.taxRate;
      
      setFormData({ 
        taxRate,
        taxRegion: companyProfile.taxRegion || ""
      });
    }
  }, [companyProfile]);

  const handleUpdate = async () => {
    if (!companyProfile) return;
    
    onSave({
      ...companyProfile,
      taxRate: formData.taxRate as number,
      taxRegion: formData.taxRegion || ""
    });
    
    toast({
      title: "Taux de TVA enregistré",
      description: "Le taux de TVA a été mis à jour avec succès."
    });
  };
  
  // Gestion du changement de région fiscale
  const handleTaxRegionChange = (value: number, regionKey?: string) => {
    setFormData(prev => ({
      ...prev,
      taxRate: value,
      taxRegion: regionKey || prev.taxRegion
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
        {/* Utiliser le sélecteur de région fiscale */}
        <RegionalTaxSelector
          defaultValue={formData.taxRate || 20}
          defaultRegion={formData.taxRegion || undefined}
          onChange={handleTaxRegionChange}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}
