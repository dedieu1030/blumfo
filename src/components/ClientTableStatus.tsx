
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export function ClientTableStatus() {
  const [status, setStatus] = useState<"checking" | "available" | "unavailable">("checking");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkTable = async () => {
    setIsChecking(true);
    setStatus("checking");
    setError(null);

    try {
      // Vérifier si la table existe et est accessible
      const { error } = await supabase
        .from("clients")
        .select("count(*)", { count: "exact", head: true });

      if (error) {
        console.error("Erreur lors de la vérification de la table clients:", error);
        setStatus("unavailable");
        
        // Déterminer le message d'erreur spécifique en fonction du code d'erreur
        if (error.code === "42P01") {
          setError("La table 'clients' n'existe pas dans la base de données.");
        } else if (error.code === "PGRST301") {
          setError("Problème d'autorisation pour accéder à la table 'clients'.");
        } else {
          setError(`Erreur ${error.code}: ${error.message}`);
        }
      } else {
        console.log("Table clients accessible");
        setStatus("available");
        setError(null);
      }
    } catch (err) {
      console.error("Exception lors de la vérification de la table clients:", err);
      setStatus("unavailable");
      setError("Une erreur inattendue s'est produite lors de la vérification de la table.");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkTable();
  }, []);

  const handleRefresh = () => {
    toast.info("Vérification de la table des clients...");
    checkTable();
  };

  if (status === "checking" || isChecking) {
    return (
      <Alert className="bg-blue-50 border-blue-200 text-blue-800">
        <div className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          <AlertDescription>Vérification de l'accès à la table des clients...</AlertDescription>
        </div>
      </Alert>
    );
  }

  if (status === "unavailable") {
    return (
      <Alert variant="destructive">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              {error || "La table des clients est inaccessible. Certaines fonctionnalités pourraient être limitées."}
            </AlertDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isChecking}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            Réessayer
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
      <div className="flex items-center">
        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
        <AlertDescription>La table des clients est accessible.</AlertDescription>
      </div>
    </Alert>
  );
}
