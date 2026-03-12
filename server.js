const express = require('express');
const session = require('express-session');
const { exec } = require('child_process');
const path = require('path');
const GARMIN_PATH = `/usr/local/bin:/root/.local/bin:${process.env.PATH}`;

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

function runGarmin(command) {
  return new Promise((resolve, reject) => {
    exec(`garmin-connect ${command}`, {
      env: { ...process.env, PATH: GARMIN_PATH },
      timeout: 30000
    }, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      try { resolve(JSON.parse(stdout)); }
      catch { resolve(stdout); }
    });
  });
}

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.status(401).json({ error: 'No autenticado' });
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Always require login through the app — never auto-use CLI stored tokens
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.authenticated && req.session.userInfo) {
    return res.json({ authenticated: true, user: req.session.userInfo });
  }
  res.json({ authenticated: false });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contrasena requeridos' });
  }

  try {
    // Clear existing CLI tokens first
    await new Promise(resolve => {
      exec('garmin-connect auth logout', {
        env: { ...process.env, PATH: GARMIN_PATH },
        timeout: 10000
      }, () => resolve());
    });

    // Login interactively with provided credentials
    await new Promise((resolve, reject) => {
      const child = exec('garmin-connect auth login', {
        env: { ...process.env, PATH: GARMIN_PATH },
        timeout: 35000
      });

      let emailSent = false;
      let passSent = false;

      const handleOutput = (data) => {
        const text = data.toString().toLowerCase();
        if (!emailSent && text.includes('email')) {
          emailSent = true;
          child.stdin.write(email + '\n');
        } else if (!passSent && text.includes('password')) {
          passSent = true;
          child.stdin.write(password + '\n');
        }
      };

      child.stdout.on('data', handleOutput);
      child.stderr.on('data', handleOutput);

      // Fallback: send after fixed delays
      setTimeout(() => { if (!emailSent) { emailSent = true; child.stdin.write(email + '\n'); } }, 2000);
      setTimeout(() => { if (!passSent) { passSent = true; child.stdin.write(password + '\n'); } }, 3500);

      child.on('close', (code) => code === 0 ? resolve() : reject(new Error('Login failed: ' + code)));
      child.on('error', reject);
    });

    const status = await runGarmin('auth status');
    if (status && status.authenticated) {
      req.session.authenticated = true;
      req.session.userInfo = status;
      return res.json({ success: true, user: status });
    }

    res.status(401).json({ error: 'Credenciales incorrectas.' });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(401).json({ error: 'Error al autenticar. Verifica tus credenciales de Garmin Connect.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  exec('garmin-connect auth logout', {
    env: { ...process.env, PATH: GARMIN_PATH },
    timeout: 10000
  }, () => {
    req.session.destroy();
    res.json({ success: true });
  });
});

app.get('/api/activities', requireAuth, async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const activities = await runGarmin(`activities list --limit ${limit}`);
    res.json(activities);
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo actividades' });
  }
});

app.get('/api/health/heart-rate', requireAuth, async (req, res) => {
  try {
    const date = req.query.date || '';
    const data = await runGarmin(date ? `health heart-rate --date ${date}` : 'health heart-rate');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo ritmo cardiaco' });
  }
});

app.get('/api/athlete', requireAuth, async (req, res) => {
  try {
    res.json(await runGarmin('athlete'));
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

app.listen(PORT, () => {
  console.log(`Garmin Dashboard corriendo en http://localhost:${PORT}`);
});
