import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";
import { TaxRateSelector } from "@/components/TaxRateSelector";

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
    emailType: "professional",
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
    businessType: "company",
    ...initialData
  });

  const [showCustomBusinessType, setShowCustomBusinessType] = useState(formData.businessType === "other");

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      setShowCustomBusinessType(initialData.businessType === "other");
    }
  }, [initialData]);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "businessType") {
      setShowCustomBusinessType(value === "other");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as CompanyProfile);
    toast({
      title: "Profil enregistré",
      description: "Vos informations ont été mises à jour avec succès."
    });
  };

  // Récupérer les labels adaptés en fonction du type d'activité
  const getLabels = () => {
    const businessType = formData.businessType || "company";
    
    switch (businessType) {
      case "individual":
        return {
          headerTitle: "Informations personnelles",
          nameLabel: "Nom complet",
          namePlaceholder: "Jean Dupont",
          emailLabel: "Email",
          emailPlaceholder: "jean.dupont@gmail.com",
          addressPlaceholder: "15 rue des Lilas, 75001 Paris",
          accountHolderLabel: "Nom du titulaire du compte",
          accountHolderPlaceholder: "Jean Dupont",
        };
      case "lawyer":
        return {
          headerTitle: "Informations du cabinet",
          nameLabel: "Nom du cabinet",
          namePlaceholder: "Cabinet Dupont",
          emailLabel: "Email",
          emailPlaceholder: "contact@cabinet-dupont.fr",
          addressPlaceholder: "15 rue du Barreau, 75001 Paris",
          accountHolderLabel: "Nom du titulaire du compte",
          accountHolderPlaceholder: "Me Jean Dupont",
        };
      case "freelancer":
        return {
          headerTitle: "Informations professionnelles",
          nameLabel: "Nom professionnel",
          namePlaceholder: "Jean Dupont Freelance",
          emailLabel: "Email",
          emailPlaceholder: "jean.dupont@gmail.com",
          addressPlaceholder: "15 rue des Freelances, 75001 Paris",
          accountHolderLabel: "Nom du titulaire du compte",
          accountHolderPlaceholder: "Jean Dupont",
        };
      case "other":
        const customType = formData.businessTypeCustom || "Professionnel";
        return {
          headerTitle: `Informations - ${customType}`,
          nameLabel: `Nom ${customType.toLowerCase()}`,
          namePlaceholder: `${customType} Jean Dupont`,
          emailLabel: "Email",
          emailPlaceholder: "contact@entreprise.fr",
          addressPlaceholder: "15 rue Principale, 75001 Paris",
          accountHolderLabel: "Nom du titulaire du compte",
          accountHolderPlaceholder: "Jean Dupont",
        };
      case "company":
      default:
        return {
          headerTitle: "Informations de l'entreprise",
          nameLabel: "Nom de l'entreprise",
          namePlaceholder: "Entreprise Dupont",
          emailLabel: "Email",
          emailPlaceholder: "contact@entreprise-dupont.fr",
          addressPlaceholder: "15 rue de l'Entreprise, 75001 Paris",
          accountHolderLabel: "Nom du titulaire du compte",
          accountHolderPlaceholder: "Jean Dupont",
        };
    }
  };

  // Obtenir les options d'email disponibles selon le type d'activité
  const getEmailTypeOptions = () => {
    const businessType = formData.businessType || "company";
    
    // Options de base pour tous les types d'activité
    const baseOptions = [
      { value: "personal", label: "Email personnel" },
      { value: "professional", label: "Email professionnel" }
    ];
    
    // Ajouter l'option "Email d'entreprise" seulement pour les entreprises
    if (businessType === "company") {
      return [...baseOptions, { value: "company", label: "Email d'entreprise" }];
    }
    
    return baseOptions;
  };

  const labels = getLabels();
  const emailTypeOptions = getEmailTypeOptions();

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Votre profil professionnel</CardTitle>
          <CardDescription>Vos informations qui apparaîtront sur vos factures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="business-type">Type d'activité</Label>
            <Select 
              value={formData.businessType} 
              onValueChange={(value) => handleChange("businessType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre type d'activité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Entreprise</SelectItem>
                <SelectItem value="individual">Particulier</SelectItem>
                <SelectItem value="lawyer">Avocat / Cabinet juridique</SelectItem>
                <SelectItem value="freelancer">Freelance</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showCustomBusinessType && (
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
              <Label htmlFor="company-name">{labels.nameLabel}</Label>
              <Input 
                id="company-name" 
                placeholder={labels.namePlaceholder} 
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">{labels.accountHolderLabel}</Label>
              <Input 
                id="contact-name" 
                placeholder={labels.accountHolderPlaceholder} 
                value={formData.accountHolder}
                onChange={(e) => handleChange("accountHolder", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{labels.emailLabel}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={labels.emailPlaceholder} 
                value={formData.email}
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
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse complète</Label>
              <Textarea 
                id="address" 
                placeholder={labels.addressPlaceholder} 
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
              <TaxRateSelector
                value={formData.taxRate || "20"}
                onChange={(value) => handleChange("taxRate", value)}
              />
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
