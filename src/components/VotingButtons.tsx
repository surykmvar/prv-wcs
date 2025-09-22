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

    // Optimistic UI update for instant feedback
    const prevVote = userVote
    const prevCounts = { myth: mythVotes, fact: factVotes, unclear: unclearVotes }

    const applyOptimistic = (next: string | null) => {
      // reset to previous
      setMythVotes(prevCounts.myth)
      setFactVotes(prevCounts.fact)
      setUnclearVotes(prevCounts.unclear)

      if (next === null) return

      // decrement previous vote if existed
      if (prevVote === 'myth') setMythVotes(v => Math.max(0, v - 1))
      if (prevVote === 'fact') setFactVotes(v => Math.max(0, v - 1))
      if (prevVote === 'unclear') setUnclearVotes(v => Math.max(0, v - 1))

      // increment new vote
      if (next === 'myth') setMythVotes(v => v + 1)
      if (next === 'fact') setFactVotes(v => v + 1)
      if (next === 'unclear') setUnclearVotes(v => v + 1)
    }

    setLoading(true)
    setAnimatingButton(voteType)

    try {
      if (userVote === voteType) {
        // Unvote
        applyOptimistic(null)
        setUserVote(null)

        let deleteQuery = supabase
          .from('user_votes')
          .delete()
          .eq('voice_response_id', voiceResponseId)

        if (user?.id) deleteQuery = deleteQuery.eq('user_id', user.id)
        else deleteQuery = deleteQuery.eq('user_session', userSession)

        const { error } = await deleteQuery
        if (error) throw error

        toast({ title: 'Vote removed', description: 'Your vote has been removed.', duration: 1500 })
      } else {
        // Cast or change vote
        applyOptimistic(voteType)
        setUserVote(voteType)

        const voteData = {
          voice_response_id: voiceResponseId,
          user_id: user?.id || null,
          user_session: userSession,
          vote_type: voteType
        }

        const conflict = user?.id ? 'voice_response_id,user_id' : 'voice_response_id,user_session'

        // Replace any existing vote then insert to avoid constraint issues
        if (user?.id) {
          await supabase
            .from('user_votes')
            .delete()
            .eq('voice_response_id', voiceResponseId)
            .eq('user_id', user.id)
        } else {
          await supabase
            .from('user_votes')
            .delete()
            .eq('voice_response_id', voiceResponseId)
            .eq('user_session', userSession)
        }

        const { error } = await supabase
          .from('user_votes')
          .insert(voteData)


        const voteLabels = { myth: '⛓️‍💥 Myth', fact: '🎯 Fact', unclear: '❓ Unclear' }
        const actionText = prevVote ? 'changed to' : 'reacted'
        toast({
          title: `Vote ${actionText}`,
          description: `You ${actionText} ${voteLabels[voteType]} to this voice note`,
          duration: 2000
        })
      }
    } catch (error) {
      console.error('Error voting:', error)
      // Revert on error
      setMythVotes(prevCounts.myth)
      setFactVotes(prevCounts.fact)
      setUnclearVotes(prevCounts.unclear)
      setUserVote(prevVote)

      toast({
        title: 'Error',
        description: 'Failed to cast vote. Please try again.',
        variant: 'destructive'
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
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('fact')}
                  disabled={loading}
                  className={`h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full transition-all duration-300 hover:bg-primary/10 hover:scale-110 ${
                    userVote === 'fact' ? 'ring-2 ring-green-500 bg-green-500/10' : ''
                  } ${animatingButton === 'fact' ? 'animate-pulse' : ''}`}
                >
                  <span className="text-sm sm:text-base">🎯</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as Fact</p>
              </TooltipContent>
            </Tooltip>
            <span 
              className={`text-xs sm:text-sm font-medium transition-all duration-300 min-w-[1rem] text-center ${
                userVote === 'fact' 
                  ? 'text-green-600 font-bold' 
                  : 'text-muted-foreground'
              } ${animatingButton === 'fact' ? 'scale-125' : ''}`}
            >
              {factVotes}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('myth')}
                  disabled={loading}
                  className={`h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full transition-all duration-300 hover:bg-[#06AFE2]/10 hover:scale-110 ${
                    userVote === 'myth' ? 'ring-2 ring-[#06AFE2] bg-[#06AFE2]/10' : ''
                  } ${animatingButton === 'myth' ? 'animate-pulse' : ''}`}
                >
                  <span className="text-sm sm:text-base">⛓️‍💥</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as Myth</p>
              </TooltipContent>
            </Tooltip>
            <span 
               className={`text-xs sm:text-sm font-medium transition-all duration-300 min-w-[1rem] text-center ${
                userVote === 'myth' 
                  ? 'text-[#06AFE2] font-bold' 
                  : 'text-muted-foreground'
               } ${animatingButton === 'myth' ? 'scale-125' : ''}`}
            >
              {mythVotes}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('unclear')}
                  disabled={loading}
                  className={`h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full transition-all duration-300 hover:bg-destructive/10 hover:scale-110 ${
                    userVote === 'unclear' ? 'ring-2 ring-red-500 bg-red-500/10' : ''
                  } ${animatingButton === 'unclear' ? 'animate-pulse' : ''}`}
                >
                  <span className="text-sm sm:text-base">❓</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Still Unclear</p>
              </TooltipContent>
            </Tooltip>
            <span 
               className={`text-xs sm:text-sm font-medium transition-all duration-300 min-w-[1rem] text-center ${
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