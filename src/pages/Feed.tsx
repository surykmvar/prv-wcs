import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Header } from "@/components/Header"
import { RandomThoughtRecorder } from "@/components/RandomThoughtRecorder"
import { TrendingThoughtDropdown } from "@/components/TrendingThoughtDropdown"
import { VoiceRecorder } from "@/components/VoiceRecorder"

const Feed = () => {
  const navigate = useNavigate()
  const [showTrendingDropdown, setShowTrendingDropdown] = useState(true)
  const [recordingThoughtId, setRecordingThoughtId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRecordingSuccess = () => {
    setRecordingThoughtId(null)
    // Trigger a refresh of the RandomThoughtRecorder
    setRefreshKey(prev => prev + 1)
  }

  const handleStartRecording = (thoughtId: string) => {
    setRecordingThoughtId(thoughtId)
  }

  if (recordingThoughtId) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background font-inter">
        <Helmet>
          <title>Record Voice Reply | Woices</title>
          <meta name="description" content="Record your 60-second voice reply to trending topics." />
          <link rel="canonical" href="/feed" />
        </Helmet>

        <div className="hidden sm:block absolute inset-0 -z-10 pointer-events-none starry-surface" aria-hidden />

        <div className="relative">
          <Header />
          <main className="py-4 sm:py-8 md:py-12 pt-20 sm:pt-24 md:pt-28">
            <div className="w-full max-w-6xl mx-auto px-3 sm:px-6">
              <VoiceRecorder 
                thoughtId={recordingThoughtId} 
                onClose={() => setRecordingThoughtId(null)}
                onSuccess={handleRecordingSuccess}
              />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background font-inter">
      <Helmet>
        <title>Break the Ice Feed | Woices</title>
        <meta name="description" content="Break the Ice voice feed – record and listen to 60-second Woice replies." />
        <link rel="canonical" href="/feed" />
      </Helmet>

      <div className="hidden sm:block absolute inset-0 -z-10 pointer-events-none starry-surface" aria-hidden />

      <div className="relative">
        <Header />
        <main className="py-4 sm:py-8 md:py-12 pt-20 sm:pt-24 md:pt-28">
          <h1 className="sr-only">Break the Ice – Voice Feed</h1>
          <div className="w-full max-w-6xl mx-auto px-3 sm:px-6">
            {/* Trending Thoughts Header Section */}
            {showTrendingDropdown && (
              <div className="mb-8">
                <TrendingThoughtDropdown 
                  isOpen={true}
                  onStartRecording={handleStartRecording}
                  onClose={() => setShowTrendingDropdown(false)}
                  onOpenAuth={() => navigate('/auth?mode=signup&redirect=' + encodeURIComponent('/feed'))}
                />
              </div>
            )}
            
            {/* Random Thought Recorder */}
            <RandomThoughtRecorder 
              key={refreshKey}
              onBack={() => navigate(-1)} 
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Feed