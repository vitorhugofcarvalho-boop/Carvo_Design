import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-base">
        <div className="flex flex-col items-center gap-3">
          <div className="size-6 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary" />
          <p className="text-xs text-brand-platinum/30">Verificando sessão…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
