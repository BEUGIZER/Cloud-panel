require('dotenv').config();
const express = require('express');
const path = require('path');
const { ensureSchema } = require('./src/db');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRoutes);

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  try {
    await ensureSchema();
  } catch (err) {
    console.error('[startup] Could not initialize schema:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`[server] Cloud panel listening on port ${PORT}`);
  });
}

start();
