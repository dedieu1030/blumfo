
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, AlertOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClientNotesProps {
  clientId: string;
  initialNotes: string | null;
}

export function ClientNotes({ clientId, initialNotes }: ClientNotesProps) {
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveNotes = async () => {
    if (!clientId) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);
      
      if (error) throw error;
      
      toast({
        title: "Notes enregistrées",
        description: "Les notes du client ont été mises à jour"
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les notes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <AlertOctagon className="h-5 w-5 text-muted-foreground mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Ces notes sont internes et ne sont pas visibles par le client.
          Utilisez-les pour enregistrer des informations importantes ou des 
          rappels concernant ce client.
        </p>
      </div>
      
      <Textarea
        placeholder="Saisissez vos notes concernant ce client ici..."
        className="min-h-[200px]"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      
      <div className="flex justify-end">
        <Button onClick={handleSaveNotes} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les notes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
