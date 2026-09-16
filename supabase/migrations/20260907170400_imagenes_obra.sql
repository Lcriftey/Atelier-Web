-- ============================================================================
-- ARCHIVO: imagenesObra.sql
-- ENTIDAD: Imagenes de obra
-- ============================================================================
-- Este archivo crea la tabla que almacena las fotografias asociadas a una
-- obra. Los archivos fisicos permanecen en un almacenamiento de imagenes;
-- aqui se guarda su URL o ruta y la informacion necesaria para presentarlos.
--
-- Orden recomendado de ejecucion:
--   1. obras.sql
--   2. imagenesObra.sql
-- ============================================================================

-- Cada registro representa una imagen perteneciente a una sola obra.
CREATE TABLE "imagenesObra" (
    -- Identificador unico de la imagen.
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Clave foranea hacia la obra propietaria. NOT NULL impide que exista una
    -- imagen sin obra. CASCADE elimina sus imagenes si la obra se elimina
    -- fisicamente y evita registros huerfanos.
    "obraId" UUID NOT NULL
        REFERENCES "obras" ("id")
        ON DELETE CASCADE,

    -- URL o ruta del archivo en el almacenamiento externo.
    "urlImagen" TEXT NOT NULL,

    -- Texto alternativo para accesibilidad y posicionamiento SEO.
    "textoAlternativo" VARCHAR(300) NOT NULL,

    -- Posicion de la imagen dentro del carrusel. Comienza normalmente en cero.
    "ordenVisualizacion" INTEGER NOT NULL DEFAULT 0
        CHECK ("ordenVisualizacion" >= 0),

    -- Identifica la portada de la obra. Solo puede existir una portada por obra.
    "esPrincipal" BOOLEAN NOT NULL DEFAULT FALSE,

    -- Fecha en que se registro la imagen.
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Dos imagenes de una misma obra no pueden compartir posicion.
    CONSTRAINT "obraOrdenImagenUnico"
        UNIQUE ("obraId", "ordenVisualizacion")
);

-- Este indice parcial garantiza que una obra tenga como maximo una imagen
-- principal. El filtro deja fuera las imagenes que no son portada.
CREATE UNIQUE INDEX "indiceUnaImagenPrincipalPorObra"
    ON "imagenesObra" ("obraId")
    WHERE "esPrincipal" = TRUE;

-- Este indice permite obtener rapidamente el carrusel ordenado de una obra.
CREATE INDEX "indiceImagenesPorObraYOrden"
    ON "imagenesObra" ("obraId", "ordenVisualizacion");

-- Nota de negocio:
-- La relacion es 1:N desde "obras" hacia "imagenesObra": una obra puede
-- tener muchas imagenes, pero cada imagen pertenece a una sola obra.
-- La regla "una obra publicada debe tener al menos una imagen" se valida
-- antes de cambiar el estado de la obra a DISPONIBLE.
