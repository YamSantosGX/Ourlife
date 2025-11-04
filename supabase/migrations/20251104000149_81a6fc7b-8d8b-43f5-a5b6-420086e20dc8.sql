-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', true);

-- Create table for monthly messages
CREATE TABLE public.monthly_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_date DATE NOT NULL UNIQUE,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on monthly_messages
ALTER TABLE public.monthly_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing messages (public)
CREATE POLICY "Anyone can view monthly messages"
ON public.monthly_messages
FOR SELECT
USING (true);

-- Create policy for managing messages (authenticated users only)
CREATE POLICY "Authenticated users can insert messages"
ON public.monthly_messages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update messages"
ON public.monthly_messages
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete messages"
ON public.monthly_messages
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create table for memories (photos and videos)
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  special_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on memories
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing memories (public)
CREATE POLICY "Anyone can view memories"
ON public.memories
FOR SELECT
USING (true);

-- Create policy for managing memories (authenticated users only)
CREATE POLICY "Authenticated users can insert memories"
ON public.memories
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update memories"
ON public.memories
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete memories"
ON public.memories
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create storage policies for memories bucket
CREATE POLICY "Anyone can view memory files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'memories');

CREATE POLICY "Authenticated users can upload memory files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'memories' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update memory files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'memories' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete memory files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'memories' AND auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_monthly_messages_updated_at
BEFORE UPDATE ON public.monthly_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memories_updated_at
BEFORE UPDATE ON public.memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();