import { supabase } from '../config/supabase'

/**
 * Get all customers (profiles)
 * Intended for Admin use
 */
export async function getCustomers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
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
        // Get profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        
        if (profileError) throw profileError

        // Get orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        return { data: { ...profile, orders }, error: null }
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
