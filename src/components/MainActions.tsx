
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Plus } from "lucide-react"
import { WriteNoteDialog } from "@/components/WriteNoteDialog"
import { ReplyToThoughtCard } from "@/components/ReplyToThoughtCard"

export function MainActions() {
  const [showWriteNote, setShowWriteNote] = useState(false)
  const [showReplyToThought, setShowReplyToThought] = useState(false)

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
          What would you like to do with your voice?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Post a thought or speak on someone else's. One voice at a time.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-woices-violet/20 cursor-pointer" 
              onClick={() => setShowReplyToThought(true)}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-woices-violet to-woices-bloom rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Break the ice. Speak your Woice.</CardTitle>
            <CardDescription className="text-base">
              Reply with your 60-second voice to a thought that matters.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-woices-mint/20 cursor-pointer" 
              onClick={() => setShowWriteNote(true)}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-woices-mint to-woices-sky rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Write a thought or topic</CardTitle>
            <CardDescription className="text-base">
              Ask for honest 60-second voice replies from Humans.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <WriteNoteDialog open={showWriteNote} onOpenChange={setShowWriteNote} />
      
      {showReplyToThought && (
        <ReplyToThoughtCard onClose={() => setShowReplyToThought(false)} />
      )}
    </div>
  )
}
