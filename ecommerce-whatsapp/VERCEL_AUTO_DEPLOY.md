# 🚀 Guía de Deploy Automático en Vercel

## El Problema
Tu código en GitHub no se despliega automáticamente en Vercel cuando haces push.

## Las Causas

1. **Vercel no está conectado al repositorio GitHub**
2. **El root directory no está configurado correctamente** (debe ser `client/`)
3. **Variables de entorno no están configuradas**
4. **La rama no está configurada para deploy automático**

---

## ✅ Solución Paso a Paso

### Paso 1: Conectar GitHub con Vercel

1. Ve a https://vercel.com/
2. Inicia sesión con tu cuenta
3. Ve a **Settings** → **Git Integration**
4. Haz clic en **Connect Git Repository**
5. Selecciona **GitHub** y autoriza
6. Busca el repositorio `fernix777/MagnoliaN`
7. Haz clic en **Import**

---

### Paso 2: Configurar el Proyecto en Vercel

1. **Framework**: Vite (se detectará automáticamente)
2. **Root Directory**: Cambia a `client/` ⚠️ **IMPORTANTE**
3. **Build Command**: `npm run build` (debe estar pre-llenado)
4. **Output Directory**: `dist` (debe estar pre-llenado)
5. **Install Command**: `npm install` (debe estar pre-llenado)

---

### Paso 3: Agregar Variables de Entorno

En Vercel, ve a **Settings** → **Environment Variables** y agrega:

```
VITE_SUPABASE_URL = [tu_url_de_supabase]
VITE_SUPABASE_ANON_KEY = [tu_anon_key]
```

Obtén estos valores de:
- Tu proyecto en https://supabase.com/
- Settings → API
- Copia `Project URL` y `anon public key`

---

### Paso 4: Configurar Auto-Deploy

1. En Vercel, ve a **Settings** → **Git**
2. En **Production Branch**, asegúrate que sea `main`
3. Activa **Automatic Deployments** (debe estar activado por defecto)
4. En **Ignored Build Step**, déjalo vacío

---

### Paso 5: Verificar la Configuración

Después de configurar todo, haz un cambio en tu código:

```bash
cd e:\Magnolia12\ecommerce-whatsapp
git add -A
git commit -m "test: triggering auto-deploy"
git push origin main
```

Vercel debería automaticamente:
1. ✅ Detectar el cambio en GitHub
2. ✅ Iniciar un nuevo deployment
3. ✅ Compilar el proyecto
4. ✅ Desplegar en vivo

---

## 🔍 Si Aún No Funciona

**Revisa:**
1. ¿Root Directory es `client/`?
2. ¿Variables de entorno están configuradas?
3. ¿El repositorio está conectado a Vercel?
4. ¿La rama es `main`?

**Ver Logs:**
1. Ve a Vercel → Tu Proyecto
2. Haz clic en el último deployment
3. Ve a **Logs**
4. Busca errores de build

---

## 📌 Checklist Final

- [ ] GitHub conectado con Vercel
- [ ] Root Directory = `client/`
- [ ] VITE_SUPABASE_URL configurada
- [ ] VITE_SUPABASE_ANON_KEY configurada
- [ ] Rama principal = `main`
- [ ] Auto-deploy activado
- [ ] Test push realizado
- [ ] Deployment automático funciona ✅

