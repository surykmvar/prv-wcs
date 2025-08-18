import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Users, RotateCcw } from "lucide-react"

interface VoiceReplyInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoiceReplyInfoModal({ open, onOpenChange }: VoiceReplyInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <DialogTitle className="text-xl font-semibold text-center">
            Voice Reply Already Submitted
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 mt-4">
            <p className="text-muted-foreground">
              You've already submitted your Woice reply. Only one voice response per user is allowed.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCcw className="w-4 h-4" />
                <span className="font-medium">Want to change it?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You can re-record if your reply gets voted "Unclear".
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Thanks for contributing!</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}