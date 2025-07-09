-- Remove old bloom/brick system and add new voting system
-- Update voice_responses table
ALTER TABLE public.voice_responses 
DROP COLUMN bloom_count,
DROP COLUMN brick_count,
ADD COLUMN myth_votes INTEGER DEFAULT 0,
ADD COLUMN fact_votes INTEGER DEFAULT 0,
ADD COLUMN unclear_votes INTEGER DEFAULT 0,
ADD COLUMN reactions JSONB DEFAULT '{"clap": 0, "brain": 0, "shock": 0, "think": 0, "trash": 0}'::jsonb;

-- Update thoughts table  
ALTER TABLE public.thoughts
DROP COLUMN bloom_count,
DROP COLUMN brick_count,
ADD COLUMN final_status TEXT DEFAULT 'pending' CHECK (final_status IN ('pending', 'bloomed', 'bricked', 'unclear'));

-- Create user_votes table to track voting
CREATE TABLE public.user_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voice_response_id UUID REFERENCES public.voice_responses(id) ON DELETE CASCADE,
  user_session TEXT NOT NULL, -- Using session ID since no auth
  vote_type TEXT NOT NULL CHECK (vote_type IN ('myth', 'fact', 'unclear')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(voice_response_id, user_session)
);

-- Create user_reactions table to track reactions
CREATE TABLE public.user_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voice_response_id UUID REFERENCES public.voice_responses(id) ON DELETE CASCADE,
  user_session TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('clap', 'brain', 'shock', 'think', 'trash')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(voice_response_id, user_session, reaction_type)
);

-- Enable RLS on new tables
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view votes" ON public.user_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can create votes" ON public.user_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their votes" ON public.user_votes FOR UPDATE USING (true);

CREATE POLICY "Anyone can view reactions" ON public.user_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can create reactions" ON public.user_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete reactions" ON public.user_reactions FOR DELETE USING (true);

-- Function to update vote counts automatically
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update vote counts on the voice_response
  UPDATE public.voice_responses 
  SET 
    myth_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = COALESCE(NEW.voice_response_id, OLD.voice_response_id) AND vote_type = 'myth'),
    fact_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = COALESCE(NEW.voice_response_id, OLD.voice_response_id) AND vote_type = 'fact'),
    unclear_votes = (SELECT COUNT(*) FROM public.user_votes WHERE voice_response_id = COALESCE(NEW.voice_response_id, OLD.voice_response_id) AND vote_type = 'unclear')
  WHERE id = COALESCE(NEW.voice_response_id, OLD.voice_response_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for vote count updates
CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();

-- Function to update reaction counts automatically  
CREATE OR REPLACE FUNCTION public.update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reaction counts on the voice_response
  UPDATE public.voice_responses 
  SET reactions = jsonb_build_object(
    'clap', (SELECT COUNT(*) FROM public.user_reactions WHERE voice_response_id = COALESCE(NEW.voice_response_id, OLD.voice_response_id) AND reaction_type = 'clap'),
    'brain', (SELECT COUNT(*) FROM public.user_reactions WHERE voice_response_id = COALESCE(NEW.voice_response_id, OLD.voice_response_id) AND reaction_type = 'brain'),
    'shock', (SELECT COUNT(*) FROM public.user_reactions WHERE voice_response_id = COALESCE(NEW.voice_response_id, OLD.voice_response_id) AND reaction_type = 'shock'),
    'think', (SELECT COUNT(*) FROM public.user_reactions WHERE voice_response_id = COALESCE(NEW.voice_response_id, OLD.voice_response_id) AND reaction_type = 'think'),
    'trash', (SELECT COUNT(*) FROM public.user_reactions WHERE voice_response_id = COALESCE(NEW.voice_response_id, OLD.voice_response_id) AND reaction_type = 'trash')
  )
  WHERE id = COALESCE(NEW.voice_response_id, OLD.voice_response_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for reaction count updates
CREATE TRIGGER update_reaction_counts_trigger
  AFTER INSERT OR DELETE ON public.user_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_reaction_counts();

-- Function to update thought final status based on votes
CREATE OR REPLACE FUNCTION public.evaluate_thought_status()
RETURNS void AS $$
BEGIN
  UPDATE public.thoughts 
  SET final_status = CASE
    WHEN expires_at < now() AND status = 'active' THEN
      CASE 
        WHEN (
          SELECT SUM(fact_votes) FROM voice_responses WHERE thought_id = thoughts.id
        ) > (
          SELECT SUM(myth_votes) FROM voice_responses WHERE thought_id = thoughts.id
        ) THEN 'bloomed'
        WHEN (
          SELECT SUM(myth_votes) FROM voice_responses WHERE thought_id = thoughts.id
        ) > (
          SELECT SUM(fact_votes) FROM voice_responses WHERE thought_id = thoughts.id
        ) THEN 'bricked'
        ELSE 'unclear'
      END
    ELSE final_status
  END,
  status = CASE
    WHEN expires_at < now() AND status = 'active' THEN 'expired'
    ELSE status
  END
  WHERE expires_at < now() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_user_votes_voice_response_id ON public.user_votes(voice_response_id);
CREATE INDEX idx_user_votes_user_session ON public.user_votes(user_session);
CREATE INDEX idx_user_reactions_voice_response_id ON public.user_reactions(voice_response_id);
CREATE INDEX idx_user_reactions_user_session ON public.user_reactions(user_session);