-- Create timeline_milestones table for storing relationship milestones
CREATE TABLE public.timeline_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE NOT NULL,
  media_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for timeline_milestones
CREATE POLICY "Anyone can view milestones" 
ON public.timeline_milestones 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create milestones" 
ON public.timeline_milestones 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" 
ON public.timeline_milestones 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones" 
ON public.timeline_milestones 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_timeline_milestones_updated_at
BEFORE UPDATE ON public.timeline_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();