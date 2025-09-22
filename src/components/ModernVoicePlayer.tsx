import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Zap } from 'lucide-react'
import { DynamicWaveform } from './DynamicWaveform'
import { VotingButtons } from './VotingButtons'
import { EchoLevels } from './EchoLevels'
import { computeVoiceOutcome } from '@/utils/voteUtils'
import { useAudioUrl } from '@/hooks/useAudioUrl'
import { supabase } from '@/lib/supabase'

interface ModernVoicePlayerProps {
  voiceResponseId: string
  audioUrl: string
  duration: number
  mythVotes: number
  factVotes: number
  unclearVotes: number
  className?: string
  // Controlled mode props
  controlled?: boolean
  isActive?: boolean
  isPlaying?: boolean
  currentTime?: number
  durationOverride?: number
  playbackRate?: number
  onTogglePlayPause?: () => void
  onSeek?: (seconds: number) => void
  onRestart?: () => void
  onToggleSpeed?: () => void
}

export function ModernVoicePlayer({ 
  voiceResponseId,
  audioUrl, 
  duration, 
  mythVotes,
  factVotes,
  unclearVotes,
  className,
  controlled = false,
  isActive = false,
  isPlaying: controlledIsPlaying = false,
  currentTime: controlledCurrentTime = 0,
  durationOverride,
  playbackRate: controlledPlaybackRate = 1,
  onTogglePlayPause,
  onSeek,
  onRestart,
  onToggleSpeed
}: ModernVoicePlayerProps) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false)
  const [internalCurrentTime, setInternalCurrentTime] = useState(0)
  const [internalAudioDuration, setInternalAudioDuration] = useState(duration || 0)
  const [internalPlaybackRate, setInternalPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Local state for real-time vote updates
  const [localMythVotes, setLocalMythVotes] = useState(mythVotes)
  const [localFactVotes, setLocalFactVotes] = useState(factVotes)
  const [localUnclearVotes, setLocalUnclearVotes] = useState(unclearVotes)
  
  // Use controlled or internal state
  const isPlaying = controlled ? controlledIsPlaying : internalIsPlaying
  const currentTime = controlled ? controlledCurrentTime : internalCurrentTime
  const audioDuration = controlled ? (durationOverride || duration || 0) : internalAudioDuration
  const playbackRate = controlled ? controlledPlaybackRate : internalPlaybackRate
  
  // Get signed URL for audio playback (only if not controlled)
  const { signedUrl, loading: urlLoading, error: urlError } = useAudioUrl(controlled && !isActive ? null : audioUrl)

  // Real-time subscription for vote updates
  useEffect(() => {
    // Update local vote counts when props change
    setLocalMythVotes(mythVotes)
    setLocalFactVotes(factVotes)
    setLocalUnclearVotes(unclearVotes)

    // Subscribe to real-time vote count updates for this specific voice response
    const channel = supabase
      .channel(`voice-response-${voiceResponseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'voice_responses',
          filter: `id=eq.${voiceResponseId}`
        },
        (payload) => {
          const updatedResponse = payload.new as any
          if (updatedResponse) {
            setLocalMythVotes(updatedResponse.myth_votes || 0)
            setLocalFactVotes(updatedResponse.fact_votes || 0)
            setLocalUnclearVotes(updatedResponse.unclear_votes || 0)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [voiceResponseId, mythVotes, factVotes, unclearVotes])

  // Audio event handlers setup - only for uncontrolled mode
  useEffect(() => {
    if (controlled) return
    
    const audio = audioRef.current
    if (!audio) return

    // Reset states when audio URL changes
    setInternalIsPlaying(false)
    setInternalCurrentTime(0)
    setInternalAudioDuration(duration || 0)

    const updateTime = () => setInternalCurrentTime(audio.currentTime)
    const updateDuration = () => {
      const validDuration = audio.duration && isFinite(audio.duration) ? audio.duration : duration || 0
      setInternalAudioDuration(validDuration)
    }
    const handleEnded = () => {
      setInternalIsPlaying(false)
      setInternalCurrentTime(0)
    }
    const handleLoadedData = () => {
      updateDuration()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [signedUrl, duration, controlled])

  // Don't render if invalid audio
  if (!audioUrl || duration <= 0) {
    return null
  }

  // Show loading state while URL is being fetched
  if (urlLoading) {
    return (
      <Card className={`rounded-xl shadow-md ${className}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Loading audio...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state if URL failed to load
  if (urlError || !signedUrl) {
    return (
      <Card className={`rounded-xl shadow-md ${className}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Unable to load audio</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (controlled && onTogglePlayPause) {
      onTogglePlayPause()
      return
    }
    
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setInternalIsPlaying(!isPlaying)
  }

  const restart = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (controlled && onRestart) {
      onRestart()
      return
    }
    
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setInternalCurrentTime(0)
    if (isPlaying) {
      audio.play()
    }
  }

  const handleWaveformClick = (progress: number) => {
    const seekTime = progress * audioDuration
    
    if (controlled && onSeek) {
      onSeek(seekTime)
      return
    }
    
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = seekTime
    setInternalCurrentTime(seekTime)
  }

  const togglePlaybackSpeed = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (controlled && onToggleSpeed) {
      onToggleSpeed()
      return
    }
    
    const audio = audioRef.current
    if (!audio) return

    const speeds = [1, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % speeds.length
    const newRate = speeds[nextIndex]
    
    setInternalPlaybackRate(newRate)
    audio.playbackRate = newRate
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
      return '0:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }


  // Calculate rating based on real-time local votes for ripple display
  const outcome = computeVoiceOutcome({ 
    fact: localFactVotes, 
    myth: localMythVotes, 
    unclear: localUnclearVotes 
  })
  
  // Convert outcome to rating (1-5 scale)
  const getRatingFromOutcome = () => {
    if (outcome.total === 0) return 0
    if (outcome.code === 'bloom') return 5
    if (outcome.code === 'unclear') return 3
    if (outcome.code === 'dust') return 1
    return 0
  }

  return (
    <Card className="w-full mb-3 sm:mb-4 bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardContent className="p-2 sm:p-4">
        {!controlled && <audio ref={audioRef} src={signedUrl} preload="metadata" />}
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            size="sm"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
            )}
          </Button>

          {/* Waveform Container */}
          <div 
            className="flex-1 min-w-0 cursor-pointer" 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const progress = x / rect.width
              handleWaveformClick(Math.max(0, Math.min(1, progress)))
            }}
          >
            <DynamicWaveform
              isPlaying={isPlaying}
              progress={audioDuration > 0 ? currentTime / audioDuration : 0}
              className="h-6 sm:h-8"
            />
          </div>

          {/* Time Display */}
          <div className="text-xs sm:text-sm text-muted-foreground tabular-nums min-w-[45px] sm:min-w-[60px] text-right flex-shrink-0">
            {isPlaying 
              ? `${formatTime(audioDuration - currentTime)} left`
              : formatTime(audioDuration)
            }
          </div>

          {/* Playback Speed */}
          <Button
            onClick={togglePlaybackSpeed}
            variant="ghost"
            size="sm"
            className="text-xs font-medium px-1 sm:px-2 h-6 sm:h-8 min-w-[32px] sm:min-w-[40px] hover:bg-muted/50 flex-shrink-0"
          >
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
            {playbackRate}x
          </Button>

          {/* Restart Button */}
          <Button
            onClick={restart}
            variant="ghost"
            size="sm"
            className="w-6 h-6 sm:w-8 sm:h-8 p-0 hover:bg-muted/50 flex-shrink-0"
          >
            <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </Button>
        </div>

        {/* Voting and Rating Section */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2 sm:gap-4">
          {/* Voting Buttons - Left side */}
          <div className="flex-1">
            <VotingButtons
              voiceResponseId={voiceResponseId}
              mythVotes={localMythVotes}
              factVotes={localFactVotes}
              unclearVotes={localUnclearVotes}
              className="flex justify-start"
            />
          </div>

          {/* Ripple Rating - Right side */}
          <div className="flex-shrink-0">
            <EchoLevels 
              rating={getRatingFromOutcome()} 
              size="sm" 
              className="justify-end"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}