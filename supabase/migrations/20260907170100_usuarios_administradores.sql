-- ============================================================================
-- ARCHIVO: usuariosAdministradores.sql
-- ENTIDAD: Usuarios administradores
-- ============================================================================
-- Este archivo crea la tabla de personas autorizadas para administrar el
-- catalogo. La ruta privada del panel no reemplaza la autenticacion: el
-- servidor debe comprobar identidad y permisos en cada operacion protegida.
-- ============================================================================

-- La tabla conserva un usuario administrativo por registro.
CREATE TABLE "usuariosAdministradores" (
    -- Identificador unico del administrador.
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Correo utilizado para iniciar sesion. UNIQUE impide dos cuentas con el
    -- mismo correo y NOT NULL obliga a proporcionar uno.
    "correoElectronico" VARCHAR(254) NOT NULL UNIQUE,

    -- Nunca se guarda la contrasena original. Este campo debe contener un hash
    -- generado con Argon2id, bcrypt u otro algoritmo adaptativo seguro.
    "hashContrasena" TEXT NOT NULL,

    -- Nombre visible para identificar al administrador.
    "nombreCompleto" VARCHAR(150) NOT NULL,

    -- Permite revocar el acceso sin borrar la cuenta ni su historial futuro.
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,

    -- Fechas de control del registro.
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Nota de seguridad:
-- Este archivo no incluye contrasenas reales ni valores de ejemplo. El alta de
-- administradores debe hacerse mediante un proceso seguro y las credenciales
-- nunca deben quedar en el codigo fuente publico.
