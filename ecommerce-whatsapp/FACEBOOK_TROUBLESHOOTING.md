# 🔧 TROUBLESHOOTING - Problemas Comunes y Soluciones

---

## ❓ No veo eventos en Meta Event Test Tool

### Causa 1: Pixel ID incorrecto
**Síntoma**: Test Tool vacío, 0 eventos
**Solución**:
```javascript
// Verificar en index.html línea 163:
fbq('init', '1613812252958290');  // ← Debe coincidir con tu Pixel ID
```
- Ir a Meta Business → Pixels
- Copiar ID correcto
- Reemplazar en index.html

### Causa 2: Access Token expirado o incorrecto
**Síntoma**: Console muestra: `Error en Facebook Conversion API`
**Solución**:
```bash
# 1. Regenerar token
Ir a https://developers.facebook.com/ → App → Settings

# 2. Copiar token de larga duración

# 3. Actualizar en .env.local:
VITE_FACEBOOK_ACCESS_TOKEN=nuevo_token_aqui

# 4. Reiniciar servidor
npm run dev
```

### Causa 3: Browser ad-blocker bloqueando llamadas
**Síntoma**: Console limpia (sin errores), pero 0 eventos
**Solución**:
```javascript
// Abrir F12 → Network → buscar llamadas a graph.facebook.com
// Si ves 403 o bloqueadas, el ad-blocker está activo

// Desactivar temporalmente ad-blocker en localhost
// O usar navegador en modo incógnito
```

### Causa 4: VITE_FACEBOOK_PIXEL_ID está vacío
**Síntoma**: isFacebookConfigured() retorna false
**Solución**:
```bash
# Verificar en .env.local
echo %VITE_FACEBOOK_PIXEL_ID%

# Si está vacío, agregar:
VITE_FACEBOOK_PIXEL_ID=1613812252958290
VITE_FACEBOOK_ACCESS_TOKEN=your_token

# Reiniciar servidor (importante!)
npm run dev
```

---

## ❓ Veo errores en la consola

### Error: "Facebook Conversion API no está configurada"

**Mensaje completo**:
```
Facebook Conversion API no está configurada. Falta PIXEL_ID o ACCESS_TOKEN
```

**Solución**:
1. Abrir `client/src/config/facebook.js`
2. Verificar que lee desde variables de entorno
3. Agregar a `.env.local`:
```env
VITE_FACEBOOK_PIXEL_ID=1613812252958290
VITE_FACEBOOK_ACCESS_TOKEN=token_aqui
```
4. Reiniciar servidor

### Error: "Error al hacer hash"

**Mensaje**:
```
Error al hacer hash: TypeError: crypto.subtle is undefined
```

**Solución**:
- Este error es normal en desarrollo, se ignora
- En producción en Chrome/Firefox está disponible
- No afecta al rastreo (usa client-side como fallback)

### Error: Network 403/401

**Mensaje** (en Network tab de F12):
```
POST https://graph.facebook.com/v18.0/1613812252958290/events 403
```

**Causas**:
1. Access Token expirado → Regenerar token
2. Token de desarrollo (corta duración) → Usar token de larga duración
3. Permisos insuficientes → Agregar permiso `ads_management`

---

## ❓ AddToCart no se rastrea

### Problema: Clickeé agregar y no aparece en Console

**Solución 1: Verificar que se agregó el import**
```javascript
// ProductDetail.jsx debe tener:
import { trackViewContent, trackAddToCart } from '../../services/facebookService'
//                           ↑↑↑↑↑↑↑↑↑↑↑↑↑ ESTO DEBE ESTAR
```

**Solución 2: Verificar que se llama en handleAddToCart()**
```javascript
const handleAddToCart = () => {
    // ... código ...
    addToCart(product, quantity, { ... });
    
    // DEBE TENER ESTA LÍNEA:
    trackAddToCart(product, quantity, currentUser);
}
```

**Solución 3: Ver Console en F12**
```javascript
// Presionar F12 → Console → Agregar al carrito
// Debería ver:
// ✅ Evento Facebook registrado (Alta Precisión): AddToCart
// ✅ Server-side event tracked: track-add-to-cart
```

**Solución 4: Espiar Network**
```
F12 → Network → Agregar al carrito
Debería ver llamadas a:
  ✅ POST graph.facebook.com (cliente)
  ✅ POST /api/facebook/track-add-to-cart (servidor)
```

---

## ❓ Server-side tracking no funciona

### Problema: Console muestra error al llamar servidor

**Error**: `POST /api/facebook/track-add-to-cart 404`

**Solución**: El endpoint no existe
1. Verificar que creaste `server/src/routes/facebook.js`
2. Verificar que lo registraste en `server/src/server.js`:
```javascript
import facebookRoutes from './routes/facebook.js';
// ...
app.use('/api/facebook', facebookRoutes);
```
3. Reiniciar servidor

### Error: `Cannot find module facebookCAPI`

**Solución**: 
```bash
# Verificar que el archivo existe:
server/src/services/facebookCAPI.js

# Si no existe, copiar desde el proyecto
# Si existe, revisar path en import
```

### Error: `process.env.FB_ACCESS_TOKEN is undefined`

