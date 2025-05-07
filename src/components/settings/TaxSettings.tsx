
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";

interface TaxSettingsProps {
  companyProfile?: CompanyProfile;
}

export function TaxSettings({ companyProfile }: TaxSettingsProps) {
  const { toast } = useToast();
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(
    companyProfile?.taxRate ? parseFloat(companyProfile.taxRate) : 20
  );

  const form = useForm({
    defaultValues: {
      defaultTaxRate: defaultTaxRate.toString()
    }
  });

  const onSubmit = (data: { defaultTaxRate: string }) => {
    // Convert string to number before saving
    const numericTaxRate = parseFloat(data.defaultTaxRate);
    
    // Check if parsing resulted in a valid number
    if (isNaN(numericTaxRate)) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un taux de TVA valide"
      });
      return;
    }
    
    // Update the state with the numeric value
    setDefaultTaxRate(numericTaxRate);
    
    // Here you would typically update this in your profile or settings storage
    if (companyProfile) {
      // Assuming there's a handler for updating the company profile
      // updateCompanyProfile({ ...companyProfile, taxRate: numericTaxRate });
      
      localStorage.setItem('companyProfile', JSON.stringify({
        ...companyProfile,
        taxRate: numericTaxRate.toString() // Store as string in the profile as expected by the type
      }));
    }
    
    toast({
      title: "Succès",
      description: "Taux de TVA par défaut enregistré"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de TVA</CardTitle>
        <CardDescription>Configurez vos paramètres de TVA par défaut</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="defaultTaxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taux de TVA par défaut (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      min="0"
                      max="100"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Ce taux sera appliqué par défaut sur vos nouvelles factures.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-violet hover:bg-violet/90">
              Enregistrer
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
