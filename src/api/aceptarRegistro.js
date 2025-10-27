var express = require('express');
var router = express.Router();

// Endpoint para validar si existe el código de invitación
router.get('/validarcodigo', function(req, res) {
  const { codigo } = req.query;
  if (!codigo) {
    return res.status(400).json({ success: false, message: 'Código no proporcionado' });
  }
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json(err);
    conn.query(
      'SELECT IdUsuario FROM Usuario WHERE codigo_invitacion = ?',
      [codigo],
      (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length > 0) {
          res.json({ success: true, message: 'Código válido' });
        } else {
          res.json({ success: false, message: 'Código no existe' });
        }
      }
    );
  });
});

router.get('/', function(req, res, next) {
  const id = req.query.id === undefined ? null : req.query.id;
  req.getConnection((err, conn) =>{
    if(err) return res.send(err);
    conn.query(
      `SELECT * FROM solicitudesregistro WHERE IdSolicitud = COALESCE(${id}, solicitudesregistro.IdSolicitud)`, 
      (err, rows) => {
        err? res.json(err) :  res.json({rows});
      
    });
  });
});

module.exports = router;