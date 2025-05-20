
-- Fonction pour synchroniser les statuts entre les tables de factures
CREATE OR REPLACE FUNCTION public.sync_invoice_statuses()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si le changement vient de stripe_invoices
  IF TG_TABLE_NAME = 'stripe_invoices' THEN
    -- Trouver la facture correspondante dans invoices
    IF NEW.stripe_invoice_id IS NOT NULL THEN
      UPDATE public.invoices
      SET 
        status = NEW.status,
        amount_paid = NEW.amount_paid,
        amount_due = NEW.amount_due,
        stripe_invoice_id = NEW.stripe_invoice_id,
        stripe_hosted_invoice_url = NEW.stripe_hosted_invoice_url,
        updated_at = NOW()
      WHERE 
        stripe_invoice_id = NEW.stripe_invoice_id
        OR (invoice_number = NEW.invoice_number AND invoice_number IS NOT NULL);
    END IF;
  -- Si le changement vient de invoices
  ELSE
    -- Trouver la facture correspondante dans stripe_invoices
    IF NEW.stripe_invoice_id IS NOT NULL THEN
      UPDATE public.stripe_invoices
      SET 
        status = NEW.status,
        amount_paid = NEW.amount_paid,
        amount_due = NEW.amount_due,
        updated_at = NOW()
      WHERE stripe_invoice_id = NEW.stripe_invoice_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fonction pour créer la fonction de synchronisation via RPC
CREATE OR REPLACE FUNCTION public.create_sync_invoice_trigger_function()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- La fonction est déjà créée dans le fichier SQL de migration
  RETURN TRUE;
END;
$$;

-- Fonction pour créer le trigger sur stripe_invoices via RPC
CREATE OR REPLACE FUNCTION public.create_stripe_invoice_trigger()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer le trigger s'il existe déjà
  DROP TRIGGER IF EXISTS stripe_invoices_sync_trigger ON public.stripe_invoices;
  
  -- Créer le nouveau trigger
  CREATE TRIGGER stripe_invoices_sync_trigger
  AFTER UPDATE OR INSERT ON public.stripe_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_invoice_statuses();
  
  RETURN TRUE;
END;
$$;

-- Fonction pour créer le trigger sur invoices via RPC
CREATE OR REPLACE FUNCTION public.create_invoice_trigger()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer le trigger s'il existe déjà
  DROP TRIGGER IF EXISTS invoices_sync_trigger ON public.invoices;
  
  -- Créer le nouveau trigger
  CREATE TRIGGER invoices_sync_trigger
  AFTER UPDATE OR INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.stripe_invoice_id IS NOT NULL)
  EXECUTE FUNCTION public.sync_invoice_statuses();
  
  RETURN TRUE;
END;
$$;
