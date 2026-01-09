# 🧪 GUÍA DE TESTING - Facebook Meta Pixel Implementation

**Objetivo**: Validar que todos los cambios funcionan correctamente  
**Tiempo**: 15-20 minutos

---

## PASO 1: Testing Local (5 minutos)

### 1.1 Iniciar servidor y cliente

**Terminal 1 - Cliente**:
```bash
cd e:\Magnolia12\ecommerce-whatsapp\client
npm run dev
```

**Terminal 2 - Servidor**:
```bash
cd e:\Magnolia12\ecommerce-whatsapp\server
npm start
```

### 1.2 Abrir sitio

1. Ir a http://localhost:5173 en navegador
2. Seleccionar un producto
3. Abrir **F12** para Developer Tools

---

## PASO 2: Test AddToCart (5 minutos)

### 2.1 Rastrear en Console

1. En la página del producto, abrir **F12 → Console**
2. Hacer clic en **"Agregar al carrito"**
3. En Console, buscar mensajes de Facebook:

**Debería ver AMBOS**:
```
✅ Evento Facebook registrado (Alta Precisión): AddToCart {...}
✅ Server-side event tracked: track-add-to-cart {...}
```

### 2.2 Verificar Network

1. **F12 → Network**
2. Filtrar por: **XHR**
3. Hacer clic en "Agregar al carrito" nuevamente
4. Deberías ver:

```
✅ POST graph.facebook.com/.../events 200 (cliente)
✅ POST http://localhost:3000/api/facebook/track-add-to-cart 200 (servidor)
```

### 2.3 Interpretar Resultados

| Resultado | Significado |
|-----------|------------|
| ✅ Ambas llamadas 200 | 🟢 PERFECTO - Todo funciona |
| ✅ Solo cliente 200 | 🟡 PARCIAL - Server-side está abajo |
| ❌ Errores 403/401 | 🔴 ERROR - Token expirado o inválido |
| ❌ No ve llamadas | 🔴 ERROR - Ad-blocker bloqueando |

---

## PASO 3: Test Purchase (5 minutos)

### 3.1 Completar compra

1. Agregar producto al carrito
2. Ir a Checkout
3. Completar compra
4. En la página de confirmación, **F12 → Console**

### 3.2 Buscar eventos

Deberías ver (en orden):
```
✅ Evento Facebook registrado (Alta Precisión): InitiateCheckout
✅ Server-side event tracked: track-checkout
✅ Evento Facebook registrado (Alta Precisión): Purchase
✅ Server-side event tracked: track-purchase
```

### 3.3 Network Tab

En **F12 → Network**, deberías ver:
```
POST /api/facebook/track-checkout 200
POST /api/facebook/track-purchase 200
POST graph.facebook.com/.../events 200
```

---

## PASO 4: Meta Event Test Tool (5 minutos)

### 4.1 Abrir Event Test Tool

1. Ir a https://business.facebook.com/events_manager
2. Seleccionar tu Pixel: **1613812252958290**
3. Click en **"Event Test Tool"**
4. Dejar en: **Website**

### 4.2 Generar eventos

