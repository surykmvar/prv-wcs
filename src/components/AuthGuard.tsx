import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />
  }

  if (!requireAuth && user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}