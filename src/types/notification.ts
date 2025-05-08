
export interface Notification {
  id: string;
  type: 'payment_received' | 'invoice_created' | 'invoice_due_soon' | 'invoice_overdue' | 'other';
  title: string;
  message: string;
  is_read: boolean;
  reference_type?: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
