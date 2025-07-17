import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface VotingExplanationModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export function VotingExplanationModal({ isOpen: externalIsOpen, onClose: externalOnClose }: VotingExplanationModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // Use external state if provided, otherwise use internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const onClose = externalOnClose || (() => setInternalIsOpen(false))

  useEffect(() => {
    // Check if user has seen the explanation before (only if using internal state)
    if (externalIsOpen === undefined) {
      const hasSeenExplanation = localStorage.getItem('hasSeenVotingExplanation')
      if (!hasSeenExplanation) {
        setInternalIsOpen(true)
      }
    }
  }, [externalIsOpen])

  const handleClose = () => {
    onClose()
    localStorage.setItem('hasSeenVotingExplanation', 'true')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How to Vote on Voice Replies</DialogTitle>
          <DialogDescription>
            React to voice replies with these voting options:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <span className="text-2xl">🎯</span>
            <div>
              <div className="font-medium">Fact</div>
              <div className="text-sm text-muted-foreground">
                This voice reply contains accurate information
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <span className="text-2xl">⛓️‍💥</span>
            <div>
              <div className="font-medium">Myth</div>
              <div className="text-sm text-muted-foreground">
                This voice reply contains misleading or false information
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <span className="text-2xl">❓</span>
            <div>
              <div className="font-medium">Unclear</div>
              <div className="text-sm text-muted-foreground">
                This voice reply is confusing or needs clarification
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground bg-background border rounded-lg p-3">
            <strong>How it works:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>You can vote once per voice reply</li>
              <li>Click the same vote again to remove it</li>
              <li>Click a different vote to change your choice</li>
              <li>You must be signed in to vote</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleClose}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}