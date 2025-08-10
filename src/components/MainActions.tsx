
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Mic, Plus } from "lucide-react"
import { WriteNoteDialog } from "@/components/WriteNoteDialog"
import { RandomThoughtRecorder } from "@/components/RandomThoughtRecorder"
import { useAuth } from "@/hooks/useAuth"

export function MainActions() {
  const [showWriteNote, setShowWriteNote] = useState(false)
  const [showRandomRecorder, setShowRandomRecorder] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Reset state when navigating back to home page
  useEffect(() => {
    console.log('MainActions route changed:', location.pathname); // Debug log
    if (location.pathname === '/') {
      setShowRandomRecorder(false)
      setShowWriteNote(false)
    }
  }, [location.pathname])

  const handleRandomRecorderSuccess = () => {
    setShowRandomRecorder(false)
  }

  const handleBack = () => {
    setShowRandomRecorder(false)
  }

  // Show random thought recorder when "Break the ice" is clicked
  if (showRandomRecorder) {
    return (
      <div className="panel p-3 sm:p-6 relative z-10">
        <RandomThoughtRecorder
          onBack={handleBack}
          onSuccess={handleRandomRecorderSuccess}
        />
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto flex flex-col gap-6 mt-6 sm:mt-8 md:mt-10">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent leading-tight sm:leading-tight md:leading-tight lg:leading-tight px-2 py-2">
          What would you like to do with your voice?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Post a thought or speak on someone else's. One voice at a time.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 sm:mb-10">
        <button
          type="button"
          onClick={() => {
            if (!user) {
              navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=record')}`)
            } else {
              setShowRandomRecorder(true)
            }
          }}
          className="group flex flex-col items-center text-center rounded-2xl p-4 bg-card/90 border border-border hover:shadow-lg transition-all"
          aria-label="Break the ice and record a 60 second voice reply"
        >
          <div className="relative sparkle-wrapper">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-woices-violet to-woices-bloom flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span aria-hidden className="sparkle-dot sparkle-1" />
            <span aria-hidden className="sparkle-dot sparkle-2" />
          </div>
          <h3 className="mt-3 text-base sm:text-lg font-semibold">Break the ice. Speak your Woice.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Reply with your 60 second voice to a thought that matters.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!user) {
              navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=write')}`)
            } else {
              setShowWriteNote(true)
            }
          }}
          className="group flex flex-col items-center text-center rounded-2xl p-4 bg-card/90 border border-border hover:shadow-lg transition-all"
          aria-label="Write a thought or topic"
        >
          <div className="relative sparkle-wrapper">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-woices-mint to-woices-sky flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span aria-hidden className="sparkle-dot sparkle-1" />
            <span aria-hidden className="sparkle-dot sparkle-2" />
          </div>
          <h3 className="mt-3 text-base sm:text-lg font-semibold">Write a thought or topic</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask for honest 60 second voice replies from Humans.
          </p>
        </button>
      </div>

      <WriteNoteDialog 
        open={showWriteNote} 
        onOpenChange={setShowWriteNote}
      />
    </div>
  )
}
