
import { supabase } from "@/integrations/supabase/client";

/**
 * Service to check for invoices that need reminders
 */
export async function checkOverdueInvoices() {
  try {
    const { data, error } = await supabase.functions.invoke('check-overdue-invoices');
    
    if (error) {
      console.error('Error checking overdue invoices:', error);
      return {
        success: false,
        error: error.message,
        overdue: [],
        nearDue: [],
        overdueCount: 0,
        nearDueCount: 0
      };
    }
    
    return {
      success: true,
      overdue: data.overdue,
      nearDue: data.nearDue,
      overdueCount: data.overdueCount,
      nearDueCount: data.nearDueCount
    };
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking invoices',
      overdue: [],
      nearDue: [],
      overdueCount: 0,
      nearDueCount: 0
    };
  }
}
