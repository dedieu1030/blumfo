
export interface Notification {
  id: string;
  type: 'payment_received' | 'invoice_created' | 'invoice_due_soon' | 'invoice_overdue' | 'invoice_paid' | 'invoice_status' | 'other' | string;
  title: string;
  message: string;
  is_read: boolean;
  reference_type?: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface InvoiceNotification extends Notification {
  metadata: {
    invoice_number: string;
    total_amount: number;
    due_date?: string;
    currency?: string;
  };
}

export interface PaymentNotification extends Notification {
  metadata: {
    payment_id: string;
    amount: number;
    invoice_number?: string;
    currency?: string;
  };
}
