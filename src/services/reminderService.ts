
import { supabase } from "@/integrations/supabase/client";
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";

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
    const { data: schedules, error } = await supabase
      .from('reminder_schedules')
      .select('*, reminder_rules(*)');
    
    if (error) {
      console.error('Error fetching reminder schedules:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Transform database model to application model
    const formattedSchedules: ReminderSchedule[] = schedules.map(schedule => ({
      id: schedule.id,
      name: schedule.name,
      enabled: schedule.enabled,
      isDefault: schedule.is_default,
      triggers: (schedule.reminder_rules || []).map(rule => ({
        id: rule.id,
        triggerType: rule.trigger_type as ReminderTrigger['triggerType'],
        triggerValue: rule.trigger_value,
        emailSubject: rule.email_subject,
        emailBody: rule.email_body
      }))
    }));
    
    return {
      success: true,
      schedules: formattedSchedules
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

    // Now include the user_id when upserting the schedule
    const { data: savedSchedule, error: scheduleError } = await supabase
      .from('reminder_schedules')
      .upsert({
        id: schedule.id,
        name: schedule.name,
        enabled: schedule.enabled,
        is_default: schedule.isDefault,
        user_id: user.id
      })
      .select('*')
      .single();
    
    if (scheduleError) {
      console.error('Error saving reminder schedule:', scheduleError);
      return {
        success: false,
        error: scheduleError.message
      };
    }

    // Delete existing rules for this schedule to replace them with new ones
    if (schedule.triggers.length > 0) {
      const { error: deleteError } = await supabase
        .from('reminder_rules')
        .delete()
        .eq('schedule_id', savedSchedule.id);
      
      if (deleteError) {
        console.error('Error deleting existing reminder rules:', deleteError);
      }

      // Insert new triggers
      const rulesData = schedule.triggers.map(trigger => ({
        schedule_id: savedSchedule.id,
        trigger_type: trigger.triggerType,
        trigger_value: trigger.triggerValue,
        email_subject: trigger.emailSubject,
        email_body: trigger.emailBody
      }));

      const { error: insertError } = await supabase
        .from('reminder_rules')
        .insert(rulesData);
      
      if (insertError) {
        console.error('Error inserting reminder rules:', insertError);
        return {
          success: false,
          error: insertError.message
        };
      }
    }
    
    return {
      success: true,
      savedSchedule: {
        id: savedSchedule.id,
        name: savedSchedule.name,
        enabled: savedSchedule.enabled,
        isDefault: savedSchedule.is_default,
        triggers: schedule.triggers
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
    const { error } = await supabase
      .from('reminder_schedules')
      .delete()
      .eq('id', scheduleId);
    
    if (error) {
      console.error('Error deleting reminder schedule:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
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
    const { data: history, error } = await supabase
      .from('invoice_reminders')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('sent_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reminder history:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      history
    };
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching reminder history'
    };
  }
}
