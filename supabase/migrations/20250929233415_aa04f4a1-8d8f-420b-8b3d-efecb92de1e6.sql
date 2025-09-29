-- Create landing page widgets table for admin-managed demo content
CREATE TABLE public.landing_page_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Widget content
  reviewer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  location TEXT NOT NULL,
  duration INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  audio_url TEXT,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  avatar_url TEXT,
  
  -- Voting data for demo
  myth_votes INTEGER NOT NULL DEFAULT 0,
  fact_votes INTEGER NOT NULL DEFAULT 0,
  unclear_votes INTEGER NOT NULL DEFAULT 0,
  
  -- Widget type and ordering
  widget_type TEXT NOT NULL CHECK (widget_type IN ('website', 'social')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.landing_page_widgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active widgets" 
ON public.landing_page_widgets 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all widgets" 
ON public.landing_page_widgets 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient querying
CREATE INDEX idx_landing_widgets_type_order ON public.landing_page_widgets(widget_type, display_order, is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_landing_widgets_updated_at
BEFORE UPDATE ON public.landing_page_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default demo data
INSERT INTO public.landing_page_widgets (
  reviewer_name, product_name, location, duration, rating, gender, 
  widget_type, display_order, myth_votes, fact_votes, unclear_votes
) VALUES
  ('Lisa Martinez', 'Premium Wireless Headphones', 'San Francisco, CA', 15, 2, 'female', 'website', 1, 12, 3, 8),
  ('David Kim', 'Smart Fitness Tracker', 'Austin, TX', 32, 3, 'male', 'website', 2, 8, 15, 6), 
  ('Alex Johnson', 'Ergonomic Office Chair', 'Seattle, WA', 45, 5, 'male', 'website', 3, 2, 28, 4),
  ('Alex Johnson', 'Ergonomic Office Chair', 'Seattle, WA', 45, 5, 'male', 'social', 1, 2, 28, 4);