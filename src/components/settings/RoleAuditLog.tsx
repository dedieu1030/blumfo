
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AuditLogEntry {
  id: string;
  action: string;
  role: string;
  created_at: string;
  actor_email?: string;
  target_email?: string;
}

export function RoleAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  // Map of user IDs to emails
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        // Get all audit logs
        const { data: auditLogs, error } = await supabase
          .from('role_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) throw error;
        
        if (auditLogs) {
          // Extract unique user IDs
          const userIds = new Set<string>();
          auditLogs.forEach(log => {
            userIds.add(log.actor_id);
            userIds.add(log.target_id);
          });
          
          // Fetch user emails for these IDs
          const userEmailMap: Record<string, string> = {};
          
          // This is a simplified approach - in a real app you'd use a batch query
          // or backend function to get all users at once
          for (const userId of Array.from(userIds)) {
            const { data: userData } = await supabase.auth.admin.getUserById(userId);
            if (userData?.user) {
              userEmailMap[userId] = userData.user.email || 'Unknown';
            }
          }
          
          setUserMap(userEmailMap);
          
          // Enhance logs with user emails
          const enhancedLogs = auditLogs.map(log => ({
            ...log,
            actor_email: userEmailMap[log.actor_id] || 'Unknown',
            target_email: userEmailMap[log.target_id] || 'Unknown'
          }));
          
          setLogs(enhancedLogs);
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        toast.error("Erreur lors du chargement des journaux d'audit");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuditLogs();
  }, [isAdmin]);

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
        <CardTitle>Journal d'audit des rôles</CardTitle>
        <CardDescription>Historique des modifications de rôles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {log.action === 'assign' ? 'Attribution de rôle' : 'Révocation de rôle'}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{log.actor_email}</span> a {log.action === 'assign' ? 'attribué' : 'révoqué'}{' '}
                    le rôle <Badge>{log.role}</Badge> à <span className="font-medium">{log.target_email}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            </div>
          ))}
          
          {logs.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              Aucune activité d'audit trouvée
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RoleAuditLog;
