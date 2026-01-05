-- Function to automatically create user profile when auth user is created
-- Updated to extract all user metadata from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, account_role, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NULLIF(NEW.raw_user_meta_data->>'phone', '')::text,
    COALESCE((NEW.raw_user_meta_data->>'account_role')::public.user_role, 'student'::public.user_role),
    CASE 
      WHEN NEW.raw_user_meta_data->>'account_role' = 'organizer' 
      THEN (NEW.raw_user_meta_data->>'user_type')::public.organizer_type
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(EXCLUDED.phone, users.phone),
    account_role = EXCLUDED.account_role,
    user_type = EXCLUDED.user_type;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

