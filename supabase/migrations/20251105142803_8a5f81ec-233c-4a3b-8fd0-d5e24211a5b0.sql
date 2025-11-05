-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add user_id column to memories table
ALTER TABLE public.memories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to monthly_messages table
ALTER TABLE public.monthly_messages ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view memories" ON public.memories;
DROP POLICY IF EXISTS "Authenticated users can insert memories" ON public.memories;
DROP POLICY IF EXISTS "Authenticated users can update memories" ON public.memories;
DROP POLICY IF EXISTS "Authenticated users can delete memories" ON public.memories;

DROP POLICY IF EXISTS "Anyone can view monthly messages" ON public.monthly_messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.monthly_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON public.monthly_messages;
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON public.monthly_messages;

-- Create secure RLS policies for memories (user can only see their own)
CREATE POLICY "Users can view own memories"
  ON public.memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON public.memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON public.memories FOR DELETE
  USING (auth.uid() = user_id);

-- Create secure RLS policies for monthly_messages (user can only see their own)
CREATE POLICY "Users can view own messages"
  ON public.monthly_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON public.monthly_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON public.monthly_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON public.monthly_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Admin policies for memories (admins can manage all)
CREATE POLICY "Admins can view all memories"
  ON public.memories FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert all memories"
  ON public.memories FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all memories"
  ON public.memories FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all memories"
  ON public.memories FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for monthly_messages (admins can manage all)
CREATE POLICY "Admins can view all messages"
  ON public.monthly_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert all messages"
  ON public.monthly_messages FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all messages"
  ON public.monthly_messages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all messages"
  ON public.monthly_messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Make storage bucket private
UPDATE storage.buckets SET public = false WHERE id = 'memories';

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to memories bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view memories" ON storage.objects;

-- Storage policies: users can only access their own folders
CREATE POLICY "Users can view own media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin storage policies
CREATE POLICY "Admins can view all media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage all media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memories' 
    AND public.has_role(auth.uid(), 'admin')
  );