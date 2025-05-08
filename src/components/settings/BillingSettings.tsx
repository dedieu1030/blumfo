
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvoiceNumberingConfig, Currency, ReminderSchedule } from "@/types/invoice";
import { 
  getInvoiceNumberingConfig, 
  saveInvoiceNumberingConfig,
  getDefaultCurrency,
  saveDefaultCurrency,
  availableCurrencies,
  getDefaultPaymentTerm,
  saveDefaultPaymentTerm
} from "@/services/invoiceSettingsService";
import { getReminderSchedules, saveReminderSchedule } from "@/services/reminderService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReminderScheduleEditor } from "@/components/ReminderScheduleEditor";

export function BillingSettings({ 
  showReminderConfig, 
  onToggleReminders 
}: { 
  showReminderConfig: boolean; 
  onToggleReminders: (enabled: boolean) => void; 
}) {
  const [numberingConfig, setNumberingConfig] = useState<InvoiceNumberingConfig>(getInvoiceNumberingConfig());
  const [defaultCurrency, setDefaultCurrency] = useState<string>(getDefaultCurrency());
  const [defaultPaymentTerm, setDefaultPaymentTerm] = useState<string>(getDefaultPaymentTerm());
  const [customDueDate, setCustomDueDate] = useState<Date | undefined>(undefined);
  const [previewNumber, setPreviewNumber] = useState<string>("");
  
  // États pour les relances
  const [reminderSchedules, setReminderSchedules] = useState<ReminderSchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ReminderSchedule | null>(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Générer l'aperçu du numéro de facture
  useEffect(() => {
    const paddedNumber = "001".padStart(numberingConfig.padding, '0');
    setPreviewNumber(`${numberingConfig.prefix}${paddedNumber}${numberingConfig.suffix || ''}`);
  }, [numberingConfig]);
  
  // Charger les planifications au chargement du composant
  useEffect(() => {
    if (showReminderConfig) {
      loadReminderSchedules();
    }
  }, [showReminderConfig]);
  
  const loadReminderSchedules = async () => {
    if (showReminderConfig) {
      setIsLoading(true);
      const result = await getReminderSchedules();
      if (result.success && result.schedules) {
        setReminderSchedules(result.schedules);
      } else {
        toast.error(result.error || "Impossible de charger les planifications de relance");
      }
      setIsLoading(false);
    }
  };
  
  const handleSaveConfig = () => {
    // Sauvegarder la configuration sans le prochain numéro
    // Nous utilisons toujours 1 comme nextNumber mais c'est juste pour 
    // la structure de données, ce champ ne sera plus utilisé
    const configToSave = {
      ...numberingConfig,
      nextNumber: 1
    };
    
    saveInvoiceNumberingConfig(configToSave);
    saveDefaultCurrency(defaultCurrency);
    
    // Save default payment term with custom date if applicable
    if (defaultPaymentTerm === 'custom' && customDueDate) {
      saveDefaultPaymentTerm(defaultPaymentTerm, format(customDueDate, 'yyyy-MM-dd'));
    } else {
      saveDefaultPaymentTerm(defaultPaymentTerm);
    }
    
    toast.success("Paramètres de facturation enregistrés");
  };
  
  // Fonctions pour gérer les relances
  const openScheduleEditor = (schedule?: ReminderSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
    } else {
      setEditingSchedule(null);
    }
    setIsEditingSchedule(true);
  };

  const handleSaveSchedule = async (schedule: ReminderSchedule) => {
    const result = await saveReminderSchedule(schedule);
    
    if (result.success) {
      // Refresh schedules list
      await loadReminderSchedules();
      
      setIsEditingSchedule(false);
      
      toast.success(editingSchedule 
        ? `La planification "${schedule.name}" a été mise à jour` 
        : `La planification "${schedule.name}" a été créée`
      );
    } else {
      toast.error(result.error || "Une erreur est survenue lors de l'enregistrement de la planification");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de facturation</CardTitle>
        <CardDescription>Personnalisez vos paramètres de facturation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration de la numérotation des factures */}
          <div className="md:col-span-2 border p-4 rounded-md space-y-4">
            <h3 className="font-medium text-lg">Numérotation des factures</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Définissez le format des numéros de facture qui seront générés automatiquement
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-prefix">Préfixe</Label>
                <Input 
                  id="invoice-prefix" 
                  value={numberingConfig.prefix}
                  onChange={(e) => setNumberingConfig({...numberingConfig, prefix: e.target.value})}
                  placeholder="Ex: FACT-"
                />
                <p className="text-xs text-muted-foreground">Texte apparaissant avant le numéro</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="padding">Remplissage</Label>
                <Select 
                  value={numberingConfig.padding.toString()} 
                  onValueChange={(value) => setNumberingConfig({...numberingConfig, padding: parseInt(value)})}
                >
                  <SelectTrigger id="padding">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sans zéros (1, 2, 3...)</SelectItem>
                    <SelectItem value="2">2 chiffres (01, 02...)</SelectItem>
                    <SelectItem value="3">3 chiffres (001, 002...)</SelectItem>
                    <SelectItem value="4">4 chiffres (0001, 0002...)</SelectItem>
                    <SelectItem value="5">5 chiffres (00001, 00002...)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Nombre de chiffres avec zéros</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoice-suffix">Suffixe (optionnel)</Label>
                <Input 
                  id="invoice-suffix" 
                  value={numberingConfig.suffix || ""}
                  onChange={(e) => setNumberingConfig({...numberingConfig, suffix: e.target.value})}
                  placeholder="Ex: -FR"
                />
                <p className="text-xs text-muted-foreground">Texte apparaissant après le numéro</p>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch 
                  id="reset-annually" 
                  checked={numberingConfig.resetAnnually}
                  onCheckedChange={(checked) => setNumberingConfig({...numberingConfig, resetAnnually: checked})}
                />
                <Label htmlFor="reset-annually">
                  Réinitialiser la numérotation chaque année
                </Label>
              </div>
            </div>
            
            <div className="mt-4 bg-muted p-3 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium">Aperçu du format:</span>
              <span className="font-mono bg-background px-3 py-1 rounded border">{previewNumber}</span>
            </div>
          </div>
          
          {/* Devise par défaut */}
          <div className="space-y-2">
            <Label htmlFor="currency">Devise par défaut</Label>
            <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une devise" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {availableCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{currency.name}</span>
                      <span className="font-medium ml-2">{currency.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Cette devise sera utilisée par défaut pour toutes les factures</p>
          </div>
          
          {/* Délai de paiement par défaut */}
          <div className="space-y-2">
            <Label htmlFor="default-payment-term">Délai de paiement par défaut</Label>
            <Select 
              value={defaultPaymentTerm} 
              onValueChange={setDefaultPaymentTerm}
            >
              <SelectTrigger id="default-payment-term">
                <SelectValue placeholder="Choisir un délai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Paiement immédiat</SelectItem>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="15">15 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="45">45 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
                <SelectItem value="custom">Date personnalisée</SelectItem>
              </SelectContent>
            </Select>
            {defaultPaymentTerm === 'custom' && (
              <div className="mt-2">
                <Label htmlFor="custom-due-date">Date d'échéance personnalisée</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="custom-due-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customDueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDueDate ? format(customDueDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customDueDate}
                      onSelect={setCustomDueDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">Date spécifique pour l'échéance</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Ce délai sera proposé par défaut lors de la création d'une facture</p>
          </div>
          
          {/* Configuration des relances automatiques */}
          <div className="md:col-span-2 border p-4 rounded-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-reminder" 
                  checked={showReminderConfig}
                  onCheckedChange={onToggleReminders}
                />
                <div>
                  <Label htmlFor="auto-reminder" className="font-medium">Relancer automatiquement les factures impayées</Label>
                  <p className="text-xs text-muted-foreground">Configure l'envoi automatique d'emails de relance pour les factures non payées</p>
                </div>
              </div>
            </div>
            
            {/* Afficher la configuration des relances si activée */}
            {showReminderConfig && (
              <div className="mt-4 space-y-4">
                <div className="text-sm text-muted-foreground mb-2">
                  <p>Les relances automatiques permettent d'envoyer des emails de rappel aux clients lorsque leurs factures restent impayées.</p>
                  <p>Vous pouvez configurer plusieurs planifications avec des déclencheurs différents (avant/après échéance, ou après une précédente relance).</p>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : reminderSchedules.length === 0 ? (
                  <div className="text-center py-4">
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
                    <ul className="space-y-2">
                      {reminderSchedules.map((schedule) => (
                        <li key={schedule.id} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {schedule.name}
                              {schedule.isDefault && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Par défaut
                                </span>
                              )}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => openScheduleEditor(schedule)}>
                              Modifier
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {schedule.triggers.length} relance(s) configurée(s)
                          </p>
                        </li>
                      ))}
                    </ul>
                    
                    <Button variant="outline" onClick={() => openScheduleEditor()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une planification
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveConfig}>
            Enregistrer les paramètres
          </Button>
        </div>
      </CardContent>
      
      {/* Dialog d'édition de planification de relances */}
      <Dialog open={isEditingSchedule} onOpenChange={setIsEditingSchedule}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Modifier la planification" : "Créer une planification de relances"}
            </DialogTitle>
          </DialogHeader>
          
          <ReminderScheduleEditor
            schedule={editingSchedule || undefined}
            onSave={handleSaveSchedule}
            onCancel={() => setIsEditingSchedule(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
