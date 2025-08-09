
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Plus } from "lucide-react"
import { WriteNoteDialog } from "@/components/WriteNoteDialog"

import { RandomThoughtRecorder } from "@/components/RandomThoughtRecorder"
import { useSupabase } from "@/hooks/useSupabase"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto flex flex-col gap-6 mt-6 sm:mt-8 md:mt-10">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">
          What would you like to share?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Post a thought or speak on someone else's. One voice at a time.
        </p>
      </div>

      <Card className="p-4 sm:p-5 rounded-xl animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-medium">
            {(user?.email?.charAt(0)?.toUpperCase() || 'U')}
          </div>
          <button
            type="button"
            className="flex-1 text-left bg-muted/50 hover:bg-muted/70 rounded-xl px-4 py-3 text-sm text-muted-foreground"
            onClick={() => {
              if (!user) {
                navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=write')}`)
              } else {
                setShowWriteNote(true)
              }
            }}
          >
            What's happening?
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="pl-14 text-xs text-muted-foreground">Share a 60s Woice or a quick thought</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!user) {
                  navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=write')}`)
                } else {
                  setShowWriteNote(true)
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Write
            </Button>
            <Button
              onClick={() => {
                if (!user) {
                  navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=record')}`)
                } else {
                  setShowRandomRecorder(true)
                }
              }}
            >
              <Mic className="h-4 w-4 mr-2" /> Record
            </Button>
          </div>
        </div>
      </Card>

      <WriteNoteDialog 
        open={showWriteNote} 
        onOpenChange={setShowWriteNote}
      />
    </div>
  )
}
