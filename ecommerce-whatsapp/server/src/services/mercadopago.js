import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Mercado Pago con el Access Token
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

/**
 * Crear una preferencia de pago en Mercado Pago
 * @param {Object} orderData - Datos de la orden y productos
 * @returns {Promise<Object>} - Preferencia creada
 */
export const createPreference = async (orderData) => {
    try {
        if (!process.env.MP_ACCESS_TOKEN) {
            throw new Error('MP_ACCESS_TOKEN no configurado en el servidor');
        }

        const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';
        const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';

        const preference = new Preference(client);
        
        const items = orderData.items.map(item => {
            const unitPrice = Math.round(Number(item.price) * 100) / 100;

            return {
                id: item.id,
                title: item.name,
                unit_price: unitPrice,
                quantity: Number(item.quantity),
                currency_id: 'ARS'
            };
        });

        const body = {
            items,
            back_urls: {
                success: `${CLIENT_URL}/order-confirmation?status=success`,
                failure: `${CLIENT_URL}/checkout?status=failure`,
                pending: `${CLIENT_URL}/order-confirmation?status=pending`,
            },
            external_reference: orderData.orderId.toString(),
            statement_descriptor: 'TIENDA IMPRESION',
            notification_url: `${SERVER_URL}/api/payments/webhook`,
        };

        console.log('Creating Mercado Pago preference with body:', JSON.stringify(body, null, 2));

        const response = await preference.create({ body });
        return response;
    } catch (error) {
        console.error('Error al crear preferencia de Mercado Pago:', error);
        throw error;
    }
};
