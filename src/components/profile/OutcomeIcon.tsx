import { Flower2, Wind, AlertCircle, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type OutcomeCode = 'bloom' | 'dust' | 'unclear' | 'none'

const messages: Record<OutcomeCode, string> = {
  bloom: 'Your voice is blooming',
  dust: 'Your voice turned to dust',
  unclear: 'Others found this unclear',
  none: 'No votes yet',
}

export default function OutcomeIcon({ outcome }: { outcome: OutcomeCode }) {
  const size = 'h-4 w-4 md:h-5 md:w-5'

  const icon = {
    bloom: <Flower2 className={`${size} text-primary`} />,
    dust: <Wind className={`${size} text-destructive`} />,
    unclear: <AlertCircle className={`${size} text-muted-foreground`} />,
    none: <HelpCircle className={`${size} text-muted-foreground`} />,
  }[outcome]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span aria-label={messages[outcome]} className="inline-flex items-center">
          {icon}
        </span>
      </TooltipTrigger>
      <TooltipContent side="left" className="text-xs">
        {messages[outcome]}
      </TooltipContent>
    </Tooltip>
  )
}
