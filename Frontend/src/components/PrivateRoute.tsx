import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore(s => s.currentUser)
  const initializing = useAuthStore(s => s.initializing)

  if (initializing) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  return currentUser ? <>{children}</> : <Navigate to="/login" replace />
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore(s => s.currentUser)
  const initializing = useAuthStore(s => s.initializing)

  if (initializing) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
