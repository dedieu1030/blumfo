
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Plus, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoicePreview } from "@/components/InvoicePreview";
import { generateInvoiceHTML } from "@/services/pdfGenerator";
import { InvoiceActions } from "@/components/InvoiceActions";
import { CompanyProfile } from "./CompanyProfile";

// Define invoice template types
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
  },
  {
    id: "poppins-orange",
    name: "Poppins Orange",
    description: "Un style contrasté avec touches d'orange",
    previewBg: "bg-orange-50",
    accent: "border-orange-500",
  }
];

interface ServiceLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  tva: string;
  total: string;
}

export default function Invoicing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  
  // Invoice number and date
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  
  // Client information
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [saveClient, setSaveClient] = useState(false);
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  
  // Service lines
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([
    {
      id: Date.now().toString(),
      description: "",
      quantity: "1",
      unitPrice: "0",
      tva: "20",
      total: "0"
    }
  ]);
  
  // Payment terms
  const [paymentDelay, setPaymentDelay] = useState("15");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [paymentTerms, setPaymentTerms] = useState("");
  
  // Additional fields
  const [notes, setNotes] = useState("");
  const [signature, setSignature] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  
  // Invoice totals
  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [total, setTotal] = useState(0);

  // État pour la prévisualisation
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  // Load company profile and set default values
  useEffect(() => {
    const savedProfile = localStorage.getItem("companyProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setCompanyProfile(parsedProfile);
      
      // Set default values from company profile
      if (parsedProfile.defaultTaxRate) {
        const defaultTaxRate = parsedProfile.defaultTaxRate;
        setServiceLines(prev => prev.map(line => ({
          ...line,
          tva: defaultTaxRate
        })));
      }
      
      if (parsedProfile.defaultPaymentTerms) {
        setPaymentTerms(parsedProfile.defaultPaymentTerms);
      }
      
      if (parsedProfile.defaultThankYouMessage) {
        setThankYouMessage(parsedProfile.defaultThankYouMessage);
      }
    }
  }, []);

  // Generate a default invoice number on component mount
  useEffect(() => {
    // Format: INV-YYYYMMDD-XX (where XX is a random number)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 90 + 10);
    
    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
    
    // Set due date based on payment delay (default to 15 days)
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 15);
    setDueDate(dueDate.toISOString().split('T')[0]);
  }, []);

  // Update due date when invoice date or payment delay changes
  useEffect(() => {
    if (invoiceDate) {
      const date = new Date(invoiceDate);
      const days = paymentDelay === 'immediate' ? 0 : parseInt(paymentDelay) || 0;
      date.setDate(date.getDate() + days);
      setDueDate(date.toISOString().split('T')[0]);
    }
  }, [invoiceDate, paymentDelay]);

  // Calculate totals when service lines change
  useEffect(() => {
    let calculatedSubtotal = 0;
    let calculatedTaxTotal = 0;
    
    serviceLines.forEach(line => {
      const lineQuantity = parseFloat(line.quantity) || 0;
      const lineUnitPrice = parseFloat(line.unitPrice) || 0;
      const lineTva = parseFloat(line.tva) || 0;
      
      const lineTotal = lineQuantity * lineUnitPrice;
      const lineTaxAmount = lineTotal * (lineTva / 100);
      
      calculatedSubtotal += lineTotal;
      calculatedTaxTotal += lineTaxAmount;
    });
    
    setSubtotal(calculatedSubtotal);
    setTaxTotal(calculatedTaxTotal);
    setTotal(calculatedSubtotal + calculatedTaxTotal);
    
    // Update the total in service lines
    const updatedServiceLines = serviceLines.map(line => ({
      ...line,
      total: ((parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0)).toFixed(2)
    }));
    
    if (JSON.stringify(updatedServiceLines) !== JSON.stringify(serviceLines)) {
      setServiceLines(updatedServiceLines);
    }
  }, [serviceLines]);

  // Add a new service line
  const addServiceLine = () => {
    setServiceLines([
      ...serviceLines,
      {
        id: Date.now().toString(),
        description: "",
        quantity: "1",
        unitPrice: "0",
        tva: "20",
        total: "0"
      }
    ]);
  };

  // Remove a service line
  const removeServiceLine = (id: string) => {
    if (serviceLines.length > 1) {
      setServiceLines(serviceLines.filter(line => line.id !== id));
    } else {
      toast({
        title: "Action impossible",
        description: "Vous devez conserver au moins une ligne de prestation",
        variant: "destructive"
      });
    }
  };

  // Update a service line
  const updateServiceLine = (id: string, field: keyof ServiceLine, value: string) => {
    setServiceLines(serviceLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  // Save as draft
  const saveAsDraft = () => {
    // In a real app, this would save to database
    toast({
      title: "Brouillon enregistré",
      description: "Votre facture a été sauvegardée comme brouillon"
    });
    
    // After saving, navigate to invoices list
    navigate("/invoices");
  };

  // Générer la prévisualisation HTML
  const generatePreview = () => {
    // Collecter toutes les données de la facture
    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      clientName,
      clientEmail,
      clientAddress,
      serviceLines,
      subtotal,
      taxTotal,
      total,
      paymentDelay,
      paymentMethod,
      paymentTerms,
      notes,
      thankYouMessage,
      company: companyProfile,
    };
    
    // Générer le HTML en utilisant la fonction du service
    const html = generateInvoiceHTML(invoiceData, selectedTemplate);
    setPreviewHtml(html);
    setPreviewOpen(true);
  };

  // Preview invoice
  const previewInvoice = () => {
    toast({
      title: "Aperçu de la facture",
      description: "Génération de l'aperçu en cours..."
    });
    
    generatePreview();
  };

  // Generate and send invoice
  const generateAndSendInvoice = () => {
    if (!clientName || !clientEmail) {
      toast({
        title: "Information requise",
        description: "Veuillez compléter les informations client avant d'envoyer la facture",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would generate PDF, create Stripe payment link, and send email
    toast({
      title: "Facture envoyée",
      description: "La facture a été générée et envoyée au client"
    });
    
    // After sending, navigate to invoices list
    navigate("/invoices");
  };

  return (
    <>
      <Header 
        title="Créer une facture" 
        description="Préparez et envoyez une nouvelle facture"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="space-y-8">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de la facture</CardTitle>
            <CardDescription>Informations de base de la facture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Numéro de facture</Label>
                <Input 
                  id="invoice-number" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Date d'émission</Label>
                <Input 
                  id="invoice-date" 
                  type="date" 
                  value={invoiceDate} 
                  onChange={(e) => setInvoiceDate(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Date d'échéance</Label>
                <Input 
                  id="due-date" 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Company Information Card - Only if no company profile exists */}
        {!companyProfile && (
          <Card className="border-orange-300 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Informations d'entreprise manquantes</CardTitle>
              <CardDescription>
                Configurez votre profil d'entreprise pour qu'il apparaisse sur vos factures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700 mb-4">
                Vous n'avez pas encore configuré votre profil d'entreprise. Vos informations apparaîtront sur toutes vos factures.
              </p>
              <Button 
                variant="outline" 
                className="border-orange-500 text-orange-700 hover:bg-orange-100"
                onClick={() => navigate("/profile")}
              >
                Configurer mon profil d'entreprise
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations client</CardTitle>
            <CardDescription>Entrez les coordonnées de votre client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nom / Raison sociale</Label>
                <Input 
                  id="client-name" 
                  placeholder="SCI Legalis" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input 
                  id="client-email" 
                  type="email" 
                  placeholder="contact@sci-legalis.fr"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="client-address">Adresse</Label>
                <Textarea 
                  id="client-address" 
                  placeholder="15 rue du Palais, 75001 Paris" 
                  className="min-h-[80px]"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)} 
                />
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox 
                  id="save-client" 
                  checked={saveClient} 
                  onCheckedChange={(checked) => setSaveClient(checked as boolean)} 
                />
                <Label htmlFor="save-client">Sauvegarder ce client dans mes contacts</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Template de facture</CardTitle>
            <CardDescription>Choisissez le style de présentation de votre facture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {invoiceTemplates.map(template => (
                <div
                  key={template.id}
                  className={`relative flex flex-col rounded-lg border-2 p-2 cursor-pointer transition-all ${
                    selectedTemplate === template.id ? `ring-2 ring-violet ${template.accent}` : "border-gray-200"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className={`${template.previewBg} h-24 w-full mb-3 rounded`}>
                    {/* Template preview */}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-base">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de la prestation</CardTitle>
            <CardDescription>Précisez les services rendus et leur prix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2 hidden md:grid">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Quantité</div>
              <div className="col-span-2">Prix unitaire (€)</div>
              <div className="col-span-1">TVA (%)</div>
              <div className="col-span-1">Total (€)</div>
              <div className="col-span-1"></div>
            </div>
            
            {serviceLines.map((line, index) => (
              <div key={line.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t first:border-t-0">
                <div className="md:col-span-5 space-y-2">
                  <Label htmlFor={`description-${index}`} className="md:hidden">Description</Label>
                  <Textarea 
                    id={`description-${index}`}
                    value={line.description}
                    onChange={(e) => updateServiceLine(line.id, "description", e.target.value)}
                    placeholder="Consultation juridique - Droit des sociétés" 
                    className="min-h-[80px]" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`quantity-${index}`} className="md:hidden">Quantité</Label>
                  <Input 
                    id={`quantity-${index}`}
                    value={line.quantity}
                    onChange={(e) => updateServiceLine(line.id, "quantity", e.target.value)}
                    placeholder="2" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`unit-price-${index}`} className="md:hidden">Prix unitaire (€)</Label>
                  <Input 
                    id={`unit-price-${index}`}
                    value={line.unitPrice}
                    onChange={(e) => updateServiceLine(line.id, "unitPrice", e.target.value)}
                    placeholder="200.00" 
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label htmlFor={`tva-${index}`} className="md:hidden">TVA (%)</Label>
                  <Input 
                    id={`tva-${index}`}
                    value={line.tva}
                    onChange={(e) => updateServiceLine(line.id, "tva", e.target.value)}
                    placeholder="20" 
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label htmlFor={`total-${index}`} className="md:hidden">Total (€)</Label>
                  <Input 
                    id={`total-${index}`}
                    value={line.total}
                    disabled
                  />
                </div>
                <div className="md:col-span-1 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeServiceLine(line.id)}
                    disabled={serviceLines.length <= 1}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={addServiceLine}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>
            
            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Sous-total</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">TVA</span>
                <span>{taxTotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Commission Stripe (0.5%)</span>
                <span>{(total * 0.005).toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Conditions de paiement</CardTitle>
            <CardDescription>Définissez les modalités de règlement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payment-delay">Délai de paiement</Label>
                <Select value={paymentDelay} onValueChange={setPaymentDelay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un délai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Paiement immédiat</SelectItem>
                    <SelectItem value="15">15 jours</SelectItem>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Méthode de paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un mode de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                    <SelectItem value="transfer">Virement bancaire</SelectItem>
                    <SelectItem value="both">Carte ou virement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show bank details selection when transfer is selected */}
              {(paymentMethod === 'transfer' || paymentMethod === 'both') && companyProfile && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="payment-instructions">Coordonnées bancaires à afficher</Label>
                  <div className="border rounded-md p-4 bg-gray-50">
                    {companyProfile.bankName && (
                      <p><strong>Banque:</strong> {companyProfile.bankName}</p>
                    )}
                    {companyProfile.bankIban && (
                      <p><strong>IBAN:</strong> {companyProfile.bankIban}</p>
                    )}
                    {companyProfile.bankBic && (
                      <p><strong>BIC/SWIFT:</strong> {companyProfile.bankBic}</p>
                    )}
                    {!companyProfile.bankName && !companyProfile.bankIban && !companyProfile.bankBic && (
                      <p className="text-amber-600">Aucune information bancaire disponible. Veuillez configurer votre profil d'entreprise.</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="payment-terms">Conditions de paiement</Label>
                <Textarea 
                  id="payment-terms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Paiement sous 30 jours. Pénalité 1.5%/mois."
                  className="min-h-[80px]" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations complémentaires</CardTitle>
            <CardDescription>Ajoutez une signature et des notes à votre facture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="signature">Signature</Label>
                <div className="border rounded-md bg-gray-50 h-32 flex items-center justify-center">
                  <p className="text-muted-foreground">Cliquez pour signer</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes et conditions</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Ajoutez des informations complémentaires ou des conditions..." 
                  className="min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thank-you">Message de remerciement</Label>
                <Textarea 
                  id="thank-you" 
                  placeholder="Merci pour votre confiance..." 
                  className="min-h-[60px]"
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={saveAsDraft}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer comme brouillon
          </Button>
          
          <InvoiceActions
            invoiceData={{
              invoiceNumber,
              invoiceDate,
              dueDate,
              clientName,
              clientEmail,
              clientAddress,
              serviceLines,
              subtotal,
              taxTotal,
              total,
              paymentDelay,
              paymentMethod,
              paymentTerms,
              notes,
              thankYouMessage,
              company: companyProfile
            }}
            templateId={selectedTemplate}
            onPreview={previewInvoice}
            onSend={generateAndSendInvoice}
          />
        </div>
      </div>
      
      {/* Dialogue de prévisualisation */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la facture</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <InvoicePreview 
              htmlContent={previewHtml} 
              invoiceData={{
                invoiceNumber,
                invoiceDate,
                dueDate,
                clientName,
                clientEmail,
                clientAddress,
                serviceLines,
                subtotal,
                taxTotal,
                total,
                paymentDelay,
                paymentMethod,
                paymentTerms,
                notes,
                thankYouMessage,
                company: companyProfile
              }}
              templateId={selectedTemplate}
              showDownloadButton={true}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
