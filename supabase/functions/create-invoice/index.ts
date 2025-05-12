
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import Stripe from 'https://esm.sh/stripe@12.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

interface InvoiceCreateParams {
  customer: string | null
  customerEmail?: string
  customerName?: string
  items: Array<{
    description: string
    quantity: number
    unit_amount: number
    tax_rates?: string[]
    discount?: {
      type: 'percentage' | 'fixed'
      value: number
    }
  }>
  metadata?: Record<string, string>
  dueDate?: number // Unix timestamp
  footer?: string
  memo?: string
  currency?: string
  taxRates?: string[]
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
  }
  introText?: string
  conclusionText?: string
  footerText?: string
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    // Get authorization from request headers
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    // Create Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Parse request body
    const requestData: InvoiceCreateParams = await req.json()

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Create customer if not provided
    let customerId = requestData.customer
    if (!customerId && requestData.customerEmail) {
      // Check if customer already exists with this email
      const customerSearch = await stripe.customers.list({
        email: requestData.customerEmail,
        limit: 1,
      })

      if (customerSearch.data.length > 0) {
        customerId = customerSearch.data[0].id
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: requestData.customerEmail,
          name: requestData.customerName,
        })
        customerId = newCustomer.id

        // Save customer to database
        await supabaseClient.from('stripe_customers').insert({
          user_id: user.id,
          stripe_customer_id: customerId,
          email: requestData.customerEmail,
          name: requestData.customerName,
        })
      }
    }

    if (!customerId) {
      throw new Error('No customer ID provided or could not create customer')
    }

    // Create invoice items with discounts
    const invoiceItems = []
    for (const item of requestData.items) {
      // Apply line item discount if provided
      let unit_amount = item.unit_amount;
      
      if (item.discount && item.discount.value > 0) {
        if (item.discount.type === 'percentage') {
          unit_amount = unit_amount * (1 - item.discount.value / 100);
        } else if (item.discount.type === 'fixed') {
          // For fixed discount, we divide by quantity to get the per-unit discount
          unit_amount = Math.max(0, unit_amount - (item.discount.value / item.quantity));
        }
      }
      
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customerId,
        description: item.description,
        quantity: item.quantity,
        unit_amount: Math.round(unit_amount), // Stripe requires amounts in cents (integers)
        currency: requestData.currency || 'eur',
        tax_rates: item.tax_rates || requestData.taxRates,
      })
      invoiceItems.push(invoiceItem)
    }

    // Create invoice
    const invoiceOptions: Stripe.InvoiceCreateParams = {
      customer: customerId,
      auto_advance: true,
      collection_method: 'send_invoice',
      due_date: requestData.dueDate,
      footer: requestData.footer,
      metadata: {
        ...requestData.metadata,
        ...(requestData.introText && { intro_text: requestData.introText.substring(0, 500) }),
        ...(requestData.conclusionText && { conclusion_text: requestData.conclusionText.substring(0, 500) }),
        ...(requestData.footerText && { footer_text: requestData.footerText.substring(0, 300) }),
      },
    }

    // Apply global discount if provided
    if (requestData.discount && requestData.discount.value > 0) {
      if (requestData.discount.type === 'percentage') {
        invoiceOptions.discount = {
          coupon: await createPercentageCoupon(stripe, requestData.discount.value)
        };
      } else if (requestData.discount.type === 'fixed') {
        invoiceOptions.discount = {
          coupon: await createFixedAmountCoupon(stripe, requestData.discount.value, requestData.currency || 'eur')
        };
      }
    }

    const invoice = await stripe.invoices.create(invoiceOptions)

    // Finalize invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

    // Create payment link for the invoice
    const paymentLink = `https://invoice.stripe.com/i/${finalizedInvoice.id}`

    // Save invoice to database
    const { data: savedInvoice, error: saveError } = await supabaseClient
      .from('stripe_invoices')
      .insert({
        user_id: user.id,
        invoice_number: finalizedInvoice.number,
        stripe_invoice_id: finalizedInvoice.id,
        stripe_customer_id: customerId,
        amount_total: finalizedInvoice.total,
        currency: finalizedInvoice.currency,
        status: finalizedInvoice.status,
        payment_link: paymentLink,
        due_date: finalizedInvoice.due_date ? new Date(finalizedInvoice.due_date * 1000).toISOString() : null,
        metadata: {
          ...requestData.metadata,
          ...(requestData.discount && { discount: requestData.discount }),
          ...(requestData.introText && { introText: requestData.introText }),
          ...(requestData.conclusionText && { conclusionText: requestData.conclusionText }),
          ...(requestData.footerText && { footerText: requestData.footerText }),
        },
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving invoice to database:', saveError)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invoice: finalizedInvoice,
        paymentLink,
        saved: savedInvoice,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating invoice:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Function to create a percentage discount coupon
async function createPercentageCoupon(stripe: Stripe, percent: number): Promise<string> {
  const coupon = await stripe.coupons.create({
    percent_off: Math.min(100, Math.max(0, percent)),
    duration: 'once',
  });
  return coupon.id;
}

// Function to create a fixed amount discount coupon
async function createFixedAmountCoupon(stripe: Stripe, amount: number, currency: string): Promise<string> {
  const coupon = await stripe.coupons.create({
    amount_off: Math.round(amount * 100), // Convert to cents
    currency: currency,
    duration: 'once',
  });
  return coupon.id;
}
