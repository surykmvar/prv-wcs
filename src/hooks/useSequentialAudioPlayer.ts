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
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [voiceResponses, setVoiceResponses] = useState<VoiceResponse[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Get signed URL for current audio
  const currentResponse = voiceResponses[currentIndex]
  const { signedUrl } = useAudioUrl(currentResponse?.audio_url || null)

  // Initialize audio element and event handlers
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    
    const audio = audioRef.current
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => {
      const validDuration = audio.duration && isFinite(audio.duration) ? audio.duration : currentResponse?.duration || 0
      setDuration(validDuration)
    }
    const handleEnded = () => playNext()
    
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentResponse])

  // Update audio source when signed URL changes
  useEffect(() => {
    if (audioRef.current && signedUrl) {
      audioRef.current.src = signedUrl
      audioRef.current.playbackRate = playbackRate
      audioRef.current.preload = 'metadata'
      setCurrentTime(0)
      
      if (isPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [signedUrl, isPlaying])

  const playNext = useCallback(() => {
    if (currentIndex < voiceResponses.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // All audio finished
      setIsPlaying(false)
      setCurrentIndex(0)
      setCurrentTime(0)
    }
  }, [currentIndex, voiceResponses.length])

  const start = useCallback((responses: VoiceResponse[], startIndex: number = 0) => {
    setVoiceResponses(responses)
    setCurrentIndex(startIndex)
    setIsPlaying(true)
    setCurrentTime(0)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      audioRef.current?.pause()
    } else {
      setIsPlaying(true)
      audioRef.current?.play().catch(console.error)
    }
  }, [isPlaying])

  const play = useCallback(() => {
    setIsPlaying(true)
    audioRef.current?.play().catch(console.error)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
    audioRef.current?.pause()
  }, [])

  const playIndex = useCallback((index: number) => {
    if (index >= 0 && index < voiceResponses.length) {
      setCurrentIndex(index)
      setIsPlaying(true)
      setCurrentTime(0)
    }
  }, [voiceResponses.length])

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds
      setCurrentTime(seconds)
    }
  }, [])

  const setRate = useCallback((rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }, [])

  const cycleRate = useCallback(() => {
    const rates = [1, 1.5, 2]
    const currentRateIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentRateIndex + 1) % rates.length
    const newRate = rates[nextIndex]
    setRate(newRate)
  }, [playbackRate, setRate])

  return {
    // State
    isPlaying,
    currentIndex,
    currentTime,
    duration,
    playbackRate,
    
    // Computed
    currentResponse: voiceResponses[currentIndex],
    totalResponses: voiceResponses.length,
    
    // Actions
    start,
    stop,
    toggle,
    play,
    pause,
    playNext,
    playIndex,
    seek,
    setRate,
    cycleRate,
    
    // Legacy compatibility
    startSequentialPlay: start,
    stopSequentialPlay: stop,
    pauseSequentialPlay: pause,
    resumeSequentialPlay: play,
    getCurrentVoiceResponse: () => voiceResponses[currentIndex]
  }
}