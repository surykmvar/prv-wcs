import { useState, useEffect } from "react"
import { ThoughtCard } from "@/components/ThoughtCard"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { WelcomeModal } from "@/components/WelcomeModal"
import { useSupabase } from "@/hooks/useSupabase"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

type Thought = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  created_at: string
  expires_at: string
  voice_responses?: { id: string }[]
  thought_scope: string
  country_code: string | null
}

export function ThoughtsFeed() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [recordingThoughtId, setRecordingThoughtId] = useState<string | null>(null)
  const { getThoughts, loading } = useSupabase()

  const loadThoughts = async () => {
    try {
      const data = await getThoughts()
      setThoughts(data || [])
    } catch (error) {
      console.error('Failed to load thoughts:', error)
    }
  }

  useEffect(() => {
    loadThoughts()
  }, [])

  const handleRecordResponse = (thoughtId: string) => {
    setRecordingThoughtId(thoughtId)
  }

  const handleRecordingSuccess = () => {
    setRecordingThoughtId(null)
    loadThoughts() // Refresh the feed
  }

  if (recordingThoughtId) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <VoiceRecorder
          thoughtId={recordingThoughtId}
          onClose={() => setRecordingThoughtId(null)}
          onSuccess={handleRecordingSuccess}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <WelcomeModal />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Live Thoughts</h2>
        <Button
          variant="outline"
          onClick={loadThoughts}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {thoughts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No active thoughts yet. Be the first to post one!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {thoughts.map((thought) => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              onRecordResponse={handleRecordResponse}
            />
          ))}
        </div>
      )}
    </div>
  )
}