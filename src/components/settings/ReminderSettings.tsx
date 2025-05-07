
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash, CalendarIcon, Clock } from "lucide-react";
import { ReminderSchedule } from "@/types/invoice";
import { getReminderSchedules, saveReminderSchedules } from "@/services/invoiceSettingsService";
import { ReminderScheduleEditor } from "@/components/ReminderScheduleEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function ReminderSettings() {
  const { toast } = useToast();
  const [reminderSchedules, setReminderSchedules] = useState<ReminderSchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<ReminderSchedule | null>(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  
  // Charger les planifications au chargement du composant
  useEffect(() => {
    setReminderSchedules(getReminderSchedules());
  }, []);
  
  const openScheduleEditor = (schedule?: ReminderSchedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
    } else {
      setEditingSchedule(null);
    }
    setIsEditingSchedule(true);
  };

  const handleSaveSchedule = (schedule: ReminderSchedule) => {
    let updatedSchedules: ReminderSchedule[];
    
    if (editingSchedule) {
      // Mise à jour d'une planification existante
      updatedSchedules = reminderSchedules.map(s => 
        s.id === schedule.id ? schedule : schedule.isDefault ? { ...s, isDefault: false } : s
      );
    } else {
      // Création d'une nouvelle planification
      if (schedule.isDefault) {
        updatedSchedules = reminderSchedules.map(s => ({ ...s, isDefault: false }));
      } else {
        updatedSchedules = [...reminderSchedules];
      }
      updatedSchedules.push(schedule);
    }
    
    setReminderSchedules(updatedSchedules);
    saveReminderSchedules(updatedSchedules);
    setIsEditingSchedule(false);
    
    toast({
      title: editingSchedule ? "Planification mise à jour" : "Planification créée",
      description: `La planification "${schedule.name}" a été ${editingSchedule ? "mise à jour" : "créée"} avec succès`
    });
  };
  
  const deleteSchedule = (scheduleId: string) => {
    const updatedSchedules = reminderSchedules.filter(s => s.id !== scheduleId);
    setReminderSchedules(updatedSchedules);
    saveReminderSchedules(updatedSchedules);
    
    toast({
      title: "Planification supprimée",
      description: "La planification de relances a été supprimée"
    });
  };

  const toggleScheduleStatus = (scheduleId: string, enabled: boolean) => {
    const updated = reminderSchedules.map(s => 
      s.id === scheduleId ? { ...s, enabled } : s
    );
    setReminderSchedules(updated);
    saveReminderSchedules(updated);
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
        
        {reminderSchedules.length === 0 ? (
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
                        onCheckedChange={(checked) => toggleScheduleStatus(schedule.id, checked)}
                      />
                      <div className="flex space-x-1">
                        <Button variant="outline" size="icon" onClick={() => openScheduleEditor(schedule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!schedule.isDefault && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => deleteSchedule(schedule.id)}
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
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Modifier la planification" : "Créer une planification de relances"}
            </DialogTitle>
          </DialogHeader>
          
          <ReminderScheduleEditor
            schedule={editingSchedule || undefined}
            onSave={handleSaveSchedule}
            onCancel={() => setIsEditingSchedule(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
