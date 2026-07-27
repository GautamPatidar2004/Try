-- Create a trigger function to protect sensitive financial fields from user modification
-- Only admins (via service role) should be able to modify these fields
CREATE OR REPLACE FUNCTION public.protect_ambassador_financial_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins to modify any field
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  
  -- For non-admin users, prevent modification of sensitive financial fields
  -- These fields can only be set/modified by edge functions using service role
  IF OLD.stripe_connect_id IS DISTINCT FROM NEW.stripe_connect_id THEN
    RAISE EXCEPTION 'Cannot modify stripe_connect_id - use the Stripe Connect onboarding flow';
  END IF;
  
  IF OLD.stripe_onboarding_complete IS DISTINCT FROM NEW.stripe_onboarding_complete THEN
    RAISE EXCEPTION 'Cannot modify stripe_onboarding_complete - managed by system';
  END IF;
  
  IF OLD.stripe_payouts_enabled IS DISTINCT FROM NEW.stripe_payouts_enabled THEN
    RAISE EXCEPTION 'Cannot modify stripe_payouts_enabled - managed by system';
  END IF;
  
  IF OLD.stripe_details_submitted IS DISTINCT FROM NEW.stripe_details_submitted THEN
    RAISE EXCEPTION 'Cannot modify stripe_details_submitted - managed by system';
  END IF;
  
  IF OLD.contract_signature_data IS DISTINCT FROM NEW.contract_signature_data THEN
    RAISE EXCEPTION 'Cannot modify contract_signature_data - contracts are immutable';
  END IF;
  
  IF OLD.contract_signed_at IS DISTINCT FROM NEW.contract_signed_at THEN
    RAISE EXCEPTION 'Cannot modify contract_signed_at - contracts are immutable';
  END IF;
  
  IF OLD.contract_ip_address IS DISTINCT FROM NEW.contract_ip_address THEN
    RAISE EXCEPTION 'Cannot modify contract_ip_address - contracts are immutable';
  END IF;
  
  IF OLD.contract_version IS DISTINCT FROM NEW.contract_version THEN
    RAISE EXCEPTION 'Cannot modify contract_version - contracts are immutable';
  END IF;
  
  IF OLD.commission_override IS DISTINCT FROM NEW.commission_override THEN
    RAISE EXCEPTION 'Cannot modify commission_override - admin only';
  END IF;
  
  IF OLD.tier_override IS DISTINCT FROM NEW.tier_override THEN
    RAISE EXCEPTION 'Cannot modify tier_override - admin only';
  END IF;
  
  IF OLD.admin_notes IS DISTINCT FROM NEW.admin_notes THEN
    RAISE EXCEPTION 'Cannot modify admin_notes - admin only';
  END IF;
  
  -- Allow modification of non-sensitive fields
  RETURN NEW;
END;
$$;

-- Create the trigger (drop first if exists to avoid duplicates)
DROP TRIGGER IF EXISTS protect_ambassador_financial_fields_trigger ON public.ambassador_members;

CREATE TRIGGER protect_ambassador_financial_fields_trigger
  BEFORE UPDATE ON public.ambassador_members
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_ambassador_financial_fields();

-- Add a comment explaining the security model
COMMENT ON FUNCTION public.protect_ambassador_financial_fields() IS 'Prevents non-admin users from modifying sensitive financial fields (Stripe IDs, contract data, commission overrides). These fields can only be modified by edge functions using service role or by admins.';