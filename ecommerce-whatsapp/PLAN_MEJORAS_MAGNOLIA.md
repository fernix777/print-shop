# 📋 Plan de Mejoras - Magnolia Novedades

## Análisis y Plan de Implementación

---

## ✅ PUNTO 1: STOCK DE ARTÍCULOS (COMPLETADO)

### Requerimiento
- Cambiar visualización de stock de cantidad numérica a estado binario
- Mostrar solo: "Disponible" o "No Disponible"
- ✅ Si el producto está "No Disponible", NO se puede agregar al carrito

### Archivos Modificados
- `client/src/pages/customer/ProductDetail.jsx`
- `client/src/pages/customer/ProductsPage.jsx`
- `client/src/pages/customer/CategoryPage.jsx`
- `client/src/pages/customer/SearchPage.jsx`
- `client/src/components/customer/FeaturedProducts.jsx`
- `client/src/pages/admin/Products.jsx`
- `client/src/context/CartContext.jsx`
- `client/src/pages/customer/ProductsPage.css`

### Estado: ✅ COMPLETADO (Commit: e5aea1a - 7 de febrero 2026)

---

## 🎯 PUNTO 2: MODO DE REGISTRO Y AUTENTICACIÓN

### Requerimientos
1. ❌ No llega correo de confirmación de registro
2. ❌ No avisa si el correo ya está registrado
3. ❌ Recuperación de contraseña no funciona (pantalla en blanco)
4. ✅ Formulario de contacto envía a WhatsApp (funcional)

### Archivos a Modificar
- `client/src/pages/auth/Register.jsx`
- `client/src/pages/auth/Login.jsx`
- Crear: `client/src/pages/auth/ForgotPassword.jsx`
- Crear: `client/src/pages/auth/ResetPassword.jsx`

### Configuración Supabase
- Verificar configuración de email templates
- Configurar SMTP o servicio de email
- Configurar URLs de redirección para reset password
- Agregar validación de email duplicado

### Complejidad: ⭐⭐⭐⭐ (Alta)
### Tiempo Estimado: 2-3 horas

---

## 🎯 PUNTO 3: PROCESO DE COMPRA (CHECKOUT)

### Requerimientos
1. ✅ Layout actual (resumen + datos envío) está bien
2. ❌ Eliminar métodos de pago, dejar solo "Coordinar por WhatsApp"
3. ❌ Incluir "Instrucciones Especiales" en mensaje de WhatsApp

### Archivos a Modificar
- `client/src/pages/customer/CheckoutPage.jsx`
- `client/src/pages/customer/OrderConfirmation.jsx`

### Cambios Específicos
- Remover selector de método de pago
- Agregar campo de instrucciones especiales al mensaje de WhatsApp
- Simplificar flujo de checkout

### Complejidad: ⭐⭐ (Baja-Media)
### Tiempo Estimado: 45 minutos

---

## 🎯 PUNTO 4: PÁGINA DE INICIO (HOME)

### Requerimientos

#### 4.1 Barra de Búsqueda
- Resaltar visualmente la barra de búsqueda

#### 4.2 Sección de Beneficios
- Cambiar a: "RETIRO EN TIENDA" y "ENVÍOS A TODO EL PAÍS"
- Simplificar a: "COMPRA SEGURA", "ATENCIÓN PERSONALIZADA", "MEJORES PRECIOS"

#### 4.3 Categorías
- Mostrar imagen de categoría con nombre debajo (en parte blanca)
- Primeros 3 productos = más vendidos de cada categoría

#### 4.4 Productos Destacados
- Mostrar productos más vendidos/agregados al carrito

#### 4.5 Mi Cuenta (Cliente)
- Agregar sección "Datos de Envío" guardados
- Auto-completar en checkout con datos guardados
- Permitir edición en checkout

#### 4.6 Historial de Pedidos
- Mostrar todos los pedidos del cliente
- Al hacer clic en número de pedido → mostrar detalle completo

### Archivos a Modificar
- `client/src/components/customer/Header.jsx`
- `client/src/components/customer/BenefitsSection.jsx`
- `client/src/components/customer/CategoriesSection.jsx`
- `client/src/components/customer/FeaturedProducts.jsx`
- Crear: `client/src/pages/customer/MyAccount.jsx`
- Crear: `client/src/pages/customer/MyOrders.jsx`
- Crear: `client/src/pages/customer/OrderDetail.jsx`

### Cambios en Base de Datos
- Crear tabla `customer_addresses` (datos de envío guardados)
- Crear tabla `orders` (pedidos)
- Crear tabla `order_items` (items de pedidos)
- Agregar campos de tracking: `view_count`, `cart_add_count` a `products`

### Complejidad: ⭐⭐⭐⭐⭐ (Muy Alta)
### Tiempo Estimado: 4-6 horas

---

## 🎯 PUNTO 5: PANEL DE ADMINISTRADOR

### Requerimientos

#### 5.1 Stock
- Cambiar a selector "Disponible" / "No Disponible"

#### 5.2 Categorías Múltiples
- Permitir asignar producto a múltiples categorías/subcategorías

#### 5.3 Variantes de Color
- Agregar/eliminar colores dinámicamente
- Opción "Activo/No Activo" para ocultar productos

