
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Plus } from "lucide-react"
import { WriteNoteDialog } from "@/components/WriteNoteDialog"
import { RandomThoughtRecorder } from "@/components/RandomThoughtRecorder"

export function MainActions() {
  const [showWriteNote, setShowWriteNote] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)
  const navigate = useNavigate()

  const handleBreakTheIce = () => {
    setShowRecorder(true)
  }

  const handleRecorderSuccess = () => {
    setShowRecorder(false)
  }

  if (showRecorder) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <RandomThoughtRecorder 
          onBack={() => setShowRecorder(false)}
          onSuccess={handleRecorderSuccess}
        />
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
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
              onClick={handleBreakTheIce}>
          <CardHeader className="text-center pb-4 p-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-br from-woices-violet to-woices-bloom rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold">Break the ice. Speak your Woice.</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Post a random 60-second voice thought to the community.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-woices-mint/20 cursor-pointer p-4 sm:p-6 rounded-xl" 
              onClick={() => navigate('/break-the-ice')}>
          <CardHeader className="text-center pb-4 p-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gradient-to-br from-woices-mint to-woices-sky rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold">Browse & Reply to Thoughts</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Discover thoughts and reply with your 60-second voice.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-woices-mint/20 cursor-pointer p-4 sm:p-6 rounded-xl mb-6 sm:mb-8" 
            onClick={() => setShowWriteNote(true)}>
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

      <WriteNoteDialog 
        open={showWriteNote} 
        onOpenChange={setShowWriteNote}
      />
    </div>
  )
}
