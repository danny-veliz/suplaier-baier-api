const express = require('express');
const router = express.Router();

router.post('/canjear-invitacion', (req, res) => {
  const { userId, code } = req.body || {};
  if (!userId || !code) {
    return res.status(400).json({ ok: false, message: 'Faltan parámetros' });
  }

  const ESTRELLAS = 100;
  const codigo = String(code).trim();

  req.getConnection((err, conn) => {
    if (err) {
      console.error('[DB connect]', err);
      return res.status(500).json({ ok: false, message: 'Error interno (DB connect)' });
    }

    conn.beginTransaction((errTx) => {
      if (errTx) {
        console.error('[TX begin]', errTx);
        return res.status(500).json({ ok: false, message: 'Error interno (TX begin)' });
      }

      // 1) Intentar registrar el canje (único por usuario+codigo)
      conn.query(
        'INSERT INTO InvitacionCanje (IdUsuario, Codigo, Estrellas) VALUES (?, ?, ?)',
        [userId, codigo, ESTRELLAS],
        (errInsert) => {
          if (errInsert) {
            // Caso: código ya canjeado antes → responder con popup y saldo actual
            if (errInsert.code === 'ER_DUP_ENTRY' || errInsert.errno === 1062) {
              return conn.rollback(() => {
                conn.query(
                  'SELECT estrellas_acumuladas AS saldo FROM Usuario WHERE IdUsuario = ?',
                  [userId],
                  (eSel, rows) => {
                    const saldo = (!eSel && rows && rows[0]) ? rows[0].saldo : null;
                    return res.json({
                      ok: true,
                      alreadyClaimed: true,
                      award: {
                        type: 'invite',
                        stars: 0,
                        message: 'Este código ya fue canjeado anteriormente'
                      },
                      balance: saldo
                    });
                  }
                );
              });
            }
            console.error('[DB insert]', errInsert);
            return conn.rollback(() => res.status(500).json({ ok: false, message: 'Error interno (insert)' }));
          }

          // 2) Sumar estrellas al usuario
          conn.query(
            'UPDATE Usuario SET estrellas_acumuladas = estrellas_acumuladas + ? WHERE IdUsuario = ?',
            [ESTRELLAS, userId],
            (errUpdate) => {
              if (errUpdate) {
                console.error('[DB update]', errUpdate);
                return conn.rollback(() => res.status(500).json({ ok: false, message: 'Error interno (update)' }));
              }

              // 3) Leer saldo actualizado (dentro de la misma TX)
              conn.query(
                'SELECT estrellas_acumuladas AS saldo FROM Usuario WHERE IdUsuario = ?',
                [userId],
                (errSel, rowsSel) => {
                  if (errSel) {
                    console.error('[DB select balance]', errSel);
                    return conn.rollback(() => res.status(500).json({ ok: false, message: 'Error interno (select balance)' }));
                  }
                  const saldo = rowsSel && rowsSel[0] ? rowsSel[0].saldo : null;

                  // 4) Confirmar transacción
                  conn.commit((errCommit) => {
                    if (errCommit) {
                      console.error('[TX commit]', errCommit);
                      return conn.rollback(() => res.status(500).json({ ok: false, message: 'Error interno (TX commit)' }));
                    }

                    return res.json({
                      ok: true,
                      award: {
                        type: 'invite',
                        stars: ESTRELLAS,
                        message: 'Obtuviste 100 Estrellas gracias a tu código de invitación'
                      },
                      balance: saldo
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
});

module.exports = router;
