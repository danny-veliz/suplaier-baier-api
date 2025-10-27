var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    const id = req.query.idUsuario === undefined ? null : req.query.idUsuario;
    const nombre = req.query.nombre === undefined ? null : req.query.nombre;
    req.getConnection((err, conn) =>{
      if(err) return res.send(err);
      conn.query(
        `SELECT * FROM Usuario u 
        WHERE IdUsuario = COALESCE(${id}, u.IdUsuario) 
        AND Nombre = COALESCE(${nombre}, u.Nombre)`, 
        (err, rows) => {
          if(err) res.json(err);
          res.json({rows});
      });
    });
  });

/* Post para crear un nuevo usuario en la bd */
router.post('/', function(req, res){
  const { 
    IdRol, Nombre, Identificacion, Usuario, Contrasena, Provincia, Email, Numero, Pais, Ciudad, Direccion, UrlLogoEmpresa, 
    CodigoInvitacion
  } = req.body;
  let invitado_por_id = null;
  req.getConnection((err, conn) =>{
    if (err) return res.status(500).json(err);
    const registrarUsuario = () => {
      const sql = `INSERT INTO Usuario 
                     (IdRol, Nombre, Identificacion, Usuario, Provincia, Contrasena, Email, Numero, Pais, Ciudad, Direccion, UrlLogoEmpresa, invitado_por_id) 
                   VALUES 
                     (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        IdRol, Nombre, Identificacion, Usuario, Provincia, Contrasena, Email, Numero, Pais, Ciudad, Direccion, UrlLogoEmpresa, 
        invitado_por_id];
      conn.query(sql, values, (err, result) => {
         if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ success: false, message: 'El usuario ya existe.' });
            }
            return res.status(500).json(err);
        }
        res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', userId: result.insertId });
      });
    };
    if (CodigoInvitacion) {
      conn.query(
        'SELECT IdUsuario FROM Usuario WHERE codigo_invitacion = ?',
        [CodigoInvitacion],
        (err, rows) => {
          if (err) return res.status(500).json(err);
          if (rows.length > 0) {
            invitado_por_id = rows[0].IdUsuario;
            registrarUsuario();
          } else {
            return res.status(400).json({ success: false, message: 'Código de invitación inválido' });
          }
        }
      );
    } else {
      registrarUsuario(); 
    }
  })
});

module.exports = router;