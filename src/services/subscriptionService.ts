
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "./productService";
import { addDays, addWeeks, addMonths, addYears, format } from "date-fns";
import { Client } from "@/components/ClientSelector";

export interface Subscription {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  client_name?: string;
  client_email?: string;
  start_date: string;
  end_date: string | null;
  recurring_interval: 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom';
  recurring_interval_count: number;
  custom_days?: number | null;
  next_invoice_date: string;
  last_invoice_date: string | null;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  items?: SubscriptionItem[];
}

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price_cents: number;
  tax_rate: number | null;
  created_at: string;
  updated_at: string;
}

// Helper function to validate recurring interval
function validateRecurringInterval(interval: string | null): 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom' {
  if (!interval || !['day', 'week', 'month', 'quarter', 'semester', 'year', 'custom'].includes(interval)) {
    console.warn(`Invalid recurring interval value: ${interval}, defaulting to 'month'`);
    return 'month';
  }
  return interval as 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom';
}

// Helper function to validate subscription status
function validateStatus(status: string | null): 'active' | 'paused' | 'cancelled' | 'completed' {
  if (!status || !['active', 'paused', 'cancelled', 'completed'].includes(status)) {
    console.warn(`Invalid status value: ${status}, defaulting to 'active'`);
    return 'active';
  }
  return status as 'active' | 'paused' | 'cancelled' | 'completed';
}

export async function fetchSubscriptions() {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        clients(name, email)
      `)
      .order('next_invoice_date', { ascending: true });
    
    if (error) throw error;
    
    return data.map(subscription => ({
      ...subscription,
      client_name: subscription.clients?.name,
      client_email: subscription.clients?.email,
      recurring_interval: validateRecurringInterval(subscription.recurring_interval),
      status: validateStatus(subscription.status)
    })) as Subscription[];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    toast.error('Erreur lors du chargement des abonnements');
    return [];
  }
}

export async function fetchSubscription(id: string) {
  try {
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        clients(name, email)
      `)
      .eq('id', id)
      .single();
    
    if (subscriptionError) throw subscriptionError;
    
    const { data: items, error: itemsError } = await supabase
      .from('subscription_items')
      .select(`
        *,
        stripe_products(*)
      `)
      .eq('subscription_id', id);
    
    if (itemsError) throw itemsError;
    
    return {
      ...subscription,
      client_name: subscription.clients?.name,
      client_email: subscription.clients?.email,
      recurring_interval: validateRecurringInterval(subscription.recurring_interval),
      status: validateStatus(subscription.status),
      items: items.map(item => ({
        ...item,
        product: item.stripe_products
      }))
    } as Subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    toast.error('Erreur lors du chargement de l\'abonnement');
    return null;
  }
}

export async function createSubscription(subscription: Partial<Subscription>, items: Partial<SubscriptionItem>[]) {
  try {
    // Get the current user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!sessionData.session) {
      throw new Error("No authenticated user");
    }

    // Create the subscription first
    const { data: newSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        name: subscription.name,
        description: subscription.description,
        client_id: subscription.client_id,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        recurring_interval: subscription.recurring_interval,
        recurring_interval_count: subscription.recurring_interval_count,
        next_invoice_date: subscription.next_invoice_date,
        status: subscription.status || 'active',
        metadata: subscription.metadata || {},
        user_id: sessionData.session.user.id
      })
      .select()
      .single();
    
    if (subscriptionError) throw subscriptionError;
    
    // Then create the subscription items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        subscription_id: newSubscription.id,
        product_id: item.product_id,
        quantity: item.quantity || 1,
        price_cents: item.price_cents,
        tax_rate: item.tax_rate
      }));
      
      const { error: itemsError } = await supabase
        .from('subscription_items')
        .insert(itemsToInsert);
      
      if (itemsError) throw itemsError;
    }
    
    toast.success('Abonnement créé avec succès');
    return newSubscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    toast.error('Erreur lors de la création de l\'abonnement');
    return null;
  }
}

export async function updateSubscription(id: string, subscription: Partial<Subscription>, items?: Partial<SubscriptionItem>[]) {
  try {
    // Update the subscription
    const { data: updatedSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        name: subscription.name,
        description: subscription.description,
        client_id: subscription.client_id,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        recurring_interval: subscription.recurring_interval,
        recurring_interval_count: subscription.recurring_interval_count,
        next_invoice_date: subscription.next_invoice_date,
        status: subscription.status,
        metadata: subscription.metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (subscriptionError) throw subscriptionError;
    
    // If items are provided, update them
    if (items) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('subscription_items')
        .delete()
        .eq('subscription_id', id);
      
      if (deleteError) throw deleteError;
      
      // Create new items
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          subscription_id: id,
          product_id: item.product_id,
          quantity: item.quantity || 1,
          price_cents: item.price_cents,
          tax_rate: item.tax_rate
        }));
        
        const { error: itemsError } = await supabase
          .from('subscription_items')
          .insert(itemsToInsert);
        
        if (itemsError) throw itemsError;
      }
    }
    
    toast.success('Abonnement mis à jour avec succès');
    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    toast.error('Erreur lors de la mise à jour de l\'abonnement');
    return null;
  }
}

export async function deleteSubscription(id: string) {
  try {
    // Delete subscription items first
    const { error: itemsError } = await supabase
      .from('subscription_items')
      .delete()
      .eq('subscription_id', id);
    
    if (itemsError) throw itemsError;
    
    // Then delete the subscription
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Abonnement supprimé avec succès');
    return true;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    toast.error('Erreur lors de la suppression de l\'abonnement');
    return false;
  }
}

export async function updateSubscriptionStatus(id: string, status: 'active' | 'paused' | 'cancelled' | 'completed') {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Statut de l\'abonnement mis à jour');
    return data;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    toast.error('Erreur lors de la mise à jour du statut');
    return null;
  }
}

export function calculateNextInvoiceDate(
  startDate: Date | string,
  interval: 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom',
  intervalCount: number,
  customDays?: number | null
): Date {
  const date = typeof startDate === 'string' ? new Date(startDate) : startDate;
  
  switch (interval) {
    case 'day':
      return addDays(date, intervalCount);
    case 'week':
      return addWeeks(date, intervalCount);
    case 'month':
      return addMonths(date, intervalCount);
    case 'quarter':
      return addMonths(date, intervalCount * 3);
    case 'semester':
      return addMonths(date, intervalCount * 6);
    case 'year':
      return addYears(date, intervalCount);
    case 'custom':
      return addDays(date, customDays || intervalCount);
    default:
      return date;
  }
}

export function formatRecurringInterval(interval: string, count: number, customDays?: number | null) {
  const intervalMap = {
    day: count > 1 ? 'jours' : 'jour',
    week: count > 1 ? 'semaines' : 'semaine',
    month: count > 1 ? 'mois' : 'mois',
    quarter: count > 1 ? 'trimestres' : 'trimestre',
    semester: count > 1 ? 'semestres' : 'semestre',
    year: count > 1 ? 'ans' : 'an',
    custom: 'jours personnalisés'
  };
  
  if (interval === 'custom' && customDays) {
    return `Tous les ${customDays} jours`;
  }
  
  return `Tous les ${count} ${intervalMap[interval as keyof typeof intervalMap]}`;
}

export function formatDate(date: string | null) {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy');
}
