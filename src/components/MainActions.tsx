
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { WriteNoteDialog } from "@/components/WriteNoteDialog"
import { SmartThoughtInput } from "@/components/SmartThoughtInput"
import { GooeyText } from "@/components/ui/gooey-text-morphing"
import { useAuth } from "@/hooks/useAuth"

export function MainActions() {
  const [showWriteNote, setShowWriteNote] = useState(false)
  const [thoughtInputTitle, setThoughtInputTitle] = useState<string>("")
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (location.pathname === '/') {
      setShowWriteNote(false)
      setThoughtInputTitle("")
    }
  }, [location.pathname])

  const handleThoughtInputFocus = () => {
    if (!user) {
      navigate('/feed')
    } else {
      setShowWriteNote(true)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto flex flex-col gap-6 mt-4 sm:mt-8">
      {/* Gooey Text Morphing */}
      <div className="flex items-center justify-center h-16 w-full mb-2">
        <GooeyText
          texts={["Talk Engineering", "Ditch AI Slop", "Review Nearby Spots", "Expose Fake News", "Debate Bold Ideas"]}
          morphTime={1.5}
          cooldownTime={0.5}
          className="w-full"
          textClassName="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground"
        />
      </div>

      {/* Main Action Bar */}
      <div className="relative">
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
    </div>
  )
}
