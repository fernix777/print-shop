import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children, requireAdmin = true }) {
    const { user, loading, isAdmin } = useAuth()

    console.log('🔍 ProtectedRoute Debug:', { user, loading, isAdmin: isAdmin(), requireAdmin })

    if (loading) {
        console.log('⏳ ProtectedRoute: Loading...')
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'var(--off-white)'
            }}>
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        )
    }

    if (!user) {
        const redirectPath = requireAdmin ? '/admin/login' : '/login'
        console.log(`❌ ProtectedRoute: No user, redirecting to ${redirectPath}`)
        return <Navigate to={redirectPath} replace />
    }

    if (requireAdmin && !isAdmin()) {
        console.log('❌ ProtectedRoute: User is not admin, redirecting to /')
        return <Navigate to="/" replace />
    }

    console.log('✅ ProtectedRoute: Access granted')
    return children
}
