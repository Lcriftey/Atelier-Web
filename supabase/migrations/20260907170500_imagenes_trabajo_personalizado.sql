-- ============================================================================
-- ARCHIVO: imagenesTrabajoPersonalizado.sql
-- ENTIDAD: Imagenes de trabajo personalizado
-- ============================================================================
-- Este archivo crea la tabla para guardar referencias visuales adjuntadas a
-- una solicitud de trabajo personalizado. Las imagenes pueden ser privadas,
-- por lo que el almacenamiento y la URL deben protegerse adecuadamente.
--
-- Orden recomendado de ejecucion:
--   1. solicitudesTrabajoPersonalizado.sql
--   2. imagenesTrabajoPersonalizado.sql
-- ============================================================================

-- Cada registro describe una imagen de referencia de una solicitud.
CREATE TABLE "imagenesTrabajoPersonalizado" (
    -- Identificador unico de la imagen.
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Solicitud propietaria. NOT NULL exige que la imagen siempre este
    -- relacionada con una solicitud. CASCADE evita imagenes huerfanas si la
    -- solicitud se elimina fisicamente.
    "solicitudId" UUID NOT NULL
        REFERENCES "solicitudesTrabajoPersonalizado" ("id")
        ON DELETE CASCADE,

    -- URL o ruta segura del archivo almacenado externamente.
    "urlImagen" TEXT NOT NULL,

    -- Nombre original opcional, util para identificacion administrativa.
    "nombreArchivoOriginal" VARCHAR(255),

    -- Descripcion accesible de la referencia visual, cuando corresponda.
    "textoAlternativo" VARCHAR(300),

    -- Fecha de carga de la referencia.
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Este indice permite listar rapidamente las referencias de una solicitud.
CREATE INDEX "indiceImagenesPorSolicitudPersonalizada"
    ON "imagenesTrabajoPersonalizado" ("solicitudId");

-- Nota de negocio:
-- La relacion es 1:N desde "solicitudesTrabajoPersonalizado" hacia
-- "imagenesTrabajoPersonalizado": una solicitud puede no tener imagenes o
-- puede tener varias, pero cada imagen pertenece a una sola solicitud.
-- La aplicacion debe validar extension, tipo MIME, peso y permisos del archivo.
