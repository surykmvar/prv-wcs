
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Mic } from "lucide-react"
import { WriteNoteDialog } from "@/components/WriteNoteDialog"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { SmartThoughtInput } from "@/components/SmartThoughtInput"
import { GuidanceTooltip } from "@/components/GuidanceTooltip"
import { LiveTrendingBanner } from "@/components/LiveTrendingBanner"
import { useAuth } from "@/hooks/useAuth"
import { useTrendingThoughts } from "@/hooks/useTrendingThoughts"
import { motion } from "framer-motion"
import { SparkleField } from "@/components/SparkleField"

export function MainActions() {
  const [showWriteNote, setShowWriteNote] = useState(false)
  const [recordingTrendingTopicId, setRecordingTrendingTopicId] = useState<string | null>(null)
  const [materializedThoughtId, setMaterializedThoughtId] = useState<string | null>(null)
  const [thoughtInputTitle, setThoughtInputTitle] = useState<string>("")
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { materializeTrendingTopic } = useTrendingThoughts()

  // Reset state when navigating back to home page
  useEffect(() => {
    console.log('MainActions route changed:', location.pathname); // Debug log
    if (location.pathname === '/') {
      setShowWriteNote(false)
      setRecordingTrendingTopicId(null)
      setMaterializedThoughtId(null)
      setThoughtInputTitle("")
    }
  }, [location.pathname])

  const handleOpenAuth = () => {
    navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?trending=true')}`)
  }

  const handleStartRecording = async (trendingTopicId: string) => {
    if (!user) {
      handleOpenAuth()
      return
    }

    try {
      // Materialize the trending topic into a real thought
      const thoughtId = await materializeTrendingTopic(trendingTopicId, user.id)
      if (thoughtId) {
        setMaterializedThoughtId(thoughtId)
        setRecordingTrendingTopicId(trendingTopicId)
      }
    } catch (error) {
      console.error('Error materializing trending topic:', error)
    }
  }

  const handleRecordingSuccess = () => {
    setRecordingTrendingTopicId(null)
    setMaterializedThoughtId(null)
    // Navigate to feed to see the new post
    navigate('/feed')
  }

  const handleRecordingClose = () => {
    setRecordingTrendingTopicId(null)
    setMaterializedThoughtId(null)
  }

  const handleThoughtInputFocus = () => {
    if (!user) {
      navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=write')}`)
    } else {
      setShowWriteNote(true)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto flex flex-col gap-6 mt-4 sm:mt-8">
      <div className="text-center mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent leading-tight">
          Share your voice, shape conversations
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Ask meaningful questions or reply with thoughtful 60-second voices
        </p>
      </div>

      {/* Live Trending Banner */}
      <LiveTrendingBanner 
        onOpenAuth={handleOpenAuth}
        onStartRecording={handleStartRecording}
      />

      {/* Main Action Bar */}
      <div className="relative">
        <SparkleField className="hidden sm:block absolute inset-0 -z-10 opacity-60" density={18} />
        
        <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
          {/* Smart Thought Input */}
          <div className="flex-1">
            <GuidanceTooltip
              id="thought-input"
              title="Start a conversation"
              description="Share your thoughts, ask questions, or spark discussions. Your post will be seen by the community."
              position="top"
            >
              <SmartThoughtInput onFocus={handleThoughtInputFocus} />
            </GuidanceTooltip>
          </div>

          {/* Voice Recording Button */}
          <GuidanceTooltip
            id="voice-record"
            title="Record your voice"
            description="Browse trending topics and reply with 60-second voice recordings. Perfect for thoughtful responses."
            position="top"
          >
            <motion.button
              onClick={() => navigate('/feed')}
              className="group relative w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-5 h-5 text-foreground/80" />
              
              {/* Pulse rings */}
              <span className="ring-pulse r1" />
              <span className="ring-pulse r2" />
              <span className="ring-pulse r3" />
            </motion.button>
          </GuidanceTooltip>
        </div>
      </div>

      {/* Helper text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          🎤 Click the mic to browse trending topics • ✍️ Click the input to ask a question
        </p>
      </div>

      <WriteNoteDialog 
        open={showWriteNote} 
        onOpenChange={setShowWriteNote}
        initialTitle={thoughtInputTitle}
      />

      {recordingTrendingTopicId && materializedThoughtId && (
        <VoiceRecorder
          thoughtId={materializedThoughtId}
          onClose={handleRecordingClose}
          onSuccess={handleRecordingSuccess}
        />
      )}
    </div>
  )
}
