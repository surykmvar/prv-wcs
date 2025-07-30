import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Mic, Calendar, Clock, Users, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Navigate, useNavigate } from 'react-router-dom'

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
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [userThoughts, setUserThoughts] = useState<UserThought[]>([])
  const [userVoiceResponses, setUserVoiceResponses] = useState<UserVoiceResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      return
    }

    if (user) {
      fetchUserData()
    }
  }, [user, authLoading])

  const fetchUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch user's thoughts
      const { data: thoughtsData, error: thoughtsError } = await supabase
        .rpc('get_user_thoughts', { user_uuid: user.id })

      if (thoughtsError) {
        console.error('Error fetching user thoughts:', thoughtsError)
      } else {
        setUserThoughts(thoughtsData || [])
      }

      // Fetch user's voice responses
      const { data: voiceData, error: voiceError } = await supabase
        .rpc('get_user_voice_responses', { user_uuid: user.id })

      if (voiceError) {
        console.error('Error fetching user voice responses:', voiceError)
      } else {
        setUserVoiceResponses(voiceData || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateToThought = (thoughtId: string) => {
    navigate(`/?thoughtId=${thoughtId}`)
  }

  const getStatusIcon = (finalStatus: string) => {
    switch (finalStatus) {
      case 'bloomed':
        return <TrendingUp className="h-4 w-4 text-woices-mint" />
      case 'bricked':
        return <TrendingDown className="h-4 w-4 text-woices-brick" />
      case 'unclear':
        return <HelpCircle className="h-4 w-4 text-woices-sky" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getVoteIcon = (classification: string) => {
    switch (classification) {
      case 'fact':
        return <TrendingUp className="h-4 w-4 text-woices-mint" />
      case 'myth':
        return <TrendingDown className="h-4 w-4 text-woices-brick" />
      case 'unclear':
        return <HelpCircle className="h-4 w-4 text-woices-sky" />
      default:
        return <Mic className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Track your thoughts and voice responses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Thoughts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-woices-violet" />
                <span className="text-2xl font-bold">{userThoughts.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Voice Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-woices-mint" />
                <span className="text-2xl font-bold">{userVoiceResponses.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Votes Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-woices-sky" />
                <span className="text-2xl font-bold">
                  {userVoiceResponses.reduce((total, response) => 
                    total + response.myth_votes + response.fact_votes + response.unclear_votes, 0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="thoughts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thoughts">My Thoughts</TabsTrigger>
            <TabsTrigger value="responses">My Voice Responses</TabsTrigger>
          </TabsList>

          <TabsContent value="thoughts" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))
              ) : userThoughts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No thoughts posted yet</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/')}
                    >
                      Post Your First Thought
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                userThoughts.map((thought) => (
                  <Card key={thought.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateToThought(thought.id)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold mb-2">{thought.title}</CardTitle>
                          <CardDescription className="text-sm">{thought.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(thought.final_status)}
                          <Badge variant="outline" className="text-xs">
                            {thought.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {thought.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mic className="h-4 w-4" />
                            {thought.voice_response_count}/{thought.max_woices_allowed} responses
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(new Date(thought.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="responses" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28" />
                ))
              ) : userVoiceResponses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No voice responses recorded yet</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/')}
                    >
                      Record Your First Response
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                userVoiceResponses.map((response) => (
                  <Card key={response.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigateToThought(response.thought_id)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold mb-2">
                            Response to: {response.thought_title}
                          </CardTitle>
                          {response.transcript && (
                            <CardDescription className="text-sm line-clamp-2">
                              {response.transcript}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getVoteIcon(response.classification)}
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(response.duration / 60)}:{(response.duration % 60).toString().padStart(2, '0')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-woices-mint">
                            <TrendingUp className="h-3 w-3" />
                            {response.fact_votes}
                          </span>
                          <span className="flex items-center gap-1 text-woices-brick">
                            <TrendingDown className="h-3 w-3" />
                            {response.myth_votes}
                          </span>
                          <span className="flex items-center gap-1 text-woices-sky">
                            <HelpCircle className="h-3 w-3" />
                            {response.unclear_votes}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}