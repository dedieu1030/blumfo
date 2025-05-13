
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Quote } from "@/types/quote";
import { Edit, Eye, MoreHorizontal, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { QuoteDialog } from "./QuoteDialog";

interface QuoteListProps {
  limit?: number;
  showActions?: boolean;
  onRefresh?: () => void;
}

export const QuoteList = ({ limit, showActions = true, onRefresh }: QuoteListProps) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editQuoteId, setEditQuoteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching quotes...");
      let query = supabase
        .from("devis")
        .select(`
          *,
          client:clients (id, client_name, email),
          company:companies (id, company_name)
        `)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error in Supabase query:", error);
        setError("Erreur lors du chargement des devis");
        throw error;
      }

      console.log("Quotes data received:", data);
      setQuotes(data as Quote[]);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setError("Erreur lors du chargement des devis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [limit]);

  const handleEditClick = (id: string) => {
    setEditQuoteId(id);
    setDialogOpen(true);
  };

  const handleViewClick = (id: string) => {
    navigate(`/quote/${id}`);
  };

  const handleDialogClose = () => {
    setEditQuoteId(null);
    setDialogOpen(false);
  };

  const handleQuoteSuccess = () => {
    fetchQuotes();
    if (onRefresh) onRefresh();
  };

  const handleConvertToInvoice = async (quoteId: string) => {
    try {
      // Récupérer les détails du devis
      const { data: quote, error: quoteError } = await supabase
        .from("devis")
        .select(`
          *,
          client:client_id (*),
          company:company_id (*),
          items:devis_items (*)
        `)
        .eq("id", quoteId)
        .single();

      if (quoteError) throw quoteError;

      // Créer une nouvelle facture basée sur le devis
      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          client_id: quote.client_id,
          company_id: quote.company_id,
          subtotal: quote.subtotal,
          tax_amount: quote.tax_amount,
          total_amount: quote.total_amount,
          notes: quote.notes,
          customizations: quote.customizations,
          status: "draft",
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Copier les articles du devis vers la facture
      const invoiceItems = quote.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      // Mettre à jour le statut du devis
      const { error: updateError } = await supabase
        .from("devis")
        .update({ status: "invoiced" })
        .eq("id", quoteId);

      if (updateError) throw updateError;

      toast.success("Le devis a été converti en facture avec succès");
      fetchQuotes();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error converting quote to invoice:", error);
      toast.error("Erreur lors de la conversion du devis en facture");
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "sent":
        return "bg-blue-200 text-blue-800";
      case "viewed":
        return "bg-purple-200 text-purple-800";
      case "signed":
        return "bg-green-200 text-green-800";
      case "rejected":
        return "bg-red-200 text-red-800";
      case "expired":
        return "bg-amber-200 text-amber-800";
      case "accepted":
        return "bg-emerald-200 text-emerald-800";
      case "invoiced":
        return "bg-teal-200 text-teal-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: limit || 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    {showActions && (
                      <TableCell><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                    )}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 6 : 5} className="text-center py-8 text-destructive">
                    {error}
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={fetchQuotes}>
                        Réessayer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 6 : 5} className="text-center py-8 text-gray-500">
                    Aucun devis trouvé
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                        Créer un devis
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{quote.quote_number}</TableCell>
                    <TableCell>{quote.client?.client_name || "N/A"}</TableCell>
                    <TableCell>{quote.total_amount.toFixed(2)} €</TableCell>
                    <TableCell>{format(new Date(quote.issue_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusBadgeStyles(quote.status)} capitalize`}
                      >
                        {quote.status}
                      </Badge>
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClick(quote.id)}>
                              <Eye className="h-4 w-4 mr-2" /> Voir
                            </DropdownMenuItem>
                            {quote.status !== "invoiced" && (
                              <DropdownMenuItem onClick={() => handleEditClick(quote.id)}>
                                <Edit className="h-4 w-4 mr-2" /> Modifier
                              </DropdownMenuItem>
                            )}
                            {(quote.status === "signed" || quote.status === "accepted") && (
                              <DropdownMenuItem onClick={() => handleConvertToInvoice(quote.id)}>
                                <FileText className="h-4 w-4 mr-2" /> Convertir en facture
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      <QuoteDialog 
        open={dialogOpen} 
        onOpenChange={handleDialogClose} 
        editQuoteId={editQuoteId || undefined} 
        onSuccess={handleQuoteSuccess}
      />
    </>
  );
};
