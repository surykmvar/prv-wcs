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
    <div className="relative mb-6">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="group w-full px-4 py-3 bg-gradient-to-r from-woices-violet/10 to-woices-mint/10 border border-woices-violet/20 rounded-xl hover:from-woices-violet/15 hover:to-woices-mint/15 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-woices-violet to-woices-mint flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            
            <div className="text-left">
              <div className="text-xs font-medium text-woices-violet mb-1">
                🔥 Live Trending
              </div>
              <div className="text-sm text-foreground font-medium line-clamp-1">
                {currentTopic.title}
              </div>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: showDropdown ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground group-hover:text-foreground"
          >
            <ChevronDown className="w-4 h-4" />
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