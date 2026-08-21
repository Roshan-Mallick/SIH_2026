-- Fix: "Database error saving new user" (500) on signup and first-time
-- Google/GitHub sign-in. handle_new_user() inserts full_name and avatar_url
-- into public.profiles, but those columns were missing, so every auth.users
-- insert failed and Supabase aborted the session creation.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Backfill profile rows for users that exist in auth.users but never got a
-- profile (their signups predate the trigger or crashed because of it).
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT u.id,
       coalesce(u.email, ''),
       coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''),
       coalesce(u.raw_user_meta_data ->> 'avatar_url', '')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
