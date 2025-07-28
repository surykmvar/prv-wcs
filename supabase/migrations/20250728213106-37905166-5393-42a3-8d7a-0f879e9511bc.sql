-- Add phone number and auth method support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone text,
ADD COLUMN auth_method text DEFAULT 'email' CHECK (auth_method IN ('email', 'phone'));

-- Update the handle_new_user function to support phone registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, display_name, phone, auth_method)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name',
      CONCAT(NEW.raw_user_meta_data ->> 'first_name', ' ', NEW.raw_user_meta_data ->> 'last_name')
    ),
    NEW.phone,
    CASE 
      WHEN NEW.phone IS NOT NULL THEN 'phone'
      ELSE 'email'
    END
  );
  RETURN NEW;
END;
$$;