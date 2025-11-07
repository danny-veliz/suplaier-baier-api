var express = require('express');
var router = express.Router();

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Autenticar un usuario (Login)
 *     description: Inicia sesión en el sistema usando credenciales de usuario y contraseña. Llama al procedimiento almacenado `Autenticacion`.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *                 description: El nombre de usuario (ej. 'wduran').
 *                 example: 'wduran'
 *               pass:
 *                 type: string
 *                 format: password
 *                 description: La contraseña del usuario.
 *                 example: 'wduran1234'
 *     responses:
 *       200:
 *         description: Autenticación exitosa. Retorna el objeto del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   IdUsuario:
 *                     type: integer
 *                   Nombre:
 *                     type: string
 *                   Email:
 *                     type: string
 *                   IdRol:
 *                     type: integer
 *                   codigo_invitacion:
 *                     type: string
 *       500:
 *         description: Error interno del servidor o error de conexión a la base de datos.
 */
router.post('/', (req, res, next) => {
  const {usuario, pass} = req.body;
  req.getConnection((err, conn) =>{
      if(err) return res.send(err);
      conn.query(
        `CALL Autenticacion("${usuario}","${pass}")`, 
        (err, rows) => {
          if(err) console.log(err);
          res.json(rows[0]);
      });
    });
});

module.exports = router;