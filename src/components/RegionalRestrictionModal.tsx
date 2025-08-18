import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Info } from "lucide-react"

interface RegionalRestrictionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegionalRestrictionModal({ open, onOpenChange }: RegionalRestrictionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-blue-500" />
          </div>
          <DialogTitle className="text-xl font-semibold text-center">
            Regional Thought - Can't Record
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 mt-4">
            <p className="text-muted-foreground">
              This thought is for users from a specific region only. You're not eligible to record a reply.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span className="font-medium">Why regional only?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Local context and cultural perspective matter for this topic.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>You can still listen to regional replies!</span>
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