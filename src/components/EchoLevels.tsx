import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EchoLevelsProps {
  rating: number
  onRatingChange?: (rating: number) => void
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  className?: string
}

const ratingLabels = {
  1: "Bad",
  2: "Poor", 
  3: "Okay",
  4: "Good",
  5: "Amazing!"
}

export const EchoLevels = ({ 
  rating, 
  onRatingChange, 
  size = "md", 
  interactive = false,
  className = "" 
}: EchoLevelsProps) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }
  
  const rippleSizes = {
    sm: [12, 16, 20, 24, 28],
    md: [16, 22, 28, 34, 40],
    lg: [24, 32, 40, 48, 56]
  }

  const handleClick = (level: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(level)
    }
  }

  const handleMouseEnter = (level: number) => {
    if (interactive) {
      setHoveredRating(level)
    }
  }

  const handleMouseLeave = () => {
    setHoveredRating(null)
  }

  const currentRating = hoveredRating || rating
  const currentLabel = ratingLabels[currentRating as keyof typeof ratingLabels]

  // Traffic light color system
  const getRippleColor = (level: number, isActive: boolean) => {
    if (!isActive) return "border-muted-foreground/10"
    
    if (level <= 2) return "border-[hsl(var(--echo-red))]"
    if (level === 3) return "border-[hsl(var(--echo-orange))]"
    return "border-[hsl(var(--echo-green))]"
  }

  const getCenterColor = () => {
    if (currentRating <= 2) return "bg-[hsl(var(--echo-red))]"
    if (currentRating === 3) return "bg-[hsl(var(--echo-orange))]"
    return "bg-[hsl(var(--echo-green))]"
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={`flex flex-col items-center ${className}`}>
            <div className={`relative ${sizeClasses[size]} flex items-center justify-center group`}>
              {/* Ripple waves */}
              {[1, 2, 3, 4, 5].map((level) => {
                const isActive = level <= currentRating
                const rippleSize = rippleSizes[size][level - 1]
                
                return (
                  <div
                    key={level}
                    className={`
                      absolute rounded-full border-2 transition-all duration-300
                      ${getRippleColor(level, isActive)}
                      ${interactive ? "cursor-pointer hover:scale-105 hover:bg-black/5 dark:hover:bg-white/5" : ""}
                    `}
                    style={{
                      width: `${rippleSize}px`,
                      height: `${rippleSize}px`,
                    }}
                    onClick={() => handleClick(level)}
                    onMouseEnter={() => handleMouseEnter(level)}
                    onMouseLeave={handleMouseLeave}
                  />
                )
              })}
              
              {/* Center dot */}
              <div className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${getCenterColor()}
              `} />
            </div>
          </div>
        </TooltipTrigger>
        
        {(interactive && hoveredRating) || (!interactive && rating > 0) ? (
          <TooltipContent side="top" className="bg-popover border border-border">
            <p className="text-xs font-medium">{currentLabel}</p>
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  )
}