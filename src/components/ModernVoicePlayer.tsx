import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { VotingButtons } from './VotingButtons'
import { ReactionButtons } from './ReactionButtons'

interface ModernVoicePlayerProps {
  voiceResponseId: string
  audioUrl: string
  duration: number
  mythVotes: number
  factVotes: number
  unclearVotes: number
  reactions: Record<string, number>
  className?: string
}

export function ModernVoicePlayer({ 
  voiceResponseId,
  audioUrl, 
  duration, 
  mythVotes,
  factVotes,
  unclearVotes,
  reactions,
  className 
}: ModernVoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Don't render if invalid audio
  if (!audioUrl || duration <= 0) {
    return null
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
  }, [audioUrl, duration])

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
    const bars = 40
    const heights = Array.from({ length: bars }, () => Math.random() * 40 + 10)
    const progress = currentTime / audioDuration
    
    return heights.map((height, index) => {
      const isActive = index < progress * bars
      return (
        <div
          key={index}
          className={`w-1 rounded-full transition-colors duration-150 ${
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
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
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
            <div className="flex-1 relative">
              <div className="flex items-end justify-between h-8 sm:h-12 gap-px px-1 sm:px-2">
                {generateWaveform()}
              </div>
              
              {/* Timeline Scrubber */}
              <div className="mt-1 sm:mt-2">
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
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs text-muted-foreground font-mono min-w-[2.5rem] sm:min-w-[3rem]">
                <span className="hidden sm:inline">{formatTime(currentTime)} / {formatTime(audioDuration)}</span>
                <span className="sm:hidden">{formatTime(currentTime)}</span>
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlaybackSpeed}
                className="flex-shrink-0 min-w-[1.5rem] sm:min-w-[2.5rem] text-xs font-medium h-6 sm:h-8 px-1 sm:px-2"
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

          {/* Reactions Section */}
          <ReactionButtons
            voiceResponseId={voiceResponseId}
            reactions={reactions}
            className="border-t pt-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}