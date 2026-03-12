const express = require('express');
const session = require('express-session');
const path = require('path');
const { GarminConnect } = require('garmin-connect');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'garmin-dashboard-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.authenticated && req.session.userInfo) {
    return res.json({ authenticated: true, user: req.session.userInfo });
  }
  res.json({ authenticated: false });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    const client = new GarminConnect({ username: email, password });
    await client.login();
    const userInfo = await client.getUserProfile();

    req.session.authenticated = true;
    req.session.userInfo = userInfo;

    req.session.credentials = { username: email, password };

    res.json({ success: true, user: userInfo });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(401).json({ error: 'Error al autenticar. Verifica tus credenciales de Garmin Connect.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.status(401).json({ error: 'No autenticado' });
}

async function getClient(req) {
  const { username, password } = req.session.credentials;
  const client = new GarminConnect({ username, password });
  await client.login();
  return client;
}

app.get('/api/activities', requireAuth, async (req, res) => {
  try {
    const client = await getClient(req);
    const limit = parseInt(req.query.limit) || 20;
    const activities = await client.getActivities(0, limit);
    res.json(activities);
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo actividades' });
  }
});

app.get('/api/health/heart-rate', requireAuth, async (req, res) => {
  try {
    const client = await getClient(req);
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const data = await client.getHeartRate(date);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo ritmo cardiaco' });
  }
});

app.get('/api/athlete', requireAuth, async (req, res) => {
  try {
    const client = await getClient(req);
    const profile = await client.getUserProfile();
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

app.listen(PORT, () => {
  console.log(`Garmin Dashboard corriendo en http://localhost:${PORT}`);
});