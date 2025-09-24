import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MessageCircle, ArrowLeft, Mic, Share2, Check } from "lucide-react"
import { formatTimeAgo } from "@/utils/timeUtils"
import { flagEmojiFromCountryCode } from "@/utils/locale"
import { SecureContent } from "@/components/SecureContent"
import { ModernVoicePlayer } from "@/components/ModernVoicePlayer"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header"
import { useToast } from "@/hooks/use-toast"

type Thought = {
  id: string
  title: string
  description: string | null
  tags: string[] | null
  created_at: string
  expires_at: string
  max_woices_allowed?: number
  thought_scope: string
  country_code: string | null
}

type VoiceResponse = {
  id: string
  audio_url: string
  duration: number
  transcript: string | null
  classification: string | null
  created_at: string
  myth_votes: number
  fact_votes: number
  unclear_votes: number
}

export default function ThoughtDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [thought, setThought] = useState<Thought | null>(null)
  const [voiceResponses, setVoiceResponses] = useState<VoiceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchThought = async () => {
      try {
        // Fetch thought details
        const { data: thoughtData, error: thoughtError } = await supabase
          .from('thoughts')
          .select('*')
          .eq('id', id)
          .single()

        if (thoughtError) throw thoughtError

        setThought(thoughtData)

        // Fetch voice responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('voice_responses')
          .select('*')
          .eq('thought_id', id)
          .order('created_at', { ascending: false })

        if (responsesError) throw responsesError

        setVoiceResponses(responsesData || [])
      } catch (error) {
        console.error('Error fetching thought:', error)
        toast({
          title: "Error",
          description: "Failed to load thought details",
          variant: "destructive"
        })
        navigate('/start')
      } finally {
        setLoading(false)
      }
    }

    fetchThought()
  }, [id, navigate, toast])

  const handleShareLink = async () => {
    const shareUrl = window.location.href
    try {
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
      toast({
        title: "Link copied!",
        description: "Share this thought with others"
      })
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      })
    }
  }

  const handleRecordResponse = () => {
    if (!user) {
      navigate('/auth?mode=signin&redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    // TODO: Implement voice recording flow
    toast({
      title: "Coming Soon",
      description: "Voice recording will be available soon!"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!thought) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Thought Not Found</h1>
            <Button onClick={() => navigate('/start')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const responseCount = voiceResponses.length
  const timeLeft = new Date(thought.expires_at).getTime() - Date.now()
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))
  const maxWoices = thought.max_woices_allowed || 10
  const isMaxReached = responseCount >= maxWoices

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button 
          onClick={() => navigate('/start')} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        {/* Main thought card */}
        <Card className="p-6 mb-8">
          <CardHeader className="p-0 mb-6">
            <div className="flex justify-between items-start gap-4 mb-4">
              <CardTitle className="text-2xl font-bold leading-tight">
                <SecureContent content={thought.title} className="block" maxLength={200} />
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                  <Clock className="w-4 h-4" />
                  {hoursLeft}h left
                </div>
                <div className="relative">
                  <Button
                    onClick={handleShareLink}
                    variant="outline"
                    size="sm"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {thought.description && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                <SecureContent content={thought.description} maxLength={600} />
              </p>
            )}
            
            {thought.tags && thought.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {thought.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #<SecureContent content={tag} maxLength={30} />
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Posted for: {thought.thought_scope === 'regional' ? `${flagEmojiFromCountryCode(thought.country_code)} ${thought.country_code || ''}` : '🌍 Global'}
                • Posted {formatTimeAgo(thought.created_at)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                {responseCount}/{maxWoices} voice{responseCount === 1 ? '' : 's'}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isMaxReached ? (
              <div className="text-center text-sm text-green-600 font-medium bg-green-50 px-4 py-2 rounded-xl">
                🎉 This Thought has received all its reviews!
              </div>
            ) : (
              <Button
                onClick={handleRecordResponse}
                className="w-full bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white rounded-xl px-6 py-3"
              >
                <Mic className="w-4 h-4 mr-2" />
                Record Your Woice
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Voice responses */}
        {voiceResponses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Voice Responses ({responseCount})</h2>
            {voiceResponses.map((response) => (
              <Card key={response.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-muted-foreground">
                    {formatTimeAgo(response.created_at)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>👍 {response.fact_votes}</span>
                    <span>👎 {response.myth_votes}</span>
                    <span>❓ {response.unclear_votes}</span>
                  </div>
                </div>
                <ModernVoicePlayer
                  voiceResponseId={response.id}
                  audioUrl={response.audio_url}
                  duration={response.duration}
                  mythVotes={response.myth_votes}
                  factVotes={response.fact_votes}
                  unclearVotes={response.unclear_votes}
                />
              </Card>
            ))}
          </div>
        )}

        {voiceResponses.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No voice responses yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to share your voice on this thought!</p>
          </Card>
        )}
      </main>
    </div>
  )
}