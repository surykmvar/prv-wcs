import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useUserSession } from '@/hooks/useUserSession'

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
  const userSession = useUserSession()

  useEffect(() => {
    // Check if user has already voted
    const checkExistingVote = async () => {
      if (!userSession) return
      
      try {
        const { data } = await supabase
          .from('user_votes')
          .select('vote_type')
          .eq('voice_response_id', voiceResponseId)
          .eq('user_session', userSession)
          .single()
        
        if (data) {
          setUserVote(data.vote_type)
        }
      } catch (error) {
        // No existing vote found
      }
    }
    
    checkExistingVote()
  }, [voiceResponseId, userSession])

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

  const handleVote = async (voteType: 'myth' | 'fact' | 'unclear') => {
    if (!userSession) return
    
    setLoading(true)
    setAnimatingButton(voteType)
    
    try {
      if (userVote === voteType) {
        // Remove vote if clicking same button
        const { error } = await supabase
          .from('user_votes')
          .delete()
          .eq('voice_response_id', voiceResponseId)
          .eq('user_session', userSession)
        
        if (error) throw error
        
        setUserVote(null)
        toast({
          title: "Vote removed",
          description: "Your vote has been removed.",
          duration: 1500
        })
      } else {
        // Change vote or add new vote
        const { error } = await supabase
          .from('user_votes')
          .upsert({
            voice_response_id: voiceResponseId,
            user_session: userSession,
            vote_type: voteType
          }, {
            onConflict: 'voice_response_id,user_session'
          })
        
        if (error) throw error
        
        const previousVote = userVote
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
        {/* Descriptive Text */}
        <div className="text-xs text-muted-foreground">
          What do you think about this voice reply?
        </div>
        
        {/* Left-Aligned Emoji Reactions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('fact')}
                  disabled={loading}
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
                    userVote === 'fact' 
                      ? 'bg-primary/10 text-primary scale-110' 
                      : 'hover:bg-muted/50'
                  } ${animatingButton === 'fact' ? 'animate-pulse' : ''}`}
                >
                  🎯
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as Fact</p>
              </TooltipContent>
            </Tooltip>
            {factVotes > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                {factVotes}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('myth')}
                  disabled={loading}
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
                    userVote === 'myth' 
                      ? 'bg-primary/10 text-primary scale-110' 
                      : 'hover:bg-muted/50'
                  } ${animatingButton === 'myth' ? 'animate-pulse' : ''}`}
                >
                  ⛓️‍💥
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as Myth</p>
              </TooltipContent>
            </Tooltip>
            {mythVotes > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                {mythVotes}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote('unclear')}
                  disabled={loading}
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 ${
                    userVote === 'unclear' 
                      ? 'bg-primary/10 text-primary scale-110' 
                      : 'hover:bg-muted/50'
                  } ${animatingButton === 'unclear' ? 'animate-pulse' : ''}`}
                >
                  ❓
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Still Unclear</p>
              </TooltipContent>
            </Tooltip>
            {unclearVotes > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                {unclearVotes}
              </span>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}