# 🚀 GUÍA PASO A PASO - Arreglar Facebook Meta

**Tiempo total**: 1.5-2 horas  
**Dificultad**: Media  
**Herramientas necesarias**: VS Code, navegador

---

## PASO 1: Agregar rastreo de AddToCart (⏱️ 5 minutos)

### 1.1 Abrir ProductDetail.jsx

Ubicación: `client/src/pages/customer/ProductDetail.jsx`

### 1.2 En la parte superior, agregar import

**ENCONTRAR (línea 1-15):**
```javascript
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { trackViewContent } from '../../services/facebookService'
```

**CAMBIAR A:**
```javascript
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { trackViewContent, trackAddToCart } from '../../services/facebookService'
//                           ↑↑↑↑↑↑↑↑↑↑↑↑↑ AGREGAR ESTO
```

### 1.3 Agregar llamada en handleAddToCart

**ENCONTRAR (alrededor de línea 104-130):**
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
    // ❌ AQUÍ VA EL CAMBIO
}
```

**CAMBIAR A:**
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

    // ✅ AGREGAR ESTA LÍNEA:
    trackAddToCart(product, quantity, currentUser);
}
```

### 1.4 Guardar cambios
- Presiona `Ctrl+S`
- Verifica que Vercel redeploy automáticamente

---

## PASO 2: Crear server-side tracking (⏱️ 60 minutos)

### 2.1 Crear archivo de rutas Facebook

**Nuevo archivo**: `server/src/routes/facebook.js`

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

### 2.2 Registrar rutas en server.js

**Abrir**: `server/src/server.js`

**ENCONTRAR (búscar otros imports de routes, alrededor de línea 10-20):**
```javascript
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
```

**AGREGAR ANTES DE ELLAS:**
```javascript
import facebookRoutes from './routes/facebook.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
```

**ENCONTRAR (búscar `app.use()` donde se registran rutas, alrededor de línea 50-80):**
```javascript
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
```

**AGREGAR:**
```javascript
app.use('/api/facebook', facebookRoutes);  // ← AGREGAR ESTA LÍNEA
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
```

### 2.3 Actualizar facebookService.js del cliente

**Abrir**: `client/src/services/facebookService.js`

**ENCONTRAR** (buscar al final del archivo antes del `export default`):
```javascript
export default {
    trackFacebookEvent,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackCompleteRegistration,
    trackSearch,
    trackContact
};
```

**AGREGAR ANTES del `export default`:**
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

