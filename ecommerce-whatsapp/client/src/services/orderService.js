import { supabase } from '../config/supabase'

/**
 * Crea una nueva orden
 * @param {Object} orderData - Datos de la orden
 * @returns {Promise<{data: Object, error: null} | {data: null, error: Error}>}
 */
export async function createOrder(orderData) {
    try {
        const { customer, items, total, paymentMethod, user_id } = orderData

        // 1. Crear la orden principal
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: user_id || null,
                customer_info: customer,
                total: total,
                status: 'pending',
                payment_method: paymentMethod
            }])
            .select()
            .single()

        if (orderError) throw orderError

        // 2. Crear los items de la orden
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            product_name: item.name,
            variant_info: item.variant || null // Si hay variante seleccionada
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) throw itemsError

        return { data: order, error: null }
    } catch (error) {
        console.error('Error creating order:', error)
        return { data: null, error }
    }
}

/**
 * Obtiene todas las órdenes (para admin)
 * @param {Object} options - Filtros y paginación
 * @returns {Promise<{data: Array, count: number, error: null} | {data: null, count: 0, error: Error}>}
 */
export async function getOrders(options = {}) {
    try {
        let query = supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })

        if (options.status) {
            query = query.eq('status', options.status)
        }

        if (options.limit) {
            query = query.limit(options.limit)
        }

        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
        }

        const { data, count, error } = await query

        if (error) throw error

        return { data, count, error: null }
    } catch (error) {
        console.error('Error fetching orders:', error)
        return { data: null, count: 0, error }
    }
}

/**
 * Obtiene una orden por ID
 * @param {number} id - ID de la orden
 */
export async function getOrderById(id) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .eq('id', id)
            .single()

        if (error) throw error

        return { data, error: null }
    } catch (error) {
        console.error('Error fetching order:', error)
        return { data: null, error }
    }
}

/**
 * Actualiza el estado de una orden
 * @param {number} id - ID de la orden
 * @param {string} status - Nuevo estado
 */
export async function updateOrderStatus(id, status) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return { data, error: null }
    } catch (error) {
        console.error('Error updating order status:', error)
        return { data: null, error }
    }
}

/**
 * Obtiene estadísticas de ventas
 */
export async function getSalesStats() {
    try {
        // Obtener total de ventas (suma de total de órdenes completadas)
        // Nota: Supabase no tiene sum() directo fácil sin RPC, así que lo calculamos en cliente por ahora
        // o usamos una query simple. Para muchos datos, mejor usar RPC.
        
        const { data: orders, error } = await supabase
            .from('orders')
            .select('total')
            .eq('status', 'completed')

        if (error) throw error

        const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0)
        
        // Conteo de órdenes
        const { count: ordersCount, error: countError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            
        if (countError) throw countError

        return { 
            totalSales, 
            ordersCount,
            error: null 
        }
    } catch (error) {
        console.error('Error fetching sales stats:', error)
        return { totalSales: 0, ordersCount: 0, error }
    }
}
