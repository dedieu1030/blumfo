
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.6'
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { format, parseISO, isAfter, isBefore } from 'https://esm.sh/date-fns@3.6.0'

// Types
interface Subscription {
  id: string;
  name: string;
  client_id: string;
  next_invoice_date: string;
  recurring_interval: string;
  recurring_interval_count: number;
}

interface SubscriptionItem {
  subscription_id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  tax_rate: number | null;
  product: any;
}

interface Client {
  id: string;
  name: string;
  email: string;
  address: string | null;
  phone: string | null;
}

interface ServiceLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  tva: string;
  total: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone: string;
  issuerInfo: any;
  serviceLines: ServiceLine[];
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentDelay: string;
  paymentMethods: any[];
  notes: string;
  templateId: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client (admin)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get current date
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    
    console.log(`Checking for subscriptions due for invoicing on ${todayStr}`)
    
    // Get active subscriptions that need invoicing (next_invoice_date <= today)
    const { data: dueSubscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        name,
        client_id,
        next_invoice_date,
        recurring_interval,
        recurring_interval_count,
        user_id
      `)
      .eq('status', 'active')
      .lte('next_invoice_date', todayStr)
    
    if (subscriptionError) {
      console.error('Error fetching due subscriptions:', subscriptionError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch due subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Found ${dueSubscriptions.length} subscriptions due for invoicing`)
    
    if (dueSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions due for invoicing' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const results = []
    
    // Process each subscription
    for (const subscription of dueSubscriptions) {
      try {
        console.log(`Processing subscription: ${subscription.id} - ${subscription.name}`)
        
        // Get client information
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', subscription.client_id)
          .single()
        
        if (clientError) {
          console.error(`Error fetching client for subscription ${subscription.id}:`, clientError)
          results.push({
            subscription_id: subscription.id,
            success: false,
            error: 'Failed to fetch client information'
          })
          continue
        }
        
        // Get subscription items
        const { data: items, error: itemsError } = await supabase
          .from('subscription_items')
          .select(`
            *,
            stripe_products(*)
          `)
          .eq('subscription_id', subscription.id)
        
        if (itemsError) {
          console.error(`Error fetching items for subscription ${subscription.id}:`, itemsError)
          results.push({
            subscription_id: subscription.id,
            success: false,
            error: 'Failed to fetch subscription items'
          })
          continue
        }
        
        // Get company profile for the user
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', subscription.user_id)
        
        let issuerInfo
        if (profileError || !profiles || profiles.length === 0) {
          console.warn(`No profile found for user ${subscription.user_id}, using default values`)
          // Use default values if profile not found
          issuerInfo = {
            name: "Your Company Name",
            address: "",
            email: "",
            emailType: "professional",
            phone: "",
            bankAccount: "",
            bankName: "",
            accountHolder: "",
            taxRate: "20",
            termsAndConditions: "",
            thankYouMessage: "",
            defaultCurrency: "EUR"
          }
        } else {
          issuerInfo = profiles[0]
        }
        
        // Generate invoice data
        const serviceLines = items.map(item => ({
          id: item.id,
          description: item.stripe_products?.name || 'Unknown product',
          quantity: item.quantity.toString(),
          unitPrice: (item.price_cents / 100).toString(),
          tva: (item.tax_rate || 20).toString(),
          total: ((item.price_cents * item.quantity) / 100).toString()
        }))
        
        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + (item.price_cents * item.quantity) / 100, 0)
        const taxTotal = items.reduce((sum, item) => {
          const itemTotal = (item.price_cents * item.quantity) / 100
          const taxRate = item.tax_rate || 0
          return sum + (itemTotal * taxRate / 100)
        }, 0)
        const total = subtotal + taxTotal
        
        // Generate invoice number
        const now = new Date()
        const year = now.getFullYear().toString()
        const month = (now.getMonth() + 1).toString().padStart(2, '0')
        const day = now.getDate().toString().padStart(2, '0')
        
        // Get invoice counter
        const { data: counterData, error: counterError } = await supabase
          .from('invoice_counters')
          .select('next_number')
          .eq('user_id', subscription.user_id)
          .single()
        
        let nextNumber = 1
        if (!counterError && counterData) {
          nextNumber = counterData.next_number
          
          // Update the counter
          await supabase
            .from('invoice_counters')
            .update({ next_number: nextNumber + 1 })
            .eq('user_id', subscription.user_id)
        } else {
          // Create a new counter if it doesn't exist
          await supabase
            .from('invoice_counters')
            .insert({ user_id: subscription.user_id, next_number: 2 })
        }
        
        const invoiceNumber = `INV-${year}${month}${day}-${nextNumber.toString().padStart(4, '0')}`
        
        // Create the invoice in the database
        const { data: invoice, error: invoiceError } = await supabase
          .from('stripe_invoices')
          .insert({
            invoice_number: invoiceNumber,
            client_id: client.id,
            user_id: subscription.user_id,
            issued_date: now.toISOString(),
            due_date: now.toISOString(), // You may want to add payment terms logic here
            amount_total: Math.round(total * 100), // Convert to cents
            currency: 'EUR',
            status: 'draft',
            metadata: {
              subscription_id: subscription.id,
              recurring: true,
              items: items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price_cents: item.price_cents,
                tax_rate: item.tax_rate
              }))
            }
          })
          .select()
        
        if (invoiceError) {
          console.error(`Error creating invoice for subscription ${subscription.id}:`, invoiceError)
          results.push({
            subscription_id: subscription.id,
            success: false,
            error: 'Failed to create invoice'
          })
          continue
        }
        
        // Calculate the next invoice date based on recurring interval
        let nextDate = parseISO(subscription.next_invoice_date)
        switch (subscription.recurring_interval) {
          case 'day':
            nextDate = new Date(nextDate.setDate(nextDate.getDate() + subscription.recurring_interval_count))
            break
          case 'week':
            nextDate = new Date(nextDate.setDate(nextDate.getDate() + (subscription.recurring_interval_count * 7)))
            break
          case 'month':
            nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + subscription.recurring_interval_count))
            break
          case 'year':
            nextDate = new Date(nextDate.setFullYear(nextDate.getFullYear() + subscription.recurring_interval_count))
            break
        }
        
        // Update the subscription with the new next_invoice_date and last_invoice_date
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            next_invoice_date: nextDate.toISOString(),
            last_invoice_date: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', subscription.id)
        
        if (updateError) {
          console.error(`Error updating subscription ${subscription.id}:`, updateError)
          results.push({
            subscription_id: subscription.id,
            success: true,
            invoice_id: invoice[0].id,
            warning: 'Invoice created but failed to update subscription dates'
          })
          continue
        }
        
        results.push({
          subscription_id: subscription.id,
          success: true,
          invoice_id: invoice[0].id,
          next_invoice_date: format(nextDate, 'yyyy-MM-dd')
        })
        
        console.log(`Successfully processed subscription ${subscription.id}, created invoice ${invoice[0].id}`)
      } catch (err) {
        console.error(`Unexpected error processing subscription ${subscription.id}:`, err)
        results.push({
          subscription_id: subscription.id,
          success: false,
          error: `Unexpected error: ${err.message}`
        })
      }
    }
    
    return new Response(
      JSON.stringify({ 
        processed: dueSubscriptions.length,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