**Solución**:
1. Abrir `server/.env`
2. Agregar:
```env
FB_PIXEL_ID=1613812252958290
FB_ACCESS_TOKEN=tu_token_aqui
FB_TEST_EVENT_CODE=TEST12345
```
3. Reiniciar servidor Node.js

---

## ❓ Match Rate sigue en 0% después de 24 horas

### Causa 1: Catálogo no está vinculado

**Solución**:
1. Ir a https://business.facebook.com/catalogs
2. Seleccionar catálogo
3. Ir a "Data Sources"
4. Verificar que "Website Pixel" está conectado
5. Click en "Connect Pixel"

### Causa 2: Nombres de productos no coinciden

**Solución**:
```javascript
// En facebookCAPI.js, verificar que:
content_id: product.id  // Debe coincidir con Product Feed
content_name: product.name  // Debe coincidir exactamente
```

Ejemplo:
- En tu DB: "Decoración floral para mesa"
- En Pixel: "Decoración floral para mesa"
- ✅ MATCH

- En tu DB: "Decoración floral para mesa"
- En Pixel: "DECORACIÓN FLORAL"
- ❌ NO MATCH

### Causa 3: Catálogo está desactualizado

**Solución**:
1. Ir a Catalogs
2. Click en tu catálogo
3. "Sync settings" → Habilitar sincronización automática

---

## ❓ Vercel deployment falla

### Error: `Module not found: facebookCAPI.js`

**Solución**:
```bash
# En local funciona pero en Vercel no
# Verificar path de import:

// ❌ INCORRECTO:
import { trackServerEvent } from '../services/facebookCAPI'

// ✅ CORRECTO:
import { trackServerEvent } from '../services/facebookCAPI.js'
//                                                          ↑↑ Agregar .js
```

### Error: Environment variables undefined

**Solución**:
1. Ir a https://vercel.com/dashboard
2. Project → Settings → Environment Variables
3. Agregar:
   - `VITE_FACEBOOK_PIXEL_ID`
   - `VITE_FACEBOOK_ACCESS_TOKEN`
   - `FB_PIXEL_ID`
   - `FB_ACCESS_TOKEN`
4. Click "Save"
5. Redeploy

---

## ✅ Testing Checklist

### Test 1: Verificar Pixel inicializado
```javascript
// F12 → Console
console.log(window.fbq)
// Debería retornar: function fbq() { ... }
```

### Test 2: Verificar cookies
```javascript
// F12 → Console
console.log(document.cookie)
// Debería contener: _fbp=fb...
```

### Test 3: Verificar eventos se envían
```javascript
// F12 → Network → XHR
// Debería haber POST a:
// https://graph.facebook.com/v18.0/.../events
```

### Test 4: Verificar deduplicación
```javascript
// 1. Abrir sitio en 2 pestañas
// 2. Una pestaña: Rastrear desde cliente
// 3. Otra pestaña: Ver que también llega evento
// 4. En Meta Event Test Tool: Debe ser UN evento (no dos)
```

### Test 5: Verificar server-side
```javascript
// F12 → Network
// Filtrar por: /api/facebook
// Debería haber:
// POST /api/facebook/track-add-to-cart 200
// POST /api/facebook/track-purchase 200
```

---

## 🚨 Problemas Avanzados

### Problema: Match Rate bajo (30% en lugar de 80%)

**Causas posibles**:
1. SKU no coinciden entre DB y Pixel
2. Precios diferentes
3. Nombres con typos

**Solución**:
```bash
# 1. Exportar catálogo desde Meta
Meta → Catalogs → Export

# 2. Comparar con tu DB
SELECT id, name, price FROM products

# 3. Actualizar nombres/precios que no coincidan

# 4. Re-subir catálogo
Meta → Data Sources → Upload
```

### Problema: Eventos duplicados en Meta

**Síntoma**: Compra = 2 eventos (uno del cliente, uno del servidor)

**Solución**:
- **Es normal**, Meta deduplica automáticamente
- Usa el mismo `event_id` en cliente y servidor
- Verificar en "Event Deduplication" en Meta

```javascript
// En facebookCAPI.js:
const eventId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// Enviar el mismo eventId en payload
```

### Problema: ROI bajo en ads a pesar de tracking correcto

**Investigar**:
1. ¿Conversión API recibe eventos? ✅
2. ¿Match Rate > 80%? ✅
3. ¿Audiencia > 100 personas? 
4. ¿Presupuesto suficiente?
5. ¿Segmentación demasiado específica?

**Solución**: Ampliar audiencia, aumentar presupuesto, revisar segmentación

---

## 📞 Contacto/Escalación

Si después de todos estos pasos sigue sin funcionar:

1. **Revisar Logs de Servidor**:
```bash
# En servidor de Vercel:
Vercel Dashboard → Logs → Runtime Logs
Buscar errores de Facebook
```

2. **Verificar Permiso del Token**:
```bash
# Test del token:
curl -X GET "https://graph.facebook.com/me?access_token=YOUR_TOKEN"
# Debería retornar info del usuario
```

3. **Contactar Meta Support**:
- https://business.facebook.com/support
- Ticket con: Pixel ID, errores, detalles técnicos

---

