import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mic, Clock, MessageCircle } from "lucide-react"
import { formatTimeAgo } from "@/utils/timeUtils"
import { useSupabase } from "@/hooks/useSupabase"
import { useUserSession } from "@/hooks/useUserSession"
import { useState, useEffect } from "react"
import { flagEmojiFromCountryCode } from "@/utils/locale"

type Thought = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  created_at: string
  expires_at: string
  max_woices_allowed?: number
  voice_responses?: { id: string }[]
  thought_scope: string
  country_code: string | null
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
  const { userSession } = useUserSession()
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
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
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
        <div className="mt-2 text-xs text-muted-foreground">
          Posted for: {thought.thought_scope === 'regional' ? `${flagEmojiFromCountryCode(thought.country_code)} ${thought.country_code || ''}` : '🌍 Global'}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            {responseCount}/{maxWoices} voice{responseCount === 1 ? '' : 's'}
          </div>
          
          {isMaxReached ? (
            <div className="text-center text-sm text-green-600 font-medium bg-green-50 px-4 py-2 rounded-xl">
              🎉 This Thought has received all its reviews!
            </div>
          ) : !canSubmit ? (
            <Button
              disabled
              className="w-full sm:w-auto bg-muted text-muted-foreground rounded-xl px-4 py-2 cursor-not-allowed"
            >
              <Mic className="w-4 h-4 mr-2" />
              {submitMessage || "Already responded"}
            </Button>
          ) : (
            <Button
              onClick={() => onRecordResponse(thought.id)}
              className="w-full sm:w-auto bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white rounded-xl px-4 py-2"
            >
              <Mic className="w-4 h-4 mr-2" />
              Record Woice
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Posted {formatTimeAgo(thought.created_at)}
        </div>
      </CardContent>
    </Card>
  )
}