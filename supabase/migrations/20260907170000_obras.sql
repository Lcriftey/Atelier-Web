-- ============================================================================
-- ARCHIVO: obras.sql
-- ENTIDAD: Obras
-- ============================================================================
-- Este archivo crea la tabla principal del catalogo de Academia Atelier.
-- Una fila representa una obra de arte que puede aparecer en el catalogo
-- publico o conservarse como parte de la galeria historica.
--
-- Dependencias:
--   - Requiere la extension pgcrypto para generar UUID automaticamente.
--
-- Dependencias posteriores:
--   - El archivo imagenesObra.sql utiliza "obras".id como clave foranea.
-- ============================================================================

-- pgcrypto permite usar gen_random_uuid(), una funcion que genera
-- identificadores unicos sin que la aplicacion tenga que crearlos manualmente.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Este tipo restringe el estado de una obra a los valores definidos por las
-- reglas del negocio. No se acepta texto libre porque podria generar estados
-- inconsistentes, por ejemplo "disponible", "Disponible" y "vendida".
CREATE TYPE "estadoObra" AS ENUM (
    'DISPONIBLE',
    'NO_DISPONIBLE'
);

-- La tabla "obras" almacena la informacion descriptiva, comercial y de
-- auditoria basica de cada obra.
CREATE TABLE "obras" (
    -- Identificador tecnico de la obra. Es la clave primaria y se genera solo.
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Nombre con el que el artista presenta la obra.
    "nombre" VARCHAR(200) NOT NULL,

    -- Texto artistico que explica la obra al visitante.
    "descripcionArtistica" TEXT NOT NULL,

    -- Informacion tecnica: tecnica, materiales, dimensiones u otros datos.
    "descripcionTecnica" TEXT NOT NULL,

    -- Precio de referencia. NUMERIC evita errores de redondeo habituales
    -- cuando se almacenan valores monetarios.
    "precio" NUMERIC(12, 2) NOT NULL CHECK ("precio" >= 0),

    -- Codigo ISO 4217 de la moneda, por ejemplo COP. CHAR(3) garantiza
    -- que siempre se reserve espacio para exactamente tres caracteres.
    "moneda" CHAR(3) NOT NULL DEFAULT 'COP',

    -- Por defecto la obra no se publica como disponible hasta que el
    -- administrador verifique que toda la informacion e imagenes estan listas.
    "estado" "estadoObra" NOT NULL DEFAULT 'NO_DISPONIBLE',

    -- Fecha de publicacion visible para ordenar o mostrar la trayectoria.
    "fechaPublicacion" DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Fechas de control: creacion y ultima modificacion del registro.
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Eliminacion logica opcional. Si tiene valor, la obra se considera
    -- archivada y no debe mostrarse en el catalogo publico.
    "eliminadoEn" TIMESTAMPTZ
);

-- Este indice ayuda a consultar rapidamente las obras por disponibilidad y
-- fecha, que es una consulta habitual del catalogo publico.
CREATE INDEX "indiceObrasEstadoFecha"
    ON "obras" ("estado", "fechaPublicacion");

-- Nota de negocio:
-- Una obra requiere al menos una imagen para publicarse. Esa regla depende de
-- la tabla "imagenesObra" y normalmente se valida en el servicio de aplicacion
-- o mediante un trigger, porque un CHECK no puede consultar otra tabla.
