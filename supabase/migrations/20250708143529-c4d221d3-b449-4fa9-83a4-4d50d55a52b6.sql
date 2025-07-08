-- Create thoughts table
CREATE TABLE public.thoughts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '48 hours'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'bloomed', 'bricked')),
  bloom_count INTEGER NOT NULL DEFAULT 0,
  brick_count INTEGER NOT NULL DEFAULT 0
);

-- Create voice_responses table
CREATE TABLE public.voice_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thought_id UUID NOT NULL REFERENCES public.thoughts(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  transcript TEXT,
  classification TEXT CHECK (classification IN ('myth', 'fact', 'debated', 'unclear')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bloom_count INTEGER NOT NULL DEFAULT 0,
  brick_count INTEGER NOT NULL DEFAULT 0
);

-- Create storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-recordings', 'voice-recordings', true);

-- Enable RLS on tables
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public platform)
CREATE POLICY "Anyone can view active thoughts" 
ON public.thoughts 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Anyone can create thoughts" 
ON public.thoughts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view voice responses" 
ON public.voice_responses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create voice responses" 
ON public.voice_responses 
FOR INSERT 
WITH CHECK (true);

-- Create storage policies for voice recordings
CREATE POLICY "Anyone can view voice recordings" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'voice-recordings');

CREATE POLICY "Anyone can upload voice recordings" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'voice-recordings');

-- Create indexes for better performance
CREATE INDEX idx_thoughts_status ON public.thoughts(status);
CREATE INDEX idx_thoughts_created_at ON public.thoughts(created_at DESC);
CREATE INDEX idx_voice_responses_thought_id ON public.voice_responses(thought_id);
CREATE INDEX idx_voice_responses_created_at ON public.voice_responses(created_at DESC);

-- Create function to automatically expire thoughts
CREATE OR REPLACE FUNCTION public.update_expired_thoughts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.thoughts 
  SET status = 'bricked'
  WHERE expires_at < now() AND status = 'active';
END;
$$;