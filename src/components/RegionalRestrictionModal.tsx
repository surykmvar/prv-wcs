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
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl font-semibold">
              Regional Thought - Can't Record
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This thought is for users from a specific region only. You're not eligible to record a reply.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Why regional only?</p>
                <p className="text-sm text-muted-foreground">
                  Local context and cultural perspective matter for this topic.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>You can still listen to regional replies!</span>
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