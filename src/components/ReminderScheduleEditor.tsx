
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { ReminderSchedule, ReminderTrigger } from '@/types/invoice';

interface ReminderScheduleEditorProps {
  schedule?: ReminderSchedule;
  onSave: (schedule: ReminderSchedule) => void;
  onCancel: () => void;
}

export function ReminderScheduleEditor({ schedule, onSave, onCancel }: ReminderScheduleEditorProps) {
  const [name, setName] = useState(schedule?.name || '');
  const [isDefault, setIsDefault] = useState(schedule?.isDefault || false);
  const [isEnabled, setIsEnabled] = useState(schedule?.enabled !== false); // default to true if undefined
  const [triggers, setTriggers] = useState<ReminderTrigger[]>(
    schedule?.triggers || [
      {
        id: uuidv4(),
        triggerType: "days_before_due",
        triggerValue: 3,
        emailSubject: "Rappel : Votre facture arrive bientôt à échéance",
        emailBody: "Cher client,\n\nNous vous rappelons que votre facture n° {{invoice_number}} arrivera à échéance dans {{days}} jours. Merci de prévoir votre paiement.\n\nCordialement,\n{{company_name}}"
      }
    ]
  );

  // Add a new trigger
  const addTrigger = () => {
    setTriggers([
      ...triggers,
      {
        id: uuidv4(),
        triggerType: "days_before_due",
        triggerValue: 3,
        emailSubject: "",
        emailBody: ""
      }
    ]);
  };

  // Remove a trigger
  const removeTrigger = (id: string) => {
    if (triggers.length > 1) {
      setTriggers(triggers.filter(trigger => trigger.id !== id));
    }
  };

  // Update a trigger field
  const updateTrigger = (id: string, field: keyof ReminderTrigger, value: any) => {
    setTriggers(
      triggers.map(trigger => 
        trigger.id === id ? { ...trigger, [field]: value } : trigger
      )
    );
  };

  // Handle save
  const handleSave = () => {
    const updatedSchedule: ReminderSchedule = {
      id: schedule?.id || uuidv4(),
      name,
      isDefault,
      enabled: isEnabled,
      triggers
    };

    onSave(updatedSchedule);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schedule-name">Nom de la planification</Label>
          <Input
            id="schedule-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Relances standards"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="is-default"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            <Label htmlFor="is-default">Définir comme planification par défaut</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <Label htmlFor="is-enabled">Activée</Label>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Règles de rappel</h3>
        
        {triggers.map((trigger, index) => (
          <div key={trigger.id} className="mb-8 p-4 border rounded-md">
            <div className="flex justify-between mb-4">
              <h4 className="font-medium">Rappel #{index + 1}</h4>
              {triggers.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeTrigger(trigger.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor={`trigger-type-${index}`}>Type de déclenchement</Label>
                <Select
                  value={trigger.triggerType}
                  onValueChange={(value) => updateTrigger(trigger.id, 'triggerType', value)}
                >
                  <SelectTrigger id={`trigger-type-${index}`}>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days_before_due">Jours avant échéance</SelectItem>
                    <SelectItem value="after_due">Jours après échéance</SelectItem>
                    <SelectItem value="after_issue">Jours après émission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`trigger-value-${index}`}>Nombre de jours</Label>
                <Input
                  id={`trigger-value-${index}`}
                  type="number"
                  min="1"
                  value={trigger.triggerValue}
                  onChange={(e) => updateTrigger(trigger.id, 'triggerValue', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <Label htmlFor={`email-subject-${index}`}>Objet de l'email</Label>
              <Input
                id={`email-subject-${index}`}
                value={trigger.emailSubject || ''}
                onChange={(e) => updateTrigger(trigger.id, 'emailSubject', e.target.value)}
                placeholder="Ex: Rappel : Votre facture arrive à échéance"
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: {"{{invoice_number}}, {{due_date}}, {{amount}}, {{days}}"}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`email-body-${index}`}>Corps de l'email</Label>
              <Textarea
                id={`email-body-${index}`}
                value={trigger.emailBody || ''}
                onChange={(e) => updateTrigger(trigger.id, 'emailBody', e.target.value)}
                placeholder="Contenu du mail de rappel..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: {"{{invoice_number}}, {{due_date}}, {{amount}}, {{company_name}}, {{client_name}}, {{days}}"}
              </p>
            </div>
          </div>
        ))}
        
        <Button variant="outline" onClick={addTrigger} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un rappel
        </Button>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={!name}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
