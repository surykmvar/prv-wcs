export interface Database {
  public: {
    Tables: {
      thoughts: {
        Row: {
          id: string
          title: string
          description: string | null
          tags: string[] | null
          created_at: string
          expires_at: string
          status: 'active' | 'bloomed' | 'bricked'
          bloom_count: number
          brick_count: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          tags?: string[] | null
          created_at?: string
          expires_at?: string
          status?: 'active' | 'bloomed' | 'bricked'
          bloom_count?: number
          brick_count?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          tags?: string[] | null
          created_at?: string
          expires_at?: string
          status?: 'active' | 'bloomed' | 'bricked'
          bloom_count?: number
          brick_count?: number
        }
      }
      voice_responses: {
        Row: {
          id: string
          thought_id: string
          audio_url: string
          duration: number
          transcript: string | null
          classification: 'myth' | 'fact' | 'debated' | 'unclear' | null
          created_at: string
          bloom_count: number
          brick_count: number
        }
        Insert: {
          id?: string
          thought_id: string
          audio_url: string
          duration: number
          transcript?: string | null
          classification?: 'myth' | 'fact' | 'debated' | 'unclear' | null
          created_at?: string
          bloom_count?: number
          brick_count?: number
        }
        Update: {
          id?: string
          thought_id?: string
          audio_url?: string
          duration?: number
          transcript?: string | null
          classification?: 'myth' | 'fact' | 'debated' | 'unclear' | null
          created_at?: string
          bloom_count?: number
          brick_count?: number
        }
      }
    }
  }
}

export type Thought = Database['public']['Tables']['thoughts']['Row']
export type VoiceResponse = Database['public']['Tables']['voice_responses']['Row']
export type NewThought = Database['public']['Tables']['thoughts']['Insert']
export type NewVoiceResponse = Database['public']['Tables']['voice_responses']['Insert']