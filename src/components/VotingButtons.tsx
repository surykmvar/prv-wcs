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

  const isDemo = voiceResponseId.startsWith('demo-')

  useEffect(() => {
    // Skip Supabase query for demo IDs
    if (isDemo) return

    // Check if user has already voted
    const checkExistingVote = async () => {
      if (!user?.id && !userSession) {
        setUserVote(null)
        return
      }
      
      try {
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
  }, [voiceResponseId, user?.id, userSession, isDemo])

  // Real-time subscription for vote count updates (skip for demo)
  useEffect(() => {
    if (isDemo) return

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
  }, [voiceResponseId, isDemo])

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
      <div className={`flex items-center gap-2 sm:gap-4 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('myth')}
              disabled={loading}
              className={`
                p-1 sm:p-1.5 h-auto flex flex-col items-center gap-0.5 min-w-[36px] sm:min-w-[48px] transition-all
                ${userVote === 'myth' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 scale-105' : 'hover:bg-muted/50'}
                ${animatingButton === 'myth' ? 'animate-pulse' : ''}
              `}
            >
              <span className="text-xs sm:text-sm">⛓️‍💥</span>
              <span className="text-xs font-medium">{mythVotes}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Myth</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('fact')}
              disabled={loading}
              className={`
                p-1 sm:p-1.5 h-auto flex flex-col items-center gap-0.5 min-w-[36px] sm:min-w-[48px] transition-all
                ${userVote === 'fact' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 scale-105' : 'hover:bg-muted/50'}
                ${animatingButton === 'fact' ? 'animate-pulse' : ''}
              `}
            >
              <span className="text-xs sm:text-sm">🎯</span>
              <span className="text-xs font-medium">{factVotes}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fact</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('unclear')}
              disabled={loading}
              className={`
                p-1 sm:p-1.5 h-auto flex flex-col items-center gap-0.5 min-w-[36px] sm:min-w-[48px] transition-all
                ${userVote === 'unclear' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 scale-105' : 'hover:bg-muted/50'}
                ${animatingButton === 'unclear' ? 'animate-pulse' : ''}
              `}
            >
              <span className="text-xs sm:text-sm">❓</span>
              <span className="text-xs font-medium">{unclearVotes}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Unclear</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}