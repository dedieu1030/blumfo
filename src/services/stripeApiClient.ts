
/**
 * Gets invoice details including status updates from Stripe
 * @param invoiceId Stripe invoice ID
 * @returns Invoice details
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceResponse> {
  try {
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('get-invoice', {
      body: { invoiceId }
    });

    if (error) {
      console.error('Error getting invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      invoice: data.invoice
    };
  } catch (error) {
    console.error('Error getting invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error getting invoice'
    };
  }
}
