import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClientSelector } from "@/components/ClientSelector";
import { CalendarIcon, Loader2, Plus, Trash2, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Quote } from "@/types/quote";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fetchProducts, Product } from "@/services/productService";

interface QuoteFormValues {
  client_id: string | null;
  issue_date: Date;
  validity_date: Date | null;
  execution_date: Date | null;
  notes: string | null;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

interface QuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editQuoteId?: string;
  onSuccess?: () => void;
}

export const QuoteDialog = ({ open, onOpenChange, editQuoteId, onSuccess }: QuoteDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<{ description: string; quantity: number; unit_price: number; total_price: number; }[]>([
    { description: "", quantity: 1, unit_price: 0, total_price: 0 }
  ]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // État pour la sélection de produits
  const [isProductCatalogOpen, setIsProductCatalogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const form = useForm<QuoteFormValues>({
    defaultValues: {
      client_id: null,
      issue_date: new Date(),
      validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      execution_date: null,
      notes: null,
      items: [{ description: "", quantity: 1, unit_price: 0, total_price: 0 }]
    }
  });

  // Réinitialiser l'état quand le dialogue se ferme
  useEffect(() => {
    if (!open) {
      // Reset form et états seulement si le dialogue est fermé
      if (!editQuoteId) {
        form.reset({
          client_id: null,
          issue_date: new Date(),
          validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          execution_date: null,
          notes: null,
          items: []
        });
        setItems([{ description: "", quantity: 1, unit_price: 0, total_price: 0 }]);
        setSelectedClientId(null);
      }
    }
  }, [open, form, editQuoteId]);

  // Chargement des produits au montage du composant
  useEffect(() => {
    let isMounted = true;
    
    const loadProducts = async () => {
      if (!open) return;
      
      setIsLoadingProducts(true);
      try {
        const productsList = await fetchProducts();
        if (isMounted) {
          setProducts(productsList);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    };

    if (open) {
      loadProducts();
    }
    
    return () => {
      isMounted = false;
    };
  }, [open]);

  // Fetch quote data if editing
  useEffect(() => {
    let isMounted = true;
    
    if (editQuoteId && open) {
      const fetchQuote = async () => {
        try {
          setIsLoading(true);
          const { data, error } = await supabase
            .from("devis")
            .select(`
              *,
              items:devis_items (*)
            `)
            .eq("id", editQuoteId)
            .single();

          if (error) throw error;

          if (data && isMounted) {
            const quote = data as Quote;
            
            form.reset({
              client_id: quote.client_id || null,
              issue_date: new Date(quote.issue_date),
              validity_date: quote.validity_date ? new Date(quote.validity_date) : null,
              execution_date: quote.execution_date ? new Date(quote.execution_date) : null,
              notes: quote.notes,
              items: []
            });

            setSelectedClientId(quote.client_id || null);

            if (quote.items && quote.items.length > 0) {
              setItems(quote.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price
              })));
            }
          }
        } catch (err) {
          console.error("Error fetching quote:", err);
          toast.error("Erreur lors du chargement du devis");
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchQuote();
    } else if (!editQuoteId && open) {
      // Reset form when opening for a new quote
      form.reset({
        client_id: null,
        issue_date: new Date(),
        validity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        execution_date: null,
        notes: null,
        items: []
      });
      setItems([{ description: "", quantity: 1, unit_price: 0, total_price: 0 }]);
      setSelectedClientId(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [editQuoteId, open, form]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    // Assuming 20% tax rate for now, can be made configurable later
    const taxAmount = subtotal * 0.2; 
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    
    if (field === 'quantity' || field === 'unit_price') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      newItems[index][field] = numValue;
      
      // Recalculate the total price
      const quantity = field === 'quantity' ? numValue : newItems[index].quantity;
      const unitPrice = field === 'unit_price' ? numValue : newItems[index].unit_price;
      newItems[index].total_price = quantity * unitPrice;
    } else {
      newItems[index][field] = value;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };
  
  // Fonction pour ajouter un produit du catalogue
  const handleAddProductFromCatalog = (product: Product) => {
    // Conversion cents to dollars/euros for display
    const unitPrice = product.price_cents / 100;
    
    setItems([
      ...items,
      {
        description: product.name + (product.description ? ` - ${product.description}` : ''),
        quantity: 1,
        unit_price: unitPrice,
        total_price: unitPrice // Quantity is 1 by default
      }
    ]);
    
    setIsProductCatalogOpen(false);
    toast.success("Produit ajouté au devis");
  };

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { subtotal, taxAmount, totalAmount } = calculateTotals();
      
      // Get company ID from the first company (assuming one company per user for simplicity)
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .limit(1);
      
      if (companiesError) throw new Error(companiesError.message);
      if (!companies || companies.length === 0) throw new Error("Aucune entreprise trouvée");
      
      const company_id = companies[0].id;
      
      // Insert or update quote
      let quoteId: string;
      
      if (editQuoteId) {
        // Update existing quote
        const { error: updateError } = await supabase
          .from('devis')
          .update({
            client_id: selectedClientId,
            company_id,
            issue_date: format(data.issue_date, 'yyyy-MM-dd'),
            validity_date: data.validity_date ? format(data.validity_date, 'yyyy-MM-dd') : null,
            execution_date: data.execution_date ? format(data.execution_date, 'yyyy-MM-dd') : null,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            notes: data.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editQuoteId);
        
        if (updateError) throw new Error(updateError.message);
        quoteId = editQuoteId;
        
        // Delete existing items to replace with new ones
        const { error: deleteItemsError } = await supabase
          .from('devis_items')
          .delete()
          .eq('quote_id', quoteId);
        
        if (deleteItemsError) throw new Error(deleteItemsError.message);
      } else {
        // Insert new quote
        const { data: quoteData, error: insertError } = await supabase
          .from('devis')
          .insert({
            client_id: selectedClientId,
            company_id,
            issue_date: format(data.issue_date, 'yyyy-MM-dd'),
            validity_date: data.validity_date ? format(data.validity_date, 'yyyy-MM-dd') : null,
            execution_date: data.execution_date ? format(data.execution_date, 'yyyy-MM-dd') : null,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            notes: data.notes
          })
          .select('id')
          .single();
        
        if (insertError || !quoteData) throw new Error(insertError?.message || "Erreur lors de la création du devis");
        quoteId = quoteData.id;
      }
      
      // Insert quote items
      const itemsToInsert = items.filter(item => item.description.trim() !== '').map(item => ({
        quote_id: quoteId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));
      
      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('devis_items')
          .insert(itemsToInsert);
        
        if (itemsError) throw new Error(itemsError.message);
      }
      
      toast.success(editQuoteId ? "Devis mis à jour avec succès" : "Devis créé avec succès");
      
      // Assurez-vous que onOpenChange est appelé après que tout est terminé
      onOpenChange(false);
      
      // Puis appelez onSuccess si fourni (important pour le re-rendu)
      if (onSuccess) {
        // Petit délai pour s'assurer que le dialogue est bien fermé avant
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Erreur lors de l'enregistrement du devis", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientChange = (client) => {
    setSelectedClientId(client.id);
    form.setValue("client_id", client.id);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editQuoteId ? "Modifier le devis" : "Créer un nouveau devis"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <ClientSelector 
                          onClientSelect={handleClientChange}
                          buttonText="Sélectionner un client"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'émission</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "P", { locale: fr })
                              ) : (
                                <span>Sélectionnez une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="validity_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de validité</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "P", { locale: fr })
                              ) : (
                                <span>Sélectionnez une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="execution_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'exécution</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "P", { locale: fr })
                              ) : (
                                <span>Optionnel</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Articles</h3>
                  <div className="space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsProductCatalogOpen(true)}>
                      <PackageOpen className="h-4 w-4 mr-1" /> Sélectionner du catalogue
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter un article
                    </Button>
                  </div>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-6">
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    
                    <div className="col-span-2">
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>Quantité</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Qté"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    
                    <div className="col-span-2">
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>Prix unitaire</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="Prix €"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    
                    <div className="col-span-1">
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>Total</FormLabel>
                        <FormControl>
                          <Input
                            readOnly
                            value={item.total_price.toFixed(2)}
                            className="bg-gray-50"
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    
                    <div className="col-span-1 flex items-center pt-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 px-2" 
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end mt-4">
                  <div className="w-1/3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total:</span>
                      <span>{calculateTotals().subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TVA (20%):</span>
                      <span>{calculateTotals().taxAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{calculateTotals().totalAmount.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes ou conditions particulières"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editQuoteId ? "Mettre à jour" : "Créer le devis"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Catalogue de produits - Correction du Sheet pour éviter les problèmes de focus */}
      <Sheet 
        open={isProductCatalogOpen} 
        onOpenChange={(open) => {
          setIsProductCatalogOpen(open);
        }}
      >
        <SheetContent side="right" className="w-full md:max-w-md">
          <SheetHeader>
            <SheetTitle>Catalogue de produits</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {isLoadingProducts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun produit disponible
              </div>
            ) : (
              <div className="space-y-2">
                {products.map(product => (
                  <div 
                    key={product.id} 
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleAddProductFromCatalog(product)}
                  >
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">{product.description}</div>
                    )}
                    <div className="mt-2 flex justify-between items-center">
                      <div className="font-medium text-sm">{(product.price_cents / 100).toFixed(2)} €</div>
                      <Button size="sm" variant="secondary">
                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
