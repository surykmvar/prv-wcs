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
  1: "Poor",
  2: "Okay",
  3: "Great"
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
    sm: [16, 24, 32],
    md: [20, 30, 40],
    lg: [28, 42, 56]
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
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
  const displayRating = hoveredRating || (currentRipples === 1 ? 1 : currentRipples === 2 ? 2 : 3)
  const currentLabel = ratingLabels[displayRating as keyof typeof ratingLabels]

  // 3-ripple color system
  const getRippleColor = (level: number, isActive: boolean) => {
    if (!isActive) return "border-muted-foreground/10"
    
    if (level === 1) return "border-[hsl(var(--echo-red))]"
    if (level === 2) return "border-[hsl(var(--woices-sky))]"
    return "border-[hsl(var(--echo-green))]"
  }

  const getCenterColor = () => {
    if (currentRipples === 1) return "hsl(var(--echo-red))"
    if (currentRipples === 2) return "hsl(var(--woices-sky))"
    return "hsl(var(--echo-green))"
  }

  return (
    <TooltipProvider>
      <Tooltip open={showTooltip || (interactive && hoveredRating !== null)} delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={`flex flex-col items-center ${className}`}>
            <div className={`relative ${sizeClasses[size]} flex items-center justify-center group`}>
              {/* 3 Ripple waves */}
              {[1, 2, 3].map((level) => {
                const isActive = level <= currentRipples
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
                    onTouchStart={() => handleTouch(level)}
                  />
                )
              })}
              
              {/* Center voice icon */}
              <div 
                className="relative z-10 rounded-full p-1 flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: getCenterColor() }}
              >
                <Mic className={`${iconSizes[size]} text-white`} />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        
        {((interactive && hoveredRating) || (!interactive && rating > 0) || showTooltip) ? (
          <TooltipContent side="top" className="bg-popover border border-border">
            <p className="text-xs font-medium">{currentLabel}</p>
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  )
}