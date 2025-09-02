import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useCredits } from '@/hooks/useCredits'
import { supabase } from '@/integrations/supabase/client'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { VoicePlayer } from '@/components/VoicePlayer'
import { Button } from '@/components/ui/button'
import { MessageSquare, Volume2, Flower2, Trash2, AlertCircle, Bookmark, BookmarkX, Wind, Coins, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MembershipModal } from '@/components/MembershipModal'
import OutcomeIcon from '@/components/profile/OutcomeIcon'
import ProfileHeader from '@/components/profile/ProfileHeader'

interface UserThought {
  id: string
  title: string
  description: string
  tags: string[]
  created_at: string
  expires_at: string
  status: string
  final_status: string
  max_woices_allowed: number
  voice_response_count: number
}

interface UserVoiceResponse {
  id: string
  thought_id: string
  thought_title: string
  created_at: string
  duration: number
  audio_url: string
  transcript: string
  classification: string
  myth_votes: number
  fact_votes: number
  unclear_votes: number
}

interface SavedThought {
  id: string
  title: string
  description: string
  tags: string[]
  created_at: string
  expires_at: string
  status: string
  saved_at: string
}

export default function Profile() {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const { creditsInfo, loading: creditsLoading } = useCredits()
  const [userThoughts, setUserThoughts] = useState<UserThought[]>([])
  const [userVoiceResponses, setUserVoiceResponses] = useState<UserVoiceResponse[]>([])
  const [savedThoughts, setSavedThoughts] = useState<SavedThought[]>([])
  const [loading, setLoading] = useState(true)
  const [ignoredUnclear, setIgnoredUnclear] = useState<Record<string, boolean>>({})
  const [membershipModalOpen, setMembershipModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data: thoughtsData, error: thoughtsError } = await supabase
        .rpc('get_user_thoughts', { user_uuid: user.id })
      if (thoughtsError) {
        console.error('Error fetching user thoughts:', thoughtsError)
      } else {
        setUserThoughts(thoughtsData || [])
      }

      const { data: voiceResponsesData, error: voiceResponsesError } = await supabase
        .rpc('get_user_voice_responses', { user_uuid: user.id })
      if (voiceResponsesError) {
        console.error('Error fetching user voice responses:', voiceResponsesError)
      } else {
        setUserVoiceResponses(voiceResponsesData || [])
      }

      const { data: savedThoughtsData, error: savedThoughtsError } = await supabase
        .rpc('get_user_saved_thoughts', { user_uuid: user.id })
      if (savedThoughtsError) {
        console.error('Error fetching saved thoughts:', savedThoughtsError)
      } else {
        setSavedThoughts(savedThoughtsData || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsaveThought = async (thoughtId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('saved_thoughts')
        .delete()
        .eq('user_id', user.id)
        .eq('thought_id', thoughtId)

      if (error) throw error

      setSavedThoughts(prev => prev.filter(thought => thought.id !== thoughtId))
    } catch (error) {
      console.error('Error unsaving thought:', error)
    }
  }

  const getVoteBreakdown = () => {
    return userVoiceResponses.reduce((totals, response) => ({
      facts: totals.facts + response.fact_votes,
      myths: totals.myths + response.myth_votes,
      unclear: totals.unclear + response.unclear_votes
    }), { facts: 0, myths: 0, unclear: 0 })
  }

  const computeOutcome = (r: UserVoiceResponse) => {
    const total = (r.fact_votes || 0) + (r.myth_votes || 0) + (r.unclear_votes || 0)
    if (total === 0) return { label: 'No votes', code: 'none' as const, total, factP: 0, mythP: 0, unclearP: 0 }

    const factP = r.fact_votes / total
    const mythP = r.myth_votes / total
    const unclearP = r.unclear_votes / total

    if (factP > 0.5 || r.fact_votes > (r.myth_votes + r.unclear_votes)) {
      return { label: 'Bloom 🌱', code: 'bloom' as const, total, factP, mythP, unclearP }
    }
    if (mythP > 0.5 || r.myth_votes > (r.fact_votes + r.unclear_votes)) {
      return { label: 'Dust 💨', code: 'dust' as const, total, factP, mythP, unclearP }
    }
    if (unclearP > 0.5) {
      return { label: 'Unclear ❓', code: 'unclear' as const, total, factP, mythP, unclearP }
    }
    // Default to top vote if no strict majority
    if (r.fact_votes >= r.myth_votes && r.fact_votes >= r.unclear_votes) {
      return { label: 'Bloom 🌱', code: 'bloom' as const, total, factP, mythP, unclearP }
    }
    if (r.myth_votes >= r.fact_votes && r.myth_votes >= r.unclear_votes) {
      return { label: 'Dust 💨', code: 'dust' as const, total, factP, mythP, unclearP }
    }
    return { label: 'Unclear ❓', code: 'unclear' as const, total, factP, mythP, unclearP }
  }

  const handleDeleteVoiceResponse = async (id: string) => {
    try {
      const { error } = await supabase.from('voice_responses').delete().eq('id', id)
      if (error) throw error
      setUserVoiceResponses(prev => prev.filter(v => v.id !== id))
      toast({ title: 'Woice deleted', description: 'Your voice reply was removed.' })
    } catch (e) {
      console.error('Delete failed', e)
      toast({ title: 'Delete failed', description: 'Unable to delete this Woice.', variant: 'destructive' })
    }
  }

  const handleIgnoreUnclear = (id: string) => setIgnoredUnclear(prev => ({ ...prev, [id]: true }))

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-8">
        <ProfileHeader
          name={profile?.display_name || 'Anonymous User'}
          email={user?.email || ''}
          initial={(profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U')}
          thoughtsCount={userThoughts.length}
          woicesCount={userVoiceResponses.length}
          facts={getVoteBreakdown().facts}
          myths={getVoteBreakdown().myths}
          unclear={getVoteBreakdown().unclear}
          avatarUrl={profile?.avatar_url}
          bio={profile?.bio}
          showEmail={profile?.show_email}
          onProfileUpdate={fetchUserData}
        />

        {/* Credits Card */}
        {!creditsLoading && creditsInfo && (
          <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-muted-foreground">Credits Balance</span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {creditsInfo.balance}
                </div>
                <Button
                  onClick={() => setMembershipModalOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-6"
                >
                  <Plus className="h-4 w-4" />
                  Top up Credits
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="woices" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 text-xs md:text-sm">
            <TabsTrigger value="thoughts" className="flex items-center gap-1.5 md:gap-2">
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
              Thoughts ({userThoughts.length})
            </TabsTrigger>
            <TabsTrigger value="woices" className="flex items-center gap-1.5 md:gap-2">
              <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
              Woices ({userVoiceResponses.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-1.5 md:gap-2">
              <Bookmark className="h-3 w-3 md:h-4 md:w-4" />
              Saved ({savedThoughts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="thoughts" className="space-y-4">
            {userThoughts.length === 0 ? (
              <Card>
            <CardContent className="text-center py-6 md:py-8">
                  <MessageSquare className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't posted any thoughts yet.</p>
                </CardContent>
              </Card>
            ) : (
              userThoughts.map((thought) => (
                <Card key={thought.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm md:text-base">{thought.title}</CardTitle>
                      <Badge variant={thought.status === 'active' ? 'default' : 'secondary'}>
                        {thought.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{thought.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {thought.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>
                        {thought.voice_response_count} / {thought.max_woices_allowed} responses
                      </span>
                      <span>Posted {formatDistanceToNow(new Date(thought.created_at))} ago</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="woices" className="space-y-4">
            {userVoiceResponses.length === 0 ? (
              <Card>
            <CardContent className="text-center py-6 md:py-8">
                  <Volume2 className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't recorded any woices yet.</p>
                </CardContent>
              </Card>
            ) : (
              userVoiceResponses.map((response) => {
                const outcome = computeOutcome(response)
                return (
                  <Card key={response.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm md:text-base">Response to: {response.thought_title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <OutcomeIcon outcome={outcome.code} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <VoicePlayer audioUrl={response.audio_url} duration={response.duration} />

                        {response.transcript && (
                          <div className="bg-muted/50 p-2 md:p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
                            <p className="text-sm">{response.transcript}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex gap-3 text-xs md:text-sm">
                            <span className="flex items-center gap-1"><span>🎯</span>{response.fact_votes}</span>
                            <span className="flex items-center gap-1"><span>⛓️‍💥</span>{response.myth_votes}</span>
                            <span className="flex items-center gap-1"><span>❓</span>{response.unclear_votes}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(response.created_at))} ago</span>
                        </div>

                        {outcome.code === 'unclear' && !ignoredUnclear[response.id] && (
                          <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
                            <p className="text-sm mb-2">Others found your reply unclear. What would you like to do?</p>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="secondary" onClick={() => toast({ title: 'Re-record', description: 'Re-record flow coming soon.' })}>
                                Re-record
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteVoiceResponse(response.id)}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleIgnoreUnclear(response.id)}>
                                Ignore
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedThoughts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-6 md:py-8">
                  <Bookmark className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't saved any thoughts yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Save interesting thoughts to easily find them later!</p>
                </CardContent>
              </Card>
            ) : (
              savedThoughts.map((thought) => (
                <Card key={thought.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm md:text-base">{thought.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={thought.status === 'active' ? 'default' : 'secondary'}>
                          {thought.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnsaveThought(thought.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <BookmarkX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{thought.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {thought.tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Saved {formatDistanceToNow(new Date(thought.saved_at))} ago</span>
                      <span>Originally posted {formatDistanceToNow(new Date(thought.created_at))} ago</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <MembershipModal 
        open={membershipModalOpen} 
        onOpenChange={setMembershipModalOpen} 
      />
    </div>
    </TooltipProvider>
  )
}
