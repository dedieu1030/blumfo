import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  tax_rate: number | null;
  is_recurring: boolean;
  recurring_interval: 'day' | 'week' | 'month' | 'year' | null;
  recurring_interval_count: number | null;
  product_type: 'product' | 'service' | null;
  active: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  category_id?: string;
  category_name?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Product CRUD operations
export async function fetchProducts(includeInactive: boolean = false) {
  try {
    let query = supabase
      .from('stripe_products')
      .select(`
        *,
        product_categories(id, name)
      `);
    
    if (!includeInactive) {
      query = query.eq('active', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(product => ({
      ...product,
      category_id: product.product_categories?.id,
      category_name: product.product_categories?.name,
      recurring_interval: validateRecurringInterval(product.recurring_interval),
      product_type: validateProductType(product.product_type)
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Erreur lors du chargement des produits');
    return [];
  }
}

export async function fetchProduct(id: string) {
  try {
    const { data, error } = await supabase
      .from('stripe_products')
      .select(`
        *,
        product_categories(id, name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      category_id: data.product_categories?.id,
      category_name: data.product_categories?.name,
      recurring_interval: validateRecurringInterval(data.recurring_interval),
      product_type: validateProductType(data.product_type)
    } as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    toast.error('Erreur lors du chargement du produit');
    return null;
  }
}

// Helper functions to validate and cast types
function validateRecurringInterval(interval: string | null): 'day' | 'week' | 'month' | 'year' | null {
  if (!interval) return null;
  if (['day', 'week', 'month', 'year'].includes(interval)) {
    return interval as 'day' | 'week' | 'month' | 'year';
  }
  console.warn(`Invalid recurring interval value: ${interval}, defaulting to null`);
  return null;
}

function validateProductType(type: string | null): 'product' | 'service' | null {
  if (!type) return null;
  if (['product', 'service'].includes(type)) {
    return type as 'product' | 'service';
  }
  console.warn(`Invalid product type value: ${type}, defaulting to null`);
  return null;
}

export async function createProduct(product: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from('stripe_products')
      .insert({
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        currency: product.currency || 'EUR',
        tax_rate: product.tax_rate,
        is_recurring: product.is_recurring || false,
        recurring_interval: product.recurring_interval,
        recurring_interval_count: product.recurring_interval_count,
        product_type: product.product_type,
        active: product.active !== undefined ? product.active : true,
        metadata: product.metadata || {}
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Produit créé avec succès');
    return data as Product;
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error('Erreur lors de la création du produit');
    return null;
  }
}

export async function updateProduct(id: string, product: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from('stripe_products')
      .update({
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        currency: product.currency,
        tax_rate: product.tax_rate,
        is_recurring: product.is_recurring,
        recurring_interval: product.recurring_interval,
        recurring_interval_count: product.recurring_interval_count,
        product_type: product.product_type,
        active: product.active,
        metadata: product.metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Produit mis à jour avec succès');
    return data as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    toast.error('Erreur lors de la mise à jour du produit');
    return null;
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase
      .from('stripe_products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Produit supprimé avec succès');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    toast.error('Erreur lors de la suppression du produit');
    return false;
  }
}

// Category CRUD operations
export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Erreur lors du chargement des catégories');
    return [];
  }
}

export async function createCategory(category: Partial<Category>) {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .insert({
        name: category.name,
        description: category.description
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Catégorie créée avec succès');
    return data as Category;
  } catch (error) {
    console.error('Error creating category:', error);
    toast.error('Erreur lors de la création de la catégorie');
    return null;
  }
}

export async function updateCategory(id: string, category: Partial<Category>) {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .update({
        name: category.name,
        description: category.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Catégorie mise à jour avec succès');
    return data as Category;
  } catch (error) {
    console.error('Error updating category:', error);
    toast.error('Erreur lors de la mise à jour de la catégorie');
    return null;
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Catégorie supprimée avec succès');
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    toast.error('Erreur lors de la suppression de la catégorie');
    return false;
  }
}

// Helper to format price from cents to a display value
export function formatPrice(cents: number | null, currency: string = 'EUR') {
  if (cents === null) return '';
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(cents / 100);
}

// Helper to get recurring interval display text
export function getRecurringIntervalText(interval: string | null, intervalCount: number | null) {
  if (!interval || !intervalCount) return '';
  
  const intervalMap = {
    day: intervalCount > 1 ? 'jours' : 'jour',
    week: intervalCount > 1 ? 'semaines' : 'semaine',
    month: intervalCount > 1 ? 'mois' : 'mois',
    year: intervalCount > 1 ? 'ans' : 'an',
  };
  
  return `Tous les ${intervalCount} ${intervalMap[interval as keyof typeof intervalMap]}`;
}
