
import { User } from "@supabase/supabase-js";

export type AppRole = 'admin' | 'manager' | 'user';

export interface UserWithRoles extends User {
  roles?: AppRole[];
}

export interface AuthContextType {
  user: UserWithRoles | null;
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  hasRole: (role: AppRole) => boolean;
  refreshRoles: () => Promise<void>;
}
