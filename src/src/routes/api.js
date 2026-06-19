const express = require('express');
const { pool, ping } = require('../db');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

router.get('/db-ping', async (req, res) => {
  try {
    const ms = await ping();
    res.json({ ok: true, latencyMs: ms });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

router.get('/services', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, status, updated_at FROM services ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/services', async (req, res) => {
  const { name, status = 'unknown' } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO services (name, status) VALUES ($1, $2) RETURNING id, name, status, updated_at',
      [name, status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/services/:id', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE services SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, name, status, updated_at',
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
