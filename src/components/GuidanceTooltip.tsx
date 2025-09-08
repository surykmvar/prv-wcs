import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GuidanceTooltipProps {
  children: React.ReactNode
  title: string
  description: string
  position?: "top" | "bottom" | "left" | "right"
  id: string
}

export function GuidanceTooltip({ 
  children, 
  title, 
  description, 
  position = "top",
  id 
}: GuidanceTooltipProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if this tooltip was previously dismissed
    return localStorage.getItem(`tooltip-dismissed-${id}`) === "true"
  })
  const [isVisible, setIsVisible] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(`tooltip-dismissed-${id}`, "true")
  }

  const handleMouseEnter = () => {
    if (!isDismissed) {
      setIsVisible(true)
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const getTooltipClasses = () => {
    const base = "absolute z-50 w-64 p-3 bg-popover border border-border rounded-xl shadow-lg backdrop-blur-sm"
    
    switch (position) {
      case "top":
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
      case "bottom":
        return `${base} top-full left-1/2 transform -translate-x-1/2 mt-2`
      case "left":
        return `${base} right-full top-1/2 transform -translate-y-1/2 mr-2`
      case "right":
        return `${base} left-full top-1/2 transform -translate-y-1/2 ml-2`
      default:
        return `${base} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
    }
  }

  const getArrowClasses = () => {
    const base = "absolute w-3 h-3 bg-popover border transform rotate-45"
    
    switch (position) {
      case "top":
        return `${base} top-full left-1/2 -translate-x-1/2 -mt-1.5 border-r-0 border-b-0`
      case "bottom":
        return `${base} bottom-full left-1/2 -translate-x-1/2 -mb-1.5 border-l-0 border-t-0`
      case "left":
        return `${base} left-full top-1/2 -translate-y-1/2 -ml-1.5 border-t-0 border-r-0`
      case "right":
        return `${base} right-full top-1/2 -translate-y-1/2 -mr-1.5 border-b-0 border-l-0`
      default:
        return `${base} top-full left-1/2 -translate-x-1/2 -mt-1.5 border-r-0 border-b-0`
    }
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === "top" ? 10 : -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={getTooltipClasses()}
          >
            {/* Arrow */}
            <div className={getArrowClasses()} />
            
            {/* Content */}
            <div className="relative">
              <div className="flex items-start gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-woices-violet mt-0.5 flex-shrink-0" />
                <h4 className="font-medium text-sm text-foreground">{title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-4 w-4 p-0 ml-auto hover:bg-muted/50"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}