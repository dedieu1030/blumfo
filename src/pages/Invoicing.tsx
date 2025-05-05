
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MobileNavigation } from "@/components/MobileNavigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CalendarIcon, Eye, File, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Interface for service line items
interface ServiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tva: number;
}

// Interface for invoice templates
interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  accent: string;
}

export default function Invoicing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);
  const [total, setTotal] = useState({ subTotal: 0, tax: 0, total: 0 });
  const [saveClient, setSaveClient] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  
  // Form for the invoice
  const form = useForm({
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientAddress: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-001`,
      paymentDelay: "30",
      paymentMethod: "transfer",
      notes: "",
    }
  });

  // Templates (these should match the ones in Settings.tsx)
  const invoiceTemplates: InvoiceTemplate[] = [
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

  // Add a new service line
  const addServiceLine = () => {
    const newLine: ServiceLine = {
      id: `line-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      tva: 20
    };
    setServiceLines([...serviceLines, newLine]);
  };

  // Remove a service line
  const removeServiceLine = (id: string) => {
    setServiceLines(serviceLines.filter(line => line.id !== id));
  };

  // Update a service line
  const updateServiceLine = (id: string, field: keyof ServiceLine, value: string | number) => {
    const numValue = field === 'description' ? value : Number(value);
    const updatedLines = serviceLines.map(line => 
      line.id === id ? { ...line, [field]: numValue } : line
    );
    setServiceLines(updatedLines);
  };

  // Calculate totals
  useEffect(() => {
    let subTotal = 0;
    let tax = 0;

    serviceLines.forEach(line => {
      const lineTotal = line.quantity * line.unitPrice;
      subTotal += lineTotal;
      tax += lineTotal * (line.tva / 100);
    });

    const total = subTotal + tax;
    setTotal({ subTotal, tax, total });
  }, [serviceLines]);

  // Initialize with one empty service line
  useEffect(() => {
    if (serviceLines.length === 0) {
      addServiceLine();
    }
  }, []);

  // Handle form submission
  const onSubmit = (data: any) => {
    console.log("Invoice data:", {
      ...data,
      serviceLines,
      total,
      date,
      selectedTemplate
    });
    // Here we'd handle the actual invoice creation, PDF generation, and Stripe link
  };

  // Preview invoice
  const handlePreview = () => {
    // Here we'd generate a preview of the PDF
    console.log("Preview invoice");
  };

  return (
    <>
      <Header 
        title="Créer une facture" 
        description="Préparez et envoyez une nouvelle facture"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de facture</FormLabel>
                    <FormControl>
                      <Input {...field} className="w-48"/>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label>Date d'émission</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
              <CardDescription>Entrez les coordonnées de votre client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom / Raison sociale</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SCI Legalis" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="contact@sci-legalis.fr" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="15 rue du Palais, 75001 Paris" 
                          className="min-h-[80px]" 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="save-client" 
                  checked={saveClient}
                  onCheckedChange={(checked) => setSaveClient(checked as boolean)}
                />
                <label
                  htmlFor="save-client"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sauvegarder ce client pour vos prochaines factures
                </label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Template de facture</CardTitle>
              <CardDescription>Choisissez l'apparence de votre facture</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <div className={`${template.previewBg} h-24 w-full mb-3 rounded flex items-center justify-center overflow-hidden`}>
                      {/* Template preview (simplified) */}
                      <div className="w-4/5 h-4/5 bg-white rounded shadow-sm p-3">
                        <div className="w-full flex justify-between items-start">
                          <div className="w-10 h-2 bg-gray-200 rounded"></div>
                          <div className="w-12 h-3 bg-gray-200 rounded"></div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="w-full h-1 bg-gray-200 rounded"></div>
                          <div className="w-4/5 h-1 bg-gray-200 rounded"></div>
                        </div>
                        
                        {template.id === 'colorful' && (
                          <div className="mt-1 w-full h-1 bg-vertlime rounded"></div>
                        )}
                      </div>
                    </div>
                    
                    <RadioGroupItem
                      value={template.id}
                      id={template.id}
                      className="sr-only"
                    />
                    <div className="text-left">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Détails de la prestation</CardTitle>
              <CardDescription>Précisez les services rendus et leur prix</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Description</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix unitaire (€)</TableHead>
                      <TableHead>TVA (%)</TableHead>
                      <TableHead>Total HT</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Input 
                            value={line.description} 
                            onChange={(e) => updateServiceLine(line.id, 'description', e.target.value)}
                            placeholder="Consultation juridique" 
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            value={line.quantity} 
                            onChange={(e) => updateServiceLine(line.id, 'quantity', e.target.value)}
                            min={1}
                            step={0.5}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            value={line.unitPrice} 
                            onChange={(e) => updateServiceLine(line.id, 'unitPrice', e.target.value)}
                            min={0}
                            step={0.01}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            value={line.tva} 
                            onChange={(e) => updateServiceLine(line.id, 'tva', e.target.value)}
                            min={0}
                            max={100}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-right">
                          {(line.quantity * line.unitPrice).toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          {serviceLines.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeServiceLine(line.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={addServiceLine}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Ajouter une ligne
                </Button>
                
                <div className="space-y-2 text-right">
                  <div className="text-sm">
                    Sous-total: <span className="font-medium">{total.subTotal.toFixed(2)} €</span>
                  </div>
                  <div className="text-sm">
                    TVA: <span className="font-medium">{total.tax.toFixed(2)} €</span>
                  </div>
                  <div className="text-base font-bold">
                    Total TTC: <span>{total.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Conditions de paiement</CardTitle>
              <CardDescription>Définissez les modalités de règlement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="payment-delay">Délai de paiement</Label>
                  <Select 
                    value={form.watch("paymentDelay")} 
                    onValueChange={(value) => form.setValue("paymentDelay", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un délai" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="immediate">Paiement immédiat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Méthode de paiement</Label>
                  <Select 
                    value={form.watch("paymentMethod")} 
                    onValueChange={(value) => form.setValue("paymentMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Carte bancaire</SelectItem>
                      <SelectItem value="transfer">Virement bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notes & Signature</CardTitle>
              <CardDescription>Ajoutez des informations complémentaires et votre signature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Conditions particulières</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Paiement par virement bancaire aux coordonnées suivantes: IBAN FR76..." 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Signature</Label>
                <div className="border-2 border-dashed rounded-md h-32 flex items-center justify-center bg-muted/30">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Cliquez pour ajouter une signature</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline">Enregistrer comme brouillon</Button>
            <div className="space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" /> Prévisualiser
              </Button>
              <Button 
                type="submit" 
                className="bg-violet hover:bg-violet/90 flex items-center gap-2"
              >
                <File className="h-4 w-4" /> Générer et envoyer
              </Button>
            </div>
          </div>
        </form>
      </Form>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
