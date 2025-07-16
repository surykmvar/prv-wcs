-- Manually update all vote counts based on existing user_votes data
UPDATE public.voice_responses 
SET 
  myth_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'myth'),
  fact_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'fact'),
  unclear_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = voice_responses.id AND vote_type = 'unclear');