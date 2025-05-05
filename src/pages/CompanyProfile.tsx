
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload } from "lucide-react";

// Define the interface for company information
export interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
  taxId?: string;
  vatNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  bankBic?: string;
  logo?: string;
  defaultCurrency: string;
  defaultTaxRate: string;
  defaultPaymentTerms: string;
  defaultThankYouMessage: string;
}

export default function CompanyProfile() {
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Initialize company profile with default values
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    vatNumber: "",
    bankName: "",
    bankAccountNumber: "",
    bankIban: "",
    bankBic: "",
    defaultCurrency: "EUR",
    defaultTaxRate: "20",
    defaultPaymentTerms: "Paiement sous 30 jours. Pénalité 1.5%/mois.",
    defaultThankYouMessage: "Merci pour votre confiance."
  });

  // Load company profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("companyProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setCompanyProfile(parsedProfile);
      
      // If logo exists, set logo preview
      if (parsedProfile.logo) {
        setLogoPreview(parsedProfile.logo);
      }
    }
  }, []);

  // Handle form input changes
  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setCompanyProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner une image (.jpg, .png, .svg)",
        variant: "destructive"
      });
      return;
    }
    
    // Check if file size is less than 1MB
    if (file.size > 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille du logo ne doit pas dépasser 1MB",
        variant: "destructive"
      });
      return;
    }
    
    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onload = () => {
      const base64Logo = reader.result as string;
      setLogoPreview(base64Logo);
      setCompanyProfile(prev => ({
        ...prev,
        logo: base64Logo
      }));
    };
    reader.readAsDataURL(file);
  };

  // Save company profile to localStorage
  const saveProfile = () => {
    // Validate required fields
    if (!companyProfile.name || !companyProfile.email) {
      toast({
        title: "Information requise",
        description: "Veuillez remplir au moins le nom de l'entreprise et l'email",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem("companyProfile", JSON.stringify(companyProfile));
    
    toast({
      title: "Profil sauvegardé",
      description: "Les informations de votre entreprise ont été enregistrées"
    });
  };

  return (
    <>
      <Header 
        title="Profil d'entreprise" 
        description="Configurez les informations de votre entreprise pour vos factures"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-8">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'entreprise</CardTitle>
            <CardDescription>Ces informations apparaîtront sur toutes vos factures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nom de l'entreprise</Label>
                <Input 
                  id="company-name" 
                  value={companyProfile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Borcelle" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email professionnel</Label>
                <Input 
                  id="company-email" 
                  type="email"
                  value={companyProfile.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="hello@borcelle.com" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Téléphone</Label>
                <Input 
                  id="company-phone" 
                  value={companyProfile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+123-456-7890" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-website">Site web</Label>
                <Input 
                  id="company-website" 
                  value={companyProfile.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="www.borcelle.com" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company-address">Adresse complète</Label>
                <Textarea 
                  id="company-address"
                  value={companyProfile.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="123 Anywhere St., Any City" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-tax-id">Numéro SIRET</Label>
                <Input 
                  id="company-tax-id"
                  value={companyProfile.taxId}
                  onChange={(e) => handleChange("taxId", e.target.value)}
                  placeholder="123 456 789 00012" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-vat">Numéro de TVA</Label>
                <Input 
                  id="company-vat"
                  value={companyProfile.vatNumber}
                  onChange={(e) => handleChange("vatNumber", e.target.value)}
                  placeholder="FR12345678900" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Banking Details */}
        <Card>
          <CardHeader>
            <CardTitle>Coordonnées bancaires</CardTitle>
            <CardDescription>Ces informations apparaîtront sur les factures avec paiement par virement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nom de la banque</Label>
                <Input 
                  id="bank-name"
                  value={companyProfile.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  placeholder="Rimberio Bank" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-holder">Titulaire du compte</Label>
                <Input 
                  id="bank-holder"
                  value={companyProfile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Alfredo Torres" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-account">Numéro de compte</Label>
                <Input 
                  id="bank-account"
                  value={companyProfile.bankAccountNumber}
                  onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                  placeholder="0123 4567 8901" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-iban">IBAN</Label>
                <Input 
                  id="bank-iban"
                  value={companyProfile.bankIban}
                  onChange={(e) => handleChange("bankIban", e.target.value)}
                  placeholder="FR76 3000 1007 0000 0000 0000 000" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank-bic">BIC / SWIFT</Label>
                <Input 
                  id="bank-bic"
                  value={companyProfile.bankBic}
                  onChange={(e) => handleChange("bankBic", e.target.value)}
                  placeholder="BNPAFRPP" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Brand and Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Logo et apparence</CardTitle>
            <CardDescription>Personnalisez l'apparence de vos factures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company-logo">Logo de l'entreprise</Label>
                <div className="flex items-start space-x-4">
                  <div className="border rounded-md p-2 w-32 h-32 flex items-center justify-center bg-gray-50">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo de l'entreprise" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">Aucun logo</p>
                    )}
                  </div>
                  <div>
                    <Button variant="outline" className="relative" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Sélectionner un logo</span>
                      <input 
                        type="file"
                        id="company-logo"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Format conseillé: PNG ou SVG avec fond transparent, max 1MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-currency">Devise par défaut</Label>
                <Select 
                  value={companyProfile.defaultCurrency} 
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
          </CardContent>
        </Card>
        
        {/* Invoice Defaults */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de facturation</CardTitle>
            <CardDescription>Définissez les valeurs par défaut pour vos factures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="default-tax">Taux de TVA par défaut (%)</Label>
                <Input 
                  id="default-tax" 
                  value={companyProfile.defaultTaxRate}
                  onChange={(e) => handleChange("defaultTaxRate", e.target.value)}
                  placeholder="20" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="default-terms">Conditions de paiement par défaut</Label>
                <Textarea 
                  id="default-terms"
                  value={companyProfile.defaultPaymentTerms}
                  onChange={(e) => handleChange("defaultPaymentTerms", e.target.value)}
                  placeholder="Paiement sous 30 jours. Pénalité 1.5%/mois." 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="thank-you">Message de remerciement</Label>
                <Textarea 
                  id="thank-you"
                  value={companyProfile.defaultThankYouMessage}
                  onChange={(e) => handleChange("defaultThankYouMessage", e.target.value)}
                  placeholder="Merci pour votre confiance." 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button 
            className="bg-violet hover:bg-violet/90"
            onClick={saveProfile}
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les modifications
          </Button>
        </div>
      </div>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
