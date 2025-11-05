// src/api/auth.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { usuario, pass } = req.body;
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ ok: false, message: 'DB conn error' });

    conn.query('CALL Autenticacion(?, ?)', [usuario, pass], (err, rows) => {
      if (err) {
        console.error('AUTH DB ERROR:', err);
        return res.status(500).json({ ok: false, error: 'AUTH_SQL_ERROR' });
      }
      const payload = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
      // tu front espera [] cuando no hay match
      if (!Array.isArray(payload) || payload.length === 0) return res.json([]);
      return res.json(payload);
    });
  });
});

module.exports = router;
