USE DbContabilly;

-- Columna para acumular estrellas del usuario
ALTER TABLE Usuario
  ADD COLUMN IF NOT EXISTS Estrellas INT NOT NULL DEFAULT 0;

-- Tabla que registra los canjes de códigos de invitación.
-- La clave única evita que un mismo usuario canjee el mismo código dos veces.
CREATE TABLE IF NOT EXISTS InvitacionCanje (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  IdUsuario INT NOT NULL,
  Codigo VARCHAR(64) NOT NULL,
  Estrellas INT NOT NULL,
  Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_codigo (IdUsuario, Codigo),
  INDEX idx_usuario (IdUsuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
