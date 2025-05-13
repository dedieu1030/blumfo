
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Types pour Supabase
type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  client_id?: string;
  company_id?: string;
  due_date?: string;
  total_amount: number;
}

interface NotificationCreateParams {
  user_id: string;
  type: string;
  title: string;
  message: string;
  reference_type: string;
  reference_id: string;
  metadata?: Record<string, any>;
}

// Fonction principale
const handleRequest = async (req: Request): Promise<Response> => {
  try {
    // Récupérer le corps de la requête
    const { invoice_id } = await req.json();
    
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id est requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Créer un client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupérer les informations de la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        id, 
        invoice_number, 
        status, 
        client_id,
        company_id, 
        due_date,
        total_amount
      `)
      .eq("id", invoice_id)
      .single();
      
    if (invoiceError || !invoice) {
      console.error("Erreur lors de la récupération de la facture:", invoiceError);
      return new Response(JSON.stringify({ error: "Facture non trouvée" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Récupérer l'utilisateur associé à cette facture via la société
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("user_id")
      .eq("id", invoice.company_id)
      .single();

    if (companyError || !company || !company.user_id) {
      console.error("Erreur lors de la récupération de la société:", companyError);
      return new Response(JSON.stringify({ error: "Société non trouvée" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Récupérer le nom du client
    let clientName = "Client inconnu";
    if (invoice.client_id) {
      const { data: client } = await supabase
        .from("clients")
        .select("client_name")
        .eq("id", invoice.client_id)
        .single();

      if (client) {
        clientName = client.client_name;
      }
    }

    // Générer le message approprié en fonction du statut
    let notificationData: NotificationCreateParams | null = null;
    
    const metadata = {
      invoice_number: invoice.invoice_number,
      total_amount: invoice.total_amount,
      due_date: invoice.due_date,
    };

    switch (invoice.status) {
      case "draft":
        notificationData = {
          user_id: company.user_id,
          type: "invoice_created",
          title: "Facture créée",
          message: `La facture ${invoice.invoice_number} a été créée et est en statut brouillon.`,
          reference_type: "invoice",
          reference_id: invoice.id,
          metadata,
        };
        break;
      case "sent":
        notificationData = {
          user_id: company.user_id,
          type: "invoice_status",
          title: "Facture envoyée",
          message: `La facture ${invoice.invoice_number} a été envoyée à ${clientName}.`,
          reference_type: "invoice",
          reference_id: invoice.id,
          metadata,
        };
        break;
      case "paid":
        notificationData = {
          user_id: company.user_id,
          type: "invoice_paid",
          title: "Facture payée",
          message: `La facture ${invoice.invoice_number} de ${clientName} a été marquée comme payée.`,
          reference_type: "invoice",
          reference_id: invoice.id,
          metadata,
        };
        break;
      case "overdue":
        notificationData = {
          user_id: company.user_id,
          type: "invoice_overdue",
          title: "Facture en retard",
          message: `La facture ${invoice.invoice_number} de ${clientName} est maintenant en retard de paiement.`,
          reference_type: "invoice",
          reference_id: invoice.id,
          metadata,
        };
        break;
      default:
        // Pas de notification pour les autres statuts
        break;
    }

    // Créer la notification si nécessaire
    if (notificationData) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationData);

      if (notificationError) {
        console.error("Erreur lors de la création de la notification:", notificationError);
        return new Response(JSON.stringify({ error: "Erreur lors de la création de la notification" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Notification créée avec succès",
        notification_type: notificationData.type
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Aucune notification nécessaire pour ce statut"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erreur non gérée:", error);
    return new Response(JSON.stringify({ error: "Erreur interne du serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

serve(handleRequest);
