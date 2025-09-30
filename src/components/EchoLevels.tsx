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
  1: "Clear Audio",
  2: "Great Content",
  3: "Excellent Experience"
}

const ringColors = {
  1: "#FF453A", // Red - Voice Clarity
  2: "#30D158", // Green - Content Quality  
  3: "#007AFF"  // Blue - Overall Experience
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
    sm: "w-10 h-10",
    md: "w-14 h-14", 
    lg: "w-18 h-18"
  }
  
  const ringSizes = {
    sm: [24, 32, 40],
    md: [28, 38, 48],
    lg: [36, 48, 60]
  }

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  }

  // Convert 5-star rating to 3-ring system (Apple Watch style)
  const convertRatingToRings = (starRating: number) => {
    if (starRating <= 2) return 1 // Only red ring (Clear Audio)
    if (starRating === 3) return 2 // Red + green rings (Clear Audio + Great Content)
    return 3 // All three rings (Clear Audio + Great Content + Excellent Experience)
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

  const currentRings = convertRatingToRings(hoveredRating ? (hoveredRating === 1 ? 2 : hoveredRating === 2 ? 3 : 5) : rating)
  
  // Apple Watch style ring colors - pure outline rings only
  const getRingStyle = (level: number, currentLevel: number) => {
    const isActive = level <= currentLevel
    const color = ringColors[level as keyof typeof ringColors]
    
    if (!isActive) {
      return {
        borderColor: "rgba(128, 128, 128, 0.2)",
        backgroundColor: "transparent"
      }
    }
    
    return {
      borderColor: color,
      backgroundColor: "transparent"
    }
  }

  const getCenterColor = () => {
    if (currentRings === 1) return "#FF453A" // Red
    if (currentRings === 2) return "#30D158" // Green
    return "#007AFF" // Blue
  }

  return (
    <TooltipProvider>
      <div className={`relative flex flex-col items-center ${className}`}>
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center group`}>
          {/* 3 Activity Rings (Apple Watch style) with individual tooltips */}
          {[1, 2, 3].map((level) => {
            const ringSize = ringSizes[size][level - 1]
            const levelLabel = ratingLabels[level as keyof typeof ratingLabels]
            const ringStyle = getRingStyle(level, currentRings)
            const isActive = level <= currentRings
            
            return (
              <Tooltip key={level} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      absolute rounded-full border-[5px] transition-all duration-500 ease-out
                      ${interactive ? "cursor-pointer hover:scale-105" : ""}
                    `}
                    style={{
                      width: `${ringSize}px`,
                      height: `${ringSize}px`,
                      borderColor: ringStyle.borderColor,
                      backgroundColor: ringStyle.backgroundColor,
                    }}
                    onClick={() => handleClick(level)}
                    onMouseEnter={() => handleMouseEnter(level)}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={() => handleTouch(level)}
                  />
                </TooltipTrigger>
                {(interactive || isActive) && (
                  <TooltipContent side="top" className="bg-popover border border-border shadow-lg">
                    <p className="text-xs font-semibold">{levelLabel}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
          
          {/* Center voice icon */}
          <div 
            className="relative z-10 rounded-full p-2 flex items-center justify-center transition-all duration-300"
            style={{ backgroundColor: getCenterColor() }}
          >
            <Mic className={`${iconSizes[size]} text-white`} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}