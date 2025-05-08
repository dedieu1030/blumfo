import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash, CalendarIcon, Clock } from "lucide-react";
import { ReminderSchedule } from "@/types/invoice";
import { getReminderSchedules, saveReminderSchedule, deleteReminderSchedule } from "@/services/reminderService";
import { ReminderScheduleEditor } from "@/components/ReminderScheduleEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function ReminderSettings() {
  const { toast } = useToast();
  const [reminderSchedules, setReminderSchedules] = useState<ReminderSchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ReminderSchedule | null>(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Charger les planifications au chargement du composant
  useEffect(() => {
    const loadSchedules = async () => {
      setIsLoading(true);
      const result = await getReminderSchedules();
      if (result.success && result.schedules) {
        setReminderSchedules(result.schedules);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de charger les planifications de relance",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    };
    
    loadSchedules();
  }, [toast]);
  
  const openScheduleEditor = (schedule?: ReminderSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
    } else {
      setEditingSchedule(null);
    }
    setIsEditingSchedule(true);
  };

  const handleSaveSchedule = async (schedule: ReminderSchedule) => {
    const result = await saveReminderSchedule(schedule);
    
    if (result.success) {
      // Refresh schedules list
      const refreshResult = await getReminderSchedules();
      if (refreshResult.success && refreshResult.schedules) {
        setReminderSchedules(refreshResult.schedules);
      }
      
      setIsEditingSchedule(false);
      
      toast({
        title: editingSchedule ? "Planification mise à jour" : "Planification créée",
        description: `La planification "${schedule.name}" a été ${editingSchedule ? "mise à jour" : "créée"} avec succès`
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Une erreur est survenue lors de l'enregistrement de la planification",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteSchedule = async (scheduleId: string) => {
    const result = await deleteReminderSchedule(scheduleId);
    
    if (result.success) {
      setReminderSchedules(reminderSchedules.filter(s => s.id !== scheduleId));
      
      toast({
        title: "Planification supprimée",
        description: "La planification de relances a été supprimée"
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Une erreur est survenue lors de la suppression de la planification",
        variant: "destructive"
      });
    }
  };

  const handleToggleScheduleStatus = async (schedule: ReminderSchedule, enabled: boolean) => {
    const updatedSchedule = { ...schedule, enabled };
    const result = await saveReminderSchedule(updatedSchedule);
    
    if (result.success) {
      setReminderSchedules(reminderSchedules.map(s => 
        s.id === schedule.id ? { ...s, enabled } : s
      ));
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Une erreur est survenue lors de la mise à jour de la planification",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
          Configuration des relances automatiques
        </h3>
        
        <div className="text-sm text-muted-foreground mb-6">
          <p>Les relances automatiques permettent d'envoyer des emails de rappel aux clients lorsque leurs factures restent impayées.</p>
          <p>Vous pouvez configurer plusieurs planifications avec des déclencheurs différents (avant/après échéance, ou après une précédente relance).</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : reminderSchedules.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Aucune planification de relances configurée
            </p>
            <Button onClick={() => openScheduleEditor()}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une planification
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reminderSchedules.map((schedule) => (
              <Card key={schedule.id} className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium flex items-center">
                        {schedule.name}
                        {schedule.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Par défaut
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {schedule.triggers.length} relance(s) configurée(s)
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={schedule.enabled}
                        onCheckedChange={(checked) => handleToggleScheduleStatus(schedule, checked)}
                      />
                      <div className="flex space-x-1">
                        <Button variant="outline" size="icon" onClick={() => openScheduleEditor(schedule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!schedule.isDefault && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    {schedule.triggers.map((trigger, index) => (
                      <div key={trigger.id} className="flex items-start space-x-4 mt-2 pb-2">
                        <div className="flex-shrink-0 mt-1">
                          {trigger.triggerType === "days_before_due" ? (
                            <CalendarIcon className="h-5 w-5 text-amber-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            Relance {index + 1}:
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">
                            {trigger.triggerType === "days_before_due" 
                              ? `${trigger.triggerValue} jour(s) avant échéance` 
                              : trigger.triggerType === "days_after_due"
                                ? `${trigger.triggerValue} jour(s) après échéance`
                                : `${trigger.triggerValue} jour(s) après la dernière relance`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button variant="outline" onClick={() => openScheduleEditor()}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une planification
            </Button>
          </div>
        )}
      </div>
      
      {/* Dialog d'édition de planification de relances */}
      <Dialog open={isEditingSchedule} onOpenChange={setIsEditingSchedule}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Modifier la planification" : "Créer une planification de relances"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[70vh] px-1 pr-4">
            <ReminderScheduleEditor
              schedule={editingSchedule || undefined}
              onSave={handleSaveSchedule}
              onCancel={() => setIsEditingSchedule(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
