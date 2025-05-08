
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/auth";

export const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_roles', { _user_id: userId });
    
    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching user roles:', error);
    return [];
  }
};

export const assignRole = async (userId: string, role: AppRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('assign_role', { 
      target_user_id: userId, 
      target_role: role 
    });
    
    if (error) {
      console.error('Error assigning role:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Exception assigning role:', error);
    return false;
  }
};

export const revokeRole = async (userId: string, role: AppRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('revoke_role', { 
      target_user_id: userId, 
      target_role: role 
    });
    
    if (error) {
      console.error('Error revoking role:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Exception revoking role:', error);
    return false;
  }
};

export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role', { 
      _user_id: userId, 
      _role: role 
    });
    
    if (error) {
      console.error('Error checking role:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Exception checking role:', error);
    return false;
  }
};
