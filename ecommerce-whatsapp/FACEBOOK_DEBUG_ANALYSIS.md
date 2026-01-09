# 🔍 Análisis de Problemas - Configuración Facebook Meta

## Fecha: 9 de Enero 2026
**Estado del cliente**: 0% Match Rate + 0 eventos en los últimos 7 días

---

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **FALTA DE LLAMADAS AL SERVIDOR (SERVER-SIDE TRACKING)**
**Severidad**: 🔴 CRÍTICA

El código tiene dos sistemas de tracking:
- ✅ **Cliente (facebookService.js)** - Llamadas desde React (propenso a ad-blockers)
- ⚠️ **Servidor (facebookCAPI.js)** - Nunca se invoca desde el servidor

**Problema**: Las funciones del servidor como `trackServerAddToCart()`, `trackServerPurchase()`, etc. **EXISTEN pero NUNCA se llaman**.

**Ubicaciones**:
- [server/src/services/facebookCAPI.js](server/src/services/facebookCAPI.js) - Funciones creadas pero nunca usadas
- [client/src/services/facebookService.js](client/src/services/facebookService.js) - Solo usa cliente

**Impacto**: 
- Los eventos NO llegan a Meta en muchos casos (ad-blockers, usuarios sin JS, conexiones lentas)
- Sin server-side tracking, Meta no valida los eventos

---

### 2. **NO SE RASTREAN EVENTOS "ADD TO CART"**
**Severidad**: 🔴 CRÍTICA

En [client/src/pages/customer/ProductDetail.jsx](client/src/pages/customer/ProductDetail.jsx):
- ✅ Se llama a `trackViewContent()` cuando carga el producto
- ❌ **NO se llama a `trackAddToCart()`** cuando hace click en agregar

```javascript
// LÍNEA 52: Se rastrean visualizaciones
trackViewContent(product, currentUser);

// LÍNEA 104-130: handleAddToCart NO rastrea el evento
const handleAddToCart = () => {
    // ... código ...
    addToCart(product, quantity, { ... });
    // ❌ FALTA: trackAddToCart(product, quantity, currentUser)
}
```

**Impacto**: Meta no recibe eventos de "agregada al carrito" → **Catalog match rate 0%**

---

### 3. **VARIABLES DE ENTORNO NO CONFIGURADAS**
**Severidad**: 🔴 CRÍTICA

El cliente busca variables que probablemente no existen:

```javascript
// client/src/config/facebook.js línea 6-8
PIXEL_ID: import.meta.env.VITE_FACEBOOK_PIXEL_ID || ''
ACCESS_TOKEN: import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN || ''
EVENT_SOURCE_ID: import.meta.env.VITE_FACEBOOK_EVENT_SOURCE_ID || ''
```

✅ El servidor puede tener las variables del servidor, pero el cliente necesita las suyas con prefijo `VITE_`

**Verificar en**:
- `.env.local` (cliente)
- `.env` (servidor)
- Variables de Vercel (production)

---

### 4. **NO HAY VALIDACIÓN DE CREDENCIALES**
**Severidad**: 🟠 ALTA

```javascript
export const isFacebookConfigured = () => {
    return !!(FACEBOOK_CONFIG.PIXEL_ID && FACEBOOK_CONFIG.ACCESS_TOKEN);
};
```

Esta función devuelve `false` silenciosamente si faltan credenciales. **No hay alertas para el equipo**.

---

### 5. **FALTA RASTREAR "ADDTOCART" EN CARRITO**
**Severidad**: 🟠 ALTA

No hay rastreo cuando se agrega desde el carrito mismo. Se necesita en [CartContext.jsx](CartContext.jsx) o similar.

---

### 6. **DEDUPLICACIÓN INCOMPLETA**
**Severidad**: 🟡 MEDIA

En [client/src/services/facebookService.js](client/src/services/facebookService.js) línea ~155:

```javascript
// Intenta deduplicar con el pixel del navegador
if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, {}, { eventID: eventId });
}
```

⚠️ **El Pixel no está inicializado**. No vemos el código de inicialización del Pixel en el proyecto.

---

### 7. **COOKIES DE FACEBOOK NO SE CAPTURAN CORRECTAMENTE**
**Severidad**: 🟡 MEDIA

En [client/src/services/facebookService.js](client/src/services/facebookService.js) línea 12-17:

```javascript
const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    // ... código ...
}
```

Las cookies `_fbp` y `_fbc` se obtienen aquí, pero **el Pixel de Facebook que las crea nunca se inicializa**.

---

## ✅ PLAN DE SOLUCIÓN

### Fase 1: Eventos Críticos (1 hora)
1. ✅ Agregar `trackAddToCart()` en ProductDetail.jsx cuando hace click
2. ✅ Inicializar el Pixel de Facebook en App.jsx
3. ✅ Verificar que las variables de entorno estén configuradas

### Fase 2: Server-Side Tracking (2 horas)
1. ✅ Crear un endpoint en el servidor que llame a `trackServerEvent()`
2. ✅ Llamar este endpoint desde CheckoutPage.jsx
3. ✅ Llamar este endpoint desde OrderConfirmation.jsx

### Fase 3: Validación (1 hora)
1. ✅ Usar Meta Event Test Tool para confirmar eventos
2. ✅ Verificar Match Rate del catálogo
3. ✅ Validar deduplicación cliente-servidor

---

## 📊 CHECKLIST ACTUAL

| Item | Status | Ubicación |
|------|--------|-----------|
| Pixel inicializado | ❌ NO ENCONTRADO | N/A |
| ViewContent rastreado | ✅ SÍ | ProductDetail.jsx:52 |
| AddToCart rastreado | ❌ NO | ProductDetail.jsx - FALTA |
| Purchase rastreado | ✅ SÍ (Cliente) | OrderConfirmation.jsx:67 |
| Server-side rastreado | ❌ NO | Never called |
| Variables de entorno | ❓ DESCONOCIDO | .env files |
| Catálogo vinculado | ❓ DESCONOCIDO | Meta Business |
| Test Event Code | ✅ Configurado | facebookCAPI.js:85 |

---

## 🎯 PRÓXIMOS PASOS

1. **Confirma que tienes**: Pixel ID, Access Token, y Product Catalog ID
2. **Verifica `.env` files** - Las variables necesarias del cliente
3. **Agrega el Pixel** en HTML o App.jsx
4. **Crea los endpoints del servidor** para rastreo desde el backend
5. **Prueba con Meta's Event Test Tool**

