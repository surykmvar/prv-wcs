import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ArrowLeft, RefreshCw, ChevronDown, ChevronUp, Play, Bookmark, BookmarkCheck } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { ModernVoicePlayer } from "@/components/ModernVoicePlayer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { formatTimeAgo } from "@/utils/timeUtils"

type VoiceResponse = {
  id: string
  audio_url: string
  duration: number
  created_at: string
  myth_votes: number
  fact_votes: number
  unclear_votes: number
  reactions: Record<string, number> | any
}

type Thought = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  created_at: string
  expires_at: string
  final_status: string
  voice_responses?: VoiceResponse[]
}

interface RandomThoughtRecorderProps {
  onBack: () => void
  onSuccess?: () => void
}

export function RandomThoughtRecorder({ onBack, onSuccess }: RandomThoughtRecorderProps) {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)
  const [recordingThoughtId, setRecordingThoughtId] = useState<string | null>(null)
  const [expandedThoughts, setExpandedThoughts] = useState<Set<string>>(new Set())
  const [savedThoughts, setSavedThoughts] = useState<Set<string>>(new Set())
  const { getThoughts } = useSupabase()

  const loadThoughts = async () => {
    try {
      setLoading(true)
      const data = await getThoughts()
      setThoughts(data || [])
    } catch (error) {
      console.error('Failed to load thoughts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadThoughts()
    // Load saved thoughts from localStorage
    const saved = localStorage.getItem('savedThoughts')
    if (saved) {
      setSavedThoughts(new Set(JSON.parse(saved)))
    }
  }, [])

  const handleRefresh = () => {
    loadThoughts()
  }

  const handleStartRecording = (thoughtId: string) => {
    setRecordingThoughtId(thoughtId)
  }

  const handleRecordingSuccess = () => {
    setRecordingThoughtId(null)
    loadThoughts() // Refresh the feed to show updated voice count
  }

  const toggleExpanded = (thoughtId: string) => {
    const newExpanded = new Set(expandedThoughts)
    if (newExpanded.has(thoughtId)) {
      newExpanded.delete(thoughtId)
    } else {
      newExpanded.add(thoughtId)
    }
    setExpandedThoughts(newExpanded)
  }

  const toggleSaved = (thoughtId: string) => {
    const newSaved = new Set(savedThoughts)
    if (newSaved.has(thoughtId)) {
      newSaved.delete(thoughtId)
    } else {
      newSaved.add(thoughtId)
    }
    setSavedThoughts(newSaved)
    localStorage.setItem('savedThoughts', JSON.stringify(Array.from(newSaved)))
  }

  if (recordingThoughtId) {
    return (
      <VoiceRecorder
        thoughtId={recordingThoughtId}
        onClose={() => setRecordingThoughtId(null)}
        onSuccess={handleRecordingSuccess}
      />
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h2 className="text-lg sm:text-2xl font-bold">Break the Ice</h2>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-4"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {loading && thoughts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Loading thoughts...</p>
        </div>
      ) : thoughts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No active thoughts yet. Create one first!
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {thoughts.map((thought) => {
            const responseCount = thought.voice_responses?.filter(response => response.duration > 0 && response.audio_url)?.length || 0
            const timeLeft = new Date(thought.expires_at).getTime() - Date.now()
            const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))
            const isExpanded = expandedThoughts.has(thought.id)
            const isSaved = savedThoughts.has(thought.id)

            return (
              <Card key={thought.id} className="p-3 sm:p-6 hover:shadow-lg transition-all duration-300">
                <CardHeader className="p-0 mb-3 sm:mb-4">
                  <div className="flex justify-between items-start gap-3">
                    <CardTitle className="text-base sm:text-xl font-semibold leading-tight flex-1">
                      {thought.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaved(thought.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-3 h-3 sm:w-4 sm:h-4 text-woices-violet" />
                        ) : (
                          <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </Button>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{hoursLeft}h left</span>
                        <span className="sm:hidden">{hoursLeft}h</span>
                      </div>
                    </div>
                  </div>
                  
                  {thought.description && (
                    <p className="text-xs sm:text-base text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
                      {thought.description}
                    </p>
                  )}
                  
                  {thought.tags && thought.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3">
                      {thought.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* Mobile-first layout */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(thought.created_at)} • {responseCount} voice{responseCount === 1 ? '' : 's'}
                          {thought.final_status !== 'pending' && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {thought.final_status === 'bloomed' ? '🌸 Bloomed' : 
                               thought.final_status === 'bricked' ? '🧱 Bricked' : 
                               '🤔 Unclear'}
                            </Badge>
                          )}
                        </div>
                        {responseCount > 0 && (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(thought.id)}
                                className="flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                              >
                                <span className="hidden sm:inline">View Replies</span>
                                <span className="sm:hidden">Replies</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </Collapsible>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handleStartRecording(thought.id)}
                        className="w-full sm:w-auto bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base h-9 sm:h-10"
                      >
                        <span className="sm:hidden">Record Woice</span>
                        <span className="hidden sm:inline">Record Your 60-Second Woice</span>
                      </Button>
                    </div>
                  </div>

                  {responseCount > 0 && isExpanded && (
                    <Collapsible open={isExpanded}>
                      <CollapsibleContent className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 border-t pt-3 sm:pt-4">
                        {thought.voice_responses
                          ?.filter((response) => response.duration > 0 && response.audio_url) // Only show valid recordings
                          ?.map((response) => (
                          <div key={response.id} className="space-y-1 sm:space-y-2">
                            <ModernVoicePlayer 
                              voiceResponseId={response.id}
                              audioUrl={response.audio_url} 
                              duration={response.duration}
                              mythVotes={response.myth_votes || 0}
                              factVotes={response.fact_votes || 0}
                              unclearVotes={response.unclear_votes || 0}
                              reactions={typeof response.reactions === 'object' ? response.reactions : {}}
                            />
                            <div className="text-xs text-muted-foreground pl-2 sm:pl-4">
                              {formatTimeAgo(response.created_at)}
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}