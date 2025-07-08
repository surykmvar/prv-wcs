import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useSupabase } from "@/hooks/useSupabase"
import { VoiceRecorder } from "@/components/VoiceRecorder"

type Thought = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  created_at: string
  expires_at: string
  voice_responses?: { id: string }[]
}

interface RandomThoughtRecorderProps {
  onBack: () => void
  onSuccess?: () => void
}

export function RandomThoughtRecorder({ onBack, onSuccess }: RandomThoughtRecorderProps) {
  const [thought, setThought] = useState<Thought | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRecorder, setShowRecorder] = useState(false)
  const { getThoughts } = useSupabase()

  const loadRandomThought = async () => {
    try {
      setLoading(true)
      const data = await getThoughts()
      
      if (data && data.length > 0) {
        // Get a random thought
        const randomIndex = Math.floor(Math.random() * data.length)
        setThought(data[randomIndex])
      }
    } catch (error) {
      console.error('Failed to load random thought:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRandomThought()
  }, [])

  const handleStartRecording = () => {
    setShowRecorder(true)
  }

  const handleRecordingSuccess = () => {
    setShowRecorder(false)
    onSuccess?.()
    onBack()
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Finding a thought for you...</p>
        </div>
      </div>
    )
  }

  if (!thought) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No active thoughts yet. Create one first!
          </p>
        </div>
      </div>
    )
  }

  if (showRecorder) {
    return (
      <VoiceRecorder
        thoughtId={thought.id}
        onClose={() => setShowRecorder(false)}
        onSuccess={handleRecordingSuccess}
      />
    )
  }

  const responseCount = thought.voice_responses?.length || 0
  const timeLeft = new Date(thought.expires_at).getTime() - Date.now()
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Break the Ice</h2>
      </div>

      <Card className="p-4 sm:p-6 mb-6">
        <CardHeader className="p-0 mb-4">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg sm:text-xl font-semibold leading-tight">
              {thought.title}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
              <Clock className="w-4 h-4" />
              {hoursLeft}h left
            </div>
          </div>
          
          {thought.description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
              {thought.description}
            </p>
          )}
          
          {thought.tags && thought.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {thought.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="text-xs text-muted-foreground mb-4">
            Posted {formatDistanceToNow(new Date(thought.created_at), { addSuffix: true })} • {responseCount} voice{responseCount === 1 ? '' : 's'}
          </div>
          
          <div className="text-center">
            <Button
              onClick={handleStartRecording}
              className="w-full sm:w-auto px-8 py-3 text-lg bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white rounded-xl shadow-md"
            >
              Record Your 60-Second Woice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}