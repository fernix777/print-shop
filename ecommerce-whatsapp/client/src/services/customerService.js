import { supabase } from '../config/supabase'

/**
 * Get all customers (from auth.users via RPC)
 * Intended for Admin use
 */
export async function getCustomers() {
    try {
        console.log('🔄 Calling get_all_users_admin RPC...')
        const { data, error } = await supabase.rpc('get_all_users_admin')

        if (error) {
            console.error('❌ RPC Error:', error)
            throw error
        }
        
        console.log('✅ RPC Success. Users found:', data?.length)
        
        // Map data to match component expectations
        const formattedData = data.map(user => ({
            ...user,
            full_name: user.full_name || 
                       (user.raw_user_meta_data?.full_name) || 
                       (user.raw_user_meta_data?.first_name ? `${user.raw_user_meta_data.first_name} ${user.raw_user_meta_data.last_name || ''}` : 'Sin Nombre'),
            phone: user.phone || user.raw_user_meta_data?.phone || 'N/A',
            city: user.city || user.raw_user_meta_data?.city || 'N/A'
        }))

        return { data: formattedData, error: null }
    } catch (error) {
        console.error('Error fetching customers:', error)
        return { data: null, error }
    }
}

/**
 * Get customer details including orders
 */
export async function getCustomerDetails(userId) {
    try {
        // Get profile (might be null if user only exists in auth)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle() // Use maybeSingle to avoid error if not found
        
        if (profileError) console.warn('Profile fetch warning:', profileError)

        // Get orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        return { data: { ...(profile || {}), orders }, error: null }
    } catch (error) {
        console.error('Error fetching customer details:', error)
        return { data: null, error }
    }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/actualizar-contrasena`,
        })
        
        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error sending password reset:', error)
        return { error }
    }
}
