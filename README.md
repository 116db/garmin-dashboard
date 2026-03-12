# 🚴 Garmin Dashboard

Dashboard personal para visualizar tus actividades de Garmin Connect con gráficas bonitas.

---

## ✅ Requisitos

- Node.js (ya lo tienes instalado)
- CLI de garmin-connect (ya lo tienes instalado)
- Cuenta en [Railway](https://railway.app) (gratis, sin tarjeta)

---

## 🚀 Cómo correrlo en tu compu (para probar)

```bash
# 1. Entra a la carpeta del proyecto
cd garmin-app

# 2. Instala las dependencias
npm install

# 3. Arranca el servidor
npm start

# 4. Abre en tu navegador:
# http://localhost:3000
```

Inicia sesión con tu email y contraseña de Garmin Connect. ¡Listo!

---

## 🌐 Cómo subirlo a internet (Railway) — GRATIS

### Paso 1: Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta gratis con GitHub

### Paso 2: Subir el proyecto a GitHub
```bash
# En la carpeta garmin-app:
git init
git add .
git commit -m "mi garmin dashboard"
```
Sube el repositorio a GitHub (puedes hacerlo desde github.com → New repository)

### Paso 3: Conectar con Railway
1. En Railway → "New Project" → "Deploy from GitHub repo"
2. Selecciona tu repositorio
3. Railway detecta automáticamente que es Node.js
4. Espera ~2 minutos y te da un link tipo: `https://garmin-app-xxxx.railway.app`

### Paso 4: Comparte el link con Iván
- Iván abre el link en su navegador
- Inicia sesión con **su** cuenta de Garmin
- Ve sus propias actividades y gráficas 🎉

---

## ⚠️ Importante sobre la autenticación

El login usa el CLI de `garmin-connect` instalado en el servidor.
Iván necesita que **tú le instales el CLI en el servidor** antes de que pueda hacer login.

**Alternativa más fácil:** Cada quien despliega su propia instancia en Railway (es gratis para los dos).

---

## 📁 Estructura del proyecto

```
garmin-app/
├── server.js        ← Servidor Node.js con API
├── package.json     ← Dependencias
├── public/
│   └── index.html   ← App web (login + dashboard)
└── README.md        ← Este archivo
```

---

## 🎨 Qué incluye la app

- 🔐 Login con cuenta de Garmin Connect
- 📊 Gráfica de distancia por actividad
- ❤️ Gráfica de ritmo cardíaco (promedio y máximo)
- 📋 Historial completo de actividades con filtros
- 🏷️ Zonas de FC por actividad (verde/amarillo/rojo)
- 📱 Diseño responsive (funciona en celular)
