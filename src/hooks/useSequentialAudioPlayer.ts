import { useState, useRef, useCallback, useEffect } from 'react'
import { useAudioUrl } from '@/hooks/useAudioUrl'

interface VoiceResponse {
  id: string
  audio_url: string
  duration: number
}

export function useSequentialAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voiceResponses, setVoiceResponses] = useState<VoiceResponse[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Get signed URL for current audio
  const currentResponse = voiceResponses[currentIndex]
  const { signedUrl } = useAudioUrl(currentResponse?.audio_url || null)

  // Initialize audio element when signed URL is available
  useEffect(() => {
    if (signedUrl && !audioRef.current) {
      audioRef.current = new Audio()
    }
    
    if (audioRef.current && signedUrl) {
      audioRef.current.src = signedUrl
      audioRef.current.preload = 'metadata'
      
      const handleEnded = () => {
        playNext()
      }
      
      audioRef.current.addEventListener('ended', handleEnded)
      
      return () => {
        audioRef.current?.removeEventListener('ended', handleEnded)
      }
    }
  }, [signedUrl, currentIndex])

  // Auto-play when index changes and we're in playing mode
  useEffect(() => {
    if (isPlaying && audioRef.current && signedUrl) {
      audioRef.current.play().catch(console.error)
    }
  }, [currentIndex, isPlaying, signedUrl])

  const playNext = useCallback(() => {
    if (currentIndex < voiceResponses.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // All audio finished
      setIsPlaying(false)
      setCurrentIndex(0)
    }
  }, [currentIndex, voiceResponses.length])

  const startSequentialPlay = useCallback((responses: VoiceResponse[]) => {
    setVoiceResponses(responses)
    setCurrentIndex(0)
    setIsPlaying(true)
  }, [])

  const stopSequentialPlay = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  const pauseSequentialPlay = useCallback(() => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const resumeSequentialPlay = useCallback(() => {
    setIsPlaying(true)
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [])

  return {
    isPlaying,
    currentIndex,
    playNext,
    startSequentialPlay,
    stopSequentialPlay,
    pauseSequentialPlay,
    resumeSequentialPlay,
    getCurrentVoiceResponse: () => voiceResponses[currentIndex],
    totalResponses: voiceResponses.length
  }
}