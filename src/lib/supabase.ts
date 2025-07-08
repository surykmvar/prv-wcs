import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Storage bucket names
export const STORAGE_BUCKETS = {
  VOICE_RECORDINGS: 'voice-recordings'
} as const