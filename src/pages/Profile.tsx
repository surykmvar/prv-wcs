import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { VoicePlayer } from '@/components/VoicePlayer'
import { User, MessageSquare, Volume2, TrendingUp, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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

export default function Profile() {
  const { user } = useAuth()
  const [userThoughts, setUserThoughts] = useState<UserThought[]>([])
  const [userVoiceResponses, setUserVoiceResponses] = useState<UserVoiceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profileData)

      // Fetch user thoughts
      const { data: thoughtsData } = await supabase
        .rpc('get_user_thoughts', { user_uuid: user.id })

      setUserThoughts(thoughtsData || [])

      // Fetch user voice responses
      const { data: voiceResponsesData } = await supabase
        .rpc('get_user_voice_responses', { user_uuid: user.id })

      setUserVoiceResponses(voiceResponsesData || [])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalVotes = () => {
    return userVoiceResponses.reduce((total, response) => 
      total + response.myth_votes + response.fact_votes + response.unclear_votes, 0
    )
  }

  const getTopVoteType = (response: UserVoiceResponse) => {
    const { myth_votes, fact_votes, unclear_votes } = response
    const max = Math.max(myth_votes, fact_votes, unclear_votes)
    
    if (max === 0) return { type: 'No votes', icon: AlertCircle, color: 'text-muted-foreground' }
    if (max === fact_votes) return { type: 'Fact', icon: ThumbsUp, color: 'text-green-500' }
    if (max === myth_votes) return { type: 'Myth', icon: ThumbsDown, color: 'text-red-500' }
    return { type: 'Unclear', icon: AlertCircle, color: 'text-yellow-500' }
  }

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-woices-violet to-woices-mint text-white">
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{profile?.display_name || 'Anonymous User'}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{userThoughts.length}</p>
                    <p className="text-sm text-muted-foreground">Thoughts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{userVoiceResponses.length}</p>
                    <p className="text-sm text-muted-foreground">Woices</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{getTotalVotes()}</p>
                    <p className="text-sm text-muted-foreground">Total Votes</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="thoughts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thoughts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              My Thoughts
            </TabsTrigger>
            <TabsTrigger value="woices" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              My Woices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="thoughts" className="space-y-4">
            {userThoughts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't posted any thoughts yet.</p>
                </CardContent>
              </Card>
            ) : (
              userThoughts.map((thought) => (
                <Card key={thought.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{thought.title}</CardTitle>
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
                <CardContent className="text-center py-12">
                  <Volume2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't recorded any woices yet.</p>
                </CardContent>
              </Card>
            ) : (
              userVoiceResponses.map((response) => {
                const topVote = getTopVoteType(response)
                const TopVoteIcon = topVote.icon
                
                return (
                  <Card key={response.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Response to: {response.thought_title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <TopVoteIcon className={`h-4 w-4 ${topVote.color}`} />
                          <span className={`text-sm ${topVote.color}`}>{topVote.type}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <VoicePlayer audioUrl={response.audio_url} duration={response.duration} />
                        
                        {response.transcript && (
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
                            <p className="text-sm">{response.transcript}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-green-500" />
                              {response.fact_votes}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsDown className="h-3 w-3 text-red-500" />
                              {response.myth_votes}
                            </span>
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
                              {response.unclear_votes}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(response.created_at))} ago
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}