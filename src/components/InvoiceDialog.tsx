
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Plus, ArrowLeft, ArrowRight, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceDialog({ open, onOpenChange }: InvoiceDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Common invoice data state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [saveClient, setSaveClient] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
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
  const [paymentDelay, setPaymentDelay] = useState("15");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [notes, setNotes] = useState("");
  const [signature, setSignature] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Generate a default invoice number on component mount
  useEffect(() => {
    // Format: INV-YYYYMMDD-XX (where XX is a random number)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 90 + 10);
    
    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
  }, []);

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

  // Handle navigation between steps
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save as draft
  const saveAsDraft = () => {
    // In a real app, this would save to database
    toast({
      title: "Brouillon enregistré",
      description: "Votre facture a été sauvegardée comme brouillon"
    });
    
    // Close dialog and navigate to invoices list
    onOpenChange(false);
    navigate("/invoices");
  };

  // Preview invoice
  const previewInvoice = () => {
    toast({
      title: "Aperçu de la facture",
      description: "Génération de l'aperçu en cours..."
    });
    
    // In a real app, this would generate a PDF preview
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
    
    // Close dialog and navigate to invoices list
    onOpenChange(false);
    navigate("/invoices");
  };

  // Step content rendering based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 py-4">
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
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4 py-4">
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
            <div className="space-y-2">
              <Label htmlFor="client-address">Adresse</Label>
              <Textarea 
                id="client-address" 
                placeholder="15 rue du Palais, 75001 Paris" 
                className="min-h-[80px]"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)} 
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-client" 
                checked={saveClient} 
                onCheckedChange={(checked) => setSaveClient(checked as boolean)} 
              />
              <Label htmlFor="save-client">Sauvegarder ce client dans mes contacts</Label>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4 py-4">
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
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
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
            </div>
            
            <div>
              <Label className="block mb-2">Template de facture</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6 py-4">
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
          </div>
        );
      
      default:
        return null;
    }
  };

  const stepTitles = [
    "Détails de la facture",
    "Informations client",
    "Services et tarification",
    "Conditions de paiement",
    "Notes et signature"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {stepTitles[currentStep - 1]}
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress Indicator */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2 mb-4">
          <div 
            className="bg-violet h-full" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        {/* Step Content */}
        {renderStepContent()}
        
        {/* Step Navigation */}
        <DialogFooter className="flex justify-between items-center pt-6">
          <div className="flex-1">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Étape {currentStep} sur {totalSteps}
          </div>
          
          <div className="flex flex-1 justify-end gap-2">
            {currentStep === totalSteps ? (
              <>
                <Button variant="outline" onClick={saveAsDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer brouillon
                </Button>
                <Button variant="outline" onClick={previewInvoice}>
                  <Eye className="mr-2 h-4 w-4" />
                  Prévisualiser
                </Button>
                <Button className="bg-violet hover:bg-violet/90" onClick={generateAndSendInvoice}>
                  Générer et envoyer
                </Button>
              </>
            ) : (
              <Button onClick={nextStep}>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
