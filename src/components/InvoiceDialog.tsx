import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvoiceData, InvoiceItem, CompanyProfile, SignatureData } from "@/types/invoice";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { getDefaultPaymentTerms, getCurrencyInfo } from "@/services/invoiceSettingsService";
import { SignatureCanvas } from "./SignatureCanvas";
import { SignatureDisplay } from "./SignatureDisplay";
import { SignatureSelector } from "./SignatureSelector";
import { useSignature } from "@/hooks/use-signature";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateInvoice: (invoiceData: InvoiceData) => Promise<void>;
  isGenerating: boolean;
  initialData?: Partial<InvoiceData>;
}

export function InvoiceDialog({ 
  open, 
  onOpenChange, 
  onGenerateInvoice, 
  isGenerating,
  initialData
}: InvoiceDialogProps) {
  const { profile } = useCompanyProfile();
  const { signature, handleSignatureChange, handleSignatureSave, handleSignatureCancel } = useSignature();
  
  // State for invoice data
  const [invoiceData, setInvoiceData] = useState<Partial<InvoiceData>>({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    date: new Date(),
    dueDate: addDays(new Date(), 30),
    status: 'draft',
    notes: '',
    terms: '',
    ...initialData
  });
  
  // State for form tabs
  const [activeTab, setActiveTab] = useState("details");
  
  // State for customer details
  const [customerName, setCustomerName] = useState(initialData?.customer?.name || '');
  const [customerEmail, setCustomerEmail] = useState(initialData?.customer?.email || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customer?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(initialData?.customer?.address || '');
  
  // State for invoice items
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || []);
  
  // State for payment terms
  const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms || '30days');
  const [dueDate, setDueDate] = useState<Date>(initialData?.dueDate ? new Date(initialData.dueDate) : addDays(new Date(), 30));
  
  // State for notes and terms
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [terms, setTerms] = useState(initialData?.terms || '');
  
  // State for signature
  const [signatureData, setSignatureData] = useState<SignatureData | null>(initialData?.signature || null);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  
  // Load company profile and set default values
  useEffect(() => {
    if (profile) {
      // Set default terms from company profile if available
      if (profile.defaultTerms && !initialData?.terms) {
        setTerms(profile.defaultTerms);
      }
      
      // Set default payment terms if available
      if (profile.defaultPaymentTerms && !initialData?.paymentTerms) {
        setPaymentTerms(profile.defaultPaymentTerms);
        
        // Calculate due date based on payment terms
        const paymentTermsOptions = getDefaultPaymentTerms();
        const selectedTerm = paymentTermsOptions.find(term => term.id === profile.defaultPaymentTerms);
        
        if (selectedTerm) {
          setDueDate(addDays(new Date(), selectedTerm.daysAfterIssue));
        }
      }
    }
  }, [profile, initialData]);
  
  // Calculate totals when items change
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax = items.reduce((sum, item) => {
      const itemTax = item.tax_rate ? (item.quantity * item.unit_price * (item.tax_rate / 100)) : 0;
      return sum + itemTax;
    }, 0);
    
    setInvoiceData(prev => ({
      ...prev,
      items,
      subtotal,
      tax,
      total: subtotal + tax
    }));
  }, [items]);
  
  // Update invoice data when customer details change
  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress
      }
    }));
  }, [customerName, customerEmail, customerPhone, customerAddress]);
  
  // Update invoice data when payment terms or due date change
  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      paymentTerms,
      dueDate
    }));
  }, [paymentTerms, dueDate]);
  
  // Update invoice data when notes or terms change
  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      notes,
      terms
    }));
  }, [notes, terms]);
  
  // Update invoice data when signature changes
  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      signature: signatureData
    }));
  }, [signatureData]);
  
  // Handle adding a new item
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    };
    
    setItems([...items, newItem]);
  };
  
  // Handle updating an item
  const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate item total
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
      const unitPrice = field === 'unit_price' ? value : updatedItems[index].unit_price;
      updatedItems[index].total = quantity * unitPrice;
    }
    
    setItems(updatedItems);
  };
  
  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  
  // Handle payment term selection
  const handlePaymentTermChange = (value: string) => {
    setPaymentTerms(value);
    
    // Calculate due date based on payment terms
    if (value !== 'custom') {
      const paymentTermsOptions = getDefaultPaymentTerms();
      const selectedTerm = paymentTermsOptions.find(term => term.id === value);
      
      if (selectedTerm) {
        setDueDate(addDays(new Date(), selectedTerm.daysAfterIssue));
      }
    }
  };
  
  // Handle signature selection
  const handleSignatureSelect = (signature: SignatureData | null) => {
    setSignatureData(signature);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!customerName) {
      alert('Please enter customer name');
      setActiveTab('details');
      return;
    }
    
    if (items.length === 0) {
      alert('Please add at least one item');
      setActiveTab('items');
      return;
    }
    
    // Create final invoice data
    const finalInvoiceData: InvoiceData = {
      ...invoiceData as InvoiceData,
      date: invoiceData.date || new Date(),
      dueDate: dueDate,
      status: 'draft',
      currency: profile?.defaultCurrency || 'EUR',
      currencySymbol: getCurrencyInfo(profile?.defaultCurrency || 'EUR').symbol,
      number: `INV-${Date.now()}`,
      company: profile as CompanyProfile
    };
    
    try {
      await onGenerateInvoice(finalInvoiceData);
      onOpenChange(false);
      
      // Reset form
      setItems([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setNotes('');
      setTerms('');
      setSignatureData(null);
      setActiveTab('details');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('An error occurred while generating the invoice');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Customer Details</TabsTrigger>
            <TabsTrigger value="items">Items & Services</TabsTrigger>
            <TabsTrigger value="payment">Payment & Terms</TabsTrigger>
          </TabsList>
          
          {/* Customer Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer Name *</Label>
                <Input 
                  id="customer-name" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input 
                  id="customer-email" 
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone</Label>
                <Input 
                  id="customer-phone" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer-address">Address</Label>
                <Textarea 
                  id="customer-address" 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter customer address"
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("items")}>
                Next: Items & Services
              </Button>
            </div>
          </TabsContent>
          
          {/* Items Tab */}
          <TabsContent value="items" className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground mb-4">No items added yet</p>
                <Button onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border p-4 rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item #{index + 1}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                        <Input 
                          id={`item-name-${index}`} 
                          value={item.name}
                          onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                          placeholder="Enter item name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`item-description-${index}`}>Description</Label>
                        <Input 
                          id={`item-description-${index}`} 
                          value={item.description}
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          placeholder="Enter description"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                        <Input 
                          id={`item-quantity-${index}`} 
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`item-price-${index}`}>Unit Price</Label>
                        <Input 
                          id={`item-price-${index}`} 
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`item-tax-${index}`}>Tax Rate (%)</Label>
                        <Input 
                          id={`item-tax-${index}`} 
                          type="number"
                          min="0"
                          max="100"
                          value={item.tax_rate || 0}
                          onChange={(e) => handleUpdateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right font-medium">
                      Total: {(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <Button onClick={handleAddItem} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Item
                </Button>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg">
                    <span>Subtotal:</span>
                    <span className="font-medium">{invoiceData.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span>Tax:</span>
                    <span>{invoiceData.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold mt-2">
                    <span>Total:</span>
                    <span>{invoiceData.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back: Customer Details
              </Button>
              <Button onClick={() => setActiveTab("payment")}>
                Next: Payment & Terms
              </Button>
            </div>
          </TabsContent>
          
          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={handlePaymentTermChange}>
                  <SelectTrigger id="payment-terms">
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate Payment</SelectItem>
                    <SelectItem value="15days">15 Days</SelectItem>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="60days">60 Days</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {paymentTerms === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="due-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => date && setDueDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes to be displayed on the invoice"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions (Optional)</Label>
              <Textarea 
                id="terms" 
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Terms and conditions for this invoice"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Signature (Optional)</Label>
              {signatureData ? (
                <SignatureDisplay signature={signatureData} />
              ) : (
                <SignatureSelector onSelect={handleSignatureSelect} />
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("items")}>
                Back: Items & Services
              </Button>
              <Button onClick={handleSubmit} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Invoice"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
