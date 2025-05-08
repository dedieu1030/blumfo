
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash, CalendarIcon, Clock } from "lucide-react";
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";

interface ReminderScheduleEditorProps {
  schedule?: ReminderSchedule;
  onSave: (schedule: ReminderSchedule) => void;
  onCancel: () => void;
}

export function ReminderScheduleEditor({ schedule, onSave, onCancel }: ReminderScheduleEditorProps) {
  const [name, setName] = useState(schedule?.name || "Nouvelle planification");
  const [enabled, setEnabled] = useState(schedule?.enabled ?? true);
  const [triggers, setTriggers] = useState<ReminderTrigger[]>(
    schedule?.triggers || [
      {
        id: Date.now().toString(),
        triggerType: "days_after_due",
        triggerValue: 1,
        emailSubject: "Rappel de facture impayée",
        emailBody: "Cher client,\n\nNous vous rappelons que votre facture [NUM_FACTURE] d'un montant de [MONTANT] € est actuellement impayée.\n\nNous vous invitons à procéder à son règlement dès que possible.\n\nCordialement,\n[VOTRE_NOM]"
      }
    ]
  );

  const handleAddTrigger = () => {
    setTriggers([
      ...triggers,
      {
        id: Date.now().toString(),
        triggerType: "days_after_due",
        triggerValue: 3,
        emailSubject: "Relance pour facture impayée",
        emailBody: "Cher client,\n\nNous n'avons toujours pas reçu le paiement de votre facture [NUM_FACTURE] d'un montant de [MONTANT] €.\n\nNous vous invitons à procéder à son règlement dans les plus brefs délais.\n\nCordialement,\n[VOTRE_NOM]"
      }
    ]);
  };

  const handleRemoveTrigger = (triggerId: string) => {
    setTriggers(triggers.filter(t => t.id !== triggerId));
  };

  const updateTrigger = (id: string, field: keyof ReminderTrigger, value: any) => {
    setTriggers(triggers.map(trigger => 
      trigger.id === id ? { ...trigger, [field]: value } : trigger
    ));
  };

  const handleSave = () => {
    const newSchedule: ReminderSchedule = {
      id: schedule?.id || Date.now().toString(),
      name,
      enabled,
      triggers,
      isDefault: schedule?.isDefault || false
    };
    
    onSave(newSchedule);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="schedule-name">Nom de la planification</Label>
            <Input
              id="schedule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Relances standard"
              className="mt-1 w-full"
            />
          </div>
          <div className="flex items-center space-x-2 mt-7">
            <Switch id="schedule-enabled" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="schedule-enabled">Activer cette planification</Label>
          </div>
        </div>
        
        <h3 className="font-medium text-lg mt-6">Programmation des relances</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Définissez quand et comment les relances seront envoyées automatiquement
        </p>
        
        {triggers.map((trigger, index) => (
          <Card key={trigger.id} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">Relance {index + 1}</CardTitle>
                {triggers.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveTrigger(trigger.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 -mt-1"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Moment de la relance</Label>
                  <Select 
                    value={trigger.triggerType}
                    onValueChange={(value) => updateTrigger(trigger.id, 'triggerType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le moment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days_before_due">Jours avant échéance</SelectItem>
                      <SelectItem value="days_after_due">Jours après échéance</SelectItem>
                      <SelectItem value="days_after_previous_reminder">Jours après dernière relance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valeur (jours)</Label>
                  <div className="flex">
                    <Input 
                      type="number"
                      min="1"
                      value={trigger.triggerValue}
                      onChange={(e) => updateTrigger(trigger.id, 'triggerValue', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`email-subject-${index}`}>Objet de l'email</Label>
                <Input
                  id={`email-subject-${index}`}
                  value={trigger.emailSubject}
                  onChange={(e) => updateTrigger(trigger.id, 'emailSubject', e.target.value)}
                  placeholder="Ex: Rappel de facture impayée"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`email-content-${index}`}>Contenu de l'email</Label>
                  <div className="text-xs text-muted-foreground">
                    Variables: [NOM_CLIENT], [NUM_FACTURE], [DATE_ECHEANCE], [MONTANT], [VOTRE_NOM]
                  </div>
                </div>
                <Textarea
                  id={`email-content-${index}`}
                  value={trigger.emailBody}
                  onChange={(e) => updateTrigger(trigger.id, 'emailBody', e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button variant="outline" onClick={handleAddTrigger} className="mt-2 w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une relance
        </Button>
      </div>
      
      <CardFooter className="flex justify-end space-x-2 px-0 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </CardFooter>
    </div>
  );
}
