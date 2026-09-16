-- ============================================================================
-- ARCHIVO: solicitudesTrabajoPersonalizado.sql
-- ENTIDAD: Solicitudes de trabajo personalizado
-- ============================================================================
-- Este archivo crea la tabla para registrar personas interesadas en encargar
-- una obra personalizada. La plataforma facilita el contacto, pero no crea
-- cotizaciones, contratos ni transacciones automaticas.
-- ============================================================================

-- Estados permitidos para seguir el avance de un encargo.
CREATE TYPE "estadoSolicitudTrabajoPersonalizado" AS ENUM (
    'RECIBIDA',
    'EN_REVISION',
    'CONTACTADA',
    'ACEPTADA',
    'RECHAZADA',
    'CANCELADA',
    'FINALIZADA'
);

-- Cada fila representa una solicitud de encargo enviada por un visitante.
CREATE TABLE "solicitudesTrabajoPersonalizado" (
    -- Identificador unico de la solicitud.
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Datos de contacto del posible cliente.
    "nombreCliente" VARCHAR(150) NOT NULL,
    "numeroWhatsapp" VARCHAR(30) NOT NULL,
    "correoElectronico" VARCHAR(254),

    -- Explicacion minima del trabajo que desea solicitar.
    "descripcionProyecto" TEXT NOT NULL,

    -- Preferencias opcionales que ayudan al artista a evaluar el encargo.
    "tecnicaDeseada" VARCHAR(120),
    "materialDeseado" VARCHAR(120),
    "tamanoDeseado" VARCHAR(120),
    "fechaDeseada" DATE,
    "referenciaPresupuesto" TEXT,
    "observacionesAdicionales" TEXT,

    -- Toda solicitud nueva queda en RECIBIDA hasta que el artista la revise.
    "estado" "estadoSolicitudTrabajoPersonalizado"
        NOT NULL DEFAULT 'RECIBIDA',

    -- Fechas de control para conocer cuando se recibio y modifico.
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Este indice facilita ordenar y filtrar las solicitudes pendientes de gestion.
CREATE INDEX "indiceSolicitudesPersonalizadasEstadoFecha"
    ON "solicitudesTrabajoPersonalizado" ("estado", "creadoEn");

-- Nota de negocio:
-- No se guarda una cuenta de usuario ni un pago asociado. El visitante puede
-- enviar la solicitud sin registrarse y la negociacion continua por WhatsApp
-- u otro canal oficial del artista.
