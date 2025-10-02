import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { Sparkles, Target, Link2, HelpCircle } from 'lucide-react'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    // Check if the user has seen the intro before
    const hasSeenIntro = sessionStorage.getItem('woiceFeedIntroShown')
    
    if (!hasSeenIntro && user) {
      setIsOpen(true)
    }
  }, [user])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('woiceFeedIntroShown', 'true')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-md border border-border">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-woices-violet to-woices-bloom flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-woices-violet to-woices-bloom bg-clip-text text-transparent">
            Welcome! You've Got 30 Free Credits 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-sm">
          <div className="bg-gradient-to-br from-woices-violet/10 to-woices-bloom/10 rounded-xl p-4 border border-woices-violet/20">
            <p className="text-center font-medium text-foreground mb-2">
              Start sharing your voice right away!
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Post thoughts, record voice responses, and vote on others' opinions.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-foreground text-center">Quick Start Guide:</p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Target className="w-5 h-5 text-woices-violet flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Vote on Voice Responses</p>
                  <p className="text-xs text-muted-foreground">🎯 Fact • ⛓️‍💥 Myth • ❓ Unclear</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Link2 className="w-5 h-5 text-woices-bloom flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Record Your Voice</p>
                  <p className="text-xs text-muted-foreground">Tap "Record Woice" to share your opinion on any thought</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <HelpCircle className="w-5 h-5 text-woices-mint flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Post Your Own Thoughts</p>
                  <p className="text-xs text-muted-foreground">Create discussions and get voice feedback from the community</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <p className="text-xs text-muted-foreground">
              💡 <strong className="text-foreground">Pro Tip:</strong> Earn more credits by getting quality votes on your voice responses!
            </p>
          </div>
        </div>
        
        <div className="flex justify-center pt-2">
          <Button 
            onClick={handleClose}
            size="lg"
            className="bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white rounded-xl px-10 shadow-lg"
          >
            Start Exploring 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}