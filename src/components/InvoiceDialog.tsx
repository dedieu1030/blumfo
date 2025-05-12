
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServiceLine, InvoiceData } from "@/types/invoice";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateInvoice?: (invoiceData: InvoiceData) => Promise<void>;
  isGenerating?: boolean;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  onGenerateInvoice,
  isGenerating = false
}: InvoiceDialogProps) {
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Add a function to handle product selection from catalog
  const handleAddProductFromCatalog = (product: Product) => {
    if (!product) return;

    const newServiceLine: ServiceLine = {
      id: Date.now().toString(),
      description: product.description || product.name,
      quantity: "1",
      unitPrice: (product.price_cents / 100).toString(),
      tva: product.tax_rate?.toString() || "20",
      total: (product.price_cents / 100).toString(),
      totalPrice: product.price_cents / 100
    };

    setServiceLines([...serviceLines, newServiceLine]);
    setIsProductModalOpen(false);
  };

  // Add necessary state and handlers for the invoice form
  const [clientName, setClientName] = useState("");
  const [issueDate, setIssueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  
  // Function to handle form submission
  const handleSubmit = async () => {
    if (onGenerateInvoice) {
      const invoiceData: InvoiceData = {
        clientName,
        issueDate,
        dueDate,
        items: serviceLines,
        // Add other necessary fields
      };
      
      await onGenerateInvoice(invoiceData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle facture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="client-name" className="block text-sm font-medium mb-1">
              Client
            </label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nom du client"
            />
          </div>
          
          {/* Add more form fields here */}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isGenerating}>
              {isGenerating ? "Création..." : "Créer la facture"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InvoiceDialog;
