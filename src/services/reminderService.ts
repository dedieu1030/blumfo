
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";

/**
 * Envoie une relance pour une facture spécifique
 */
export async function sendInvoiceReminder(invoiceId: string, reminderId?: string) {
  try {
    const { data, error } = await supabase.functions.invoke('send-reminder', {
      body: { invoiceId, reminderId },
    });

    if (error) {
      console.error('Error sending reminder:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (e) {
    console.error('Exception in sendInvoiceReminder:', e);
    return { 
      success: false, 
      error: e instanceof Error ? e.message : "Une erreur s'est produite lors de l'envoi de la relance" 
    };
  }
}

/**
 * Vérifie si une facture doit être relancée en fonction d'une planification
 */
export function shouldSendReminder(
  invoice: { 
    created_at: string;
    due_date?: string; 
    status: string;
    last_reminder_date?: string;
  }, 
  trigger: ReminderTrigger
): boolean {
  // Ne pas relancer les factures payées ou annulées
  if (invoice.status === 'paid' || invoice.status === 'void') {
    return false;
  }
  
  const now = new Date();
  const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
  const lastReminderDate = invoice.last_reminder_date ? new Date(invoice.last_reminder_date) : null;
  
  // Si pas de date d'échéance et que le trigger est basé sur l'échéance, on ne peut pas relancer
  if (!dueDate && (trigger.triggerType === 'days_before_due' || trigger.triggerType === 'days_after_due')) {
    return false;
  }
  
  if (trigger.triggerType === 'days_before_due' && dueDate) {
    const triggerDate = new Date(dueDate);
    triggerDate.setDate(dueDate.getDate() - trigger.triggerValue);
    return now >= triggerDate && now <= dueDate;
  }
  
  if (trigger.triggerType === 'days_after_due' && dueDate) {
    const triggerDate = new Date(dueDate);
    triggerDate.setDate(dueDate.getDate() + trigger.triggerValue);
    return now >= triggerDate;
  }
  
  if (trigger.triggerType === 'days_after_previous_reminder' && lastReminderDate) {
    const triggerDate = new Date(lastReminderDate);
    triggerDate.setDate(lastReminderDate.getDate() + trigger.triggerValue);
    return now >= triggerDate;
  }
  
  if (trigger.triggerType === 'specific_date') {
    const triggerDate = new Date(trigger.triggerValue);
    return now >= triggerDate;
  }
  
  return false;
}

/**
 * Récupère la planification active pour les relances automatiques
 */
export function getActiveReminderSchedule(): ReminderSchedule | null {
  const savedSchedules = localStorage.getItem('reminderSchedules');
  if (!savedSchedules) return null;
  
  try {
    const schedules: ReminderSchedule[] = JSON.parse(savedSchedules);
    return schedules.find(s => s.enabled) || null;
  } catch (e) {
    console.error("Erreur lors de la récupération des planifications de relance", e);
    return null;
  }
}
