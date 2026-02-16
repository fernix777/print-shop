import express from 'express';
import { createPreference } from '../services/mercadopago.js';

const router = express.Router();

// Crear preferencia de pago
router.post('/create-preference', async (req, res) => {
    try {
        const { items, orderId } = req.body;
        
        if (!items || !items.length) {
            return res.status(400).json({ error: 'No se enviaron productos' });
        }

        const preference = await createPreference({ items, orderId });
        
        res.json({
            id: preference.id,
            init_point: preference.init_point, // Link para redirección
            sandbox_init_point: preference.sandbox_init_point // Link para pruebas
        });
    } catch (error) {
        console.error('Error en /create-preference:', error);
        res.status(500).json({ error: error?.message || 'Error al procesar el pago' });
    }
});

// Webhook para notificaciones de Mercado Pago
router.post('/webhook', async (req, res) => {
    const { query } = req;
    const topic = query.topic || query.type;
    
    console.log('Webhook de Mercado Pago recibido:', { topic, id: query.id || query['data.id'] });

    try {
        if (topic === 'payment') {
            const paymentId = query.id || query['data.id'];
            // Aquí se debería consultar el estado del pago a Mercado Pago
            // y actualizar la orden en la base de datos (Supabase)
            console.log(`Procesando pago ID: ${paymentId}`);
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error en webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
