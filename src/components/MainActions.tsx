
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Plus } from "lucide-react"
import { WriteNoteDialog } from "@/components/WriteNoteDialog"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { RandomThoughtRecorder } from "@/components/RandomThoughtRecorder"
import { useSupabase } from "@/hooks/useSupabase"
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
      <RandomThoughtRecorder
        onBack={handleBack}
        onSuccess={handleRandomRecorderSuccess}
      />
    )
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto flex flex-col justify-center">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent leading-tight sm:leading-tight md:leading-tight lg:leading-tight px-2 py-2">
          What would you like to do with your voice?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Post a thought or speak on someone else's. One voice at a time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-woices-violet/20 cursor-pointer p-4 sm:p-6 rounded-xl" 
              onClick={() => {
                if (!user) {
                  navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=record')}`)
                } else {
                  setShowRandomRecorder(true)
                }
              }}>
          <CardHeader className="text-center pb-4 p-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-br from-woices-violet to-woices-bloom rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold">Break the ice. Speak your Woice.</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Reply with your 60-second voice to a thought that matters.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-woices-mint/20 cursor-pointer p-4 sm:p-6 rounded-xl" 
              onClick={() => {
                if (!user) {
                  navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=write')}`)
                } else {
                  setShowWriteNote(true)
                }
              }}>
          <CardHeader className="text-center pb-4 p-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-br from-woices-mint to-woices-sky rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold">Write a thought or topic</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Ask for honest 60-second voice replies from Humans.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <WriteNoteDialog 
        open={showWriteNote} 
        onOpenChange={setShowWriteNote}
      />
    </div>
  )
}
