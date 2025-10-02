import { AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LowCreditBannerProps {
  credits: number
  onPurchaseClick: () => void
}

export function LowCreditBanner({ credits, onPurchaseClick }: LowCreditBannerProps) {
  if (credits > 10) return null

  const isVeryLow = credits <= 3
  const isCritical = credits === 0

  return (
    <Alert 
      className={`mb-4 border-2 ${
        isCritical 
          ? 'bg-red-500/10 border-red-500/50' 
          : isVeryLow 
          ? 'bg-orange-500/10 border-orange-500/50'
          : 'bg-yellow-500/10 border-yellow-500/50'
      }`}
    >
      <AlertCircle className={`h-4 w-4 ${
        isCritical ? 'text-red-500' : isVeryLow ? 'text-orange-500' : 'text-yellow-500'
      }`} />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">
            {isCritical 
              ? '❌ Out of Credits!' 
              : isVeryLow 
              ? '⚠️ Very Low Credits' 
              : '💡 Running Low on Credits'
            }
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCritical 
              ? 'Purchase credits to continue posting and voting' 
              : `You have ${credits} credit${credits !== 1 ? 's' : ''} remaining. Top up to keep engaging!`
            }
          </p>
        </div>
        <Button 
          onClick={onPurchaseClick}
          size="sm"
          className="bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Get Credits
        </Button>
      </AlertDescription>
    </Alert>
  )
}
