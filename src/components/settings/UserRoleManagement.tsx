
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { AppRole } from "@/types/auth";
import { assignRole, revokeRole } from "@/services/authService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  roles: AppRole[];
}

export function UserRoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Get all users from auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) throw authError;
        
        if (authUsers && authUsers.users) {
          // For each user, fetch their roles
          const usersWithRoles = await Promise.all(
            authUsers.users.map(async (user) => {
              const { data: roles } = await supabase.rpc('get_user_roles', { _user_id: user.id });
              return {
                id: user.id,
                email: user.email || 'No email',
                roles: roles || []
              };
            })
          );
          
          setUsers(usersWithRoles);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Erreur lors du chargement des utilisateurs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [isAdmin]);

  const handleRoleChange = async (userId: string, role: AppRole, action: 'add' | 'remove') => {
    if (!isAdmin) return;
    
    try {
      let success = false;
      
      if (action === 'add') {
        success = await assignRole(userId, role);
      } else {
        success = await revokeRole(userId, role);
      }
      
      if (success) {
        // Update local state
        setUsers(users.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              roles: action === 'add' 
                ? [...user.roles, role] 
                : user.roles.filter(r => r !== role)
            };
          }
          return user;
        }));
        
        toast.success(
          action === 'add' 
            ? `Rôle ${role} assigné avec succès` 
            : `Rôle ${role} révoqué avec succès`
        );
      } else {
        toast.error("L'opération a échoué");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return <div>Accès non autorisé</div>;
  }

  if (loading) {
    return <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des rôles utilisateurs</CardTitle>
        <CardDescription>Attribuer et révoquer des rôles aux utilisateurs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {users.map(user => (
            <div key={user.id} className="border rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.roles.map(role => (
                      <Badge key={role} className={`${getRoleBadgeColor(role)} mr-1`}>
                        {role}
                        {user.id !== currentUser?.id && (
                          <button 
                            onClick={() => handleRoleChange(user.id, role, 'remove')}
                            className="ml-1 focus:outline-none"
                            title="Révoquer ce rôle"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                    {user.roles.length === 0 && (
                      <span className="text-gray-500 text-sm">Aucun rôle</span>
                    )}
                  </div>
                </div>
                
                {user.id !== currentUser?.id && (
                  <div className="flex flex-wrap gap-2">
                    {!user.roles.includes('admin') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRoleChange(user.id, 'admin', 'add')}
                      >
                        + Admin
                      </Button>
                    )}
                    
                    {!user.roles.includes('manager') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRoleChange(user.id, 'manager', 'add')}
                      >
                        + Manager
                      </Button>
                    )}
                    
                    {!user.roles.includes('user') && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRoleChange(user.id, 'user', 'add')}
                      >
                        + Utilisateur
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {user.id === currentUser?.id && (
                <p className="mt-2 text-sm text-amber-600">
                  C'est votre compte - vous ne pouvez pas modifier vos propres rôles
                </p>
              )}
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default UserRoleManagement;
