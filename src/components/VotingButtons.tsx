import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useUserSession } from '@/hooks/useUserSession'
import { useNavigate } from 'react-router-dom'

interface VotingButtonsProps {
  voiceResponseId: string
  mythVotes: number
  factVotes: number
  unclearVotes: number
  className?: string
}

export function VotingButtons({ 
  voiceResponseId, 
  mythVotes: initialMythVotes, 
  factVotes: initialFactVotes, 
  unclearVotes: initialUnclearVotes,
  className 
}: VotingButtonsProps) {
  const [userVote, setUserVote] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [animatingButton, setAnimatingButton] = useState<string | null>(null)
  
  // Local state for real-time vote counts
  const [mythVotes, setMythVotes] = useState(initialMythVotes)
  const [factVotes, setFactVotes] = useState(initialFactVotes)
  const [unclearVotes, setUnclearVotes] = useState(initialUnclearVotes)
  
  const { toast } = useToast()
  const { user } = useAuth()
  const { userSession } = useUserSession()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has already voted
    const checkExistingVote = async () => {
      if (!user?.id && !userSession) {
        setUserVote(null)
        return
      }
      
      try {
        // Query by user_id if authenticated, otherwise by user_session
        let query = supabase
          .from('user_votes')
          .select('vote_type')
          .eq('voice_response_id', voiceResponseId)
        
        if (user?.id) {
          query = query.eq('user_id', user.id)
        } else {
          query = query.eq('user_session', userSession)
        }
        
        const { data, error } = await query.maybeSingle()
        
        if (error) {
          console.error('Error checking existing vote:', error)
          return
        }
        
        setUserVote(data?.vote_type || null)
      } catch (error) {
        console.error('Unexpected error in checkExistingVote:', error)
      }
    }
    
    checkExistingVote()
  }, [voiceResponseId, user?.id, userSession])

  // Real-time subscription for vote count updates
  useEffect(() => {
    const channel = supabase
      .channel(`voice_response_votes_${voiceResponseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voice_responses',
          filter: `id=eq.${voiceResponseId}`
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as any
            setMythVotes(newData.myth_votes || 0)
            setFactVotes(newData.fact_votes || 0)
            setUnclearVotes(newData.unclear_votes || 0)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [voiceResponseId])

  // Sync initial vote counts when component mounts or props change
  useEffect(() => {
    setMythVotes(initialMythVotes)
    setFactVotes(initialFactVotes)
    setUnclearVotes(initialUnclearVotes)
  }, [initialMythVotes, initialFactVotes, initialUnclearVotes])

  const handleVote = async (voteType: 'myth' | 'fact' | 'unclear') => {
    if (!user && !userSession) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on voice responses.",
        variant: "destructive"
      })
      navigate('/auth')
      return
    }
    
    setLoading(true)
    setAnimatingButton(voteType)
    
    try {
      if (userVote === voteType) {
        // Remove vote if clicking same button
        let deleteQuery = supabase
          .from('user_votes')
          .delete()
          .eq('voice_response_id', voiceResponseId)
        
        if (user?.id) {
          deleteQuery = deleteQuery.eq('user_id', user.id)
        } else {
          deleteQuery = deleteQuery.eq('user_session', userSession)
        }
        
        const { error } = await deleteQuery
        
        if (error) throw error
        
        // Immediately update local state for better UX
        setUserVote(null)
        // Decrease the count for the removed vote
        if (voteType === 'myth') {
          setMythVotes(prev => Math.max(0, prev - 1))
        } else if (voteType === 'fact') {
          setFactVotes(prev => Math.max(0, prev - 1))
        } else if (voteType === 'unclear') {
          setUnclearVotes(prev => Math.max(0, prev - 1))
        }
        
        toast({
          title: "Vote removed",
          description: "Your vote has been removed.",
          duration: 1500
        })
      } else {
        // Change vote or add new vote
        const voteData = {
          voice_response_id: voiceResponseId,
          user_id: user?.id || null,
          user_session: userSession,
          vote_type: voteType
        }
        
        // For authenticated users, use user_id conflict resolution
        // For anonymous users, we'll handle duplicates manually since user_session isn't unique in constraints
        if (user?.id) {
          const { error } = await supabase
            .from('user_votes')
            .upsert(voteData, {
              onConflict: 'user_id,voice_response_id'
            })
          if (error) throw error
        } else {
          // For anonymous users, first delete any existing vote, then insert new one
          await supabase
            .from('user_votes')
            .delete()
            .eq('voice_response_id', voiceResponseId)
            .eq('user_session', userSession)
          
          const { error } = await supabase
            .from('user_votes')
            .insert(voteData)
          if (error) throw error
        }
        
        const previousVote = userVote
        
        // Immediately update local state for better UX
        if (previousVote) {
          // Remove previous vote count
          if (previousVote === 'myth') {
            setMythVotes(prev => Math.max(0, prev - 1))
          } else if (previousVote === 'fact') {
            setFactVotes(prev => Math.max(0, prev - 1))
          } else if (previousVote === 'unclear') {
            setUnclearVotes(prev => Math.max(0, prev - 1))
          }
        }
        
        // Add new vote count
        if (voteType === 'myth') {
          setMythVotes(prev => prev + 1)
        } else if (voteType === 'fact') {
          setFactVotes(prev => prev + 1)
        } else if (voteType === 'unclear') {
          setUnclearVotes(prev => prev + 1)
        }
        
        setUserVote(voteType)
        
        const voteLabels = { myth: '⛓️‍💥 Myth', fact: '🎯 Fact', unclear: '❓ Unclear' }
        const actionText = previousVote ? 'changed to' : 'reacted'
        
        toast({
          title: `Vote ${actionText}`,
          description: `You ${actionText} ${voteLabels[voteType]} to this voice note`,
          duration: 2000
        })
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setTimeout(() => setAnimatingButton(null), 600)
    }
  }

  return (
    <TooltipProvider>
      <div className={`space-y-2 ${className}`}>        
        {/* Emoji Reactions Only */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('fact')}
                  disabled={loading}
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 hover:bg-primary/10 hover:scale-110 ${
                    userVote === 'fact' ? 'ring-2 ring-green-500 bg-green-500/10' : ''
                  } ${animatingButton === 'fact' ? 'animate-pulse' : ''}`}
                >
                  🎯
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as Fact</p>
              </TooltipContent>
            </Tooltip>
            <span 
              className={`text-sm font-medium transition-all duration-300 ${
                userVote === 'fact' 
                  ? 'text-green-600 font-bold' 
                  : 'text-muted-foreground'
              } ${animatingButton === 'fact' ? 'scale-125' : ''}`}
            >
              {factVotes}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('myth')}
                  disabled={loading}
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 hover:bg-[#06AFE2]/10 hover:scale-110 ${
                    userVote === 'myth' ? 'ring-2 ring-[#06AFE2] bg-[#06AFE2]/10' : ''
                  } ${animatingButton === 'myth' ? 'animate-pulse' : ''}`}
                >
                  ⛓️‍💥
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as Myth</p>
              </TooltipContent>
            </Tooltip>
            <span 
               className={`text-sm font-medium transition-all duration-300 ${
                userVote === 'myth' 
                  ? 'text-[#06AFE2] font-bold' 
                  : 'text-muted-foreground'
               } ${animatingButton === 'myth' ? 'scale-125' : ''}`}
            >
              {mythVotes}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('unclear')}
                  disabled={loading}
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 hover:bg-destructive/10 hover:scale-110 ${
                    userVote === 'unclear' ? 'ring-2 ring-red-500 bg-red-500/10' : ''
                  } ${animatingButton === 'unclear' ? 'animate-pulse' : ''}`}
                >
                  ❓
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Still Unclear</p>
              </TooltipContent>
            </Tooltip>
            <span 
               className={`text-sm font-medium transition-all duration-300 ${
                userVote === 'unclear' 
                  ? 'text-red-600 font-bold' 
                  : 'text-muted-foreground'
               } ${animatingButton === 'unclear' ? 'scale-125' : ''}`}
            >
              {unclearVotes}
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}