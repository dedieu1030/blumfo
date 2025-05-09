
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { stripe } from '../_shared/stripe.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { invoiceData } = await req.json()

    // Vérifier que les données requises sont présentes
    if (!invoiceData || !invoiceData.clientName || !invoiceData.clientEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'Données client manquantes' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Création ou récupération du client Stripe
    const customerParams = {
      name: invoiceData.clientName,
      email: invoiceData.clientEmail,
      address: {
        line1: invoiceData.clientAddress || '',
      },
      phone: invoiceData.clientPhone || '',
    }

    let customer
    const customers = await stripe.customers.list({
      email: invoiceData.clientEmail,
      limit: 1,
    })

    if (customers && customers.data && customers.data.length > 0) {
      customer = customers.data[0]
      // Mettre à jour les informations client si nécessaire
      if (
        customer.name !== customerParams.name ||
        customer.phone !== customerParams.phone ||
        (customer.address?.line1 !== customerParams.address.line1 && customerParams.address.line1)
      ) {
        customer = await stripe.customers.update(customer.id, customerParams)
      }
    } else {
      customer = await stripe.customers.create(customerParams)
    }

    // Création des items de facture
    const invoiceItems = invoiceData.serviceLines.map((line) => ({
      price_data: {
        unit_amount: Math.round(parseFloat(line.unitPrice) * 100), // Convertir en centimes
        currency: invoiceData.issuerInfo.defaultCurrency?.toLowerCase() || 'eur',
        product_data: {
          name: line.description,
          tax_code: 'txcd_99999999',
        },
      },
      quantity: parseInt(line.quantity, 10),
    }))

    // Création de la facture
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: parseInt(invoiceData.paymentDelay, 10) || 30,
      auto_advance: true,
      custom_fields: [
        {
          name: 'Numéro de facture',
          value: invoiceData.invoiceNumber,
        },
      ],
      description: `Facture ${invoiceData.invoiceNumber}`,
      footer: invoiceData.notes || `Merci pour votre confiance. - ${invoiceData.issuerInfo.name}`,
      metadata: {
        invoiceNumber: invoiceData.invoiceNumber,
        issuedDate: invoiceData.date || new Date().toISOString(),
        appGenerated: true,
      },
    })

    // Ajout des items à la facture
    for (const item of invoiceItems) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        ...item,
      })
    }

    // Finaliser la facture
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: finalizedInvoice.id,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        invoicePdf: finalizedInvoice.invoice_pdf,
        customerEmail: customer.email,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating invoice:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
