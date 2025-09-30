import { useState, useEffect } from 'react'
import { supabase, STORAGE_BUCKETS } from '@/lib/supabase'

export function useAudioUrl(audioPath: string | null) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!audioPath) {
      setSignedUrl(null)
      return
    }

    // If it's already a full URL, local blob/data URL, or local asset, use directly
    if (audioPath.startsWith('http') || audioPath.startsWith('blob:') || audioPath.startsWith('data:') || 
        audioPath.startsWith('/src/assets/') || audioPath.startsWith('/assets/') || 
        audioPath.includes('demo-voice-')) {
      setSignedUrl(audioPath)
      return
    }

    let isCancelled = false

    const getSignedUrl = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKETS.VOICE_RECORDINGS)
          .createSignedUrl(audioPath, 3600) // 1 hour expiry

        if (error) throw error
        
        if (!isCancelled) {
          setSignedUrl(data.signedUrl)
        }
      } catch (err) {
        console.error('Error getting signed URL:', err)
        if (!isCancelled) {
          setError('Failed to load audio')
          setSignedUrl(null)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    getSignedUrl()

    return () => {
      isCancelled = true
    }
  }, [audioPath])

  return { signedUrl, loading, error }
}