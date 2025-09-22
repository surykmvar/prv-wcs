import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { DynamicWaveform } from './DynamicWaveform'
import { VotingButtons } from './VotingButtons'
import { useAudioUrl } from '@/hooks/useAudioUrl'

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
  
  // Use controlled or internal state
  const isPlaying = controlled ? controlledIsPlaying : internalIsPlaying
  const currentTime = controlled ? controlledCurrentTime : internalCurrentTime
  const audioDuration = controlled ? (durationOverride || duration || 0) : internalAudioDuration
  const playbackRate = controlled ? controlledPlaybackRate : internalPlaybackRate
  
  // Get signed URL for audio playback (only if not controlled)
  const { signedUrl, loading: urlLoading, error: urlError } = useAudioUrl(controlled && !isActive ? null : audioUrl)

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


  return (
    <Card className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-3 sm:p-4">
        {!controlled && <audio ref={audioRef} src={signedUrl} preload="metadata" />}
        
        {/* Main Player */}
        <div className="space-y-3 sm:space-y-4">
          {/* Play Controls & Waveform */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>

            {/* Clickable Waveform Visualization */}
            <div 
              className="flex-1 relative min-w-0 cursor-pointer group"
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
                className="hover:opacity-80 transition-opacity"
              />
            </div>

            {/* Duration & Controls */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground font-mono text-right min-w-[2.5rem] sm:min-w-[3rem]">
                <span className="hidden sm:inline">{formatTime(currentTime)}/{formatTime(audioDuration)}</span>
                <span className="sm:hidden">{formatTime(audioDuration)}</span>
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlaybackSpeed}
                className="flex-shrink-0 w-8 sm:w-10 text-xs font-medium h-6 sm:h-8 px-0"
              >
                {playbackRate}x
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={restart}
                className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 p-0"
              >
                <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </Button>
            </div>
          </div>

          {/* Voting Section */}
          <div className="border-t pt-3 sm:pt-4">
            <VotingButtons
              voiceResponseId={voiceResponseId}
              mythVotes={mythVotes}
              factVotes={factVotes}
              unclearVotes={unclearVotes}
              className="flex justify-center"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}