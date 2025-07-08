import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Clock, MessageCircle, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useSupabase } from "@/hooks/useSupabase"

type Thought = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  created_at: string
  expires_at: string
  voice_responses?: { id: string }[]
}

interface ThoughtSelectorProps {
  onSelectThought: (thoughtId: string) => void
  onBack: () => void
}

export function ThoughtSelector({ onSelectThought, onBack }: ThoughtSelectorProps) {
  const [thoughts, setThoughts] = useState<Thought[]>([])
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Choose a Thought to Respond To</h2>
      </div>

      {thoughts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No active thoughts yet. Create one first!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {thoughts.map((thought) => {
            const responseCount = thought.voice_responses?.length || 0
            const timeLeft = new Date(thought.expires_at).getTime() - Date.now()
            const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))

            return (
              <Card 
                key={thought.id} 
                className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-woices-violet/20"
                onClick={() => onSelectThought(thought.id)}
              >
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      {responseCount} voice{responseCount === 1 ? '' : 's'}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-woices-violet">
                      <Mic className="w-4 h-4" />
                      Click to record response
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    Posted {formatDistanceToNow(new Date(thought.created_at), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}