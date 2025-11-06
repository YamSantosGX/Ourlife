-- Remove all admin-based RLS policies from tables
DROP POLICY IF EXISTS "Admins can view all memories" ON public.memories;
DROP POLICY IF EXISTS "Admins can insert all memories" ON public.memories;
DROP POLICY IF EXISTS "Admins can update all memories" ON public.memories;
DROP POLICY IF EXISTS "Admins can delete all memories" ON public.memories;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.monthly_messages;
DROP POLICY IF EXISTS "Admins can insert all messages" ON public.monthly_messages;
DROP POLICY IF EXISTS "Admins can update all messages" ON public.monthly_messages;
DROP POLICY IF EXISTS "Admins can delete all messages" ON public.monthly_messages;

-- Associate existing orphan data to user
UPDATE public.memories 
SET user_id = '8c62ac7f-b4bb-46b6-b7b9-9f3de4ec77c1'
WHERE user_id IS NULL;

UPDATE public.monthly_messages 
SET user_id = '8c62ac7f-b4bb-46b6-b7b9-9f3de4ec77c1'
WHERE user_id IS NULL;

-- Make user_id required
ALTER TABLE public.memories ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.monthly_messages ALTER COLUMN user_id SET NOT NULL;

-- Drop role system policies first
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Drop admin storage policies that depend on has_role
DROP POLICY IF EXISTS "Admins can view all media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload all media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update all media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete all media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all media" ON storage.objects;

-- Now safe to drop role system
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP FUNCTION IF EXISTS public.has_role CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;