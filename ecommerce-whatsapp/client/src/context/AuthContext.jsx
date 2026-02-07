import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import { setupEnhancedMatching, clearEnhancedMatching, getUserDataForMatching } from '../utils/enhancedMatching'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Obtener sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            const user = session?.user ?? null;
            setUser(user);
            
            // Configurar Enhanced Matching si hay usuario
            if (user) {
                console.log('👤 AuthContext: User loaded', { 
                    email: user.email, 
                    role: user.user_metadata?.role,
                    metadata: user.user_metadata 
                });
                const matchingData = getUserDataForMatching(user.user_metadata);
                if (matchingData) {
                    setupEnhancedMatching(matchingData);
                }
            }
            
            setLoading(false);
        })

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                
                // Configurar Enhanced Matching según el evento
                if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && currentUser)) {
                    const matchingData = getUserDataForMatching(currentUser.user_metadata);
                    if (matchingData) {
                        setupEnhancedMatching(matchingData);
                    }
                } else if (event === 'SIGNED_OUT') {
                    clearEnhancedMatching();
                }
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
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { error: null }
        } catch (error) {
            console.warn('Error logging out:', error)
            // Force local state cleanup even if network request fails
            setUser(null)
            clearEnhancedMatching()
            
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
