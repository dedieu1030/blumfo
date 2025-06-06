
// This file contains utilities for Stripe integration

import { CompanyProfile } from "@/types/invoice";

/**
 * Creates a Stripe Checkout session for invoice payment
 * @param invoiceData Invoice data to create payment for
 * @returns The URL to the Stripe checkout page
 */
export const createStripeCheckoutSession = async (invoiceData: any) => {
  try {
    // In a real implementation, this would call a Supabase Edge Function
    // that securely communicates with Stripe API
    console.log('Creating Stripe checkout session for invoice:', invoiceData);
    
    // Calculate the total amount in cents (Stripe requires cents)
    const amountInCents = Math.round(invoiceData.total * 100);
    
    // Calculate due date based on payment delay
    let dueDate = new Date(invoiceData.invoiceDate);
    const delayDays = parseInt(invoiceData.paymentDelay) || 0;
    dueDate.setDate(dueDate.getDate() + delayDays);
    
    // Construct line items from serviceLines
    const lineItems = invoiceData.serviceLines.map((line: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: line.description || 'Service',
          description: `Quantité: ${line.quantity}`,
        },
        unit_amount: Math.round(parseFloat(line.unitPrice) * 100),
      },
      quantity: parseInt(line.quantity) || 1,
    }));
    
    // Determine the issuer type and name based on the businessType if available
    const issuerType = invoiceData.issuerInfo?.businessType || 'company';
    let issuerTypeDisplay = 'Entreprise';
    
    switch(issuerType) {
      case 'individual':
        issuerTypeDisplay = 'Particulier';
        break;
      case 'lawyer':
        issuerTypeDisplay = 'Cabinet juridique';
        break;
      case 'freelancer':
        issuerTypeDisplay = 'Freelance';
        break;
      case 'other':
        issuerTypeDisplay = invoiceData.issuerInfo?.businessTypeCustom || 'Professionnel';
        break;
      default:
        issuerTypeDisplay = 'Entreprise';
    }
    
    // Get email type label
    const emailType = invoiceData.issuerInfo?.emailType || 'professional';
    let emailTypeDisplay = 'Professionnel';
    
    switch(emailType) {
      case 'personal':
        emailTypeDisplay = 'Personnel';
        break;
      case 'company':
        emailTypeDisplay = 'Entreprise';
        break;
      default:
        emailTypeDisplay = 'Professionnel';
    }
    
    // Create metadata for the invoice
    const metadata = {
      invoice_number: invoiceData.invoiceNumber,
      client_name: invoiceData.clientName,
      client_email: invoiceData.clientEmail,
      due_date: dueDate.toISOString().split('T')[0],
      issuer_type: issuerTypeDisplay,
      issuer_name: invoiceData.issuerInfo?.name || '',
      email_type: emailTypeDisplay,
    };
    
    // Simulate API response delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mocked checkout URL (this would come from Stripe in production)
    // In a real implementation, this would call Stripe's API and return the actual session URL
    return {
      success: true,
      url: `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(2, 15)}`,
      sessionId: `cs_test_${Math.random().toString(36).substring(2, 15)}`,
      metadata,
    };
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return {
      success: false,
      error: 'Failed to create payment session',
    };
  }
};

/**
 * Simulates checking the payment status of an invoice
 * @param sessionId Stripe session ID to check
 * @returns Payment status information
 */
export const checkPaymentStatus = async (sessionId: string) => {
  // This would call a Supabase Edge Function in production
  console.log('Checking payment status for session:', sessionId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response
  return {
    paid: Math.random() > 0.3, // Randomly return paid or not for demo
    status: Math.random() > 0.3 ? 'paid' : 'pending',
  };
};

/**
 * Helper function to format money amounts
 * @param amount Amount to format
 * @param currency Currency code
 * @returns Formatted amount string
 */
export const formatMoney = (amount: number, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency 
  }).format(amount);
};
