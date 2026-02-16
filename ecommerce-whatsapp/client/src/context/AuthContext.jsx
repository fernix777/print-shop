import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Obtener sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            const user = session?.user ?? null;
            setUser(user);

            setLoading(false);
        })

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signOut = async () => {
        try {
            // Evitar petición de red que puede abortarse en navegación
            const { error } = await supabase.auth.signOut({ scope: 'local' })
            if (error) throw error
            
            // Limpieza local inmediata
            setUser(null)
            try {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                        localStorage.removeItem(key)
                    }
                })
            } catch (e) {}
            
            // Intento no bloqueante de cierre global (revocar refresh tokens)
            setTimeout(() => {
                supabase.auth.signOut({ scope: 'global' }).catch(() => {})
            }, 0)
            
            return { error: null }
        } catch (error) {
            console.warn('Error logging out:', error)
            // Force local state cleanup even if network request fails
            setUser(null)
            // Manually clear Supabase local storage token to prevent persistence
            try {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                        localStorage.removeItem(key)
                    }
                })
            } catch (e) {
                console.warn('Could not clear local storage:', e)
            }
            
            return { error: null }
        }
    }

    const isAdmin = () => {
        return user?.user_metadata?.role === 'admin'
    }

    const value = {
        user,
        loading,
        signIn,
        signOut,
        isAdmin
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
