# 🔧 SOLUCIONES ESPECÍFICAS - Facebook Meta Pixel

## RESUMEN EJECUTIVO
- ✅ Pixel INICIALIZADO (en index.html línea 163)
- ❌ **Evento AddToCart NUNCA se rastrea** (CRÍTICO)
- ❌ **No hay server-side tracking** (CRÍTICO)
- ❓ Variables de entorno del cliente (DESCONOCIDO)

---

## 🔴 PROBLEMA 1: NO SE RASTREA "ADD TO CART" (CRÍTICO)

### Ubicación del problema:
[ProductDetail.jsx](client/src/pages/customer/ProductDetail.jsx) - Línea 104-130

### Código ACTUAL (INCORRECTO):
```javascript
const handleAddToCart = () => {
    if (!purchaseType) {
        alert('Por favor selecciona un tipo de compra');
        return;
    }

    if (!quantity) {
        alert('Por favor selecciona una cantidad');
        return;
    }

    addToCart(product, quantity, {
        purchaseType,
        selectedVariant: selectedColor,
        selectedCondition: purchaseType,
    });
    // ❌ FALTA RASTREO
}
```

### Código CORRECTO (SOLUCIÓN):
```javascript
import { trackAddToCart } from '../../services/facebookService'

const handleAddToCart = () => {
    if (!purchaseType) {
        alert('Por favor selecciona un tipo de compra');
        return;
    }

    if (!quantity) {
        alert('Por favor selecciona una cantidad');
        return;
    }

    // Agregar al carrito
    addToCart(product, quantity, {
        purchaseType,
        selectedVariant: selectedColor,
        selectedCondition: purchaseType,
    });

    // ✅ RASTREAR EVENTO
    trackAddToCart(product, quantity, currentUser);
}
```

---

## 🔴 PROBLEMA 2: NO HAY SERVER-SIDE TRACKING (CRÍTICO)

### El problema:
Meta recibe eventos solo desde el cliente (navegador). Sin server-side:
- 🚫 Usuarios con ad-blockers no son rastreados
- 🚫 Conexiones lentas pierden eventos
- 🚫 Meta no valida los eventos
- 🚫 **Match Rate = 0%**

### Solución - Crear endpoints en servidor:

#### PASO 1: Crear ruta en server

[server/src/routes/facebook.js](server/src/routes/facebook.js) - **NUEVO ARCHIVO**:
```javascript
import express from 'express';
import {
    trackServerViewContent,
    trackServerAddToCart,
    trackServerInitiateCheckout,
    trackServerPurchase,
    trackServerCompleteRegistration
} from '../services/facebookCAPI.js';

const router = express.Router();

// Endpoint para rastrear visualización de producto
router.post('/track-view', async (req, res) => {
    try {
        const { product, user, eventSourceUrl } = req.body;
        const result = await trackServerViewContent(product, user, eventSourceUrl);
        res.json({ success: !!result, data: result });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint para rastrear agregar al carrito
router.post('/track-add-to-cart', async (req, res) => {
    try {
        const { product, quantity, user, eventSourceUrl } = req.body;
        const result = await trackServerAddToCart(product, quantity, user, eventSourceUrl);
        res.json({ success: !!result, data: result });
    } catch (error) {
        console.error('Error tracking add to cart:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint para rastrear checkout
router.post('/track-checkout', async (req, res) => {
    try {
        const { cartTotal, itemsCount, user, eventSourceUrl } = req.body;
        const result = await trackServerInitiateCheckout(cartTotal, itemsCount, user, eventSourceUrl);
        res.json({ success: !!result, data: result });
    } catch (error) {
        console.error('Error tracking checkout:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint para rastrear compra
router.post('/track-purchase', async (req, res) => {
    try {
        const { order, eventSourceUrl } = req.body;
        const result = await trackServerPurchase(order, eventSourceUrl);
        res.json({ success: !!result, data: result });
    } catch (error) {
        console.error('Error tracking purchase:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint para rastrear registro
router.post('/track-registration', async (req, res) => {
    try {
        const { user, eventSourceUrl } = req.body;
        const result = await trackServerCompleteRegistration(user, eventSourceUrl);
        res.json({ success: !!result, data: result });
    } catch (error) {
        console.error('Error tracking registration:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
```

#### PASO 2: Registrar ruta en servidor

[server/src/server.js](server/src/server.js) - Agregar:
```javascript
import facebookRoutes from './routes/facebook.js';

// ... después de otras rutas ...

app.use('/api/facebook', facebookRoutes);
```

#### PASO 3: Crear servicio cliente para llamar al servidor

[client/src/services/facebookService.js](client/src/services/facebookService.js) - Agregar:
```javascript
/**
 * Enviar evento al servidor para rastreo server-side
 */
const trackServerEvent = async (endpoint, data) => {
    try {
        const response = await fetch(`/api/facebook/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...data,
                eventSourceUrl: typeof window !== 'undefined' ? window.location.href : ''
            })
        });

        if (!response.ok) {
            console.warn(`Server tracking failed: ${endpoint}`);
            return null;
        }

        const result = await response.json();
        console.log(`✅ Server-side event tracked: ${endpoint}`, result);
        return result;
    } catch (error) {
        console.error(`Error en server tracking (${endpoint}):`, error);
        return null;
    }
};
```

#### PASO 4: Actualizar funciones para usar server-side

Modificar en [client/src/services/facebookService.js](client/src/services/facebookService.js):

```javascript
// Modificar trackViewContent existente para TAMBIÉN llamar servidor
export const trackViewContent = async (product, user = null) => {
    // 1. Rastrear desde cliente
    const clientResult = await trackFacebookEvent(FACEBOOK_EVENTS.VIEW_CONTENT, {
        user,
        content_id: product.id,
        content_name: product.name,
        value: product.base_price,
        contents: [
            {
                id: product.id,
                quantity: 1,
                delivery_category: 'home_delivery'
            }
        ]
    });

    // 2. Rastrear desde servidor (deduplicación)
    const serverResult = await trackServerEvent('track-view', {
        product,
        user
    });

    return clientResult || serverResult;
};

