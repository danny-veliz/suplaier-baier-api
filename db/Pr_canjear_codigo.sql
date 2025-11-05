USE DbContabilly;

DROP PROCEDURE IF EXISTS CanjearCodigoInvitacion;

DELIMITER //
CREATE PROCEDURE CanjearCodigoInvitacion(
  IN p_IdUsuario INT,
  IN p_Codigo    VARCHAR(64),
  IN p_Estrellas INT
)
BEGIN
  DECLARE dup TINYINT DEFAULT 0;
  DECLARE CONTINUE HANDLER FOR 1062 SET dup = 1;

  INSERT INTO InvitacionCanje (IdUsuario, Codigo, Estrellas)
  VALUES (p_IdUsuario, p_Codigo, p_Estrellas);

  IF dup = 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Este código ya fue canjeado por este usuario.';
  END IF;

  SELECT u.IdUsuario, u.estrellas_acumuladas
  FROM Usuario u
  WHERE u.IdUsuario = p_IdUsuario;
END;
//
DELIMITER ;
CALL CanjearCodigoInvitacion(1, 'welcome1', 10); -- suma si es la 1ra vez
CALL CanjearCodigoInvitacion(1, 'WELCOME1', 5);  -- error: ya canjeado por ese usuario
