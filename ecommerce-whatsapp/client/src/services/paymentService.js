import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Crear preferencia de pago en Mercado Pago
 * @param {Array} items - Items del carrito
 * @param {string} orderId - ID de la orden generada
 * @returns {Promise<Object>} - Datos de la preferencia
 */
export const createPaymentPreference = async (items, orderId) => {
    try {
        const response = await axios.post(`${API_URL}/payments/create-preference`, {
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price || 0,
                quantity: item.quantity
            })),
            orderId
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear preferencia de pago:', error);
        throw error;
    }
};
