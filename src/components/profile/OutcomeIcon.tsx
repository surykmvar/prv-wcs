import { Wind, AlertCircle, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type OutcomeCode = 'bloom' | 'dust' | 'unclear' | 'none'

const messages: Record<OutcomeCode, string> = {
  bloom: 'Your voice is blooming',
  dust: 'Your voice turned to dust',
  unclear: 'Others found this unclear',
  none: 'No votes yet',
}

function BloomPlantIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="7" r="3" fill="hsl(var(--accent, 330 70% 75%))" />
      <rect x="11.4" y="10" width="1.2" height="7" rx="0.6" fill="hsl(var(--success, 150 45% 40%))" />
      <ellipse cx="9.8" cy="12.5" rx="2.2" ry="1" fill="hsl(var(--success, 150 45% 40%))" transform="rotate(-30 9.8 12.5)" />
      <ellipse cx="14.2" cy="13.5" rx="2.2" ry="1" fill="hsl(var(--success, 150 45% 40%))" transform="rotate(30 14.2 13.5)" />
    </svg>
  )
}

export default function OutcomeIcon({ outcome }: { outcome: OutcomeCode }) {
  const size = 'h-4 w-4 md:h-5 md:w-5'

  const icon = {
    bloom: <BloomPlantIcon className={size} />,
    dust: <Wind className={size} style={{ color: 'hsl(var(--sand, 40 70% 60%))' }} />,
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
      <TooltipContent side="left" className="text-xs animate-fade-in">
        {messages[outcome]}
      </TooltipContent>
    </Tooltip>
  )
}