export default {
    trackFacebookEvent,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackCompleteRegistration,
    trackSearch,
    trackContact
};
```

### 2.4 Actualizar funciones de rastreo

**REEMPLAZAR** la función `trackViewContent`:

**ENCONTRAR:**
```javascript
export const trackViewContent = async (product, user = null) => {
    return trackFacebookEvent(FACEBOOK_EVENTS.VIEW_CONTENT, {
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
};
```

**CAMBIAR A:**
```javascript
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
```

**REEMPLAZAR** la función `trackAddToCart`:

**ENCONTRAR:**
```javascript
export const trackAddToCart = async (product, quantity, user = null) => {
    return trackFacebookEvent(FACEBOOK_EVENTS.ADD_TO_CART, {
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
};
```

**CAMBIAR A:**
```javascript
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
```

**REEMPLAZAR** la función `trackPurchase`:

**ENCONTRAR:**
```javascript
export const trackPurchase = async (order) => {
    return trackFacebookEvent(FACEBOOK_EVENTS.PURCHASE, {
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
};
```

**CAMBIAR A:**
```javascript
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

## PASO 3: Verificar Variables de Entorno (⏱️ 10 minutos)

### 3.1 Verificar `.env.local` (desarrollo)

**Archivo**: `client/.env.local`

**Debe contener:**
```env
VITE_FACEBOOK_PIXEL_ID=1613812252958290
VITE_FACEBOOK_ACCESS_TOKEN=tu_token_aqui
VITE_FACEBOOK_TEST_EVENT_CODE=TEST12345
```

**Si no tiene `VITE_FACEBOOK_ACCESS_TOKEN`:**
1. Ir a https://developers.facebook.com/
2. Crear un token de acceso
3. Agregarlo al archivo

### 3.2 Verificar `.env` (servidor)

**Archivo**: `server/.env`

**Debe contener:**
```env
FB_PIXEL_ID=1613812252958290
FB_ACCESS_TOKEN=tu_token_aqui
FB_TEST_EVENT_CODE=TEST12345
```

### 3.3 Configurar en Vercel (producción)

1. Ir a https://vercel.com/dashboard
2. Seleccionar tu proyecto
3. Settings → Environment Variables
4. Agregar:
   - `VITE_FACEBOOK_PIXEL_ID` = `1613812252958290`
   - `VITE_FACEBOOK_ACCESS_TOKEN` = `tu_token`
   - `FB_PIXEL_ID` = `1613812252958290`
   - `FB_ACCESS_TOKEN` = `tu_token`

---

## PASO 4: Probar cambios (⏱️ 15 minutos)

### 4.1 Probar en desarrollo local

```bash
# Terminal cliente
cd client
npm run dev

# Terminal servidor (otra ventana)
cd server
npm start
```

### 4.2 Probar AddToCart

1. Abrir http://localhost:5173
2. Entrar a un producto
3. Seleccionar cantidad
4. Hacer clic en "Agregar al carrito"
5. Abrir F12 → Console
6. Buscar: `"✅ Evento Facebook registrado"`

**Debería ver**:
```
✅ Evento Facebook registrado (Alta Precisión): AddToCart
✅ Server-side event tracked: track-add-to-cart
```

### 4.3 Probar compra

1. Ir al checkout
2. Completar pedido
3. Ver en Console:
```
✅ Evento Facebook registrado: Purchase
✅ Server-side event tracked: track-purchase
```

---

## PASO 5: Deployar (⏱️ 5 minutos)

### 5.1 Commit cambios

```bash
git add .
git commit -m "Fix: Agregar rastreo de AddToCart y server-side Facebook tracking"
git push
```

### 5.2 Vercel redeploy

- Automático en 2-3 minutos
- Verificar en https://vercel.com/dashboard

---

## PASO 6: Validar en Meta (⏱️ 10 minutos)

### 6.1 Meta Event Test Tool

1. Ir a https://business.facebook.com/events_manager
2. Seleccionar tu pixel
3. Ir a "Event Test Tool"
4. Seleccionar Website
5. Esperar eventos (2-5 segundos)

**Debería ver**:
- ✅ PageView
- ✅ ViewContent
- ✅ **AddToCart** (NUEVO)
- ✅ Purchase

### 6.2 Catalog Match

1. Ir a https://business.facebook.com/catalogs
2. Seleccionar tu catálogo
3. Esperar 24 horas
4. Ver "Match Rate" > 0%

---

## Checklist Final

- [ ] Agregué import de `trackAddToCart` en ProductDetail.jsx
- [ ] Agregué llamada a `trackAddToCart()` en handleAddToCart
- [ ] Creé server/src/routes/facebook.js
- [ ] Registré rutas en server.js
- [ ] Agregué función `trackServerEvent()` en facebookService.js
- [ ] Actualicé trackViewContent con server-side
- [ ] Actualicé trackAddToCart con server-side
- [ ] Actualicé trackPurchase con server-side
- [ ] Verifiqué variables de entorno (.env.local y .env)
- [ ] Probé en desarrollo (http://localhost:5173)
- [ ] Vi eventos en Console
- [ ] Hice push a GitHub
- [ ] Verifiqué redeploy en Vercel
- [ ] Validé en Meta Event Test Tool

---

## Resultados Esperados

### INMEDIATO (5-10 min después de deployar):
- ✅ Console muestra eventos de Facebook
- ✅ Meta Event Test Tool recibe eventos
- ✅ Deduplicación funciona (1 evento = 1 venta)

### 24 HORAS:
- ✅ Match Rate > 0% (50-80%)
- ✅ Catálogo se vincula automáticamente
- ✅ Audiencias se llenan

### 7 DÍAS:
- ✅ Datos suficientes para Ads Manager
- ✅ Conversiones medibles
- ✅ Retargeting 100% funcional

