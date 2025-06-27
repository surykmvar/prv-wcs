
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Clock, Flower, Square } from "lucide-react"
import { VoiceRecorder } from "@/components/VoiceRecorder"

interface ReplyToThoughtCardProps {
  onClose: () => void
}

// Mock data for demonstration
const mockNote = {
  id: "1",
  username: "Anonymous",
  timestamp: "Posted 1 hour ago",
  title: "Should I quit my corporate job to start my own business?",
  description: "I've been working at a tech company for 5 years, but I have this burning idea for a startup. The stability is nice, but I feel like I'm not living up to my potential. What would you do?",
  tags: ["career", "startup", "decisions"],
  status: "active" as "active" | "bloomed" | "bricked",
  timeLeft: "47 hours"
}

export function ReplyToThoughtCard({ onClose }: ReplyToThoughtCardProps) {
  const [noteStatus, setNoteStatus] = useState<"active" | "bloomed" | "bricked">(mockNote.status)
  const [showRecorder, setShowRecorder] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleBrick()
    }
    if (isRightSwipe) {
      handleBloom()
    }
  }

  const handleBloom = () => {
    setNoteStatus("bloomed")
    console.log("Note bloomed! 🌸")
  }

  const handleBrick = () => {
    setNoteStatus("bricked")
    console.log("Note bricked! 🧱")
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reply to a Thought</h2>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <Card 
        className={`mb-6 transition-all duration-500 select-none ${
          noteStatus === "bloomed" 
            ? "border-woices-bloom shadow-lg animate-bloom bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20" 
            : noteStatus === "bricked"
            ? "border-woices-brick opacity-50 animate-brick bg-gray-50 dark:bg-gray-900/50"
            : "hover:shadow-md border-2"
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{mockNote.username}</span>
                <span className="text-muted-foreground text-sm">{mockNote.timestamp}</span>
                {noteStatus === "bloomed" && <Flower className="w-4 h-4 text-woices-bloom" />}
                {noteStatus === "bricked" && <Square className="w-4 h-4 text-woices-brick" />}
              </div>
              <CardTitle className="text-xl mb-2">{mockNote.title}</CardTitle>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {mockNote.timeLeft} left
            </Badge>
          </div>
          <CardDescription className="text-base">
            {mockNote.description}
          </CardDescription>
          <div className="flex flex-wrap gap-2 mt-3">
            {mockNote.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="text-center mb-4">
        <p className="text-muted-foreground">
          Swipe right to Bloom 🌸 • Swipe left to Brick 🧱
        </p>
      </div>

      {noteStatus !== "bricked" && (
        <>
          {!showRecorder ? (
            <Card className="text-center">
              <CardContent className="pt-6">
                <Button
                  onClick={() => setShowRecorder(true)}
                  className="bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white px-8 py-3 text-lg font-medium"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording Your Woice
                </Button>
                <p className="text-muted-foreground mt-2">
                  Share your honest thoughts in 60 seconds
                </p>
              </CardContent>
            </Card>
          ) : (
            <VoiceRecorder onClose={() => setShowRecorder(false)} />
          )}
        </>
      )}
    </div>
  )
}
