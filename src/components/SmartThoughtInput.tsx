import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Mic } from "lucide-react"
import { cn } from "@/lib/utils"

interface SmartThoughtInputProps {
  onFocus: () => void
  onMicClick: () => void
  className?: string
}

const thoughtSuggestions = [
  "What's your biggest career challenge right now?",
  "Share a life lesson you learned the hard way",
  "What technology excites you most for the future?",
  "How do you stay motivated during tough times?",
  "What's a controversial opinion you hold?",
  "Describe your ideal work-life balance",
  "What skill would you master if you had unlimited time?",
  "Share your thoughts on remote vs office work",
  "What's the best advice you've ever received?",
  "How has your perspective on success changed?",
  "What's something you wish more people understood?",
  "Describe a moment that changed your worldview",
  "What's your take on social media's impact?",
  "Share a creative idea you've been thinking about",
  "What's the most important quality in a leader?"
]

export function SmartThoughtInput({ onFocus, onMicClick, className }: SmartThoughtInputProps) {
  const [currentSuggestion, setCurrentSuggestion] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Cycle through suggestions every 3 seconds
    intervalRef.current = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % thoughtSuggestions.length)
    }, 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleFocus = () => {
    setIsVisible(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    onFocus()
  }

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <div className="relative flex items-center">
        {/* Chevron left icon */}
        <div className="absolute left-4 z-10">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </div>
        
        {/* Main input button */}
        <button
          onClick={handleFocus}
          className="group relative w-full h-14 pl-12 pr-16 bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          aria-label="Ask a question or share a thought"
        >
          {/* Background gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-woices-violet/5 to-woices-mint/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content container */}
          <div className="relative flex items-center h-full">
            <div className="flex-1 text-left">
              <AnimatePresence mode="wait">
                {isVisible && (
                  <motion.div
                    key={currentSuggestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-muted-foreground text-sm sm:text-base leading-relaxed"
                  >
                    {thoughtSuggestions[currentSuggestion]}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!isVisible && (
                <div className="text-muted-foreground text-sm sm:text-base">
                  What's your thought or question?
                </div>
              )}
            </div>
          </div>
        </button>
        
        {/* Mic button */}
        <button
          onClick={onMicClick}
          className="absolute right-2 w-10 h-10 rounded-xl bg-card/80 backdrop-blur-sm border border-border shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center z-10"
          aria-label="Record voice response"
        >
          <Mic className="w-4 h-4 text-foreground/80" />
        </button>
      </div>
    </div>
  )
}