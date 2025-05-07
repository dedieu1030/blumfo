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
import { Check, Plus, Edit, Trash, ExternalLink, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2, CreditCard } from "lucide-react";
import { CompanyProfile, PaymentTermTemplate, PaymentMethodDetails, ReminderSchedule } from "@/types/invoice";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PaymentTermsSelector } from "@/components/PaymentTermsSelector";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { useSearchParams } from "react-router-dom";
import { checkStripeConnection, initiateStripeConnect, disconnectStripeAccount } from "@/services/stripeConnectClient";
import { toast } from "sonner";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { ProfileViewer } from "@/components/profile/ProfileViewer";
import { CalendarIcon, Clock } from "lucide-react";
import { ReminderScheduleEditor } from "@/components/ReminderScheduleEditor";

export default function Settings() {
  const { toast: shadcnToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  
  // État du profil
  const [companyProfile, setCompanyProfile] = useState<Partial<CompanyProfile>>({});
  const [hasProfile, setHasProfile] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // État pour les autres fonctionnalités
  const [paymentTermTemplates, setPaymentTermTemplates] = useState<PaymentTermTemplate[]>([]);
  const [defaultPaymentMethods, setDefaultPaymentMethods] = useState<PaymentMethodDetails[]>([]);
  
  // Stripe Connect state
  const [stripeConnection, setStripeConnection] = useState<{
    isLoading: boolean;
    isConnected: boolean;
    accountDetails?: any;
    accountId?: string;
    error?: string;
  }>({
    isLoading: true,
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);
  
  // Term template edit state
  const [editingTemplate, setEditingTemplate] = useState<PaymentTermTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDelay, setNewTemplateDelay] = useState("15");
  const [newTemplateDate, setNewTemplateDate] = useState("");
  const [newTemplateTerms, setNewTemplateTerms] = useState("");
  const [newTemplateDefault, setNewTemplateDefault] = useState(false);

  // État pour les planifications de relance
  const [reminderSchedules, setReminderSchedules] = useState<ReminderSchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ReminderSchedule | null>(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [showReminderConfig, setShowReminderConfig] = useState(false);

  // Récupérer les données du profil d'entreprise
  useEffect(() => {
    const savedProfile = localStorage.getItem('companyProfile');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        setCompanyProfile(profileData);
        setHasProfile(true);
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
    
    // Check Stripe connection status
    checkStripeConnectionStatus();
    
    // Récupérer les planifications de relance
    const savedSchedules = localStorage.getItem('reminderSchedules');
    if (savedSchedules) {
      try {
        setReminderSchedules(JSON.parse(savedSchedules));
      } catch (e) {
        console.error("Erreur lors du parsing des planifications de relance", e);
      }
    } else {
      // Créer une planification par défaut
      const defaultSchedule: ReminderSchedule = {
        id: "default",
        name: "Relances standard",
        enabled: false,
        isDefault: true,
        triggers: [
          {
            id: "trigger1",
            triggerType: "days_after_due",
            triggerValue: 3,
            emailSubject: "Rappel de facture impayée",
            emailBody: "Cher [NOM_CLIENT],\n\nNous vous rappelons que votre facture [NUM_FACTURE] d'un montant de [MONTANT] € est arrivée à échéance le [DATE_ECHEANCE] et n'a pas encore été réglée.\n\nNous vous invitons à procéder à son règlement dès que possible.\n\nCordialement,\n[VOTRE_NOM]"
          },
          {
            id: "trigger2",
            triggerType: "days_after_previous_reminder",
            triggerValue: 7,
            emailSubject: "Relance importante - Facture impayée",
            emailBody: "Cher [NOM_CLIENT],\n\nMalgré notre précédent rappel, nous n'avons toujours pas reçu le paiement de votre facture [NUM_FACTURE] d'un montant de [MONTANT] €.\n\nNous vous invitons à procéder à son règlement dans les plus brefs délais afin d'éviter des frais supplémentaires.\n\nCordialement,\n[VOTRE_NOM]"
          }
        ]
      };
      setReminderSchedules([defaultSchedule]);
      localStorage.setItem('reminderSchedules', JSON.stringify([defaultSchedule]));
    }
  }, []);

  const handleSaveProfile = (profile: CompanyProfile) => {
    setCompanyProfile(profile);
    setHasProfile(true);
    setIsCreatingProfile(false);
    setIsEditingProfile(false);
    localStorage.setItem('companyProfile', JSON.stringify(profile));
    
    // Afficher une notification de succès
    toast.success("Profil enregistré avec succès");
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
      shadcnToast({
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
        ? paymentTermTemplates.map(t => ({ ...t, isDefault: false }))
        : [...paymentTermTemplates];
      
      // Add the new template to the updated templates array
      updatedTemplates.push(newTemplate);
    }
    
    setPaymentTermTemplates(updatedTemplates);
    localStorage.setItem('paymentTermsTemplates', JSON.stringify(updatedTemplates));
    
    shadcnToast({
      title: editingTemplate ? "Modèle mis à jour" : "Modèle créé",
      description: `Le modèle "${newTemplateName}" a été ${editingTemplate ? "mis à jour" : "créé"} avec succès`
    });
    
    setIsEditingTemplate(false);
  };

  const deleteTermTemplate = (id: string) => {
    const updatedTemplates = paymentTermTemplates.filter(t => t.id !== id);
    setPaymentTermTemplates(updatedTemplates);
    localStorage.setItem('paymentTermsTemplates', JSON.stringify(updatedTemplates));
    
    shadcnToast({
      title: "Modèle supprimé",
      description: "Le modèle de conditions a été supprimé"
    });
  };

  // Gestion des méthodes de paiement par défaut
  const handleSaveDefaultPaymentMethods = (methods: PaymentMethodDetails[]) => {
    setDefaultPaymentMethods(methods);
    localStorage.setItem('defaultPaymentMethods', JSON.stringify(methods));
    
    shadcnToast({
      title: "Méthodes de paiement sauvegardées",
      description: "Les méthodes de paiement par défaut ont été mises à jour"
    });
  };

  // Stripe Connect functions
  const checkStripeConnectionStatus = async () => {
    setStripeConnection(prev => ({ ...prev, isLoading: true }));
    
    try {
      const status = await checkStripeConnection();
      
      setStripeConnection({
        isLoading: false,
        isConnected: status.connected,
        accountId: status.accountId,
        accountDetails: status.details,
        error: status.message
      });
    } catch (error) {
      console.error("Error checking Stripe connection:", error);
      setStripeConnection({
        isLoading: false,
        isConnected: false,
        error: "Erreur lors de la vérification de la connexion Stripe"
      });
    }
  };

  const handleConnectWithStripe = async () => {
    setIsConnecting(true);
    
    try {
      // Create the redirect URL for after OAuth
      const redirectUrl = `${window.location.origin}/stripe/callback`;
      
      // Call the edge function to initiate the connection
      const response = await initiateStripeConnect(redirectUrl);
      
      if (response && response.url) {
        // Redirect the user to the Stripe OAuth page
        window.location.href = response.url;
      } else {
        toast.error("Impossible d'initialiser la connexion avec Stripe");
      }
    } catch (error) {
      console.error("Error connecting with Stripe:", error);
      toast.error("Erreur lors de la connexion avec Stripe");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!stripeConnection.accountId) {
      toast.error("Aucun compte Stripe connecté");
      return;
    }
    
    setIsDisconnecting(true);
    
    try {
      const success = await disconnectStripeAccount(stripeConnection.accountId);
      
      if (success) {
        setStripeConnection({
          isLoading: false,
          isConnected: false,
          accountDetails: undefined,
          accountId: undefined
        });
        
        setIsConfirmingDisconnect(false);
      }
    } catch (error) {
      console.error("Error disconnecting Stripe account:", error);
      toast.error("Erreur lors de la déconnexion de votre compte Stripe");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const openScheduleEditor = (schedule?: ReminderSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
    } else {
      setEditingSchedule(null);
    }
    setIsEditingSchedule(true);
  };

  const deleteSchedule = (scheduleId: string) => {
    const updatedSchedules = reminderSchedules.filter(s => s.id !== scheduleId);
    setReminderSchedules(updatedSchedules);
    localStorage.setItem('reminderSchedules', JSON.stringify(updatedSchedules));
    
    shadcnToast({
      title: "Planification supprimée",
      description: "La planification de relances a été supprimée"
    });
  };

  const handleSaveSchedule = (schedule: ReminderSchedule) => {
    let updatedSchedules: ReminderSchedule[];
    
    if (editingSchedule) {
      // Mise à jour d'une planification existante
      updatedSchedules = reminderSchedules.map(s => 
        s.id === schedule.id ? schedule : schedule.isDefault ? { ...s, isDefault: false } : s
      );
    } else {
      // Création d'une nouvelle planification
      if (schedule.isDefault) {
        updatedSchedules = reminderSchedules.map(s => ({ ...s, isDefault: false }));
      } else {
        updatedSchedules = [...reminderSchedules];
      }
      updatedSchedules.push(schedule);
    }
    
    setReminderSchedules(updatedSchedules);
    localStorage.setItem('reminderSchedules', JSON.stringify(updatedSchedules));
    setIsEditingSchedule(false);
    
    shadcnToast({
      title: editingSchedule ? "Planification mise à jour" : "Planification créée",
      description: `La planification "${schedule.name}" a été ${editingSchedule ? "mise à jour" : "créée"} avec succès`
    });
  };

  const handleToggleAutoReminders = (enabled: boolean) => {
    setShowReminderConfig(enabled);
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
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
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
          {!hasProfile && !isCreatingProfile ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Vous n'avez pas encore de profil</h2>
              <p className="text-muted-foreground mb-8">
                Créez votre profil professionnel pour qu'il apparaisse sur vos factures.
              </p>
              <Button 
                className="bg-violet hover:bg-violet/90"
                onClick={() => setIsCreatingProfile(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer mon profil
              </Button>
            </div>
          ) : isCreatingProfile || isEditingProfile ? (
            <ProfileWizard 
              initialData={isEditingProfile ? companyProfile : undefined}
              onComplete={handleSaveProfile}
              onCancel={() => {
                setIsCreatingProfile(false);
                setIsEditingProfile(false);
              }}
            />
          ) : (
            <ProfileViewer 
              profile={companyProfile as CompanyProfile}
              onEdit={() => setIsEditingProfile(true)}
            />
          )}
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
                  <Switch 
                    id="auto-reminder" 
                    checked={showReminderConfig}
                    onCheckedChange={handleToggleAutoReminders}
                  />
                  <Label htmlFor="auto-reminder">Relancer automatiquement les factures impayées</Label>
                </div>
              </div>

              {showReminderConfig && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-medium mb-4">Configuration des relances automatiques</h3>
                  
                  {reminderSchedules.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        Aucune planification de relances configurée
                      </p>
                      <Button onClick={() => openScheduleEditor()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une planification
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reminderSchedules.map((schedule) => (
                        <Card key={schedule.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium flex items-center">
                                  {schedule.name}
                                  {schedule.isDefault && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Par défaut
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {schedule.triggers.length} relance(s) configurée(s)
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={schedule.enabled}
                                  onCheckedChange={(checked) => {
                                    const updated = reminderSchedules.map(s => 
                                      s.id === schedule.id ? { ...s, enabled: checked } : s
                                    );
                                    setReminderSchedules(updated);
                                    localStorage.setItem('reminderSchedules', JSON.stringify(updated));
                                  }}
                                />
                                <div className="flex space-x-1">
                                  <Button variant="outline" size="icon" onClick={() => openScheduleEditor(schedule)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {!schedule.isDefault && (
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      onClick={() => deleteSchedule(schedule.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              {schedule.triggers.map((trigger, index) => (
                                <div key={trigger.id} className="flex items-start space-x-4 mt-2 pb-2">
                                  <div className="flex-shrink-0 mt-1">
                                    {trigger.triggerType === "days_before_due" ? (
                                      <CalendarIcon className="h-5 w-5 text-amber-500" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-blue-500" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">
                                      Relance {index + 1}:
                                    </span>
                                    <span className="text-sm text-muted-foreground ml-1">
                                      {trigger.triggerType === "days_before_due" 
                                        ? `${trigger.triggerValue} jour(s) avant échéance` 
                                        : trigger.triggerType === "days_after_due"
                                          ? `${trigger.triggerValue} jour(s) après échéance`
                                          : `${trigger.triggerValue} jour(s) après la dernière relance`}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <Button variant="outline" onClick={() => openScheduleEditor()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une planification
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Conditions de paiement */}
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
        
        {/* Méthodes de paiement */}
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de paiement par défaut</CardTitle>
              <CardDescription>Définissez les méthodes de paiement que vous proposez habituellement</CardDescription>
            </CardHeader>
            <CardContent>
              {hasProfile ? (
                <PaymentMethodSelector 
                  methods={defaultPaymentMethods}
                  onChange={handleSaveDefaultPaymentMethods}
                  companyProfile={companyProfile as CompanyProfile}
                  onSaveDefault={handleSaveDefaultPaymentMethods}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Vous devez d'abord créer un profil avant de configurer les méthodes de paiement.
                  </p>
                  <Button 
                    className="mt-4 bg-violet hover:bg-violet/90"
                    onClick={() => {
                      setActiveTab("profile");
                      setIsCreatingProfile(true);
                    }}
                  >
                    Créer mon profil
                  </Button>
                </div>
              )}
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
              <CardTitle>Configuration Stripe Connect</CardTitle>
              <CardDescription>
                Connectez votre compte Stripe pour recevoir directement les paiements de vos clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {stripeConnection.isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 text-violet animate-spin mb-4" />
                  <p className="text-muted-foreground">Vérification de la connexion Stripe...</p>
                </div>
              ) : stripeConnection.isConnected ? (
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-green-50 rounded-md">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mr-4" />
                    <div>
                      <h3 className="font-medium">Compte Stripe connecté</h3>
                      <p className="text-sm text-muted-foreground">
                        Votre compte est connecté et prêt à recevoir des paiements
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-4">Détails du compte</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nom de l'entreprise</p>
                        <p className="font-medium">{stripeConnection.accountDetails?.business_name || "Non spécifié"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ID du compte</p>
                        <p className="font-medium">{stripeConnection.accountId || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type d'entreprise</p>
                        <p className="font-medium">{stripeConnection.accountDetails?.business_type || "Non spécifié"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mode</p>
                        <p className="font-medium">{stripeConnection.accountDetails?.livemode ? "Production" : "Test"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Paiements activés</p>
                        <div className="flex items-center">
                          {stripeConnection.accountDetails?.charges_enabled ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <p className="font-medium">
                            {stripeConnection.accountDetails?.charges_enabled ? "Oui" : "Non"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Versements activés</p>
                        <div className="flex items-center">
                          {stripeConnection.accountDetails?.payouts_enabled ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <p className="font-medium">
                            {stripeConnection.accountDetails?.payouts_enabled ? "Oui" : "Non"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {(!stripeConnection.accountDetails?.charges_enabled || !stripeConnection.accountDetails?.payouts_enabled) && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">Configuration incomplète</p>
                          <p className="text-sm text-amber-700">
                            Votre compte Stripe nécessite une configuration supplémentaire pour être pleinement opérationnel.
                            Veuillez compléter les informations manquantes dans votre tableau de bord Stripe.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open('https://dashboard.stripe.com/account', '_blank')}
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            Compléter dans Stripe
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={checkStripeConnectionStatus}
                      disabled={stripeConnection.isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser le statut
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setIsConfirmingDisconnect(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Déconnecter le compte
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-amber-50 rounded-md">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mr-4" />
                    <div>
                      <h3 className="font-medium">Connectez votre compte Stripe</h3>
                      <p className="text-sm text-muted-foreground">
                        Pour recevoir les paiements directement sur votre compte bancaire, vous devez connecter votre compte Stripe.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-6 space-y-4">
                    <div className="text-center max-w-xl mx-auto">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-violet" />
                      <h3 className="text-lg font-medium mb-2">Acceptez des paiements en ligne</h3>
                      <p className="text-muted-foreground mb-6">
                        Grâce à Stripe Connect, vos clients peuvent payer vos factures en ligne directement sur votre compte bancaire. 
                        Les paiements sont sécurisés et rapides.
                      </p>
                      
                      <Button 
                        className="bg-violet hover:bg-violet/90"
                        onClick={handleConnectWithStripe}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connexion en cours...
                          </>
                        ) : (
                          <>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                                 alt="Stripe" 
                                 className="h-4 mr-2" />
                            Connecter avec Stripe
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-8 border-t pt-6">
                      <h4 className="text-sm font-medium mb-3">Pourquoi utiliser Stripe ?</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Acceptez les cartes bancaires et autres moyens de paiement</span>
                        </li>
                        <li className="flex">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Recevez les fonds directement sur votre compte bancaire</span>
                        </li>
                        <li className="flex">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Gérez les factures et les paiements depuis votre tableau de bord</span>
                        </li>
                        <li className="flex">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>Protection contre les fraudes et gestion des litiges</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
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
      
      {/* Dialog de confirmation de déconnexion Stripe */}
      <Dialog open={isConfirmingDisconnect} onOpenChange={setIsConfirmingDisconnect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déconnecter votre compte Stripe</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir déconnecter votre compte Stripe ? Les paiements en ligne ne seront plus disponibles pour vos clients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Cette action supprimera l'association entre votre compte Stripe et cette application, mais n'affectera pas votre compte Stripe lui-même.
            </p>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmingDisconnect(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDisconnectStripe}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Déconnexion...
                </>
              ) : (
                "Confirmer la déconnexion"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog d'édition de planification de relances */}
      <Dialog open={isEditingSchedule} onOpenChange={setIsEditingSchedule}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Modifier la planification" : "Créer une planification de relances"}
            </DialogTitle>
            <DialogDescription>
              Définissez quand et comment les relances seront envoyées aux clients
            </DialogDescription>
          </DialogHeader>
          
          <ReminderScheduleEditor
            schedule={editingSchedule || undefined}
            onSave={handleSaveSchedule}
            onCancel={() => setIsEditingSchedule(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
