
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { PersonalProfileSubtype } from "./ProfileSubtypeSelector";
import { CompanyProfile } from "@/types/invoice";
import { TaxRateSelector } from "@/components/settings/TaxRateSelector";

interface PersonalProfileFormProps {
  subtype: PersonalProfileSubtype;
  initialData?: Partial<CompanyProfile>;
  onSave: (data: CompanyProfile) => void;
  onBack: () => void;
}

export function PersonalProfileForm({ subtype, initialData, onSave, onBack }: PersonalProfileFormProps) {
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    name: "",
    address: "",
    email: "",
    emailType: "personal",
    phone: "",
    bankAccount: "",
    bankName: "",
    accountHolder: "",
    taxRate: 20, // Use numeric value for internal state
    termsAndConditions: "Paiement à réception de facture. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance.",
    thankYouMessage: "Merci pour votre confiance",
    defaultCurrency: "EUR",
    businessTypeCustom: "",
    ...initialData
  });

  // Mise à jour de certains champs en fonction du subtype
  useEffect(() => {
    const updates: Partial<CompanyProfile> = {};
    
    switch(subtype) {
      case "individual":
        updates.businessType = "individual";
        updates.emailType = "personal";
        break;
      case "lawyer":
        updates.businessType = "lawyer";
        updates.emailType = "professional";
        break;
      case "freelancer":
        updates.businessType = "freelancer";
        updates.emailType = "professional";
        break;
      case "other":
        updates.businessType = "other";
        updates.emailType = "professional";
        break;
      default:
        break;
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  }, [subtype]);

  const handleChange = (field: keyof CompanyProfile, value: string | number) => {
    if (field === 'taxRate') {
      // Always ensure taxRate is stored as a number
      const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have all required fields and proper types
    const profileToSave: CompanyProfile = {
      name: formData.name || '',
      address: formData.address || '',
      email: formData.email || '',
      phone: formData.phone || '',
      emailType: formData.emailType as 'personal' | 'professional' | 'company',
      taxRate: formData.taxRate as number,
      defaultCurrency: formData.defaultCurrency || 'EUR',
      ...formData
    } as CompanyProfile;
    
    onSave(profileToSave);
  };

  // Récupérer les labels adaptés en fonction du type d'activité
  const getLabels = () => {
    switch (subtype) {
      case "individual":
        return {
          nameLabel: "Nom complet",
          namePlaceholder: "Jean Dupont",
          holderLabel: "Nom du titulaire du compte",
          holderPlaceholder: "Jean Dupont",
          addressPlaceholder: "15 rue des Lilas, 75001 Paris",
          emailPlaceholder: "jean.dupont@gmail.com",
        };
      case "lawyer":
        return {
          nameLabel: "Nom du cabinet",
          namePlaceholder: "Cabinet Dupont",
          holderLabel: "Nom du titulaire du compte",
          holderPlaceholder: "Me Jean Dupont",
          addressPlaceholder: "15 rue du Barreau, 75001 Paris",
          emailPlaceholder: "contact@cabinet-dupont.fr",
        };
      case "freelancer":
        return {
          nameLabel: "Nom professionnel",
          namePlaceholder: "Jean Dupont Freelance",
          holderLabel: "Nom du titulaire du compte",
          holderPlaceholder: "Jean Dupont",
          addressPlaceholder: "15 rue des Freelances, 75001 Paris",
          emailPlaceholder: "jean.dupont@gmail.com",
        };
      case "other":
        const customType = formData.businessTypeCustom || "Professionnel";
        return {
          nameLabel: `Nom ${customType.toLowerCase()}`,
          namePlaceholder: `${customType} Jean Dupont`,
          holderLabel: "Nom du titulaire du compte",
          holderPlaceholder: "Jean Dupont",
          addressPlaceholder: "15 rue Principale, 75001 Paris",
          emailPlaceholder: "contact@entreprise.fr",
        };
      default:
        return {
          nameLabel: "Nom complet",
          namePlaceholder: "Jean Dupont",
          holderLabel: "Nom du titulaire du compte",
          holderPlaceholder: "Jean Dupont",
          addressPlaceholder: "15 rue des Lilas, 75001 Paris",
          emailPlaceholder: "jean.dupont@gmail.com",
        };
    }
  };

  const labels = getLabels();
  
  // Obtenir les options d'email disponibles selon le type d'activité
  const getEmailTypeOptions = () => {
    // Options de base pour tous les types d'activité
    return [
      { value: "personal", label: "Email personnel" },
      { value: "professional", label: "Email professionnel" }
    ];
  };

  const emailTypeOptions = getEmailTypeOptions();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {subtype === "other" && (
        <div className="space-y-2">
          <Label htmlFor="business-type-custom">Précisez votre activité</Label>
          <Input 
            id="business-type-custom" 
            placeholder="Ex: Consultant, Architecte, etc." 
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
        <p className="text-sm text-muted-foreground mb-4">Optionnel : vous pourrez compléter ces informations ultérieurement</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bank-name">Nom de la banque</Label>
            <Input 
              id="bank-name" 
              placeholder="Banque Nationale" 
              value={formData.bankName || ""}
              onChange={(e) => handleChange("bankName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-account">IBAN / Numéro de compte</Label>
            <Input 
              id="bank-account" 
              placeholder="FR76 1234 5678 9123 4567 8912 345" 
              value={formData.bankAccount || ""}
              onChange={(e) => handleChange("bankAccount", e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Paramètres de facturation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <TaxRateSelector
              defaultValue={Number(formData.taxRate)}
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
