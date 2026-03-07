
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Mic, MessageSquare } from "lucide-react"
import { WriteNoteDialog } from "@/components/WriteNoteDialog"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { SmartThoughtInput } from "@/components/SmartThoughtInput"
import { GooeyText } from "@/components/ui/gooey-text-morphing"
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
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
          What's on your voice?
        </h1>
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
          <SmartThoughtInput 
            onFocus={handleThoughtInputFocus}
            onMicClick={() => navigate('/feed')}
          />
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
