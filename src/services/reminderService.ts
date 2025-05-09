
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
    // Récupérer les planifications depuis la base de données
    const { data: schedules, error: schedulesError } = await supabase
      .from('reminder_schedules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (schedulesError) throw schedulesError;
    
    // Pour chaque planification, récupérer les règles associées
    const schedulesWithRules: ReminderSchedule[] = [];
    
    for (const schedule of schedules || []) {
      const { data: rules, error: rulesError } = await supabase
        .from('reminder_rules')
        .select('*')
        .eq('schedule_id', schedule.id)
        .order('trigger_value', { ascending: true });
      
      if (rulesError) throw rulesError;
      
      schedulesWithRules.push({
        id: schedule.id,
        name: schedule.name,
        enabled: schedule.enabled,
        isDefault: schedule.is_default,
        triggers: (rules || []).map(rule => ({
          id: rule.id,
          scheduleId: rule.schedule_id,
          triggerType: rule.trigger_type,
          triggerValue: rule.trigger_value,
          emailSubject: rule.email_subject,
          emailBody: rule.email_body
        }))
      });
    }
    
    return {
      success: true,
      schedules: schedulesWithRules
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
    
    const scheduleData = {
      id: schedule.id || undefined, // undefined pour qu'il génère un nouvel ID si nécessaire
      name: schedule.name,
      enabled: schedule.enabled,
      is_default: schedule.isDefault,
      user_id: user.id
    };
    
    // Si c'est une nouvelle planification, on l'insère
    // Sinon on la met à jour
    let operation;
    if (!schedule.id) {
      operation = supabase.from('reminder_schedules').insert(scheduleData).select().single();
    } else {
      operation = supabase.from('reminder_schedules').update(scheduleData).eq('id', schedule.id).select().single();
    }
    
    const { data: savedSchedule, error: scheduleError } = await operation;
    
    if (scheduleError) throw scheduleError;
    
    // Si on a des règles, on les sauvegarde
    if (schedule.triggers && schedule.triggers.length > 0) {
      // On supprime d'abord les règles existantes si c'est une mise à jour
      if (schedule.id) {
        await supabase.from('reminder_rules').delete().eq('schedule_id', schedule.id);
      }
      
      // On insère les nouvelles règles
      const rulesData = schedule.triggers.map(rule => ({
        schedule_id: savedSchedule.id,
        trigger_type: rule.triggerType,
        trigger_value: rule.triggerValue,
        email_subject: rule.emailSubject,
        email_body: rule.emailBody
      }));
      
      const { error: rulesError } = await supabase.from('reminder_rules').insert(rulesData);
      
      if (rulesError) throw rulesError;
    }
    
    // On récupère les règles mises à jour
    const { data: rules } = await supabase
      .from('reminder_rules')
      .select('*')
      .eq('schedule_id', savedSchedule.id)
      .order('trigger_value', { ascending: true });
    
    return {
      success: true,
      savedSchedule: {
        id: savedSchedule.id,
        name: savedSchedule.name,
        enabled: savedSchedule.enabled,
        isDefault: savedSchedule.is_default,
        triggers: (rules || []).map(rule => ({
          id: rule.id,
          scheduleId: rule.schedule_id,
          triggerType: rule.trigger_type,
          triggerValue: rule.trigger_value,
          emailSubject: rule.email_subject,
          emailBody: rule.email_body
        }))
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
    // On supprime d'abord les règles associées
    const { error: rulesError } = await supabase
      .from('reminder_rules')
      .delete()
      .eq('schedule_id', scheduleId);
      
    if (rulesError) throw rulesError;
    
    // Puis on supprime la planification
    const { error: scheduleError } = await supabase
      .from('reminder_schedules')
      .delete()
      .eq('id', scheduleId);
      
    if (scheduleError) throw scheduleError;
    
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
    const { data, error } = await supabase
      .from('invoice_reminders')
      .select(`
        *,
        reminder_rules(*)
      `)
      .eq('invoice_id', invoiceId)
      .order('sent_at', { ascending: false });
      
    if (error) throw error;
    
    return {
      success: true,
      history: data
    };
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching reminder history'
    };
  }
}
