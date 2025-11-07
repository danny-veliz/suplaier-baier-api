var express = require('express');
var router = express.Router();

/*IdPropuesta INT AUTO_INCREMENT PRIMARY KEY,
  IdDemanda INT,
    IdProveedor INT,
    Precio INT,
    Cantidad INT,
  Estado*/

/**
 * @swagger
 * /propuestas:
 *   get:
 *     summary: Obtener propuestas
 *     description: Obtiene una lista de propuestas, filtradas por estado (por defecto 'pendiente'), IdPropuesta o IdDemanda.
 *     tags:
 *       - Propuestas
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         description: El ID de la propuesta específica a buscar.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idDemanda
 *         required: false
 *         description: El ID de la demanda para la cual se quieren ver las propuestas.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         required: false
 *         description: Filtrar por estado (ej. 'pendiente', 'aceptada', 'rechazada'). Valor por defecto 'pendiente'.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista de propuestas obtenida con éxito.
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
 *                       IdPropuesta:
 *                         type: integer
 *                         example: 1
 *                       IdDemanda:
 *                         type: integer
 *                         example: 3
 *                       IdProveedor:
 *                         type: integer
 *                         example: 2
 *                       Precio:
 *                         type: number
 *                         example: 45.75
 *                       Cantidad:
 *                         type: integer
 *                         example: 100
 *                       Estado:
 *                         type: string
 *                         example: "pendiente"
 *       '500':
 *         description: Error interno del servidor.
 */
router.get('/', function (req, res, next) {
  const idPropuesta = req.query.id;
  const idDemanda = req.query.idDemanda;
  const estado = req.query.estado || 'pendiente';

  req.getConnection((err, conn) => {
    if (err) return res.send(err);

    let query = 'SELECT * FROM propuesta WHERE Estado = ?';
    let queryParams = [estado];

    if (idPropuesta) {
      query += ' AND IdPropuesta = ?';
      queryParams.push(idPropuesta);
    }

    if (idDemanda) {
      query += ' AND IdDemanda = ?';
      queryParams.push(idDemanda);
    }

    conn.query(query, queryParams, (err, rows) => {
      if (err) {
        res.json(err);
      } else {
        res.json({ rows });
      }
    });
  });
});

/**
 * @swagger
 * /propuestas:
 *   post:
 *     summary: Enviar una nueva propuesta
 *     description: Permite a un proveedor enviar una propuesta como respuesta a una demanda existente.
 *     tags:
 *       - Propuestas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               IdDemanda:
 *                 type: integer
 *                 example: 3
 *               IdProveedor:
 *                 type: integer
 *                 example: 7
 *               Precio:
 *                 type: number
 *                 example: 45.75
 *               Cantidad:
 *                 type: integer
 *                 example: 100
 *               Estado:
 *                 type: string
 *                 example: "pendiente"
 *     responses:
 *       '200':
 *         description: Propuesta enviada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Propuesta Enviada Exitosamente"
 *       '500':
 *         description: Error interno del servidor.
 */
router.post('/', function (req, res) {
  const { IdDemanda, IdProveedor, Precio, Cantidad, Estado } = req.body;
  req.getConnection((err, conn) => {
    if (err) return res.send(err);
    conn.query(
      `INSERT INTO propuesta (IdDemanda, IdProveedor, Precio, Cantidad, Estado, FechaPropuesta) VALUES 
        (${IdDemanda}, '${IdProveedor}', '${Precio}', '${Cantidad}','${Estado}', NOW() )`,
      (err, rows) => {
        err ? res.json(err) : res.json("Propuesta Enviada Exitosamente");
      }
    );
  })
});

/**
 * @swagger
 * /propuestas:
 *   patch:
 *     summary: Actualizar estado de una propuesta
 *     description: Modifica el campo 'Estado' de una propuesta (por ejemplo, cambiar a 'aceptada' o 'rechazada').
 *     tags:
 *       - Propuestas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               IdPropuesta:
 *                 type: integer
 *                 description: El ID de la propuesta a modificar.
 *                 example: 12
 *               Estado:
 *                 type: string
 *                 description: El nuevo estado de la propuesta.
 *                 example: "aceptada"
 *     responses:
 *       '200':
 *         description: Actualización exitosa.
 *       '500':
 *         description: Error interno del servidor.
 */
router.patch('/', (req, res, next) => {
  const { IdPropuesta, Estado } = req.body;
  req.getConnection((err, conn) => {
    if (err) return res.send(err);
    conn.query(
      `UPDATE propuesta 
      SET Estado = '${Estado}'
      WHERE IdPropuesta =${IdPropuesta}`,
      (err, rows) => {
        err ? console.log(err) : res.json(rows);
      }
    )
  })
});

module.exports = router;