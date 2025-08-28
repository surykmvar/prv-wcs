-- Create sales_inquiries table for contact sales form
CREATE TABLE public.sales_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  address TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed'))
);

-- Enable RLS
ALTER TABLE public.sales_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all sales inquiries" 
ON public.sales_inquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage sales inquiries" 
ON public.sales_inquiries 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create sales inquiries" 
ON public.sales_inquiries 
FOR INSERT 
WITH CHECK (true);