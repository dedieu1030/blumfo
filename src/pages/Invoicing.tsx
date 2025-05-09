import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
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
import { InvoiceNumberingConfig, Currency, ReminderSchedule, InvoiceData } from "@/types/invoice";
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
import { MobileNavigation } from "@/components/MobileNavigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReminderScheduleEditor } from "@/components/ReminderScheduleEditor";
import { useNavigate } from "react-router-dom";
import { InvoiceDialog } from "@/components/InvoiceDialog";
import { useTranslation } from "react-i18next";

export default function Invoicing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // États pour la configuration de facturation
  const [numberingConfig, setNumberingConfig] = useState<InvoiceNumberingConfig>({
    prefix: "INV",
    suffix: "",
    startNumber: 1,
    padding: 3,
    separator: "-",
    includeDate: true,
    dateFormat: "YYYY-MM-DD",
    digits: 3,
    nextNumber: 1,
    pattern: "PREFIX-YEAR-NUMBER",
    resetPeriod: "never",
    lastReset: "",
    resetAnnually: false
  });
  const [defaultCurrency, setDefaultCurrency] = useState<string>(getDefaultCurrency());
  const [defaultPaymentTerm, setDefaultPaymentTerm] = useState<string>(getDefaultPaymentTerm());
  const [customDueDate, setCustomDueDate] = useState<Date | undefined>(undefined);
  const [previewNumber, setPreviewNumber] = useState<string>("");
  
  // États pour les relances
  const [showReminderConfig, setShowReminderConfig] = useState(false);
  const [reminderSchedules, setReminderSchedules] = useState<ReminderSchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ReminderSchedule | null>(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Générer l'aperçu du numéro de facture
  useEffect(() => {
    const paddedNumber = "001".padStart(numberingConfig.padding, '0');
    setPreviewNumber(`${numberingConfig.prefix}${paddedNumber}${numberingConfig.suffix || ''}`);
  }, [numberingConfig]);
  
  // Vérifier si les relances sont activées
  useEffect(() => {
    const reminderSchedules = localStorage.getItem('reminderSchedules');
    if (reminderSchedules) {
      try {
        const schedules = JSON.parse(reminderSchedules);
        setShowReminderConfig(schedules.some(s => s.enabled));
        
        if (schedules.some(s => s.enabled)) {
          loadReminderSchedules();
        }
      } catch (e) {
        console.error("Erreur lors du parsing des planifications de relance", e);
      }
    }
  }, []);
  
  // Charger les planifications au chargement du composant
  const loadReminderSchedules = async () => {
    if (showReminderConfig) {
      setIsLoading(true);
      const result = await getReminderSchedules();
      if (result.success && result.schedules) {
        setReminderSchedules(result.schedules);
      } else {
        toast.error(result.error || t("unableToLoadReminders", "Impossible de charger les planifications de relance"));
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
    
    toast.success(t("settingsSaved", "Paramètres de facturation enregistrés"));
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
        ? t("scheduleUpdated", { name: schedule.name })
        : t("scheduleCreated", { name: schedule.name })
      );
    } else {
      toast.error(result.error || t("scheduleSaveError", "Une erreur est survenue lors de l'enregistrement de la planification"));
    }
  };
  
  const handleGenerateInvoice = () => {
    setInvoiceDialogOpen(true);
  };
  
  // Fix: Make this function return a Promise<void> as expected by InvoiceDialog
  const handleInvoiceGenerated = async (invoiceData: InvoiceData): Promise<void> => {
    setInvoiceDialogOpen(false);
    navigate("/invoices");
    return Promise.resolve();
  };

  const handlePaddingChange = (value: string) => {
    const padding = parseInt(value, 10);
    setNumberingConfig(prev => ({
      ...prev,
      padding: isNaN(padding) ? 3 : padding
    }));
  };

  const handleResetAnnuallyChange = (checked: boolean) => {
    setNumberingConfig(prev => ({
      ...prev,
      resetAnnually: checked,
      resetPeriod: checked ? "yearly" : "never"
    }));
  };

  return (
    <>
      <Header 
        title={t("invoicing")} 
        description={t("invoicingDescription")}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        showNewInvoiceButton={false}
        actions={
          <Button onClick={handleGenerateInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            {t("newInvoice")}
          </Button>
        }
      />
      
      {/* J'ai supprimé le bouton "Nouvelle facture" ici comme demandé */}

      <Card>
        <CardHeader>
          <CardTitle>{t("billingConfiguration")}</CardTitle>
          <CardDescription>{t("customizeYourBillingSettings")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration de la numérotation des factures */}
            <div className="md:col-span-2 border p-4 rounded-md space-y-4">
              <h3 className="font-medium text-lg">{t("invoiceNumbering")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("defineFormatOfInvoiceNumbers")}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">{t("prefix")}</Label>
                  <Input 
                    id="invoice-prefix" 
                    value={numberingConfig.prefix}
                    onChange={(e) => setNumberingConfig({...numberingConfig, prefix: e.target.value})}
                    placeholder="Ex: FACT-"
                  />
                  <p className="text-xs text-muted-foreground">{t("textBeforeNumber")}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="padding">{t("padding")}</Label>
                  <Select 
                    value={numberingConfig.padding.toString()} 
                    onValueChange={(value) => handlePaddingChange(value)}
                  >
                    <SelectTrigger id="padding">
                      <SelectValue placeholder={t("chooseDelay")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Sans zéros (1, 2, 3...)</SelectItem>
                      <SelectItem value="2">2 chiffres (01, 02...)</SelectItem>
                      <SelectItem value="3">3 chiffres (001, 002...)</SelectItem>
                      <SelectItem value="4">4 chiffres (0001, 0002...)</SelectItem>
                      <SelectItem value="5">5 chiffres (00001, 00002...)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t("numberOfDigitsWithZeros")}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoice-suffix">{t("suffix")}</Label>
                  <Input 
                    id="invoice-suffix" 
                    value={numberingConfig.suffix || ""}
                    onChange={(e) => setNumberingConfig({...numberingConfig, suffix: e.target.value})}
                    placeholder="Ex: -FR"
                  />
                  <p className="text-xs text-muted-foreground">{t("textAfterNumber")}</p>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch 
                    id="reset-annually" 
                    checked={numberingConfig.resetAnnually}
                    onCheckedChange={(checked) => handleResetAnnuallyChange(checked)}
                  />
                  <Label htmlFor="reset-annually">
                    {t("resetAnnually")}
                  </Label>
                </div>
              </div>
              
              <div className="mt-4 bg-muted p-3 rounded-md flex items-center justify-between">
                <span className="text-sm font-medium">{t("previewFormat")}</span>
                <span className="font-mono bg-background px-3 py-1 rounded border">{previewNumber}</span>
              </div>
            </div>
            
            {/* Devise par défaut */}
            <div className="space-y-2">
              <Label htmlFor="currency">{t("defaultCurrency")}</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder={t("chooseDelay")} />
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
              <p className="text-xs text-muted-foreground">{t("currencyUsedForAllInvoices")}</p>
            </div>
            
            {/* Délai de paiement par défaut */}
            <div className="space-y-2">
              <Label htmlFor="default-payment-term">{t("defaultPaymentTerm")}</Label>
              <Select 
                value={defaultPaymentTerm} 
                onValueChange={setDefaultPaymentTerm}
              >
                <SelectTrigger id="default-payment-term">
                  <SelectValue placeholder={t("chooseDelay")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">{t("immediatePayment")}</SelectItem>
                  <SelectItem value="7">7 {t("days")}</SelectItem>
                  <SelectItem value="15">15 {t("days")}</SelectItem>
                  <SelectItem value="30">30 {t("days")}</SelectItem>
                  <SelectItem value="45">45 {t("days")}</SelectItem>
                  <SelectItem value="60">60 {t("days")}</SelectItem>
                  <SelectItem value="90">90 {t("days")}</SelectItem>
                  <SelectItem value="custom">{t("customDate")}</SelectItem>
                </SelectContent>
              </Select>
              {defaultPaymentTerm === 'custom' && (
                <div className="mt-2">
                  <Label htmlFor="custom-due-date">{t("customDueDate")}</Label>
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
                        {customDueDate ? format(customDueDate, 'dd/MM/yyyy') : <span>{t("selectDate")}</span>}
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
                  <p className="text-xs text-muted-foreground mt-1">{t("specificDueDate")}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{t("termUsedByDefault")}</p>
            </div>
            
            {/* Configuration des relances automatiques */}
            <div className="md:col-span-2 border p-4 rounded-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-reminder" 
                    checked={showReminderConfig}
                    onCheckedChange={setShowReminderConfig}
                  />
                  <div>
                    <Label htmlFor="auto-reminder" className="font-medium">{t("automaticallyRemindUnpaidInvoices")}</Label>
                    <p className="text-xs text-muted-foreground">{t("configureAutoEmailReminders")}</p>
                  </div>
                </div>
              </div>
              
              {/* Afficher la configuration des relances si activée */}
              {showReminderConfig && (
                <div className="mt-4 space-y-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    <p>{t("autoRemindersDescription")}</p>
                    <p>{t("remindersConfigDescription")}</p>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : reminderSchedules.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">
                        {t("noRemindersConfigured")}
                      </p>
                      <Button onClick={() => openScheduleEditor()}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("createSchedule")}
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
                                    {t("defaultLabel")}
                                  </span>
                                )}
                              </span>
                              <Button variant="outline" size="sm" onClick={() => openScheduleEditor(schedule)}>
                                {t("editSchedule")}
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {schedule.triggers.length} {t("remindersConfigured")}
                            </p>
                          </li>
                        ))}
                      </ul>
                      
                      <Button variant="outline" onClick={() => openScheduleEditor()}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addSchedule")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveConfig}>
              {t("saveSettings")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("myInvoices")}</CardTitle>
            <CardDescription>{t("accessYourExistingInvoices")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("/invoices")} className="w-full">
              {t("viewAllMyInvoices")}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog d'édition de planification de relances */}
      <Dialog open={isEditingSchedule} onOpenChange={setIsEditingSchedule}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? t("editReminder") : t("createReminder")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[70vh] px-1 pr-4">
            <ReminderScheduleEditor
              schedule={editingSchedule || undefined}
              onSave={handleSaveSchedule}
              onCancel={() => setIsEditingSchedule(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de création de facture */}
      <InvoiceDialog 
        open={invoiceDialogOpen} 
        onOpenChange={setInvoiceDialogOpen}
        onGenerateInvoice={handleInvoiceGenerated} 
        isGenerating={isGenerating}
      />
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
