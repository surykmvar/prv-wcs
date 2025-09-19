
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Mic, MessageSquare } from "lucide-react"
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
      // Allow guests to navigate to feed without forcing auth
      navigate('/feed')
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
      // Allow guests to navigate to feed to see content
      navigate('/feed')
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
        
        <div className="flex justify-center">
          <GuidanceTooltip
            id="thought-input"
            title="Start a conversation or record voice"
            description="Click the text area to ask a question or click the mic button to browse trending topics and record voice responses."
            position="top"
          >
            <SmartThoughtInput 
              onFocus={handleThoughtInputFocus}
              onMicClick={() => navigate('/feed')}
            />
          </GuidanceTooltip>
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-8 max-w-lg mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ask Questions Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-lg border border-border/40 p-4 hover:bg-card/70 hover:backdrop-blur-xl hover:border-border/70 hover:ring-2 hover:ring-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors duration-300">
                <MessageSquare className="w-4 h-4 text-primary strokeWidth-2.5" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm mb-1">Ask Questions</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Click the text field to ask interesting thoughts or questions</p>
              </div>
            </div>
          </div>

          {/* Voice Replies Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-lg border border-border/40 p-4 hover:bg-card/70 hover:backdrop-blur-xl hover:border-border/70 hover:ring-2 hover:ring-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm mb-1">Voice Replies</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Click the mic to give voice replies on trending topics</p>
              </div>
            </div>
          </div>
        </div>
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
