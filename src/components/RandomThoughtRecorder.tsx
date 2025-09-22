import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ArrowLeft, RefreshCw, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, Play, Pause, Share } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { ModernVoicePlayer } from "@/components/ModernVoicePlayer"
import { VotingExplanationModal } from "@/components/VotingExplanationModal"
import { ThoughtActionButton } from "@/components/ThoughtActionButton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatTimeAgo } from "@/utils/timeUtils"
import { useSequentialAudioPlayer } from "@/hooks/useSequentialAudioPlayer"

type VoiceResponse = {
  id: string
  audio_url: string
  duration: number
  created_at: string
  myth_votes: number
  fact_votes: number
  unclear_votes: number
}

type Thought = {
  id: string
  user_id?: string
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
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const [listeningThoughts, setListeningThoughts] = useState<Set<string>>(new Set())
  const { getThoughts } = useSupabase()
  const { user } = useAuth()
  const { 
    isPlaying, 
    currentIndex, 
    currentTime,
    duration: audioDuration,
    playbackRate,
    currentResponse,
    start: startAudio, 
    stop: stopAudio, 
    toggle: toggleAudio,
    playIndex,
    seek,
    cycleRate
  } = useSequentialAudioPlayer()

  const getProfileInitials = (userId?: string) => {
    const p = userId ? profiles[userId] : undefined
    if (!p) return 'U'
    const dn = (p.display_name as string | undefined)?.trim()
    if (dn && dn.length) {
      const parts = dn.split(/\s+/).filter(Boolean)
      return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
    }
    const initials = ((p.first_name?.[0] || '') + (p.last_name?.[0] || ''))
    return (initials || 'U').toUpperCase()
  }

  const loadThoughts = async () => {
    try {
      setLoading(true)
      const data = await getThoughts()
      setThoughts(data || [])
      try {
        const userIds = Array.from(new Set((data || []).map((t: any) => t.user_id).filter(Boolean)))
        if (userIds.length > 0) {
          const { data: profs, error: profErr } = await supabase
            .rpc('get_profile_display_info', { user_ids: userIds })
          if (!profErr && profs) {
            const map: Record<string, any> = {}
            for (const p of profs) map[p.user_id] = p
            setProfiles(map)
          }
        }
      } catch (e) {
        console.error('Failed to load profiles:', e)
      }
    } catch (error) {
      console.error('Failed to load thoughts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadThoughts()
    loadSavedThoughts()
  }, [user])

  const loadSavedThoughts = async () => {
    if (!user) {
      // For anonymous users, load from localStorage
      const saved = localStorage.getItem('savedThoughts')
      if (saved) {
        setSavedThoughts(new Set(JSON.parse(saved)))
      }
      return
    }

    try {
      // For authenticated users, load from database
      const { data, error } = await supabase
        .from('saved_thoughts')
        .select('thought_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error loading saved thoughts:', error)
        return
      }

      const savedIds = new Set(data.map(item => item.thought_id))
      setSavedThoughts(savedIds)
    } catch (error) {
      console.error('Error loading saved thoughts:', error)
    }
  }

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
      
      // Show voting explanation modal on first expand if user hasn't seen it
      const hasSeenVotingExplanation = localStorage.getItem('hasSeenVotingExplanation')
      if (!hasSeenVotingExplanation) {
        setShowVotingModal(true)
      }
    }
    setExpandedThoughts(newExpanded)
  }

  const handleListen = (thoughtId: string, voiceResponses: VoiceResponse[]) => {
    const validResponses = voiceResponses.filter(response => response.duration > 0 && response.audio_url)
    
    if (validResponses.length === 0) return
    
    // Stop any currently playing thought first
    if (listeningThoughts.size > 0) {
      setListeningThoughts(new Set())
      stopAudio()
    }
    
    // Expand the thought to show replies
    const newExpanded = new Set(expandedThoughts)
    newExpanded.add(thoughtId)
    setExpandedThoughts(newExpanded)
    
    // Start listening mode for this thought only
    setListeningThoughts(new Set([thoughtId]))
    
    // Start sequential audio playback
    startAudio(validResponses)
    
    // Show voting explanation modal on first listen if user hasn't seen it
    const hasSeenVotingExplanation = localStorage.getItem('hasSeenVotingExplanation')
    if (!hasSeenVotingExplanation) {
      setShowVotingModal(true)
    }
  }

  const handleStopListening = (thoughtId: string) => {
    setListeningThoughts(new Set())
    stopAudio()
  }

  const handleShareThought = async (thought: Thought, voiceResponses?: VoiceResponse[]) => {
    // If we have voice responses and we're listening, share the current or first audio
    if (voiceResponses && voiceResponses.length > 0) {
      const { shareAudioFile } = await import('@/utils/shareAudio')
      const targetResponse = currentResponse || voiceResponses[0]
      
      if (targetResponse) {
        try {
          await shareAudioFile(targetResponse.audio_url, `Voice Reply - ${thought.title}`)
          return
        } catch (error) {
          console.error('Failed to share audio:', error)
          // Fall through to text sharing
        }
      }
    }
    
    // Fallback to sharing thought as text
    const shareData = {
      title: thought.title,
      text: `Check out this thought: ${thought.title}${thought.description ? '\n\n' + thought.description : ''}`,
      url: window.location.href
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to copying to clipboard
      const textToCopy = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
      try {
        await navigator.clipboard.writeText(textToCopy)
        console.log('Copied to clipboard')
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  const toggleSaved = async (thoughtId: string) => {
    if (!user) {
      // For anonymous users, use localStorage
      const newSaved = new Set(savedThoughts)
      if (newSaved.has(thoughtId)) {
        newSaved.delete(thoughtId)
      } else {
        newSaved.add(thoughtId)
      }
      setSavedThoughts(newSaved)
      localStorage.setItem('savedThoughts', JSON.stringify(Array.from(newSaved)))
      return
    }

    try {
      const isSaved = savedThoughts.has(thoughtId)
      
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_thoughts')
          .delete()
          .eq('user_id', user.id)
          .eq('thought_id', thoughtId)

        if (error) throw error

        const newSaved = new Set(savedThoughts)
        newSaved.delete(thoughtId)
        setSavedThoughts(newSaved)
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_thoughts')
          .insert({
            user_id: user.id,
            thought_id: thoughtId
          })

        if (error) throw error

        const newSaved = new Set(savedThoughts)
        newSaved.add(thoughtId)
        setSavedThoughts(newSaved)
      }
    } catch (error) {
      console.error('Error toggling saved thought:', error)
    }
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
    <div className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6">
      <VotingExplanationModal 
        isOpen={showVotingModal} 
        onClose={() => setShowVotingModal(false)} 
      />
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h2 className="text-base sm:text-2xl font-bold">Break the Ice</h2>
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
          <p className="text-muted-foreground text-base sm:text-lg">Loading thoughts...</p>
        </div>
      ) : thoughts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-base sm:text-lg">
            No active thoughts yet. Create one first!
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {thoughts.map((thought) => {
            const responseCount = thought.voice_responses?.filter(response => response.duration > 0 && response.audio_url)?.length || 0
            const timeLeft = new Date(thought.expires_at).getTime() - Date.now()
            const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))
            const isExpanded = expandedThoughts.has(thought.id)
            const isSaved = savedThoughts.has(thought.id)
            const isListening = listeningThoughts.has(thought.id)

            return (
              <li key={thought.id} className="py-3 sm:py-6">
                <article className="grid grid-cols-[28px,1fr] sm:grid-cols-[32px,1fr] gap-3 sm:gap-4">
                  <aside className="pt-1">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shadow-md" aria-label="Author avatar">
                      <AvatarFallback className="text-[10px] sm:text-xs">{getProfileInitials(thought.user_id)}</AvatarFallback>
                    </Avatar>
                  </aside>

                  <div className="min-w-0">
                    <header className="flex items-start justify-between gap-3">
                      <h3 className="text-sm sm:text-lg font-semibold leading-tight flex-1">
                        {thought.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaved(thought.id)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          aria-label={isSaved ? "Unsave" : "Save"}
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
                    </header>

                    {thought.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                        {thought.description}
                      </p>
                    )}

                    {thought.tags && thought.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        {thought.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="inline-flex items-center gap-2 whitespace-nowrap">
                          <span>
                            {formatTimeAgo(thought.created_at)} • {responseCount} voice{responseCount === 1 ? '' : 's'}
                          </span>
                          {responseCount > 0 && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => isListening 
                                  ? handleStopListening(thought.id)
                                  : handleListen(thought.id, thought.voice_responses || [])
                                }
                                className="h-6 px-2 text-xs gap-1"
                              >
                                {isListening && isPlaying ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                                Listen
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShareThought(thought, thought.voice_responses)}
                                className="h-6 px-2 text-xs gap-1"
                              >
                                <Share className="w-3 h-3" />
                                Share
                              </Button>
                            </div>
                          )}
                        </div>
                        {thought.final_status !== 'pending' && (
                          <Badge variant="outline" className="text-xs">
                            {thought.final_status === 'bloomed' ? '🌸 Bloomed' :
                             thought.final_status === 'bricked' ? '🧱 Bricked' :
                             '🤔 Unclear'}
                          </Badge>
                        )}
                      </div>

                      <ThoughtActionButton
                        thoughtId={thought.id}
                        onStartRecording={() => handleStartRecording(thought.id)}
                      />
                    </div>

                    {responseCount > 0 && isExpanded && (
                      <div className="mt-3 sm:mt-4 pl-4 sm:pl-5 border-l border-border space-y-2 sm:space-y-3">
                        {thought.voice_responses
                          ?.filter((response) => response.duration > 0 && response.audio_url)
                          ?.map((response, index) => {
                            const isCurrentlyPlaying = isListening && index === currentIndex
                            return (
                              <div 
                                key={response.id} 
                                className={`space-y-1 sm:space-y-2 ${
                                  isCurrentlyPlaying ? 'ring-2 ring-primary ring-opacity-30 rounded-lg p-2 bg-primary/5' : ''
                                }`}
                              >
                                <ModernVoicePlayer
                                  voiceResponseId={response.id}
                                  audioUrl={response.audio_url}
                                  duration={response.duration}
                                  mythVotes={response.myth_votes || 0}
                                  factVotes={response.fact_votes || 0}
                                  unclearVotes={response.unclear_votes || 0}
                                  controlled={isListening}
                                  isActive={isCurrentlyPlaying}
                                  isPlaying={isCurrentlyPlaying && isPlaying}
                                  currentTime={isCurrentlyPlaying ? currentTime : 0}
                                  durationOverride={isCurrentlyPlaying ? audioDuration : undefined}
                                  playbackRate={isCurrentlyPlaying ? playbackRate : 1}
                                  onTogglePlayPause={() => isCurrentlyPlaying ? toggleAudio() : playIndex(index)}
                                  onSeek={isCurrentlyPlaying ? seek : undefined}
                                  onRestart={isCurrentlyPlaying ? () => seek(0) : undefined}
                                  onToggleSpeed={isCurrentlyPlaying ? cycleRate : undefined}
                                  onRefresh={!isListening ? handleRefresh : undefined}
                                />
                                <div className="text-xs text-muted-foreground pl-1 flex items-center gap-2">
                                  <span>{formatTimeAgo(response.created_at)}</span>
                                  {isCurrentlyPlaying && isPlaying && (
                                    <span className="text-primary font-medium">• Now playing</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}