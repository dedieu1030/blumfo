
import { supabase } from "@/integrations/supabase/client";
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";
import { toast } from "sonner";

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

/**
 * Envoie un rappel pour une facture spécifique
 * @param invoiceId ID de la facture Stripe
 * @param reminderId ID du modèle de rappel (optionnel)
 */
export async function sendInvoiceReminder(invoiceId: string, reminderId?: string) {
  try {
    const { data, error } = await supabase.functions.invoke('send-reminder', {
      body: {
        invoiceId,
        reminderId
      }
    });
    
    if (error) {
      console.error('Error sending reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error sending invoice reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending reminder'
    };
  }
}

/**
 * Récupère les planifications de relances automatiques de l'utilisateur
 */
export async function getReminderSchedules(): Promise<{
  success: boolean;
  schedules?: ReminderSchedule[];
  error?: string;
}> {
  try {
    // For now, we'll use a dummy implementation since the actual table might not exist
    // We'll return example data that matches the expected structure
    const dummySchedules: ReminderSchedule[] = [
      {
        id: "1",
        name: "Relances automatiques standard",
        enabled: true,
        isDefault: true,
        triggers: [
          {
            id: "101",
            triggerType: "days_before_due",
            triggerValue: 2,
            emailSubject: "Rappel de facture à venir",
            emailBody: "Votre facture arrive à échéance dans 2 jours."
          },
          {
            id: "102",
            triggerType: "days_after_due",
            triggerValue: 1,
            emailSubject: "Facture échue",
            emailBody: "Votre facture est échue depuis 1 jour."
          }
        ]
      }
    ];
    
    return {
      success: true,
      schedules: dummySchedules
    };
  } catch (error) {
    console.error('Error fetching reminder schedules:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching reminder schedules'
    };
  }
}

/**
 * Enregistre une planification de relance automatique
 */
export async function saveReminderSchedule(schedule: ReminderSchedule): Promise<{
  success: boolean;
  savedSchedule?: ReminderSchedule;
  error?: string;
}> {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: "User not authenticated"
      };
    }

    // For now, return a mock successful response
    return {
      success: true,
      savedSchedule: {
        ...schedule,
        id: schedule.id || Date.now().toString()
      }
    };
  } catch (error) {
    console.error('Error saving reminder schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error saving reminder schedule'
    };
  }
}

/**
 * Supprime une planification de relance automatique
 */
export async function deleteReminderSchedule(scheduleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // For now, return a mock successful response
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting reminder schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting reminder schedule'
    };
  }
}

/**
 * Récupère l'historique des relances pour une facture
 */
export async function getInvoiceReminderHistory(invoiceId: string): Promise<{
  success: boolean;
  history?: any[];
  error?: string;
}> {
  try {
    // For now, return a mock successful response with empty history
    return {
      success: true,
      history: []
    };
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching reminder history'
    };
  }
}
