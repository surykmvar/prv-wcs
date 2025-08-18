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
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-semibold">
              Voice Reply Already Submitted
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You've already submitted your Woice reply. Only one voice response per user is allowed.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Want to change it?</p>
                <p className="text-sm text-muted-foreground">
                  You can re-record if your reply gets voted "Unclear".
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Thanks for contributing!</span>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="px-8"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}