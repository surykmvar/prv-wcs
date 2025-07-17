import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
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
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has already voted
    const checkExistingVote = async () => {
      if (!user?.id) return
      
      try {
        const { data } = await supabase
          .from('user_votes')
          .select('vote_type')
          .eq('voice_response_id', voiceResponseId)
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setUserVote(data.vote_type)
        }
      } catch (error) {
        // No existing vote found
      }
    }
    
    checkExistingVote()
  }, [voiceResponseId, user?.id])

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
    if (!user) {
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
        const { error } = await supabase
          .from('user_votes')
          .delete()
          .eq('voice_response_id', voiceResponseId)
          .eq('user_id', user.id)
        
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
        const { error } = await supabase
          .from('user_votes')
          .upsert({
            voice_response_id: voiceResponseId,
            user_id: user.id,
            user_session: '', // Keep for compatibility but will be deprecated
            vote_type: voteType
          }, {
            onConflict: 'user_id,voice_response_id'
          })
        
        if (error) throw error
        
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
        {/* Descriptive Text */}
        <div className="text-xs text-muted-foreground">
          {user ? "What do you think about this voice reply?" : "Sign in to vote on voice replies"}
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
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 hover:bg-primary/10 hover:scale-110 ${
                    animatingButton === 'fact' ? 'animate-pulse' : ''
                  }`}
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
                  ? 'text-primary font-semibold' 
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
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 hover:bg-destructive/10 hover:scale-110 ${
                    animatingButton === 'myth' ? 'animate-pulse' : ''
                  }`}
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
                  ? 'text-destructive font-semibold' 
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
                  className={`h-8 w-8 p-0 rounded-full transition-all duration-300 hover:bg-yellow-500/10 hover:scale-110 ${
                    animatingButton === 'unclear' ? 'animate-pulse' : ''
                  }`}
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
                  ? 'text-yellow-600 dark:text-yellow-400 font-semibold' 
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