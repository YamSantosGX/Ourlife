-- Create table for relationship start dates
CREATE TABLE public.relationship_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.relationship_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own relationship settings" 
ON public.relationship_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own relationship settings" 
ON public.relationship_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own relationship settings" 
ON public.relationship_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_relationship_settings_updated_at
BEFORE UPDATE ON public.relationship_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();