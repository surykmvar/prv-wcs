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

  // Color progression: muted -> sky -> violet
  const getRippleColor = (level: number, isActive: boolean) => {
    if (!isActive) return "border-muted-foreground/20"
    
    if (level <= 2) return "border-muted-foreground/50"
    if (level <= 3) return "border-woices-sky/70"
    return "border-woices-violet/80"
  }

  const getCenterColor = () => {
    if (currentRating <= 2) return "bg-muted-foreground/50"
    if (currentRating <= 3) return "bg-woices-sky"
    return "bg-woices-violet"
  }

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
              className={`
                absolute rounded-full border transition-all duration-300
                ${getRippleColor(level, isActive)}
                ${interactive ? "cursor-pointer hover:scale-105" : ""}
                ${isActive && interactive ? "animate-pulse" : ""}
              `}
              style={{
                width: `${rippleSize}px`,
                height: `${rippleSize}px`,
                borderWidth: '1.5px',
                animationDuration: `${2 + level * 0.2}s`
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