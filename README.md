# 🚴 Garmin Dashboard

Dashboard personal para visualizar tus actividades de Garmin Connect con gráficas bonitas.

---

## ✅ Requisitos

- Node.js 
- CLI de garmin-connect 
- Cuenta en [Railway](https://railway.app) 



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
