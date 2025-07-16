import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if the user has seen the intro before
    const hasSeenIntro = sessionStorage.getItem('woiceFeedIntroShown')
    
    if (!hasSeenIntro) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('woiceFeedIntroShown', 'true')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border border-border/50">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto text-4xl">🎧</div>
          <DialogTitle className="text-xl font-semibold">
            Welcome to the Voice Feed!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center text-muted-foreground">
          <p className="text-sm leading-relaxed">
            Here's how reactions work:
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🎯</span>
              <span>= You think it's a Fact</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">⛓️‍💥</span>
              <span>= You believe it's a Myth</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">❓</span>
              <span>= You're not sure or it's debated</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground/80">
            React only once per Woice — and yes, it's anonymous.
          </p>
          
          <div className="pt-2">
            <p className="text-sm font-medium flex items-center justify-center gap-2">
              <span>📢</span>
              <span>Want to reply to a thought?</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Just tap "Record Woice" below any thought!
            </p>
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleClose}
            className="bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white rounded-xl px-8"
          >
            ✅ Got it, Start Listening
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}