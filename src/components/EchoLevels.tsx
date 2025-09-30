import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Mic } from "lucide-react"

interface EchoLevelsProps {
  rating: number
  onRatingChange?: (rating: number) => void
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  className?: string
}

const ratingLabels = {
  1: "Poor Quality",
  2: "Good Quality",
  3: "Excellent Quality"
}

export const EchoLevels = ({ 
  rating, 
  onRatingChange, 
  size = "md", 
  interactive = false,
  className = "" 
}: EchoLevelsProps) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }
  
  const rippleSizes = {
    sm: [20, 28, 36],
    md: [24, 34, 44],
    lg: [32, 44, 56]
  }

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  }

  // Convert 5-star rating to 3-ripple system
  const convertRatingToRipples = (starRating: number) => {
    if (starRating <= 2) return 1 // Poor - 1 red ripple
    if (starRating === 3) return 2 // Okay - 2 ripples (red + blue)
    return 3 // Great - 3 ripples (red + blue + green)
  }

  const handleClick = (level: number) => {
    if (interactive && onRatingChange) {
      // Convert ripple level back to star rating
      const starRating = level === 1 ? 2 : level === 2 ? 3 : 5
      onRatingChange(starRating)
    }
  }

  const handleMouseEnter = (level: number) => {
    if (interactive) {
      setHoveredRating(level)
    }
  }

  const handleMouseLeave = () => {
    setHoveredRating(null)
    setShowTooltip(false)
  }

  const handleTouch = (level: number) => {
    if (interactive) {
      setHoveredRating(level)
      setShowTooltip(true)
      // Hide tooltip after 2 seconds
      setTimeout(() => setShowTooltip(false), 2000)
    }
  }

  const currentRipples = convertRatingToRipples(hoveredRating ? (hoveredRating === 1 ? 2 : hoveredRating === 2 ? 3 : 5) : rating)
  
  // Single color system with intensity levels
  const getRippleColor = (level: number, currentLevel: number) => {
    if (level > currentLevel) return "border-muted-foreground/10 bg-muted/5"
    
    // Use primary color with increasing intensity
    if (level === 1) return "border-primary/30 bg-primary/5"
    if (level === 2) return "border-primary/60 bg-primary/10"
    return "border-primary bg-primary/20"
  }

  const getCenterColor = () => {
    if (currentRipples === 1) return "hsl(var(--primary) / 0.7)"
    if (currentRipples === 2) return "hsl(var(--primary) / 0.85)"
    return "hsl(var(--primary))"
  }

  return (
    <TooltipProvider>
      <div className={`relative flex flex-col items-center ${className}`}>
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center group`}>
          {/* 3 Ripple waves with individual tooltips */}
          {[1, 2, 3].map((level) => {
            const rippleSize = rippleSizes[size][level - 1]
            const levelLabel = ratingLabels[level as keyof typeof ratingLabels]
            
            return (
              <Tooltip key={level} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      absolute rounded-full border-3 transition-all duration-300 ease-in-out
                      ${getRippleColor(level, currentRipples)}
                      ${interactive ? "cursor-pointer hover:scale-110 hover:border-primary/80" : ""}
                    `}
                    style={{
                      width: `${rippleSize}px`,
                      height: `${rippleSize}px`,
                    }}
                    onClick={() => handleClick(level)}
                    onMouseEnter={() => handleMouseEnter(level)}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={() => handleTouch(level)}
                  />
                </TooltipTrigger>
                {(interactive || (level <= currentRipples)) && (
                  <TooltipContent side="top" className="bg-popover border border-border shadow-lg">
                    <p className="text-xs font-semibold">{levelLabel}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
          
          {/* Center voice icon */}
          <div 
            className="relative z-10 rounded-full p-1.5 flex items-center justify-center transition-all duration-300 shadow-lg"
            style={{ backgroundColor: getCenterColor() }}
          >
            <Mic className={`${iconSizes[size]} text-white`} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}