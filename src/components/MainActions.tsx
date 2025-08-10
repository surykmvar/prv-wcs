
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Mic, Plus, Star } from "lucide-react"
import { WriteNoteDialog } from "@/components/WriteNoteDialog"
import { RandomThoughtRecorder } from "@/components/RandomThoughtRecorder"
import { useAuth } from "@/hooks/useAuth"

export function MainActions() {
  const [showWriteNote, setShowWriteNote] = useState(false)
  const [showRandomRecorder, setShowRandomRecorder] = useState(false)
  const [splash, setSplash] = useState<null | 'record' | 'write'>(null)
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 sm:mb-10 items-stretch justify-items-center">
        <button
          type="button"
          onClick={() => {
            if (!user) {
              navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=record')}`)
            } else {
              const isLarge = typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches
              if (isLarge) {
                setSplash('record')
                setTimeout(() => {
                  setShowRandomRecorder(true)
                  setSplash(null)
                }, 280)
              } else {
                setShowRandomRecorder(true)
              }
            }
          }}
          className="group relative flex w-full max-w-sm flex-col items-center text-center rounded-2xl p-4 bg-card/90 starry-surface border border-border hover:shadow-lg transition-all"
          aria-label="Break the ice and record a 60 second voice reply"
        >
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-woices-violet to-woices-bloom flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            {/* Ambient stars */}
            <Star size={12} className="ambient-star cs1 text-woices-bloom" />
            <Star size={12} className="ambient-star cs2 text-woices-violet" />
            <Star size={12} className="ambient-star cs3 text-woices-sky" />
            <Star size={12} className="ambient-star cs4 text-woices-mint" />
            <Star size={12} className="ambient-star cs5 text-woices-bloom" />
            <Star size={12} className="ambient-star cs6 text-woices-sky" />
          </div>

          {splash === 'record' && (
            <div className="star-splash">
              <Star className="splash-star i1 text-woices-violet" />
              <Star className="splash-star i2 text-woices-bloom" />
              <Star className="splash-star i3 text-woices-sky" />
              <Star className="splash-star i4 text-woices-mint" />
              <Star className="splash-star i5 text-woices-bloom" />
              <Star className="splash-star i6 text-woices-violet" />
              <Star className="splash-star i7 text-woices-sky" />
              <Star className="splash-star i8 text-woices-mint" />
            </div>
          )}

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
              const isLarge = typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches
              if (isLarge) {
                setSplash('write')
                setTimeout(() => {
                  setShowWriteNote(true)
                  setSplash(null)
                }, 280)
              } else {
                setShowWriteNote(true)
              }
            }
          }}
          className="group relative flex w-full max-w-sm flex-col items-center text-center rounded-2xl p-4 bg-card/90 starry-surface border border-border hover:shadow-lg transition-all"
          aria-label="Write a thought or topic"
        >
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-woices-mint to-woices-sky flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            {/* Ambient stars */}
            <Star size={12} className="ambient-star cs1 text-woices-sky" />
            <Star size={12} className="ambient-star cs2 text-woices-mint" />
            <Star size={12} className="ambient-star cs3 text-woices-bloom" />
            <Star size={12} className="ambient-star cs4 text-woices-violet" />
            <Star size={12} className="ambient-star cs5 text-woices-sky" />
            <Star size={12} className="ambient-star cs6 text-woices-mint" />
          </div>

          {splash === 'write' && (
            <div className="star-splash">
              <Star className="splash-star i1 text-woices-mint" />
              <Star className="splash-star i2 text-woices-sky" />
              <Star className="splash-star i3 text-woices-bloom" />
              <Star className="splash-star i4 text-woices-violet" />
              <Star className="splash-star i5 text-woices-sky" />
              <Star className="splash-star i6 text-woices-mint" />
              <Star className="splash-star i7 text-woices-bloom" />
              <Star className="splash-star i8 text-woices-violet" />
            </div>
          )}

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
