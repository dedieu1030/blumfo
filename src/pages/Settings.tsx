
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Plus, Edit, Trash } from "lucide-react";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";
import { CompanyProfile, PaymentTermTemplate, PaymentMethodDetails } from "@/types/invoice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PaymentTermsSelector } from "@/components/PaymentTermsSelector";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";

export default function Settings() {
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({});
  const [paymentTermTemplates, setPaymentTermTemplates] = useState<PaymentTermTemplate[]>([]);
  const [defaultPaymentMethods, setDefaultPaymentMethods] = useState<PaymentMethodDetails[]>([]);
  
  // Term template edit state
  const [editingTemplate, setEditingTemplate] = useState<PaymentTermTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDelay, setNewTemplateDelay] = useState("15");
  const [newTemplateDate, setNewTemplateDate] = useState("");
  const [newTemplateTerms, setNewTemplateTerms] = useState("");
  const [newTemplateDefault, setNewTemplateDefault] = useState(false);

  // Récupérer les données du profil d'entreprise
  useEffect(() => {
    const savedProfile = localStorage.getItem('companyProfile');
    if (savedProfile) {
      try {
        setCompanyProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Erreur lors du parsing du profil d'entreprise", e);
      }
    }
    
    // Récupérer les modèles de conditions de paiement
    const savedTerms = localStorage.getItem('paymentTermsTemplates');
    if (savedTerms) {
      try {
        setPaymentTermTemplates(JSON.parse(savedTerms));
      } catch (e) {
        console.error("Erreur lors du parsing des modèles de conditions", e);
      }
    }
    
    // Récupérer les méthodes de paiement par défaut
    const savedMethods = localStorage.getItem('defaultPaymentMethods');
    if (savedMethods) {
      try {
        setDefaultPaymentMethods(JSON.parse(savedMethods));
      } catch (e) {
        console.error("Erreur lors du parsing des méthodes de paiement", e);
      }
    } else {
      // Définir des méthodes par défaut si rien n'est sauvegardé
      setDefaultPaymentMethods([
        { type: "card", enabled: true },
        { type: "transfer", enabled: true }
      ]);
    }
  }, []);

  const handleSaveProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    localStorage.setItem('companyProfile', JSON.stringify(profile));
  };

  // Gestion des modèles de conditions de paiement
  const openTermTemplateEditor = (template?: PaymentTermTemplate) => {
    if (template) {
      // Edition d'un modèle existant
      setEditingTemplate(template);
      setNewTemplateName(template.name);
      setNewTemplateDelay(template.delay);
      setNewTemplateDate(template.customDate || "");
      setNewTemplateTerms(template.termsText);
      setNewTemplateDefault(template.isDefault || false);
    } else {
      // Création d'un nouveau modèle
      setEditingTemplate(null);
      setNewTemplateName("");
      setNewTemplateDelay("15");
      setNewTemplateDate("");
      setNewTemplateTerms("Paiement à réception de facture. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance.");
      setNewTemplateDefault(false);
    }
    setIsEditingTemplate(true);
  };

  const saveTermTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à ce modèle de conditions",
        variant: "destructive"
      });
      return;
    }

    let updatedTemplates: PaymentTermTemplate[];
    
    if (editingTemplate) {
      // Mettre à jour un modèle existant
      updatedTemplates = paymentTermTemplates.map(t => 
        t.id === editingTemplate.id 
          ? {
              ...t,
              name: newTemplateName,
              delay: newTemplateDelay,
              customDate: newTemplateDelay === "custom" ? newTemplateDate : undefined,
              termsText: newTemplateTerms,
              isDefault: newTemplateDefault
            }
          : newTemplateDefault ? { ...t, isDefault: false } : t
      );
    } else {
      // Créer un nouveau modèle
      const newTemplate: PaymentTermTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        delay: newTemplateDelay,
        customDate: newTemplateDelay === "custom" ? newTemplateDate : undefined,
        termsText: newTemplateTerms,
        isDefault: newTemplateDefault
      };
      
      // Si le nouveau modèle est défini par défaut, supprimer la définition par défaut des autres
      updatedTemplates = newTemplateDefault 
        ? paymentTermTemplates.map(t => ({ ...t, isDefault: false })).concat(newTemplate)
        : [...paymentTermTemplates, newTemplate];
    }
    
    setPaymentTermTemplates(updatedTemplates);
    localStorage.setItem('paymentTermsTemplates', JSON.stringify(updatedTemplates));
    
    toast({
      title: editingTemplate ? "Modèle mis à jour" : "Modèle créé",
      description: `Le modèle "${newTemplateName}" a été ${editingTemplate ? "mis à jour" : "créé"} avec succès`
    });
    
    setIsEditingTemplate(false);
  };

  const deleteTermTemplate = (id: string) => {
    const updatedTemplates = paymentTermTemplates.filter(t => t.id !== id);
    setPaymentTermTemplates(updatedTemplates);
    localStorage.setItem('paymentTermsTemplates', JSON.stringify(updatedTemplates));
    
    toast({
      title: "Modèle supprimé",
      description: "Le modèle de conditions a été supprimé"
    });
  };

  // Gestion des méthodes de paiement par défaut
  const handleSaveDefaultPaymentMethods = (methods: PaymentMethodDetails[]) => {
    setDefaultPaymentMethods(methods);
    localStorage.setItem('defaultPaymentMethods', JSON.stringify(methods));
    
    toast({
      title: "Méthodes de paiement sauvegardées",
      description: "Les méthodes de paiement par défaut ont été mises à jour"
    });
  };

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
            value="payment-terms"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
          >
            Conditions de paiement
          </TabsTrigger>
          <TabsTrigger 
            value="payment-methods"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet rounded-none h-10"
          >
            Méthodes de paiement
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
          <CompanyProfileForm 
            initialData={companyProfile}
            onSave={handleSaveProfile}
          />
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de facturation</CardTitle>
              <CardDescription>Personnalisez vos paramètres de facturation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
        
        {/* Nouvelle section: Conditions de paiement */}
        <TabsContent value="payment-terms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Conditions de paiement</CardTitle>
                <CardDescription>Créez et gérez des modèles de conditions de paiement</CardDescription>
              </div>
              <Button onClick={() => openTermTemplateEditor()}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau modèle
              </Button>
            </CardHeader>
            <CardContent>
              {paymentTermTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Vous n'avez pas encore créé de modèles de conditions de paiement.</p>
                  <p className="mt-2">Créez votre premier modèle pour l'utiliser dans vos factures.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentTermTemplates.map((template) => (
                    <div key={template.id} className="border rounded-md p-4 relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium flex items-center">
                            {template.name}
                            {template.isDefault && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Par défaut
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Délai: {template.delay === "immediate" 
                              ? "Paiement immédiat" 
                              : template.delay === "custom" 
                                ? `Date spécifique: ${template.customDate}` 
                                : `${template.delay} jours`}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => openTermTemplateEditor(template)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => deleteTermTemplate(template.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 text-sm bg-gray-50 p-2 rounded">
                        {template.termsText}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Nouvelle section: Méthodes de paiement */}
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de paiement par défaut</CardTitle>
              <CardDescription>Définissez les méthodes de paiement que vous proposez habituellement</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelector 
                methods={defaultPaymentMethods}
                onChange={handleSaveDefaultPaymentMethods}
                companyProfile={companyProfile as CompanyProfile}
                onSaveDefault={handleSaveDefaultPaymentMethods}
              />
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
      
      {/* Dialog d'édition de modèle de conditions */}
      <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Modifier un modèle" : "Créer un modèle"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nom du modèle</Label>
              <Input 
                id="template-name" 
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Ex: Conditions Standard 30 jours"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-delay">Délai de paiement</Label>
                <select 
                  id="template-delay"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTemplateDelay}
                  onChange={(e) => setNewTemplateDelay(e.target.value)}
                >
                  <option value="immediate">Paiement immédiat</option>
                  <option value="7">7 jours</option>
                  <option value="15">15 jours</option>
                  <option value="30">30 jours</option>
                  <option value="45">45 jours</option>
                  <option value="60">60 jours</option>
                  <option value="custom">Date spécifique</option>
                </select>
              </div>
              
              {newTemplateDelay === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="template-date">Date d'échéance</Label>
                  <Input 
                    id="template-date" 
                    type="date"
                    value={newTemplateDate}
                    onChange={(e) => setNewTemplateDate(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-terms">Texte des conditions</Label>
              <Textarea 
                id="template-terms" 
                value={newTemplateTerms}
                onChange={(e) => setNewTemplateTerms(e.target.value)}
                className="min-h-[120px]"
                placeholder="Paiement à réception de facture. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="template-default"
                checked={newTemplateDefault}
                onCheckedChange={setNewTemplateDefault}
              />
              <Label htmlFor="template-default">Définir comme conditions par défaut</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>Annuler</Button>
            <Button onClick={saveTermTemplate}>
              {editingTemplate ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
