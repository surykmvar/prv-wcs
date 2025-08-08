import type { ComponentType } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Volume2, Flower2, Wind, AlertCircle } from 'lucide-react'

interface ProfileHeaderProps {
  name: string
  email: string
  initial: string
  thoughtsCount: number
  woicesCount: number
  facts: number
  myths: number
  unclear: number
}

function StatPill({ icon: Icon, label, value }: { icon: ComponentType<any>; label: string; value: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-md bg-muted/30 px-2 py-1">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-medium text-foreground/90">{value}</span>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default function ProfileHeader({
  name,
  email,
  initial,
  thoughtsCount,
  woicesCount,
  facts,
  myths,
  unclear,
}: ProfileHeaderProps) {
  return (
    <Card className="mb-5 md:mb-8">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-to-br from-woices-violet to-woices-mint text-white">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold md:text-xl">{name}</h1>
            <p className="truncate text-xs text-muted-foreground md:text-sm">{email}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          <StatPill icon={MessageSquare} label="Thoughts" value={thoughtsCount} />
          <StatPill icon={Volume2} label="Woices" value={woicesCount} />
          <StatPill icon={Flower2} label="Facts" value={facts} />
          <StatPill icon={Wind} label="Myths" value={myths} />
          <StatPill icon={AlertCircle} label="Unclear" value={unclear} />
        </div>
      </CardContent>
    </Card>
  )
}
