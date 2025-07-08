-- Woices App Database Setup
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create thoughts table
CREATE TABLE IF NOT EXISTS thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours'),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'bloomed', 'bricked')),
  bloom_count INTEGER DEFAULT 0,
  brick_count INTEGER DEFAULT 0
);

-- Create voice_responses table
CREATE TABLE IF NOT EXISTS voice_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id UUID REFERENCES thoughts(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL,
  transcript TEXT,
  classification TEXT CHECK (classification IN ('myth', 'fact', 'debated', 'unclear')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bloom_count INTEGER DEFAULT 0,
  brick_count INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for thoughts (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on thoughts" ON thoughts
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on voice_responses" ON voice_responses
  FOR ALL USING (true);

-- Create storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-recordings', 'voice-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for voice recordings
CREATE POLICY "Allow all operations on voice recordings" ON storage.objects
  FOR ALL USING (bucket_id = 'voice-recordings');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thoughts_status ON thoughts(status);
CREATE INDEX IF NOT EXISTS idx_voice_responses_thought_id ON voice_responses(thought_id);
CREATE INDEX IF NOT EXISTS idx_voice_responses_created_at ON voice_responses(created_at DESC);