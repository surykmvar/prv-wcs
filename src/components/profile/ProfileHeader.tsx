import { useState, type ReactNode } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Volume2, Settings } from 'lucide-react'
import { ProfileEditModal } from './ProfileEditModal'

interface ProfileHeaderProps {
  name: string
  email: string
  initial: string
  thoughtsCount: number
  woicesCount: number
  facts: number
  myths: number
  unclear: number
  avatarUrl?: string
  bio?: string
  showEmail?: boolean
  onProfileUpdate?: () => void
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
  avatarUrl,
  bio,
  showEmail = true,
  onProfileUpdate
}: ProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <Card className="mb-5 md:mb-8">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-12 w-12">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-woices-violet to-woices-mint text-white">
                    {initial}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-semibold md:text-xl">{name}</h1>
                {bio ? (
                  <p className="truncate text-xs text-muted-foreground md:text-sm italic">
                    "{bio}"
                  </p>
                ) : showEmail ? (
                  <p className="truncate text-xs text-muted-foreground md:text-sm">{email}</p>
                ) : (
                  <p className="text-xs text-muted-foreground md:text-sm">Woicer</p>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
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

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={{
          display_name: name,
          avatar_url: avatarUrl,
          bio: bio,
          show_email: showEmail
        }}
        onProfileUpdate={() => {
          onProfileUpdate?.();
          setIsEditModalOpen(false);
        }}
      />
    </>
  );
}
