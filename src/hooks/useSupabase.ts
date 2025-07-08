import { useState } from 'react'
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase'
import { NewThought, NewVoiceResponse, Thought, VoiceResponse } from '@/types/database'
import { useToast } from '@/hooks/use-toast'

export function useSupabase() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Create a new thought
  const createThought = async (thought: Omit<NewThought, 'id' | 'created_at' | 'expires_at'>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .insert({
          ...thought,
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
  const createVoiceResponse = async (voiceResponse: Omit<NewVoiceResponse, 'id' | 'created_at'>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('voice_responses')
        .insert(voiceResponse)
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
          voice_responses (*)
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

  // Submit complete voice response (upload + create record)
  const submitVoiceResponse = async (thoughtId: string, audioBlob: Blob, duration: number) => {
    try {
      // Upload audio file
      const { url } = await uploadAudioFile(audioBlob, thoughtId)
      
      // Create voice response record
      const voiceResponse = await createVoiceResponse({
        thought_id: thoughtId,
        audio_url: url,
        duration
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
    getThoughts
  }
}