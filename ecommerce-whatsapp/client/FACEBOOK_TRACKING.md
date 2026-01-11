# Facebook Tracking Service - Guía de Uso

## 📋 Overview

El servicio `facebookTracking.js` proporciona tracking dual (Pixel + CAPI) para todos los eventos de Facebook. Cada llamada envía automáticamente:

1. **Facebook Pixel** (browser-side)
2. **Conversions API** (server-side)
3. **Event ID único** para deduplicación
4. **Cookies fbp/fbc** automáticas
5. **User Agent y datos de cliente**

## 🚀 Instalación y Configuración

### 1. Importar el servicio

```javascript
import { 
  trackViewContent, 
  trackAddToCart, 
  trackInitiateCheckout, 
  trackPurchase, 
  trackPageView 
} from '../services/facebookTracking';
```

### 2. Configuración automática

- **PageView**: Automático en cada cambio de ruta (implementado en App.jsx)
- **Cookies**: Automáticas desde el navegador
- **User Data**: Automático desde AuthContext

## 📱 Eventos Disponibles

### ViewContent - Ver Producto
```javascript
useEffect(() => {
  if (product) {
    trackViewContent(product);
  }
}, [product]);
```

### AddToCart - Agregar al Carrito
```javascript
const addToCart = async (product, quantity = 1) => {
  // ... lógica del carrito ...
  
  // Tracking
  await trackAddToCart(product, quantity);
  
  // ... resto de lógica ...
};
```

### InitiateCheckout - Iniciar Checkout
```javascript
const handleCheckout = async () => {
  // Tracking
  await trackInitiateCheckout(cart);
  
  // ... lógica de checkout ...
};
```

### Purchase - Compra Completada
```javascript
useEffect(() => {
  if (order) {
    trackPurchase({
      id: order.id,
      total: order.total,
      items: order.items,
      user: {
        email: order.customer_email,
        phone: order.customer_phone,
        first_name: order.customer_name?.split(' ')[0],
        last_name: order.customer_name?.split(' ')[1]
      }
    });
  }
}, [order]);
```

### PageView - Vista de Página (Automático)
```javascript
// Implementado automáticamente en App.jsx
// Se dispara en cada cambio de ruta
```

## 🎯 Formatos de Datos

### Product (para ViewContent/AddToCart)
```javascript
const product = {
  id: "prod-123",
  name: "Producto Ejemplo",
  base_price: 999.99,
  price: 999.99
};
```

### Cart (para InitiateCheckout)
```javascript
const cart = [
  {
    id: "prod-123",
    name: "Producto Ejemplo",
    price: 999.99,
    quantity: 2
  }
];
```

### Order (para Purchase)
```javascript
const order = {
  id: "order-456",
  total: 1999.98,
  items: [
    {
      product_id: "prod-123",
      product_name: "Producto Ejemplo",
      quantity: 2,
      price: 999.99
    }
  ],
  user: {
    email: "cliente@ejemplo.com",
    phone: "+549388123456",
    first_name: "Juan",
    last_name: "Pérez"
  }
};
```

## 🔄 Flujo Completo

1. **Usuario visita producto** → `ViewContent` (Pixel + CAPI)
2. **Usuario agrega al carrito** → `AddToCart` (Pixel + CAPI)
3. **Usuario inicia checkout** → `InitiateCheckout` (Pixel + CAPI)
4. **Usuario completa compra** → `Purchase` (Pixel + CAPI)
5. **Navegación entre páginas** → `PageView` (Pixel solo)

## 📊 Logs y Debugging

Cada evento genera logs en la consola:

```javascript
✅ Dual tracking enviado: ViewContent { success: true, data: {...} }
```

## 🛠️ Endpoints Serverless

El servicio utiliza endpoints serverless en Vercel:

- `/api/facebook/track-view` → ViewContent
- `/api/facebook/track-add-to-cart` → AddToCart
- `/api/facebook/track-checkout` → InitiateCheckout
- `/api/facebook/track-purchase` → Purchase

## ⚠️ Notas Importantes

- **Event ID único**: Generado automáticamente para deduplicación
- **Cookies fbp/fbc**: Extraídas automáticamente del navegador
- **User Agent**: Incluido automáticamente
- **Errores**: Los errores de CAPI no afectan el Pixel
- **Async**: Las funciones son async pero no bloquean el UI

## 🔧 Mantenimiento

- **Variables de entorno**: Configurar en Vercel (`FB_PIXEL_ID`, `FB_ACCESS_TOKEN`)
- **Gateway de Meta**: Configurar con URL del endpoint
- **Testing**: Probar cada evento en la consola del navegador
