var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /notificaciones:
 *   get:
 *     summary: Obtener notificaciones
 *     description: Obtiene una lista de notificaciones, filtradas opcionalmente por 'id' de la notificación o 'idUsuario'.
 *     tags:
 *       - Notificaciones
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         description: El ID de la notificación específica a buscar.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idUsuario
 *         required: false
 *         description: El ID del usuario para el cual se quieren obtener las notificaciones.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Lista de notificaciones obtenida con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       IdNotificacion:
 *                         type: integer
 *                       IdUsuario:
 *                         type: integer
 *                       Mensaje:
 *                         type: string
 *                       Leida:
 *                         type: boolean
 *                       Fecha:
 *                         type: string
 *                         format: date-time
 *       '500':
 *         description: Error interno del servidor.
 */
/* GET users listing. */
router.get('/', function(req, res, next) {
  const id = req.query.id === undefined ? null : req.query.id;
  const idUsuario = req.query.idUsuario === undefined ? null : req.query.idUsuario;
  req.getConnection((err, conn) =>{
    if(err) return res.send(err);
    conn.query(
      `SELECT * FROM Notificacion noti WHERE IdNotificacion = COALESCE(${id}, noti.IdNotificacion)
      AND IdUsuario = COALESCE(${idUsuario}, noti.IdUsuario)`, 
      (err, rows) => {
        if(err) res.json(err);
        res.json({rows});
    });
  });
});

module.exports = router;