// Modificar trackAddToCart existente
export const trackAddToCart = async (product, quantity, user = null) => {
    // 1. Rastrear desde cliente
    const clientResult = await trackFacebookEvent(FACEBOOK_EVENTS.ADD_TO_CART, {
        user,
        content_id: product.id,
        content_name: product.name,
        value: product.base_price * quantity,
        contents: [
            {
                id: product.id,
                quantity: quantity,
                delivery_category: 'home_delivery'
            }
        ]
    });

    // 2. Rastrear desde servidor (más confiable)
    const serverResult = await trackServerEvent('track-add-to-cart', {
        product,
        quantity,
        user
    });

    return clientResult || serverResult;
};

// Modificar trackPurchase
export const trackPurchase = async (order) => {
    // 1. Rastrear desde cliente
    const clientResult = await trackFacebookEvent(FACEBOOK_EVENTS.PURCHASE, {
        user: order.user,
        value: order.total,
        content_id: order.id,
        content_name: `Order #${order.id}`,
        contents: order.items.map(item => ({
            id: item.product_id,
            quantity: item.quantity,
            item_price: item.price,
            title: item.product_name,
            delivery_category: 'home_delivery'
        }))
    });

    // 2. Rastrear desde servidor (CRÍTICO para conversiones)
    const serverResult = await trackServerEvent('track-purchase', {
        order
    });

    return clientResult || serverResult;
};
```

---

## 🟠 PROBLEMA 3: VARIABLES DE ENTORNO DEL CLIENTE

### Ubicación:
[client/src/config/facebook.js](client/src/config/facebook.js)

### Verificar que existan en:

#### `.env.local` (desarrollo):
```env
VITE_FACEBOOK_PIXEL_ID=1613812252958290
VITE_FACEBOOK_ACCESS_TOKEN=tu_access_token_aqui
VITE_FACEBOOK_TEST_EVENT_CODE=TEST12345
```

#### `.env` (servidor):
```env
FB_PIXEL_ID=1613812252958290
FB_ACCESS_TOKEN=tu_access_token_aqui
FB_TEST_EVENT_CODE=TEST12345
```

#### Variables en Vercel (producción):
Configurar en: https://vercel.com → Project Settings → Environment Variables

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Rastreo de AddToCart (30 minutos)
- [ ] Importar `trackAddToCart` en ProductDetail.jsx
- [ ] Llamar `trackAddToCart()` en `handleAddToCart()`
- [ ] Probar en navegador (F12 → Console → buscar eventos)

### Fase 2: Server-Side Tracking (1 hora)
- [ ] Crear [server/src/routes/facebook.js](server/src/routes/facebook.js)
- [ ] Registrar rutas en [server/src/server.js](server/src/server.js)
- [ ] Agregar función `trackServerEvent()` en facebookService.js
- [ ] Actualizar funciones de rastreo

### Fase 3: Variables de Entorno (15 minutos)
- [ ] Verificar PIXEL_ID en index.html (línea 163) = `1613812252958290`
- [ ] Obtener Access Token desde Meta
- [ ] Copiar a `.env.local` y `.env`
- [ ] Deployar cambios

### Fase 4: Testing y Validación (30 minutos)
- [ ] Usar Meta Event Test Tool: https://business.facebook.com/events_manager
- [ ] Enviar evento de prueba desde el sitio
- [ ] Verificar que aparezca en Event Test Tool
- [ ] Esperar 24 horas para Match Rate se actualice
- [ ] Revisar Meta Ads Manager → Catalog → Match Rate

---

## 🎯 RESULTADOS ESPERADOS

### ANTES (Actual):
- ❌ Match Rate: 0%
- ❌ Eventos últimos 7 días: 0
- ❌ AddToCart: No rastreado
- ❌ ViewContent: Parcialmente

### DESPUÉS (Con cambios):
- ✅ Match Rate: >80%
- ✅ Eventos últimos 7 días: Cientos
- ✅ AddToCart: Rastreado (cliente + servidor)
- ✅ ViewContent: Completamente rastreado
- ✅ Purchase: Completamente rastreado
- ✅ Catálogo vinculado automáticamente

---

## ⚠️ NOTAS IMPORTANTES

1. **Test Event Code**: Úsalo durante desarrollo para NO contaminar datos
2. **Deduplicación**: Enviar desde cliente Y servidor es SEGURO (Meta deduplica automáticamente)
3. **Conversión API**: Es OBLIGATORIA en 2024+ para retargeting con confiabilidad
4. **Match Rate**: Tarda 24-48 horas para actualizarse después de eventos
5. **Product Catalog**: Asegurar que el catálogo en Meta tenga los mismos SKU/IDs que tu base de datos

