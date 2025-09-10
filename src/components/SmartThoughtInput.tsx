import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
    <TooltipProvider>
      <div className={cn("relative w-full max-w-4xl mx-auto", className)}>
        {/* Enhanced ambient glow background */}
        <motion.div
          className="absolute -inset-6 rounded-3xl pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(200px 200px at 25% 25%, hsl(var(--primary) / 0.12), transparent 70%), radial-gradient(200px 200px at 75% 75%, hsl(var(--accent) / 0.1), transparent 70%)',
            filter: 'blur(40px)'
          }}
          animate={{ 
            x: [0, 10, 0, -10, 0], 
            y: [0, -8, 0, 8, 0],
            rotate: [0, 1, 0, -1, 0]
          }}
          transition={{ duration: 15, ease: "easeInOut", repeat: Infinity }}
          aria-hidden
        />
        
        {/* Subtle ring glow */}
        <motion.div
          className="absolute -inset-1 rounded-3xl pointer-events-none -z-10 opacity-60"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.15))',
            filter: 'blur(8px)'
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          aria-hidden
        />
        
        <div className="relative flex items-center h-20 gap-3">
          {/* Main input button - enhanced */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleFocus}
                className="group relative flex-1 h-full pl-14 pr-6 bg-card/90 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-primary/5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 ease-out overflow-hidden"
                aria-label="Ask a question or share a thought"
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Chevron icon - enhanced */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    <ChevronRight className="w-5 h-5 text-muted-foreground/70 group-hover:text-primary/80 transition-all duration-300 group-hover:translate-x-0.5" />
                    <div className="absolute inset-0 w-5 h-5 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                  </div>
                </div>
                
                {/* Content container */}
                <div className="relative flex items-center h-full">
                  <div className="flex-1 text-left">
                    <AnimatePresence mode="wait">
                      {isVisible && (
                        <motion.div
                          key={currentSuggestion}
                          initial={{ opacity: 0, y: 25, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -25, filter: "blur(4px)" }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="text-muted-foreground/90 text-base sm:text-lg font-medium leading-relaxed tracking-wide"
                        >
                          {thoughtSuggestions[currentSuggestion]}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!isVisible && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-muted-foreground/90 text-base sm:text-lg font-medium"
                      >
                        What's your thought or question?
                      </motion.div>
                    )}
                  </div>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-card/95 backdrop-blur-sm border border-border/50">
              <p className="font-medium">Share your thoughts or ask an interesting question</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Mic button - enhanced */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onMicClick}
                className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/90 to-primary shadow-lg hover:shadow-2xl hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center z-10 group overflow-hidden"
                aria-label="Record voice response"
              >
                {/* Animated background pulse */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-foreground/10 to-transparent"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                />
                
                {/* Mic icon */}
                <Mic className="w-6 h-6 text-primary-foreground drop-shadow-sm group-hover:scale-110 group-active:scale-90 transition-transform duration-200" />
                
                {/* Subtle shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-card/95 backdrop-blur-sm border border-border/50">
              <p className="font-medium">Record voice reply to trending topics</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}