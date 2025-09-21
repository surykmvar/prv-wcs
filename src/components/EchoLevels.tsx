import { useState } from "react"

interface EchoLevelsProps {
  rating: number
  onRatingChange?: (rating: number) => void
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  className?: string
}

const ratingLabels = {
  1: "Meh",
  2: "Not so bad", 
  3: "It's okay",
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
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }
  
  const rippleSizes = {
    sm: [8, 12, 16, 20, 24],
    md: [12, 18, 24, 30, 36],
    lg: [20, 30, 40, 50, 60]
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

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Ripple waves */}
        {[1, 2, 3, 4, 5].map((level) => {
          const isActive = level <= currentRating
          const rippleSize = rippleSizes[size][level - 1]
          
          return (
            <div
              key={level}
              className={`absolute rounded-full border-2 transition-all duration-300 cursor-pointer
                ${isActive 
                  ? level <= 2 
                    ? "border-muted-foreground/40" 
                    : level <= 3 
                    ? "border-woices-sky/60" 
                    : "border-woices-violet"
                  : "border-muted-foreground/20"
                }
                ${interactive ? "hover:scale-110" : ""}
                ${isActive && interactive ? "animate-pulse" : ""}
              `}
              style={{
                width: `${rippleSize}px`,
                height: `${rippleSize}px`,
                animationDuration: `${2 + level * 0.3}s`
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
          ${currentRating <= 2 
            ? "bg-muted-foreground/60" 
            : currentRating <= 3 
            ? "bg-woices-sky" 
            : "bg-woices-violet"
          }
          ${interactive && currentRating > 0 ? "animate-pulse" : ""}
        `} />
      </div>
      
      {/* Rating label */}
      {interactive && hoveredRating && (
        <span className="text-xs text-muted-foreground font-medium">
          {currentLabel}
        </span>
      )}
    </div>
  )
}