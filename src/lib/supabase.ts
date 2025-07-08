// Use the automatically configured Supabase client
export { supabase } from '@/integrations/supabase/client'
export type { Database } from '@/integrations/supabase/types'

// Always configured when using the integration
export const isSupabaseConfigured = true

// Storage bucket names
export const STORAGE_BUCKETS = {
  VOICE_RECORDINGS: 'voice-recordings'
} as const