-- ============================================================================
-- ARCHIVO: solicitudesClase.sql
-- ENTIDAD: Solicitudes de clase
-- ============================================================================
-- Este archivo crea la tabla que registra los formularios enviados por
-- visitantes interesados en tomar una clase.
--
-- Importante: una fila representa una SOLICITUD, no una reserva confirmada.
-- La confirmacion y la coordinacion final ocurren fuera de la plataforma,
-- normalmente mediante WhatsApp.
-- ============================================================================

-- Este tipo limita los estados posibles de seguimiento de una solicitud.
CREATE TYPE "estadoSolicitudClase" AS ENUM (
    'SOLICITADA',
    'CONTACTADA',
    'CONFIRMADA',
    'ATENDIDA',
    'CANCELADA'
);

-- Cada fila conserva la informacion que el visitante envio en el formulario.
CREATE TABLE "solicitudesClase" (
    -- Identificador unico de la solicitud.
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Datos de contacto obligatorios para poder responder la solicitud.
    "nombreCliente" VARCHAR(150) NOT NULL,
    "numeroWhatsapp" VARCHAR(30) NOT NULL,
    "correoElectronico" VARCHAR(254),

    -- Fecha y hora que el visitante desea. Estos valores no bloquean agenda
    -- ni significan que la clase este confirmada.
    "fechaSolicitada" DATE NOT NULL,
    "horaSolicitada" TIME NOT NULL,

    -- Tipo de clase solicitado, por ejemplo pintura o dibujo.
    "tipoClase" VARCHAR(120) NOT NULL,

    -- Puede quedar vacio para una clase individual. Cuando se informa, debe
    -- ser un numero positivo.
    "cantidadEstudiantes" INTEGER
        CHECK (
            "cantidadEstudiantes" IS NULL
            OR "cantidadEstudiantes" > 0
        ),

    -- Informacion opcional sobre lo que busca aprender el visitante.
    "descripcionSolicitud" TEXT,

    -- Comentarios adicionales del visitante.
    "observacionesAdicionales" TEXT,

    -- Toda solicitud comienza obligatoriamente en SOLICITADA.
    "estado" "estadoSolicitudClase" NOT NULL DEFAULT 'SOLICITADA',

    -- Fechas de control para conservar el historial basico de la solicitud.
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Este indice facilita al administrador filtrar solicitudes por estado y fecha.
CREATE INDEX "indiceSolicitudesClaseEstadoFecha"
    ON "solicitudesClase" ("estado", "fechaSolicitada");

-- Nota de negocio:
-- No existe una clave foranea hacia una tabla de usuarios porque los visitantes
-- no necesitan crear cuentas. Los datos de contacto se guardan directamente
-- en cada solicitud y el registro debe crearse antes de generar el enlace de
-- WhatsApp.
