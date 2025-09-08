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
    <div className="relative mb-4 max-w-3xl mx-auto">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="group w-full px-3 py-2 bg-card/70 border border-woices-violet/20 rounded-xl hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-woices-violet to-woices-mint flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-white" />
            </div>
            
            <div className="text-left">
              <div className="text-xs font-medium text-woices-violet">
                🔥 Live Trending
              </div>
              <div className="text-xs text-foreground font-medium line-clamp-1">
                {currentTopic.title}
              </div>
            </div>
          </div>
          
          <div className="text-muted-foreground group-hover:text-foreground">
            <ChevronDown className="w-3 h-3" />
          </div>
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