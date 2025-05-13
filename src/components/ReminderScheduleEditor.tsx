import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";
import { useTranslation } from 'react-i18next';
import { Editor } from "@monaco-editor/react";
import { toast } from "sonner";

interface ReminderScheduleEditorProps {
  schedule?: ReminderSchedule;
  onSave: (schedule: ReminderSchedule) => void;
  onCancel: () => void;
}

export function ReminderScheduleEditor({ schedule, onSave, onCancel }: ReminderScheduleEditorProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(schedule?.name || '');
  const [enabled, setEnabled] = useState(schedule?.enabled !== false);
  const [isDefault, setIsDefault] = useState(schedule?.isDefault || false);
  const [triggers, setTriggers] = useState<ReminderTrigger[]>(schedule?.triggers || []);
  const [newTrigger, setNewTrigger] = useState<Omit<ReminderTrigger, 'id'>>({
    triggerType: 'before_due',
    triggerValue: 7,
    emailSubject: t("reminderEmailSubject", "Reminder: Invoice {invoice_number} is due soon"),
    emailBody: t("reminderEmailBody", `Dear {client_name},

This is a friendly reminder that invoice {invoice_number} for {amount} is due on {due_date}.

You can view the invoice and make a payment here: {payment_url}

Thank you for your business!

Sincerely,
{company_name}`)
  });
  
  useEffect(() => {
    if (schedule) {
      setName(schedule.name);
      setEnabled(schedule.enabled !== false);
      setIsDefault(schedule.isDefault || false);
      setTriggers(schedule.triggers);
    } else {
      // Reset newTrigger to default values when creating a new schedule
      setNewTrigger({
        triggerType: 'before_due',
        triggerValue: 7,
        emailSubject: t("reminderEmailSubject", "Reminder: Invoice {invoice_number} is due soon"),
        emailBody: t("reminderEmailBody", `Dear {client_name},

This is a friendly reminder that invoice {invoice_number} for {amount} is due on {due_date}.

You can view the invoice and make a payment here: {payment_url}

Thank you for your business!

Sincerely,
{company_name}`)
      });
    }
  }, [schedule, t]);
  
  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t("nameIsRequired", "Le nom est obligatoire"));
      return;
    }
    
    if (triggers.length === 0) {
      toast.error(t("atLeastOneTrigger", "Veuillez configurer au moins un déclencheur"));
      return;
    }
    
    const scheduleToSave: ReminderSchedule = {
      id: schedule?.id || uuidv4(),
      name: name,
      enabled: enabled,
      isDefault: isDefault,
      triggers: triggers,
    };
    
    onSave(scheduleToSave);
  };
  
  const handleAddTrigger = () => {
    if (!newTrigger.triggerValue) {
      toast.error(t("triggerValueRequired", "La valeur du déclencheur est obligatoire"));
      return;
    }
    
    if (!newTrigger.emailSubject || !newTrigger.emailSubject.trim()) {
      toast.error(t("emailSubjectRequired", "Le sujet de l'email est obligatoire"));
      return;
    }
    
    if (!newTrigger.emailBody || !newTrigger.emailBody.trim()) {
      toast.error(t("emailBodyRequired", "Le corps de l'email est obligatoire"));
      return;
    }
    
    const newTriggerWithId: ReminderTrigger = {
      id: uuidv4(),
      ...newTrigger,
    };
    setTriggers([...triggers, newTriggerWithId]);
    
    // Reset newTrigger to default values after adding
    setNewTrigger({
      triggerType: 'before_due',
      triggerValue: 7,
      emailSubject: t("reminderEmailSubject", "Reminder: Invoice {invoice_number} is due soon"),
      emailBody: t("reminderEmailBody", `Dear {client_name},

This is a friendly reminder that invoice {invoice_number} for {amount} is due on {due_date}.

You can view the invoice and make a payment here: {payment_url}

Thank you for your business!

Sincerely,
{company_name}`)
    });
  };
  
  const handleRemoveTrigger = (id: string) => {
    setTriggers(triggers.filter(trigger => trigger.id !== id));
  };
  
  const handleTriggerChange = (id: string, field: string, value: any) => {
    setTriggers(triggers.map(trigger =>
      trigger.id === id ? { ...trigger, [field]: value } : trigger
    ));
  };
  
  const handleNewTriggerChange = (field: string, value: any) => {
    setNewTrigger({ ...newTrigger, [field]: value });
  };
  
  const getTriggerDescription = (trigger: ReminderTrigger) => {
    const { triggerType, triggerValue } = trigger;
    
    switch (triggerType) {
      case 'before_due':
        return t("daysBeforeDue", { days: triggerValue });
      case 'after_due':
        return t("daysAfterDue", { days: triggerValue });
      case 'after_issue':
        return t("daysAfterIssue", { days: triggerValue });
      case 'days_before_due':
        return t("daysBeforeDue", { days: triggerValue });
      case 'days_after_due':
        return t("daysAfterDue", { days: triggerValue });
      case 'days_after_previous_reminder':
        return t("daysAfterPreviousReminder", { days: triggerValue });
      default:
        return t("unknownTrigger");
    }
  };

  const previewVariables = {
    invoice_number: "INV-12345",
    due_date: "15/05/2025",
    amount: "100.00€",
    days: "5",
    company_name: "Votre Société",
    client_name: "Client Exemple"
  };
  
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="schedule-name">{t("name")}</Label>
        <Input
          id="schedule-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("enterScheduleName")}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="schedule-enabled" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="schedule-enabled">{t("enabled")}</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="schedule-default" checked={isDefault} onCheckedChange={setIsDefault} />
        <Label htmlFor="schedule-default">{t("defaultSchedule")}</Label>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {triggers.map(trigger => (
          <AccordionItem key={trigger.id} value={trigger.id}>
            <AccordionTrigger>
              {getTriggerDescription(trigger)}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`trigger-type-${trigger.id}`}>{t("triggerType")}</Label>
                    <Select
                      value={trigger.triggerType}
                      onValueChange={(value) => handleTriggerChange(trigger.id, 'triggerType', value)}
                    >
                      <SelectTrigger id={`trigger-type-${trigger.id}`}>
                        <SelectValue placeholder={t("selectTriggerType")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before_due">{t("beforeDueDate")}</SelectItem>
                        <SelectItem value="after_due">{t("afterDueDate")}</SelectItem>
                        <SelectItem value="after_issue">{t("afterIssueDate")}</SelectItem>
                        <SelectItem value="days_before_due">{t("daysBeforeDue")}</SelectItem>
                        <SelectItem value="days_after_due">{t("daysAfterDue")}</SelectItem>
                        <SelectItem value="days_after_previous_reminder">{t("daysAfterPreviousReminder")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`trigger-value-${trigger.id}`}>{t("triggerValue")}</Label>
                    <Input
                      type="number"
                      id={`trigger-value-${trigger.id}`}
                      value={trigger.triggerValue?.toString() || ''}
                      onChange={(e) => handleTriggerChange(trigger.id, 'triggerValue', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`email-subject-${trigger.id}`}>{t("emailSubject")}</Label>
                  <Input
                    id={`email-subject-${trigger.id}`}
                    value={trigger.emailSubject || ''}
                    onChange={(e) => handleTriggerChange(trigger.id, 'emailSubject', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`email-body-${trigger.id}`}>{t("emailBody")}</Label>
                  <Editor
                    height="200px"
                    defaultLanguage="html"
                    value={trigger.emailBody || ''}
                    onChange={(value) => handleTriggerChange(trigger.id, 'emailBody', value)}
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveTrigger(trigger.id)}>
                    {t("removeTrigger")}
                  </Button>
                  <Button variant="secondary" size="sm">
                    {t("previewEmail")}
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <div className="border p-4 rounded-md space-y-4">
        <h4 className="text-lg font-medium">{t("addReminder")}</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="new-trigger-type">{t("triggerType")}</Label>
            <Select
              value={newTrigger.triggerType}
              onValueChange={(value) => handleNewTriggerChange('triggerType', value)}
            >
              <SelectTrigger id="new-trigger-type">
                <SelectValue placeholder={t("selectTriggerType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before_due">{t("beforeDueDate")}</SelectItem>
                <SelectItem value="after_due">{t("afterDueDate")}</SelectItem>
                <SelectItem value="after_issue">{t("afterIssueDate")}</SelectItem>
                <SelectItem value="days_before_due">{t("daysBeforeDue")}</SelectItem>
                <SelectItem value="days_after_due">{t("daysAfterDue")}</SelectItem>
                <SelectItem value="days_after_previous_reminder">{t("daysAfterPreviousReminder")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="new-trigger-value">{t("triggerValue")}</Label>
            <Input
              type="number"
              id="new-trigger-value"
              value={newTrigger.triggerValue?.toString() || ''}
              onChange={(e) => handleNewTriggerChange('triggerValue', parseInt(e.target.value))}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="new-email-subject">{t("emailSubject")}</Label>
          <Input
            id="new-email-subject"
            value={newTrigger.emailSubject || ''}
            onChange={(e) => handleNewTriggerChange('emailSubject', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="new-email-body">{t("emailBody")}</Label>
          <Editor
            height="200px"
            defaultLanguage="html"
            value={newTrigger.emailBody || ''}
            onChange={(value) => handleNewTriggerChange('emailBody', value)}
          />
        </div>
        
        <Button type="button" onClick={handleAddTrigger}>
          {t("addTrigger")}
        </Button>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="button" onClick={handleSave}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
