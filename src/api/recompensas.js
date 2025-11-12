// src/api/recompensas.js
const express = require('express');
const router = express.Router();

/**
 * POST /api/v1/recompensas/canjear-invitacion
 * Body: { userId: number, code: string }
 */
router.post('/canjear-invitacion', (req, res) => {
  const { userId, code } = req.body || {};
  if (!userId || !code) {
    return res.status(400).json({ ok: false, message: 'Faltan parámetros' });
  }

  const ESTRELLAS = 100;                 // <--- Asegúrate que NO sea 0
  const codigo = String(code).trim();    // el trigger normaliza a MAYÚSCULAS y sin espacios

  req.getConnection((err, conn) => {
    if (err) {
      console.error('[DB connect]', err);
      return res.status(500).json({ ok: false, message: 'Error interno (DB connect)' });
    }

    // Usamos el PROCEDIMIENTO para centralizar la lógica
    conn.query(
      'CALL CanjearCodigoInvitacion(?, ?, ?)',
      [userId, codigo, ESTRELLAS],       // <-- PASAR SIEMPRE EL 3er PARÁMETRO
      (errProc, rows) => {
        if (errProc) {
          // Cuando el SP hace SIGNAL 'Este código ya fue canjeado...', MySQL devuelve errno 1644
          if (errProc.errno === 1644) {
            // Devolvemos "ya canjeado" + saldo actual
            return conn.query(
              'SELECT estrellas_acumuladas AS saldo FROM Usuario WHERE IdUsuario = ?',
              [userId],
              (eSel, rs) => {
                const saldo = (!eSel && rs && rs[0]) ? rs[0].saldo : null;
                return res.json({
                  ok: true,
                  alreadyClaimed: true,
                  award: { type: 'invite', stars: 0, message: 'Este código ya fue canjeado anteriormente' },
                  balance: saldo
                });
              }
            );
          }

          // Si el trigger pegó por estrellas <= 0 u otro problema
          if (errProc.message) {
            return res.status(400).json({ ok: false, message: errProc.message });
          }
          console.error('[SP error]', errProc);
          return res.status(500).json({ ok: false, message: 'Error interno (SP)' });
        }

        // El SP ya insertó y (por triggers) ajustó el saldo. Leemos el saldo para responder.
        conn.query(
          'SELECT estrellas_acumuladas AS saldo FROM Usuario WHERE IdUsuario = ?',
          [userId],
          (eSel, rs) => {
            if (eSel) {
              console.error('[DB select saldo]', eSel);
              return res.status(500).json({ ok: false, message: 'Error interno (select saldo)' });
            }
            const saldo = rs && rs[0] ? rs[0].saldo : null;

            return res.json({
              ok: true,
              alreadyClaimed: false,
              award: { type: 'invite', stars: ESTRELLAS, message: 'Obtuviste 100 Estrellas gracias a tu código de invitación' },
              balance: saldo
            });
          }
        );
      }
    );
  });
});

/**
 * GET /api/v1/recompensas/saldo?userId=123
 */
router.get('/saldo/:userId', (req, res) => {
  const userId = req.params.userId;
  if (!userId) return res.status(400).json({ ok: false, message: 'Falta userId' });

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ ok: false, message: 'DB connect error' });
    conn.query(
      'SELECT estrellas_acumuladas AS saldo FROM Usuario WHERE IdUsuario = ?',
      [userId],
      (e, rows) => {
        if (e) return res.status(500).json({ ok: false, message: 'Query error' });
        const saldo = rows?.[0]?.saldo ?? 0;
        return res.json({ ok: true, balance: saldo });
      }
    );
  });
});


module.exports = router;
