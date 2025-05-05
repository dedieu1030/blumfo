
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";

interface CompanyProfileFormProps {
  initialData?: Partial<CompanyProfile>;
  onSave: (data: CompanyProfile) => void;
}

export function CompanyProfileForm({ initialData, onSave }: CompanyProfileFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    name: "",
    address: "",
    email: "",
    phone: "",
    bankAccount: "",
    bankName: "",
    accountHolder: "",
    taxRate: "20",
    termsAndConditions: "Paiement sous 30 jours. Pénalité 1.5%/mois en cas de retard.",
    thankYouMessage: "Merci pour votre confiance",
    defaultCurrency: "EUR",
    paypal: "",
    payoneer: "",
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as CompanyProfile);
    toast({
      title: "Profil enregistré",
      description: "Vos informations ont été mises à jour avec succès."
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Informations du cabinet</CardTitle>
          <CardDescription>Vos informations professionnelles qui apparaîtront sur vos factures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nom du cabinet</Label>
              <Input 
                id="company-name" 
                placeholder="Cabinet Dupont" 
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">Nom du titulaire du compte</Label>
              <Input 
                id="contact-name" 
                placeholder="Me Dupont" 
                value={formData.accountHolder}
                onChange={(e) => handleChange("accountHolder", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="contact@cabinet-dupont.fr" 
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone" 
                placeholder="01 23 45 67 89" 
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse complète</Label>
              <Textarea 
                id="address" 
                placeholder="15 rue du Barreau, 75001 Paris" 
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Informations bancaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nom de la banque</Label>
                <Input 
                  id="bank-name" 
                  placeholder="Banque Nationale" 
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-account">IBAN / Numéro de compte</Label>
                <Input 
                  id="bank-account" 
                  placeholder="FR76 1234 5678 9123 4567 8912 345" 
                  value={formData.bankAccount}
                  onChange={(e) => handleChange("bankAccount", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Méthodes de paiement alternatives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paypal">Email PayPal</Label>
                <Input 
                  id="paypal" 
                  placeholder="paiements@cabinet-dupont.fr" 
                  value={formData.paypal || ""}
                  onChange={(e) => handleChange("paypal", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Facultatif. Laissez vide si vous n'utilisez pas PayPal.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payoneer">Compte Payoneer</Label>
                <Input 
                  id="payoneer" 
                  placeholder="paiements@cabinet-dupont.fr" 
                  value={formData.payoneer || ""}
                  onChange={(e) => handleChange("payoneer", e.target.value)}
                  disabled
                />
                <p className="text-sm text-muted-foreground">Cette option sera disponible prochainement.</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Paramètres de facturation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Taux de TVA par défaut (%)</Label>
                <Input 
                  id="tax-rate" 
                  type="number" 
                  placeholder="20" 
                  value={formData.taxRate}
                  onChange={(e) => handleChange("taxRate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-currency">Devise par défaut</Label>
                <Select 
                  value={formData.defaultCurrency} 
                  onValueChange={(value) => handleChange("defaultCurrency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                    <SelectItem value="CHF">CHF (Fr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="terms">Conditions de paiement par défaut</Label>
                <Textarea 
                  id="terms" 
                  placeholder="Paiement sous 30 jours. Pénalité 1.5%/mois en cas de retard." 
                  value={formData.termsAndConditions}
                  onChange={(e) => handleChange("termsAndConditions", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="thankyou">Message de remerciement</Label>
                <Textarea 
                  id="thankyou" 
                  placeholder="Merci pour votre confiance" 
                  value={formData.thankYouMessage}
                  onChange={(e) => handleChange("thankYouMessage", e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="bg-violet hover:bg-violet/90">Enregistrer les modifications</Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default CompanyProfileForm;
