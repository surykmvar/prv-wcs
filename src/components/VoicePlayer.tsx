import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useAudioUrl } from '@/hooks/useAudioUrl'

interface VoicePlayerProps {
  audioUrl: string
  duration: number
  className?: string
}

export function VoicePlayer({ audioUrl, duration, className }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [hasError, setHasError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Get signed URL for audio playback
  const { signedUrl, loading: urlLoading, error: urlError } = useAudioUrl(audioUrl)

  // Don't render if invalid audio
  if (!audioUrl || duration <= 0) {
    return null
  }

  // Show loading state while URL is being fetched
  if (urlLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
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
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Unable to load audio</span>
          </div>
        </CardContent>
      </Card>
    )
  }

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

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <audio ref={audioRef} src={signedUrl} preload="metadata" />
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayPause}
            className="flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 space-y-2">
            <Slider
              value={[currentTime]}
              max={audioDuration || 100}
              step={0.1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-end text-xs text-muted-foreground">
              <span>{formatTime(audioDuration - currentTime)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlaybackSpeed}
            className="flex-shrink-0 min-w-[2.5rem] text-xs font-medium"
          >
            {playbackRate}x
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={restart}
            className="flex-shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}