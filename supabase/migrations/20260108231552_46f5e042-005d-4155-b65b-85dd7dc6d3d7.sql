-- Create table for partner messages ("Seus encantos para mim")
CREATE TABLE public.partner_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_date DATE NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.partner_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own partner messages" 
ON public.partner_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own partner messages" 
ON public.partner_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partner messages" 
ON public.partner_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own partner messages" 
ON public.partner_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_partner_messages_updated_at
BEFORE UPDATE ON public.partner_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Make timeline_milestones.title and milestone_date nullable/optional
ALTER TABLE public.timeline_milestones 
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN milestone_date DROP NOT NULL;