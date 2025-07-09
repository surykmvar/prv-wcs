import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Check, X, HelpCircle } from 'lucide-react'
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
  mythVotes, 
  factVotes, 
  unclearVotes,
  className 
}: VotingButtonsProps) {
  const [userVote, setUserVote] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
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

  const handleVote = async (voteType: 'myth' | 'fact' | 'unclear') => {
    if (!userSession) return
    
    setLoading(true)
    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from('user_votes')
          .delete()
          .eq('voice_response_id', voiceResponseId)
          .eq('user_session', userSession)
        
        setUserVote(null)
        toast({
          title: "Vote removed",
          description: "Your vote has been removed."
        })
      } else {
        // Add or update vote
        await supabase
          .from('user_votes')
          .upsert({
            voice_response_id: voiceResponseId,
            user_session: userSession,
            vote_type: voteType
          })
        
        setUserVote(voteType)
        const voteLabels = { myth: 'Myth', fact: 'Fact', unclear: 'Unclear' }
        toast({
          title: "Vote cast",
          description: `You voted: ${voteLabels[voteType]}`
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
    }
  }

  return (
    <TooltipProvider>
      <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">What do you think about this voice reply?</span>
              <span className="sm:hidden">Your verdict:</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cast your vote to help verify content accuracy</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
          <Button
            variant={userVote === 'fact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleVote('fact')}
            disabled={loading}
            className="h-7 sm:h-8 px-2 sm:px-3 flex-1 sm:flex-none"
          >
            <Check className="w-3 h-3 mr-0.5 sm:mr-1" />
            <span className="text-xs">Fact</span>
            {factVotes > 0 && (
              <Badge variant="secondary" className="ml-1 h-3 sm:h-4 px-1 text-xs">
                {factVotes}
              </Badge>
            )}
          </Button>
          
          <Button
            variant={userVote === 'myth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleVote('myth')}
            disabled={loading}
            className="h-7 sm:h-8 px-2 sm:px-3 flex-1 sm:flex-none"
          >
            <X className="w-3 h-3 mr-0.5 sm:mr-1" />
            <span className="text-xs">Myth</span>
            {mythVotes > 0 && (
              <Badge variant="secondary" className="ml-1 h-3 sm:h-4 px-1 text-xs">
                {mythVotes}
              </Badge>
            )}
          </Button>
          
          <Button
            variant={userVote === 'unclear' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleVote('unclear')}
            disabled={loading}
            className="h-7 sm:h-8 px-2 sm:px-3 flex-1 sm:flex-none"
          >
            <HelpCircle className="w-3 h-3 mr-0.5 sm:mr-1" />
            <span className="text-xs">Unclear</span>
            {unclearVotes > 0 && (
              <Badge variant="secondary" className="ml-1 h-3 sm:h-4 px-1 text-xs">
                {unclearVotes}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}