#### 5.4 Gestión de Categorías
- Agregar opciones de editar/eliminar
- Crear subcategorías dentro de categorías

#### 5.5 Gestión de Pedidos
- Ver pedidos ordenados por fecha
- Ver detalle de cada pedido (número, email/usuario)
- Marcar pedido como "Terminado"
- Notificar al cliente cuando pedido está terminado

#### 5.6 Reportes de Ventas
- Filtrar por rango de fechas
- Mostrar total vendido
- Productos más vendidos por categoría
- Cantidad vendida de cada artículo

#### 5.7 Gestión de Banners
- Subir/eliminar banners de la página
- Cambiar según temporada

### Archivos a Modificar
- `client/src/pages/admin/ProductForm.jsx`
- `client/src/pages/admin/Products.jsx`
- `client/src/pages/admin/Categories.jsx`
- Crear: `client/src/pages/admin/Orders.jsx`
- Crear: `client/src/pages/admin/OrderDetail.jsx`
- Crear: `client/src/pages/admin/Sales.jsx`
- Crear: `client/src/pages/admin/Banners.jsx`

### Cambios en Base de Datos
- Crear tabla `product_categories` (relación muchos a muchos)
- Crear tabla `subcategories`
- Modificar tabla `product_variants` (agregar campo `active`)
- Crear tabla `orders` y `order_items`
- Crear tabla `banners`
- Agregar triggers para tracking de ventas

### Complejidad: ⭐⭐⭐⭐⭐ (Muy Alta)
### Tiempo Estimado: 6-8 horas

---

## 🎯 PUNTO 6: GESTIÓN DE CLIENTES (ADMIN)

### Requerimientos
- Nueva sección "Clientes" en panel admin
- Listar todos los clientes registrados
- Ver detalle de cada cliente al seleccionar
- Acceso a datos para ayudar con recuperación de contraseña/usuario

### Archivos a Crear
- `client/src/pages/admin/Customers.jsx`
- `client/src/pages/admin/CustomerDetail.jsx`

### Cambios en Base de Datos
- Query para listar usuarios de Supabase Auth
- Relacionar con datos de perfil y pedidos

### Complejidad: ⭐⭐⭐ (Media-Alta)
### Tiempo Estimado: 1-2 horas

---

## 📊 RESUMEN DE COMPLEJIDAD

| Punto | Descripción | Complejidad | Tiempo Estimado |
|-------|-------------|-------------|-----------------|
| 1 | Stock Disponible/No Disponible | ⭐⭐ | 30-45 min |
| 2 | Registro y Autenticación | ⭐⭐⭐⭐ | 2-3 horas |
| 3 | Proceso de Compra | ⭐⭐ | 45 min |
| 4 | Página de Inicio | ⭐⭐⭐⭐⭐ | 4-6 horas |
| 5 | Panel Administrador | ⭐⭐⭐⭐⭐ | 6-8 horas |
| 6 | Gestión de Clientes | ⭐⭐⭐ | 1-2 horas |

**TOTAL ESTIMADO: 15-21 horas de desarrollo**

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Fase 1: Mejoras Rápidas (2-3 horas)
1. ✅ Punto 1: Stock (30-45 min)
2. ✅ Punto 3: Checkout simplificado (45 min)
3. ✅ Punto 4.1 y 4.2: Búsqueda y beneficios (1 hora)

### Fase 2: Autenticación y Base de Datos (3-4 horas)
4. ✅ Punto 2: Sistema de registro completo (2-3 horas)
5. ✅ Crear estructura de BD para pedidos (1 hora)

### Fase 3: Funcionalidades de Cliente (4-6 horas)
6. ✅ Punto 4.5: Mi Cuenta y datos de envío (2-3 horas)
7. ✅ Punto 4.6: Historial de pedidos (2-3 horas)

### Fase 4: Panel de Administrador (6-8 horas)
8. ✅ Punto 5.1-5.4: Productos y categorías (3-4 horas)
9. ✅ Punto 5.5: Gestión de pedidos (2-3 horas)
10. ✅ Punto 5.6-5.7: Reportes y banners (1-2 horas)

### Fase 5: Gestión de Clientes (1-2 horas)
11. ✅ Punto 6: Panel de clientes (1-2 horas)

---

## 📝 NOTAS IMPORTANTES

### Dependencias Críticas
- Supabase configurado correctamente
- SMTP o servicio de email configurado
- Permisos de storage para banners
- Políticas de seguridad (RLS) actualizadas

### Testing Local
- Levantar servidor de desarrollo
- Probar cada funcionalidad antes de commit
- Verificar responsive design
- Probar flujos completos de usuario

### Backup
- Hacer backup de base de datos antes de migraciones
- Mantener versión anterior funcional en rama separada

---

## ✅ CHECKLIST DE INICIO

Antes de comenzar, verificar:
- [ ] Servidor local funcionando
- [ ] Conexión a Supabase activa
- [ ] Variables de entorno configuradas
- [ ] Backup de base de datos realizado
- [ ] Rama de desarrollo creada
- [ ] Documentación de cambios lista

---

**Fecha de Creación:** 7 de febrero de 2026  
**Estado:** Pendiente de Aprobación  
**Próximo Paso:** Comenzar con Punto 1 (Stock)
