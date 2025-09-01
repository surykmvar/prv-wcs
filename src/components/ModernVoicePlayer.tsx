import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
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
}

export function ModernVoicePlayer({ 
  voiceResponseId,
  audioUrl, 
  duration, 
  mythVotes,
  factVotes,
  unclearVotes,
  className
}: ModernVoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Get signed URL for audio playback
  const { signedUrl, loading: urlLoading, error: urlError } = useAudioUrl(audioUrl)

  // Audio event handlers setup - MUST be called before any early returns
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Reset states when audio URL changes
    setIsPlaying(false)
    setCurrentTime(0)
    setAudioDuration(duration || 0)

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      const validDuration = audio.duration && isFinite(audio.duration) ? audio.duration : duration || 0
      setAudioDuration(validDuration)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
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
  }, [signedUrl, duration])

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
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const restart = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setCurrentTime(0)
    if (isPlaying) {
      audio.play()
    }
  }

  const handleSliderChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = value[0]
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const togglePlaybackSpeed = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return

    const speeds = [1, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % speeds.length
    const newRate = speeds[nextIndex]
    
    setPlaybackRate(newRate)
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

  // Create waveform visualization
  const generateWaveform = () => {
    const bars = window.innerWidth < 640 ? 25 : 40 // Fewer bars on mobile
    const heights = Array.from({ length: bars }, () => Math.random() * 30 + 8) // Shorter bars
    const progress = currentTime / audioDuration
    
    return heights.map((height, index) => {
      const isActive = index < progress * bars
      return (
        <div
          key={index}
          className={`w-0.5 sm:w-1 rounded-full transition-colors duration-150 ${
            isActive 
              ? 'bg-gradient-to-t from-woices-violet to-woices-bloom' 
              : 'bg-muted'
          }`}
          style={{ height: `${height}%` }}
        />
      )
    })
  }

  return (
    <Card className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-3 sm:p-4">
        <audio ref={audioRef} src={signedUrl} preload="metadata" />
        
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

            {/* Waveform Visualization */}
            <div className="flex-1 relative min-w-0">
              <div className="flex items-end justify-between h-6 sm:h-10 gap-px px-1">
                {generateWaveform()}
              </div>
              
              {/* Timeline Scrubber */}
              <div className="mt-1">
                <Slider
                  value={[currentTime]}
                  max={audioDuration || 100}
                  step={0.1}
                  onValueChange={handleSliderChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Duration & Controls */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground font-mono text-right min-w-[2rem] sm:min-w-[2.5rem]">
                <span className="hidden sm:inline">{formatTime(currentTime)}/{formatTime(audioDuration)}</span>
                <span className="sm:hidden">{formatTime(currentTime)}</span>
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
          <VotingButtons
            voiceResponseId={voiceResponseId}
            mythVotes={mythVotes}
            factVotes={factVotes}
            unclearVotes={unclearVotes}
            className="border-t pt-2 sm:pt-3"
          />
        </div>
      </CardContent>
    </Card>
  )
}