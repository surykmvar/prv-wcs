import { useState } from 'react'
import { supabase, STORAGE_BUCKETS, isSupabaseConfigured } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

// Use the integrated Supabase types
type Database = import('@/integrations/supabase/types').Database
type Thought = Database['public']['Tables']['thoughts']['Row']
type VoiceResponse = Database['public']['Tables']['voice_responses']['Row']
type NewThought = Database['public']['Tables']['thoughts']['Insert']
type NewVoiceResponse = Database['public']['Tables']['voice_responses']['Insert']

export function useSupabase() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Create a new thought
  const createThought = async (thought: Omit<NewThought, 'id' | 'created_at' | 'expires_at' | 'user_id'>) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Supabase not configured",
        description: "Please set up Supabase environment variables to use this feature.",
        variant: "destructive"
      })
      return null
    }
    
    setLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to post a thought.",
          variant: "destructive"
        })
        return null
      }
      
      const { data, error } = await supabase
        .from('thoughts')
        .insert({
          ...thought,
          user_id: user.id, // Always set user_id for authenticated users
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
        })
        .select()
        .single()

      if (error) throw error
      
      toast({
        title: "Thought posted!",
        description: "Your thought is now live and waiting for Woices."
      })
      
      return data as Thought
    } catch (error) {
      console.error('Error creating thought:', error)
      toast({
        title: "Error",
        description: "Failed to post thought. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Upload audio file to Supabase Storage
  const uploadAudioFile = async (audioBlob: Blob, thoughtId: string) => {
    setLoading(true)
    try {
      const fileName = `${thoughtId}_${Date.now()}.webm`
      const filePath = `voice-responses/${fileName}`

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.VOICE_RECORDINGS)
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type,
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.VOICE_RECORDINGS)
        .getPublicUrl(filePath)

      return {
        path: data.path,
        url: urlData.publicUrl
      }
    } catch (error) {
      console.error('Error uploading audio:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload voice recording. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Create a voice response
  const createVoiceResponse = async (voiceResponse: Omit<NewVoiceResponse, 'id' | 'created_at' | 'user_id'>) => {
    setLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Use upsert with the unique constraint to handle duplicates gracefully
      const { data, error } = await supabase
        .from('voice_responses')
        .upsert({
          ...voiceResponse,
          user_id: user?.id || null
        }, {
          onConflict: user?.id ? 'user_id,thought_id' : 'user_session,thought_id'
        })
        .select()
        .single()

      if (error) throw error
      
      toast({
        title: "Woice sent!",
        description: "Your voice response has been posted successfully."
      })
      
      return data as VoiceResponse
    } catch (error) {
      console.error('Error creating voice response:', error)
      toast({
        title: "Error",
        description: "Failed to send voice response. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get thoughts with their voice responses
  const getThoughts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select(`
          *,
          voice_responses (
            id,
            audio_url,
            duration,
            created_at,
            myth_votes,
            fact_votes,
            unclear_votes
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching thoughts:', error)
      toast({
        title: "Error",
        description: "Failed to load thoughts. Please try again.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Check if user can submit a voice response
  const canUserSubmitVoice = async (thoughtId: string, userSession: string): Promise<{ canSubmit: boolean; reason: string | null }> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Check if thought exists and get its max_woices_allowed
      const { data: thought, error: thoughtError } = await supabase
        .from('thoughts')
        .select('max_woices_allowed, voice_responses(id)')
        .eq('id', thoughtId)
        .eq('status', 'active')
        .single()

      if (thoughtError) {
        console.error('Error fetching thought:', thoughtError)
        throw thoughtError
      }
      if (!thought) {
        console.log('Thought not found or inactive:', thoughtId)
        return { canSubmit: false, reason: 'Thought not found or inactive' }
      }

      const maxWoices = thought.max_woices_allowed || 10
      const currentCount = thought.voice_responses?.length || 0

      // Check if max woices reached
      if (currentCount >= maxWoices) {
        return { canSubmit: false, reason: 'This thought has reached the maximum number of Woice replies.' }
      }

      // For authenticated users, check if they already submitted
      if (user?.id) {
        const { data: existingVoice, error: voiceError } = await supabase
          .from('voice_responses')
          .select('id')
          .eq('thought_id', thoughtId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (voiceError && voiceError.code !== 'PGRST116') {
          console.error('Error checking existing voice response:', voiceError)
          throw voiceError
        }
        
        if (existingVoice) {
          return { canSubmit: false, reason: "You've already shared your Woice on this thought" }
        }
        
        return { canSubmit: true, reason: null }
      }
      
      // For anonymous users, check by user_session
      if (userSession) {
        const { data: existingVoice, error: voiceError } = await supabase
          .from('voice_responses')
          .select('id')
          .eq('thought_id', thoughtId)
          .eq('user_session', userSession)
          .is('user_id', null)
          .maybeSingle()

        if (voiceError && voiceError.code !== 'PGRST116') {
          console.error('Error checking existing anonymous voice response:', voiceError)
          throw voiceError
        }
        
        if (existingVoice) {
          return { canSubmit: false, reason: "You've already shared your Woice on this thought" }
        }
        
        return { canSubmit: true, reason: null }
      }

      // No user session available
      return { canSubmit: false, reason: 'Please refresh the page and try again' }
      
    } catch (error) {
      console.error('Error checking user submission eligibility:', error)
      return { canSubmit: false, reason: 'Unable to verify submission eligibility. Please try again.' }
    }
  }

  // Submit complete voice response (upload + create record)
  const submitVoiceResponse = async (thoughtId: string, audioBlob: Blob, duration: number, userSession: string) => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Supabase not configured",
        description: "Please set up Supabase environment variables to use this feature.",
        variant: "destructive"
      })
      return null
    }
    
    try {
      // First check if user can submit
      const eligibilityCheck = await canUserSubmitVoice(thoughtId, userSession)
      if (!eligibilityCheck.canSubmit) {
        toast({
          title: "Cannot submit Woice",
          description: eligibilityCheck.reason || "Unable to submit voice response.",
          variant: "destructive"
        })
        return null
      }

      // Upload audio file
      const { url } = await uploadAudioFile(audioBlob, thoughtId)
      
      // Create voice response record
      const voiceResponse = await createVoiceResponse({
        thought_id: thoughtId,
        audio_url: url,
        duration,
        user_session: userSession
      })
      
      return voiceResponse
    } catch (error) {
      console.error('Error submitting voice response:', error)
      throw error
    }
  }

  return {
    loading,
    createThought,
    uploadAudioFile,
    createVoiceResponse,
    submitVoiceResponse,
    getThoughts,
    canUserSubmitVoice
  }
}