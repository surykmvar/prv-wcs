import type { ReactNode } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Volume2 } from 'lucide-react'

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

function StatPill({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-md bg-muted/30 px-2 py-1">
      <span className="inline-flex items-center justify-center">{icon}</span>
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
          <StatPill icon={<MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />} label="Thoughts" value={thoughtsCount} />
          <StatPill icon={<Volume2 className="h-3.5 w-3.5 text-muted-foreground" />} label="Woices" value={woicesCount} />
          <StatPill icon={<span className="text-[14px]" aria-hidden="true">🎯</span>} label="Facts" value={facts} />
          <StatPill icon={<span className="text-[14px]" aria-hidden="true">⛓️‍💥</span>} label="Myths" value={myths} />
          <StatPill icon={<span className="text-[14px]" aria-hidden="true">❓</span>} label="Unclear" value={unclear} />
        </div>
      </CardContent>
    </Card>
  )
}
