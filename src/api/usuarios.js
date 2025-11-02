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

  // 1. OBTENCIÓN DE DATOS NECESARIOS PARA EL CÓDIGO
  const nombreCompleto = Nombre || ''; // Usamos 'Nombre' del body
  const partesNombre = nombreCompleto.trim().split(/\s+/);
  const primerNombre = partesNombre[0] || '';
  const apellido = partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : '';

  // 2. GENERACIÓN DE LA FECHA Y FORMATO (DÍA/MES/AÑO)
  const ahora = new Date();
  const dia = ahora.getDate();
  // Se suma 1 a getMonth() porque devuelve un valor de 0 (enero) a 11 (diciembre)
  const mes = ahora.getMonth() + 1; 
  const anio = ahora.getFullYear();

  // 3. CREACIÓN DEL CÓDIGO DE INVITACIÓN BASADO EN LA LÓGICA
  const codigoGenerado = `${primerNombre.charAt(0).toLowerCase()}${apellido.toLowerCase()}-${dia}${mes}${anio}${Identificacion}`;

  let invitado_por_id = null;
  req.getConnection((err, conn) =>{
    if (err) return res.status(500).json(err);

    const registrarUsuario = (codigo_invitacion_nuevo) => {
      const sql = `INSERT INTO Usuario 
                     (IdRol, Nombre, Identificacion, Usuario, Provincia, Contrasena, Email, Numero, Pais, Ciudad, Direccion, UrlLogoEmpresa, invitado_por_id,codigo_invitacion) 
                   VALUES 
                     (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        IdRol, Nombre, Identificacion, Usuario, Provincia, Contrasena, Email, Numero, Pais, Ciudad, Direccion, UrlLogoEmpresa, 
        invitado_por_id, codigo_invitacion_nuevo];
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
            registrarUsuario(codigoGenerado);
          } else {
            return res.status(400).json({ success: false, message: 'Código de invitación inválido' });
          }
        }
      );
    } else {
      registrarUsuario(codigoGenerado); 
    }
  })
});

module.exports = router;