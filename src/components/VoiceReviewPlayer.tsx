import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"
import { DynamicWaveform } from "./DynamicWaveform"
import { EchoLevels } from "./EchoLevels"

interface VoiceReviewPlayerProps {
  reviewerName: string
  productName: string
  duration: number
  rating: number
  location: string
  date: string
  isPlaying?: boolean
  onPlayPause?: () => void
  className?: string
}

export const VoiceReviewPlayer = ({
  reviewerName,
  productName, 
  duration,
  rating,
  location,
  date,
  isPlaying = false,
  onPlayPause,
  className = ""
}: VoiceReviewPlayerProps) => {
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<number>(0)
  const animationRef = useRef<number>()
  
  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now() - (progressRef.current * duration * 1000)
      
      const updateProgress = () => {
        const elapsed = (Date.now() - startTime) / 1000
        const newProgress = Math.min(elapsed / duration, 1)
        
        setProgress(newProgress)
        progressRef.current = newProgress
        
        if (newProgress < 1) {
          animationRef.current = requestAnimationFrame(updateProgress)
        } else {
          // Auto-stop when finished
          progressRef.current = 0
          setProgress(0)
        }
      }
      
      animationRef.current = requestAnimationFrame(updateProgress)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`bg-card border border-border/30 rounded-xl p-4 hover:border-woices-violet/30 transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-woices-violet to-woices-sky flex items-center justify-center text-white text-sm font-medium">
            {reviewerName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{reviewerName}</p>
            <p className="text-xs text-muted-foreground">{location} • {date}</p>
          </div>
        </div>
        
        <EchoLevels rating={rating} size="sm" />
      </div>
      
      {/* Product info */}
      <p className="text-sm text-muted-foreground mb-3">
        Voice review for: <span className="font-medium text-foreground">{productName}</span>
      </p>
      
      {/* Voice player */}
      <div className="bg-muted/20 rounded-lg p-3 flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onPlayPause}
          className="w-8 h-8 p-0 rounded-full bg-woices-violet hover:bg-woices-violet/90 text-white flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3 ml-0.5" />
          )}
        </Button>
        
        <div className="flex-1 min-w-0 mx-1">
          <DynamicWaveform 
            isPlaying={isPlaying} 
            progress={progress}
            className="w-full"
          />
        </div>
        
        <div className="text-xs text-muted-foreground flex-shrink-0 min-w-[32px] text-right">
          {isPlaying ? formatTime(duration * (1 - progress)) : formatTime(duration)}
        </div>
      </div>
    </div>
  )
}