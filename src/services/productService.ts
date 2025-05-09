
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  tax_rate: number | null;
  is_recurring: boolean;
  active: boolean;
  category_id: string | null;
  category_name?: string;
  currency: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Propriétés additionnelles pour gérer la récurrence
  recurring_interval?: 'day' | 'week' | 'month' | 'year' | null;
  recurring_interval_count?: number | null;
  product_type?: 'product' | 'service' | null;
}

export interface ProductCategory {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

// Format price for display
export function formatPrice(cents: number, currency = 'EUR') {
  const price = cents / 100;
  return price.toLocaleString('fr-CA', {
    style: 'currency',
    currency: currency,
  });
}

// Fetch all products
export async function fetchProducts(includeInactive = false) {
  try {
    let query = supabase
      .from('stripe_products')
      .select(`
        *,
        product_categories (name, color)
      `)
      .order('name');
    
    if (!includeInactive) {
      query = query.eq('active', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Format products with their categories
    return (data || []).map(product => ({
      ...product,
      category_name: product.product_categories?.name,
      price: formatPrice(product.price_cents || 0)
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    toast.error('Erreur lors du chargement des produits');
    return [];
  }
}

// Fetch a single product by ID
export async function fetchProduct(id: string) {
  try {
    const { data, error } = await supabase
      .from('stripe_products')
      .select(`
        *,
        product_categories (name, color)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      category_name: data.product_categories?.name
    } as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Create a new product
export async function createProduct(product: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from('stripe_products')
      .insert({
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        tax_rate: product.tax_rate,
        is_recurring: product.is_recurring || false,
        active: product.active !== undefined ? product.active : true,
        category_id: product.category_id,
        currency: product.currency || 'EUR',
        metadata: product.metadata || {},
        // Ajout des propriétés de récurrence
        recurring_interval: product.recurring_interval,
        recurring_interval_count: product.recurring_interval_count,
        product_type: product.product_type
      })
      .select();
    
    if (error) throw error;
    
    toast.success('Produit créé avec succès');
    return data[0] as Product;
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error('Erreur lors de la création du produit');
    return null;
  }
}

// Update an existing product
export async function updateProduct(id: string, product: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from('stripe_products')
      .update({
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        tax_rate: product.tax_rate,
        is_recurring: product.is_recurring,
        active: product.active,
        category_id: product.category_id,
        currency: product.currency,
        metadata: product.metadata,
        // Mise à jour des propriétés de récurrence
        recurring_interval: product.recurring_interval,
        recurring_interval_count: product.recurring_interval_count,
        product_type: product.product_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    toast.success('Produit mis à jour avec succès');
    return data[0] as Product;
  } catch (error) {
    console.error('Error updating product:', error);
    toast.error('Erreur lors de la mise à jour du produit');
    return null;
  }
}

// Delete a product
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

// Type pour Category (renommé pour éviter la confusion avec ProductCategory)
export type Category = ProductCategory;

// Fetch product categories
export async function fetchProductCategories() {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data as ProductCategory[];
  } catch (error) {
    console.error('Error fetching product categories:', error);
    toast.error('Erreur lors du chargement des catégories');
    return [];
  }
}

// Alias pour la fonction fetchProductCategories
export const fetchCategories = fetchProductCategories;

// Create a product category
export async function createProductCategory(category: Partial<ProductCategory>) {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .insert({
        name: category.name,
        color: category.color
      })
      .select();
    
    if (error) throw error;
    
    toast.success('Catégorie créée avec succès');
    return data[0] as ProductCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    toast.error('Erreur lors de la création de la catégorie');
    return null;
  }
}

// Alias pour la fonction createProductCategory
export const createCategory = createProductCategory;

// Update a product category
export async function updateProductCategory(id: string, category: Partial<ProductCategory>) {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .update({
        name: category.name,
        color: category.color,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    toast.success('Catégorie mise à jour avec succès');
    return data[0] as ProductCategory;
  } catch (error) {
    console.error('Error updating category:', error);
    toast.error('Erreur lors de la mise à jour de la catégorie');
    return null;
  }
}

// Alias pour la fonction updateProductCategory
export const updateCategory = updateProductCategory;

// Delete a product category
export async function deleteProductCategory(id: string) {
  try {
    // First update products that use this category to have null category_id
    await supabase
      .from('stripe_products')
      .update({ category_id: null })
      .eq('category_id', id);
    
    // Then delete the category
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

// Alias pour la fonction deleteProductCategory
export const deleteCategory = deleteProductCategory;
