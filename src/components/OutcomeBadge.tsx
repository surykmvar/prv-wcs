import { Badge } from '@/components/ui/badge'

export function OutcomeBadge({ code, label }: { code: 'bloom' | 'dust' | 'unclear' | 'none'; label: string }) {
  if (code === 'none') {
    return <Badge variant="outline" className="animate-fade-in">No votes yet</Badge>
  }
  if (code === 'bloom') {
    return <Badge className="animate-fade-in bg-gradient-to-r from-woices-violet to-woices-bloom text-white">{label}</Badge>
  }
  if (code === 'dust') {
    return <Badge variant="destructive" className="animate-fade-in">{label}</Badge>
  }
  return <Badge variant="secondary" className="animate-fade-in">{label}</Badge>
}