1. En tu sitio local (http://localhost:5173):
   - Entrar a un producto
   - Hacer click en "Agregar al carrito"

### 4.3 Verificar en Meta

En **Event Test Tool**, deberías ver dentro de **2-5 segundos**:

```
🔵 PageView
🔵 ViewContent
🔵 AddToCart ← NUEVO!
```

Si ves **AddToCart**, significa:
- ✅ Tracking funciona en cliente
- ✅ Meta recibe eventos
- ✅ Token de acceso es válido

---

## PASO 5: Error Handling (Troubleshooting)

### Error: "Cannot GET /api/facebook/track-add-to-cart"

**Causa**: Servidor no tiene las rutas registradas  
**Solución**:
```bash
# Verificar que server.js tiene la línea:
grep "app.use('/api/facebook'" server/src/server.js

# Si no la tiene, leer IMPLEMENTATION_COMPLETED.md
```

### Error: "ECONNREFUSED 127.0.0.1:3000"

**Causa**: Servidor no está corriendo  
**Solución**:
```bash
# En Terminal 2:
cd server
npm start

# Verificar que aparezca:
# 🚀 Server running on http://localhost:3000
```

### Error: "401 Unauthorized" en graph.facebook.com

**Causa**: Token de Facebook expirado  
**Solución**:
1. Regenerar token en https://developers.facebook.com/
2. Actualizar en client/.env.local
3. Reiniciar: `npm run dev`

### No aparece "Server-side event tracked" en Console

**Causa**: trackServerEvent no está configurado  
**Solución**:
```bash
# Verificar que facebookService.js tiene la función:
grep "trackServerEvent" client/src/services/facebookService.js

# Debería retornar varias líneas
```

---

## PASO 6: Deploy a Vercel (5 minutos)

### 6.1 Commit cambios

```bash
cd e:\Magnolia12\ecommerce-whatsapp
git add .
git commit -m "feat: Complete Facebook Meta Pixel setup with server-side tracking"
git push
```

### 6.2 Verificar Deployment

1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto
3. Esperar que aparezca "Production Deployment"
4. Cuando esté en verde: ✅ Listo

### 6.3 Probrar en Producción

1. Ir a https://www.magnolia-n.com (tu sitio real)
2. **F12 → Console**
3. Agregar producto al carrito
4. Buscar: `"Server-side event tracked"`

**Si ves el mensaje**:
- ✅ Server-side tracking funciona en producción
- ✅ Eventos van a Meta en tiempo real
- ✅ Catálogo se vinculará en 24 horas

---

## PASO 7: Final Validation (5 minutos)

### 7.1 Check in Meta Event Test Tool (Producción)

1. Ir a https://business.facebook.com/events_manager
2. Seleccionar Pixel
3. Event Test Tool
4. **IMPORTANTE**: Cambiar a **Production** mode (no test mode)

### 7.2 Generar evento

1. En magnolia-n.com:
   - Entrar a producto
   - Agregar al carrito

### 7.3 Esperar confirmación

En Meta Event Test Tool (production), deberías ver:
```
✅ PageView
✅ ViewContent
✅ AddToCart ← CONFIRMACIÓN DE ÉXITO
```

Si aparecen los 3 eventos:
- 🟢 **IMPLEMENTACIÓN CORRECTA**
- 🟢 Match Rate se actualizará en 24h
- 🟢 Retargeting estará disponible en 24h

---

## 🎯 Checklist de Validación

- [ ] Servidor levanta sin errores en puerto 3000
- [ ] Cliente levanta sin errores en http://localhost:5173
- [ ] Ingresa a producto exitosamente
- [ ] Console muestra: `"✅ Evento Facebook registrado: ViewContent"`
- [ ] Agregar al carrito funciona
- [ ] Console muestra: `"✅ Evento Facebook registrado: AddToCart"`
- [ ] Console muestra: `"✅ Server-side event tracked: track-add-to-cart"`
- [ ] Network muestra POST a /api/facebook/track-add-to-cart con 200
- [ ] Network muestra POST a graph.facebook.com con 200
- [ ] Completa una compra
- [ ] Console muestra: `"✅ Server-side event tracked: track-purchase"`
- [ ] Meta Event Test Tool (local) muestra PageView, ViewContent, AddToCart
- [ ] Haces git push sin errores
- [ ] Vercel deployment termina en verde
- [ ] Pruebas en producción: magnolia-n.com
- [ ] Meta Event Test Tool (production) recibe eventos

---

## ✅ Resultado Esperado

### Después de completar todos los pasos:

**En Console (local/prod)**:
```
✅ Evento Facebook registrado (Alta Precisión): ViewContent
✅ Server-side event tracked: track-view
✅ Evento Facebook registrado (Alta Precisión): AddToCart
✅ Server-side event tracked: track-add-to-cart
✅ Evento Facebook registrado (Alta Precisión): Purchase
✅ Server-side event tracked: track-purchase
```

**En Meta Event Test Tool**:
```
🔵 PageView
🔵 ViewContent
🔵 AddToCart ← NUEVO - antes no aparecía!
🔵 InitiateCheckout
🔵 Purchase
```

**En Meta Ads Manager (después de 24h)**:
- ✅ Match Rate: 0% → 80%+
- ✅ Catálogo: Desvinculado → Vinculado automáticamente
- ✅ Retargeting: No disponible → Disponible
- ✅ Conversión: No medida → Medida correctamente

---

## 🆘 Si algo falla

**Leer**: [FACEBOOK_TROUBLESHOOTING.md](FACEBOOK_TROUBLESHOOTING.md)

**Buscar error** en esa guía

**Si no está**, crear issue con:
1. Error exacto de Console
2. Screenshot de Network tab
3. Resultado de: `console.log(window.fbq)`

