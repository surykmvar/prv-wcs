import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mic, Clock, MessageCircle, Users, CheckCircle2 } from "lucide-react"
import { formatTimeAgo } from "@/utils/timeUtils"
import { useSupabase } from "@/hooks/useSupabase"
import { useUserSession } from "@/hooks/useUserSession"
import { useState, useEffect } from "react"

type Thought = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  created_at: string
  expires_at: string
  max_woices_allowed?: number
  voice_responses?: { id: string }[]
}

interface ThoughtCardProps {
  thought: Thought
  onRecordResponse: (thoughtId: string) => void
}

export function ThoughtCard({ thought, onRecordResponse }: ThoughtCardProps) {
  const responseCount = thought.voice_responses?.length || 0
  const timeLeft = new Date(thought.expires_at).getTime() - Date.now()
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))
  const maxWoices = thought.max_woices_allowed || 10
  const isMaxReached = responseCount >= maxWoices
  
  const { canUserSubmitVoice } = useSupabase()
  const userSession = useUserSession()
  const [canSubmit, setCanSubmit] = useState(true)
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    if (userSession && !isMaxReached) {
      canUserSubmitVoice(thought.id, userSession).then(result => {
        setCanSubmit(result.canSubmit)
        setSubmitMessage(result.reason || "")
      })
    }
  }, [thought.id, userSession, responseCount, isMaxReached, canUserSubmitVoice])

  return (
    <Card className="rounded-2xl border-0 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all duration-300 bg-card overflow-hidden">
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start gap-4 mb-4">
          <CardTitle className="text-xl font-bold leading-tight text-card-foreground line-clamp-2">
            {thought.title}
          </CardTitle>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap bg-muted/50 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            {hoursLeft}h left
          </div>
        </div>
        
        {thought.description && (
          <p className="text-base text-muted-foreground leading-relaxed line-clamp-3">
            {thought.description}
          </p>
        )}
        
        {thought.tags && thought.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {thought.tags.map((tag) => (
              <Badge 
                key={tag} 
                className="px-3 py-1 text-sm rounded-full bg-tag text-tag-foreground border-0 font-medium"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{responseCount}</span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="font-medium">{maxWoices} max</span>
            </div>
          </div>
          
          {isMaxReached ? (
            <div className="flex items-center gap-2 text-sm font-medium text-woices-mint bg-woices-mint/10 px-4 py-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              All responses received!
            </div>
          ) : !canSubmit ? (
            <div className="text-sm font-medium text-woices-brick bg-woices-brick/10 px-4 py-2.5 rounded-xl">
              {submitMessage}
            </div>
          ) : (
            <Button
              onClick={() => onRecordResponse(thought.id)}
              className="bg-gradient-to-r from-woices-violet to-woices-bloom hover:opacity-90 text-white rounded-xl px-6 py-2.5 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <Mic className="w-4 h-4 mr-2" />
              🎙️ Record Your Woice Reply
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Posted {formatTimeAgo(thought.created_at)}
        </div>
      </CardContent>
    </Card>
  )
}