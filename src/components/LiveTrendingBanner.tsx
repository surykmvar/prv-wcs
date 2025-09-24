import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, ChevronDown } from "lucide-react"
import { TrendingThoughtDropdown } from "@/components/TrendingThoughtDropdown"
import { useTrendingThoughts } from "@/hooks/useTrendingThoughts"

interface LiveTrendingBannerProps {
  onOpenAuth: () => void
  onStartRecording: (trendingTopicId: string) => void
}

export function LiveTrendingBanner({ onOpenAuth, onStartRecording }: LiveTrendingBannerProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const { currentTopic, loading } = useTrendingThoughts()

  if (loading || !currentTopic) {
    return null
  }

  return (
    <div className="relative mb-4 max-w-3xl mx-auto px-4">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="group w-full h-11 px-3 py-2 bg-card/70 border border-woices-violet/20 rounded-xl hover:bg-card/80 transition-all duration-300 ease-out cursor-pointer"
      >
        <div 
          className="flex items-center justify-between h-full w-full cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-woices-violet to-woices-mint flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-2.5 h-2.5 text-white" />
            </div>
            
            <div className="text-left min-w-0 flex-1">
              <div className="text-xs font-medium text-woices-violet">
                🔥 Trending Topics
              </div>
            </div>
          </div>
          
          <motion.div 
            className="text-muted-foreground group-hover:text-foreground flex-shrink-0 ml-2 cursor-pointer"
            animate={{ rotate: showDropdown ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </div>
      </button>

      <TrendingThoughtDropdown
        isOpen={showDropdown}
        onClose={() => setShowDropdown(false)}
        onOpenAuth={onOpenAuth}
        onStartRecording={onStartRecording}
      />
    </div>
  )
}