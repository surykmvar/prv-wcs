
-- Fix search_path for functions missing pg_temp

CREATE OR REPLACE FUNCTION public.log_profile_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF TG_OP = 'SELECT' AND NEW.user_id != auth.uid() THEN
    PERFORM public.log_sensitive_data_access(
      'profiles',
      'EXTERNAL_ACCESS',
      NEW.id,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_credit_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  PERFORM public.log_sensitive_data_access(
    'credits_ledger',
    TG_OP,
    NEW.id,
    NEW.user_id
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_negative_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.credits_balance < 0 AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Credit balance cannot be negative';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_sales_inquiry_data(p_name text, p_email text, p_message text, p_company_name text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RETURN false;
  END IF;
  IF p_email IS NULL OR NOT public.validate_email_format(p_email) THEN
    RETURN false;
  END IF;
  IF p_message IS NULL OR length(trim(p_message)) < 10 THEN
    RETURN false;
  END IF;
  IF p_message ~* '(viagra|casino|lottery|click here|buy now)' THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(table_name text, operation text, record_id uuid, user_id uuid DEFAULT auth.uid())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    record_id,
    user_id,
    timestamp,
    ip_address
  ) VALUES (
    table_name,
    operation,
    record_id,
    COALESCE(user_id, auth.uid()),
    now(),
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
  );
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_email_format(email text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$function$;

CREATE OR REPLACE FUNCTION public.sanitize_html_input(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi'),
      '<[^>]*>', '', 'g'
    ),
    '&[^;]+;', '', 'g'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_sales_inquiry_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  PERFORM public.log_sensitive_data_access(
    'sales_inquiries',
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;
