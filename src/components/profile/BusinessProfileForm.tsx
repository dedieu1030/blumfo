import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { BusinessProfileSubtype } from "./ProfileSubtypeSelector";
import { CompanyProfile } from "@/types/invoice";
import { TaxRateSelector } from "@/components/settings/TaxRateSelector";

interface BusinessProfileFormProps {
  subtype: BusinessProfileSubtype;
  initialData?: Partial<CompanyProfile>;
  onSave: (data: CompanyProfile) => void;
  onBack: () => void;
}

export function BusinessProfileForm({ subtype, initialData, onSave, onBack }: BusinessProfileFormProps) {
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    name: "",
    address: "",
    email: "",
    emailType: "company",
    phone: "",
    bankAccount: "",
    bankName: "",
    accountHolder: "",
    taxRate: 20, // Use numeric value for internal state
    termsAndConditions: "Paiement sous 30 jours. Pénalité 1.5%/mois en cas de retard.",
    thankYouMessage: "Merci pour votre confiance",
    defaultCurrency: "EUR",
    businessTypeCustom: "",
    ...initialData
  });

  // Mise à jour de certains champs en fonction du subtype
  useEffect(() => {
    const updates: Partial<CompanyProfile> = {};
    
    switch(subtype) {
      case "company":
        updates.businessType = "company";
        updates.emailType = "company";
        break;
      case "startup":
        updates.businessType = "company";
        updates.businessTypeCustom = "Startup";
        updates.emailType = "company";
        break;
      case "nonprofit":
        updates.businessType = "other";
        updates.businessTypeCustom = "Association / ONG";
        updates.emailType = "company";
        break;
      case "other":
        updates.businessType = "other";
        updates.emailType = "company";
        break;
      default:
        break;
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  }, [subtype]);

  const handleChange = (field: keyof CompanyProfile, value: string | number) => {
    if (field === 'taxRate' && typeof value === 'string') {
      // Convert taxRate string to number for internal state
      setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert profile to the correct types before saving
    onSave({
      ...formData as CompanyProfile,
      // Make sure taxRate is a number
      taxRate: typeof formData.taxRate === 'string' ? parseFloat(formData.taxRate) : (formData.taxRate || 0)
    });
  };

  // Récupérer les labels adaptés en fonction du type d'activité
  const getLabels = () => {
    switch (subtype) {
      case "startup":
        return {
          nameLabel: "Nom de la startup",
          namePlaceholder: "MaStartup SAS",
          holderLabel: "Représentant légal",
          holderPlaceholder: "Jean Dupont",
          addressPlaceholder: "15 rue de l'Innovation, 75001 Paris",
          emailPlaceholder: "contact@mastartup.com",
        };
      case "nonprofit":
        return {
          nameLabel: "Nom de l'organisation",
          namePlaceholder: "Association Entraide",
          holderLabel: "Nom du représentant",
          holderPlaceholder: "Jean Dupont, Président",
          addressPlaceholder: "15 rue Solidaire, 75001 Paris",
          emailPlaceholder: "contact@entraide.org",
        };
      case "other":
        const customType = formData.businessTypeCustom || "Organisation";
        return {
          nameLabel: `Nom de ${customType.toLowerCase()}`,
          namePlaceholder: `${customType} Exemple`,
          holderLabel: "Nom du représentant",
          holderPlaceholder: "Jean Dupont",
          addressPlaceholder: "15 rue Principale, 75001 Paris",
          emailPlaceholder: "contact@organisation.fr",
        };
      case "company":
      default:
        return {
          nameLabel: "Nom de l'entreprise",
          namePlaceholder: "Entreprise SAS",
          holderLabel: "Représentant légal",
          holderPlaceholder: "Jean Dupont, Gérant",
          addressPlaceholder: "15 rue de l'Entreprise, 75001 Paris",
          emailPlaceholder: "contact@entreprise.fr",
        };
    }
  };

  const labels = getLabels();
  
  // Obtenir les options d'email disponibles selon le type d'activité
  const getEmailTypeOptions = () => {
    return [
      { value: "company", label: "Email d'entreprise" },
      { value: "professional", label: "Email professionnel" }
    ];
  };

  const emailTypeOptions = getEmailTypeOptions();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {subtype === "other" && (
        <div className="space-y-2">
          <Label htmlFor="business-type-custom">Type d'organisation</Label>
          <Input 
            id="business-type-custom" 
            placeholder="Ex: Coopérative, Collectivité, etc." 
            value={formData.businessTypeCustom || ""}
            onChange={(e) => handleChange("businessTypeCustom", e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">{labels.nameLabel}</Label>
          <Input 
            id="name" 
            placeholder={labels.namePlaceholder} 
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-name">{labels.holderLabel}</Label>
          <Input 
            id="contact-name" 
            placeholder={labels.holderPlaceholder} 
            value={formData.accountHolder || ""}
            onChange={(e) => handleChange("accountHolder", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder={labels.emailPlaceholder} 
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-type">Type d'email</Label>
          <Select
            value={formData.emailType}
            onValueChange={(value) => handleChange("emailType", value as "personal" | "professional" | "company")}
          >
            <SelectTrigger id="email-type">
              <SelectValue placeholder="Sélectionnez le type d'email" />
            </SelectTrigger>
            <SelectContent>
              {emailTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input 
            id="phone" 
            placeholder="01 23 45 67 89" 
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Adresse complète</Label>
          <Textarea 
            id="address" 
            placeholder={labels.addressPlaceholder} 
            value={formData.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Informations bancaires</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bank-name">Nom de la banque</Label>
            <Input 
              id="bank-name" 
              placeholder="Banque Nationale" 
              value={formData.bankName || ""}
              onChange={(e) => handleChange("bankName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-account">IBAN / Numéro de compte</Label>
            <Input 
              id="bank-account" 
              placeholder="FR76 1234 5678 9123 4567 8912 345" 
              value={formData.bankAccount || ""}
              onChange={(e) => handleChange("bankAccount", e.target.value)}
              required
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Paramètres de facturation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <TaxRateSelector
              defaultValue={formData.taxRate || "20"}
              onChange={(value) => handleChange("taxRate", value)}
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
        </div>
      </div>
      
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <Button type="submit" className="bg-violet hover:bg-violet/90">
          Créer mon profil
        </Button>
      </div>
    </form>
  );
}
