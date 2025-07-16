-- Enable realtime for voice_responses table
ALTER TABLE public.voice_responses REPLICA IDENTITY FULL;

-- Add voice_responses to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_responses;