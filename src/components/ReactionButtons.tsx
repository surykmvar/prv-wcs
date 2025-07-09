import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useUserSession } from '@/hooks/useUserSession'

const REACTIONS = [
  { type: 'clap', emoji: '👏', label: 'Clap' },
  { type: 'brain', emoji: '🧠', label: 'Smart' },
  { type: 'shock', emoji: '😲', label: 'Surprised' },
  { type: 'think', emoji: '🤔', label: 'Interesting' },
  { type: 'trash', emoji: '🗑️', label: 'Dismiss' }
] as const

type ReactionType = typeof REACTIONS[number]['type']

interface ReactionButtonsProps {
  voiceResponseId: string
  reactions: Record<string, number>
  className?: string
}

export function ReactionButtons({ voiceResponseId, reactions, className }: ReactionButtonsProps) {
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set())
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const userSession = useUserSession()

  useEffect(() => {
    // Check existing user reactions
    const checkExistingReactions = async () => {
      if (!userSession) return
      
      try {
        const { data } = await supabase
          .from('user_reactions')
          .select('reaction_type')
          .eq('voice_response_id', voiceResponseId)
          .eq('user_session', userSession)
        
        if (data) {
          setUserReactions(new Set(data.map(r => r.reaction_type as ReactionType)))
        }
      } catch (error) {
        console.error('Error loading reactions:', error)
      }
    }
    
    checkExistingReactions()
  }, [voiceResponseId, userSession])

  const handleReaction = async (reactionType: ReactionType) => {
    if (!userSession) return
    
    setLoading(true)
    try {
      const hasReaction = userReactions.has(reactionType)
      
      if (hasReaction) {
        // Remove reaction
        await supabase
          .from('user_reactions')
          .delete()
          .eq('voice_response_id', voiceResponseId)
          .eq('user_session', userSession)
          .eq('reaction_type', reactionType)
        
        setUserReactions(prev => {
          const newSet = new Set(prev)
          newSet.delete(reactionType)
          return newSet
        })
      } else {
        // Add reaction
        await supabase
          .from('user_reactions')
          .insert({
            voice_response_id: voiceResponseId,
            user_session: userSession,
            reaction_type: reactionType
          })
        
        setUserReactions(prev => new Set([...prev, reactionType]))
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = reactions[type] || 0
        const isActive = userReactions.has(type)
        
        return (
          <Button
            key={type}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleReaction(type)}
            disabled={loading}
            className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
            title={label}
          >
            <span className="mr-0.5 sm:mr-1">{emoji}</span>
            {count > 0 && (
              <Badge variant="secondary" className="h-3 sm:h-4 px-1 text-xs ml-0.5 sm:ml-1">
                {count}
              </Badge>
            )}
          </Button>
        )
      })}
    </div>
  )
}