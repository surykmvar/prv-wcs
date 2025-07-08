import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client when environment variables are missing
const createMockClient = () => ({
  from: () => ({
    insert: () => ({ select: () => ({ single: () => Promise.reject(new Error('Supabase not configured')) }) }),
    select: () => ({ eq: () => ({ order: () => Promise.reject(new Error('Supabase not configured')) }) })
  }),
  storage: {
    from: () => ({
      upload: () => Promise.reject(new Error('Supabase not configured')),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
})

export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createMockClient() as any
  : createClient<Database>(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Storage bucket names
export const STORAGE_BUCKETS = {
  VOICE_RECORDINGS: 'voice-recordings'
} as const