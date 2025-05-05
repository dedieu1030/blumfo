
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Settings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");

  const invoiceTemplates = [
    {
      id: "classic",
      name: "Classique",
      description: "Un design professionnel et intemporel",
      previewBg: "bg-bleuclair",
      accent: "border-credornoir",
    },
    {
      id: "modern",
      name: "Moderne",
      description: "Un style épuré et minimaliste",
      previewBg: "bg-white",
      accent: "border-violet",
    },
    {
      id: "elegant",
      name: "Élégant",
      description: "Sophistiqué avec une typographie raffinée",
      previewBg: "bg-gray-50",
      accent: "border-credornoir",
    },
    {
      id: "colorful",
      name: "Dynamique",
      description: "Utilisation audacieuse des couleurs",
      previewBg: "bg-white",
      accent: "border-vertlime",
    }
  ];

  return (
    <>
      <Header 
        title="Paramètres" 
        description="Personnalisez votre compte et vos préférences"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      {/* Company Profile Link Card */}
      <Card className="mb-6">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-violet/10 flex items-center justify-center mr-4">
              <User className="h-5 w-5 text-violet" />
            </div>
            <div>
              <h3 className="font-medium text-base">Profil d'entreprise</h3>
              <p className="text-sm text-muted-foreground">Configurez les informations de votre entreprise pour vos factures</p>
            </div>
          </div>
          <Button asChild>
            <Link to="/profile">
              Configurer
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
          >
            Profil
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
          >
            Facturation
          </TabsTrigger>
          <TabsTrigger 
            value="template"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
          >
            Template
          </TabsTrigger>
          <TabsTrigger 
            value="stripe"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
          >
            Paiements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations du cabinet</CardTitle>
              <CardDescription>Vos informations professionnelles qui apparaîtront sur vos factures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800">
                  Les paramètres du profil d'entreprise sont maintenant disponibles dans une nouvelle section dédiée.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2 border-amber-500 text-amber-700 hover:bg-amber-100"
                  asChild
                >
                  <Link to="/profile">
                    Aller au profil d'entreprise
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nom du cabinet</Label>
                  <Input id="company-name" placeholder="Cabinet Dupont" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Nom du contact principal</Label>
                  <Input id="contact-name" placeholder="Me Dupont" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input id="email" type="email" placeholder="contact@cabinet-dupont.fr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="01 23 45 67 89" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Textarea id="address" placeholder="15 rue du Barreau, 75001 Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input id="siret" placeholder="123 456 789 00012" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva">Numéro de TVA</Label>
                  <Input id="tva" placeholder="FR12345678900" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de facturation</CardTitle>
              <CardDescription>Personnalisez vos paramètres de facturation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800">
                  Les paramètres de facturation sont maintenant disponibles dans la section du profil d'entreprise.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2 border-amber-500 text-amber-700 hover:bg-amber-100"
                  asChild
                >
                  <Link to="/profile">
                    Aller au profil d'entreprise
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise par défaut</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="eur">EUR (€)</option>
                    <option value="usd">USD ($)</option>
                    <option value="gbp">GBP (£)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-payment-term">Délai de paiement par défaut</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="15">15 jours</option>
                    <option value="30">30 jours</option>
                    <option value="immediate">Paiement immédiat</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Préfixe des factures</Label>
                  <Input id="invoice-prefix" placeholder="INV-" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-invoice-number">Prochain numéro de facture</Label>
                  <Input id="next-invoice-number" placeholder="001" />
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch id="auto-reminder" />
                  <Label htmlFor="auto-reminder">Relancer automatiquement les factures impayées</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Template de facture</CardTitle>
              <CardDescription>Choisissez l'apparence de vos factures parmi nos modèles prédéfinis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800">
                  Les templates de facture peuvent être choisis directement lors de la création d'une facture.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2 border-amber-500 text-amber-700 hover:bg-amber-100"
                  asChild
                >
                  <Link to="/invoicing">
                    Créer une facture
                  </Link>
                </Button>
              </div>
              
              <RadioGroup 
                value={selectedTemplate} 
                onValueChange={setSelectedTemplate} 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {invoiceTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`relative flex flex-col rounded-lg border-2 p-2 cursor-pointer transition-all ${
                      selectedTemplate === template.id ? `ring-2 ring-violet ${template.accent}` : "border-gray-200"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center">
                      {selectedTemplate === template.id && (
                        <div className="h-3 w-3 rounded-full bg-violet flex items-center justify-center">
                          <Check className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`${template.previewBg} h-40 w-full mb-3 rounded flex items-center justify-center overflow-hidden`}>
                      {/* Template preview */}
                      <div className="w-4/5 h-4/5 bg-white rounded shadow-sm p-3">
                        <div className="w-full flex justify-between items-start">
                          <div className="w-10 h-3 bg-gray-200 rounded"></div>
                          <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="mt-4 space-y-1">
                          <div className="w-full h-2 bg-gray-200 rounded"></div>
                          <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
                          <div className="w-3/5 h-2 bg-gray-200 rounded"></div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full h-10 bg-gray-100 rounded flex justify-between px-2">
                            <div className="w-1/3 h-2 bg-gray-200 self-center rounded"></div>
                            <div className="w-1/5 h-2 bg-gray-200 self-center rounded"></div>
                          </div>
                        </div>
                        
                        {template.id === 'colorful' && (
                          <div className="mt-2 w-full h-1 bg-vertlime rounded"></div>
                        )}
                        
                        {template.id === 'elegant' && (
                          <div className="mt-3 w-1/3 h-4 bg-gray-200 mx-auto rounded"></div>
                        )}
                      </div>
                    </div>
                    
                    <RadioGroupItem
                      value={template.id}
                      id={template.id}
                      className="sr-only"
                    />
                    <div className="text-left">
                      <h3 className="font-medium text-base">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="mt-6">
                <Label htmlFor="footer-text">Texte de pied de page</Label>
                <Textarea 
                  id="footer-text" 
                  placeholder="Merci pour votre confiance. Pour toute question concernant cette facture, veuillez nous contacter." 
                  className="min-h-[80px] mt-2"
                />
              </div>
              
              <div>
                <Button>Prévisualiser le template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des paiements</CardTitle>
              <CardDescription>Configurez Stripe pour recevoir les paiements de vos clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="stripe-connect">Connecter votre compte Stripe</Label>
                <div className="mt-2">
                  <Button className="bg-violet hover:bg-violet/90">
                    Connecter avec Stripe
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Une commission de 0,5% est appliquée sur chaque paiement reçu via la plateforme.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="test-mode" />
                <Label htmlFor="test-mode">Activer le mode test (sandbox)</Label>
              </div>
              
              <div className="space-y-2">
                <Label>Méthodes de paiement acceptées</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="card" className="rounded border-gray-300" checked readOnly />
                    <Label htmlFor="card">Carte bancaire</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="apple-pay" className="rounded border-gray-300" checked readOnly />
                    <Label htmlFor="apple-pay">Apple Pay</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="google-pay" className="rounded border-gray-300" checked readOnly />
                    <Label htmlFor="google-pay">Google Pay</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="sepa" className="rounded border-gray-300" />
                    <Label htmlFor="sepa">Virement SEPA</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Button className="bg-violet hover:bg-violet/90">Enregistrer les modifications</Button>
      </div>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
