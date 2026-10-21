# Módulo administrativo de obras - implementación real

## 1. Objetivo del documento

Este archivo documenta la implementación real del módulo administrativo encargado de crear, consultar, editar y eliminar obras del catálogo de Academia Atelier. La intención es describir cómo funciona hoy el sistema en el código, no proponer una refactorización hipotética.

Este documento toma como base la documentación existente en `Reglas/backendInstruction.md`, `Reglas/estructuraBackend.md`, `Reglas/database.md`, `Reglas/manual de funcionamiento front end.md` y la inspección directa del código fuente del repositorio.

## 2. Estado real del proyecto

Existe una implementación funcional de la capa administrativa en el frontend y una capa backend REST que persiste datos usando PostgreSQL/Supabase. La evidencia más directa es:

- El frontend usa `fetch` a una URL remota de Railway en `../Fronted/src/api/httpClient.js`.
- La API del frontend define `obrasApi` e `imagenesObraApi` en `../Fronted/src/api/obrasApi.js` y `../Fronted/src/api/imagenesObraApi.js`.
- El backend de Java usa `JdbcTemplate` para consultar y escribir en tablas Postgres/Supabase (`../Backend/backend/src/main/java/com/example/backend/obra/ObraService.java` y `../Backend/backend/src/main/java/com/example/backend/imagenobra/ImagenObraService.java`).
- Las migraciones SQL de Supabase definen las tablas `obras` e `imagenesObra` (`../supabase/migrations/20260907170000_obras.sql` y `../supabase/migrations/20260907170400_imagenes_obra.sql`).

En otras palabras, la arquitectura actual es:

`Frontend React` -> `fetch` a API REST en Railway -> `Spring Boot` -> `PostgreSQL/Supabase`

No hay uso de `createClient` de Supabase desde el frontend ni un flujo de carga directa de archivos desde el navegador para las obras.

## 3. Ubicación y estructura del módulo administrativo

### 3.1 Entrada a la vista

La pantalla administrativa se accede por hash de navegación en `../Fronted/src/App.jsx`:

```jsx
if (route === '#admin-obras') {
  return <AdminObras />;
}
```

La ruta se obtiene desde `window.location.hash`. Eso significa que el acceso real es una URL con hash, por ejemplo `#admin-obras`.

### 3.2 Archivo principal

El archivo principal del módulo es:

- `../Fronted/src/pages/AdminObras.jsx`

Este componente encapsula la interfaz administrativa completa del catálogo: listado, creación, edición, eliminación y gestión de imágenes.

### 3.3 Componentes y archivos relacionados

Los archivos más relevantes son:

- `../Fronted/src/App.jsx`: selecciona la vista según el hash.
- `../Fronted/src/pages/AdminObras.jsx`: lógica y UI del módulo.
- `../Fronted/src/pages/AdminObras.module.css`: estilos del módulo.
- `../Fronted/src/api/httpClient.js`: cliente HTTP central con base URL remota.
- `../Fronted/src/api/obrasApi.js`: operaciones CRUD para obras.
- `../Fronted/src/api/imagenesObraApi.js`: operaciones CRUD para imágenes de obra.

También se usa la misma capa de imágenes para generar el catálogo público desde `App.jsx`, donde se une `obras` e `imagenesObra` con una función `toCatalogProduct`.

### 3.4 Estados locales y hooks relevantes

En `AdminObras.jsx` el estado se maneja con `useState` y `useMemo`:

- `obras`: listado de obras.
- `imagenes`: listado de imágenes.
- `selectedObraId`: obra activa en la interfaz.
- `editingId`: identificador de la obra en edición.
- `obraForm`: formulario de datos de obra.
- `imagenForm`: formulario de datos de imagen.
- `loadState`: estado de carga inicial.
- `saveState`: estado de guardado de obra.
- `deleteState`: estado de eliminación de obra.
- `imageState`: estado de gestión de imágenes.

La vista de imágenes se calcula así:

```jsx
const selectedImages = useMemo(
  () => imagenes.filter((imagen) => imagen.obraId === selectedObraId),
  [imagenes, selectedObraId],
);
```

La carga inicial hace dos peticiones concurrentes:

```jsx
Promise.all([obrasApi.getAll(), imagenesObraApi.getAll()])
```

## 4. Funcionalidad del frontend

### 4.1 Creación de una obra

#### 1) Apertura del formulario

Cuando el usuario presiona el botón “Nueva obra”, se ejecuta `startCreate()`:

```jsx
function startCreate() {
  setEditingId(null);
  setObraForm(emptyObra);
  setSaveState({ status: 'idle', message: '' });
}
```

Esto limpia el formulario y deja el módulo listo para crear una obra nueva.

#### 2) Campos del formulario

El formulario se renderiza dentro de `AdminObras.jsx` con los siguientes campos:

- `nombre` (obligatorio)
- `fechaPublicacion` (obligatorio, tipo `date`)
- `descripcionArtistica` (obligatorio)
- `descripcionTecnica` (obligatorio)
- `dimensiones` (obligatorio)
- `precio` (obligatorio, tipo `number`, mínimo 0)
- `moneda` (obligatorio, valor por defecto `COP`)
- `estado` (`DISPONIBLE` o `NO_DISPONIBLE`)

La estructura inicial es:

```jsx
const emptyObra = {
  nombre: '',
  descripcionArtistica: '',
  descripcionTecnica: '',
  dimensiones: '',
  precio: '',
  moneda: 'COP',
  estado: 'DISPONIBLE',
  fechaPublicacion: '',
};
```

#### 3) Validación

La validación se hace en el propio navegador en `handleObraSubmit`.

Condiciones que bloquean el guardado:

- `nombre` vacío
- `descripcionArtistica` vacío
- `descripcionTecnica` vacío
- `dimensiones` vacío
- `fechaPublicacion` vacía
- `moneda` vacía
- `precio === ''`
- `Number(obraForm.precio) < 0`

Si falla, se guarda un estado de error:

```jsx
setSaveState({ status: 'error', message: 'Completa todos los campos y usa un precio valido.' });
```

#### 4) Guardado

La función ejecutada es `handleObraSubmit(event)`. Antes de enviar, arma el payload con la moneda en mayúsculas y el precio convertido a número:

```jsx
const payload = {
  ...obraForm,
  precio: Number(obraForm.precio),
  moneda: obraForm.moneda.toUpperCase(),
};
```

Luego llama al servicio correspondiente:

```jsx
const saved = editingId
  ? await obrasApi.update(editingId, payload)
  : await obrasApi.create(payload);
```

#### 5) Persistencia

`obrasApi` define:

```js
const obrasApi = {
  getAll: () => httpClient.get('/api/obras'),
  getById: (id) => httpClient.get(`/api/obras/${id}`),
  create: (obra) => httpClient.post('/api/obras', obra),
  update: (id, obra) => httpClient.put(`/api/obras/${id}`, obra),
  remove: (id) => httpClient.delete(`/api/obras/${id}`),
};
```

Y `httpClient` hace `fetch` a la base URL remota en Railway:

```js
const API_BASE_URL = 'https://atelier-web-production-eda3.up.railway.app';
```

#### 6) Feedback y actualización de UI

Tras el guardado exitoso:

```jsx
setObras((current) => (editingId
  ? current.map((obra) => (obra.id === editingId ? saved : obra))
  : [...current, saved]));
setSelectedObraId(saved.id);
setEditingId(saved.id);
setObraForm({ ...payload });
setSaveState({ status: 'success', message: editingId ? 'Obra actualizada.' : 'Obra creada.' });
```

Si falla, se captura el error `error.message` y se muestra en pantalla.

### 4.2 Edición de una obra

#### Selección y carga de datos

El usuario pulsa “Editar” sobre una fila de la tabla. La llamada es:

```jsx
function startEdit(obra) {
  setEditingId(obra.id);
  setSelectedObraId(obra.id);
  setObraForm({
    nombre: obra.nombre,
    descripcionArtistica: obra.descripcionArtistica,
    descripcionTecnica: obra.descripcionTecnica,
    dimensiones: obra.dimensiones || '',
    precio: obra.precio,
    moneda: obra.moneda,
    estado: obra.estado,
    fechaPublicacion: obra.fechaPublicacion,
  });
  setSaveState({ status: 'idle', message: '' });
}
```

Esto rellena el formulario con los datos actuales de la obra seleccionada.

#### Guardado de cambios

La lógica reutiliza `handleObraSubmit` con `editingId` no nulo. La diferencia está en que en lugar de crear, ejecuta `obrasApi.update(editingId, payload)`.

El backend hace la actualización con `PUT /api/obras/{id}`.

#### Imágenes existentes durante la edición

Las imágenes no se vuelven a cargar en el formulario principal de la obra; se gestionan separadamente en la sección “Imágenes de la obra seleccionada”.

La lógica de la vista se basa en `selectedObraId` y en `selectedImages`:

```jsx
const selectedImages = imagenes.filter((imagen) => imagen.obraId === selectedObraId);
```

Cuando se cambia la obra seleccionada, aparecen sus imágenes asociadas y se pueden eliminar individualmente o agregar nuevas.

### 4.3 Eliminación de una obra

La eliminación se dispara por `handleDeleteObra(obra)`:

```jsx
if (!window.confirm(`¿Eliminar la obra "${obra.nombre}"? Esta accion no se puede deshacer.`)) return;
await obrasApi.remove(obra.id);
setObras((current) => current.filter((item) => item.id !== obra.id));
setImagenes((current) => current.filter((imagen) => imagen.obraId !== obra.id));
```

Eso indica que en la UI se eliminan también las imágenes de la obra del estado local, y luego se limpia la selección si correspondía.

#### ¿Se eliminan también archivos en storage?

La implementación actual del frontend no sube archivos ni interactúa con Supabase Storage. La eliminación de una obra en esta UI elimina los registros en la API de Obras y, en el estado local, también elimina las imágenes relacionadas a esa obra.

La parte importante es que el backend Java hace un `DELETE` directo sobre la tabla `obras` y, según la definición SQL, `imagenesObra` tiene `ON DELETE CASCADE`:

```sql
"obraId" UUID NOT NULL REFERENCES "obras" ("id") ON DELETE CASCADE
```

Esto significa que, si el backend se está ejecutando contra la base de datos real de Supabase con esa relación, la eliminación física de la obra provoca la eliminación de sus imágenes asociadas en la tabla `imagenesObra`.

Sin embargo, no hay evidencia de que se eliminen archivos físicos de almacenamiento externo; lo que sí existe es la eliminación de los registros de metadatos y el vínculo en la base de datos. El código no muestra una llamada a un bucket de Supabase Storage ni una API que borre archivos del almacenamiento de imágenes.

### 4.4 Gestión de imágenes en el frontend

#### Cómo se agregan

La sección de imágenes usa el siguiente formulario:

```jsx
const emptyImagen = {
  urlImagen: '',
  textoAlternativo: '',
  ordenVisualizacion: 0,
  esPrincipal: false,
};
```

Y la creación se hace por `handleImageSubmit(event)`.

Validaciones actuales:

- debe existir una obra seleccionada
- `urlImagen` no puede estar vacío
- `textoAlternativo` no puede estar vacío
- `ordenVisualizacion >= 0`

#### Tipo de entrada

El frontend no usa subida de archivos desde el computador. El campo se define como `type="url"`:

```jsx
<input value={imagenForm.urlImagen} onChange={...} type="url" required />
```

Esto sugiere que el usuario debe introducir una URL de imagen manualmente (por ejemplo, una URL pública o una URL de storage).

#### Vista previa

Si la URL se ha ingresado, se muestra una vista previa:

```jsx
{imagenForm.urlImagen && <img className={styles.imagePreview} src={imagenForm.urlImagen} alt="Vista previa de la nueva imagen" />}
```

#### Imagen principal

La UI incluye un checkbox:

```jsx
<label className={styles.checkbox}>
  <input
    checked={imagenForm.esPrincipal}
    onChange={(event) => setImagenForm({ ...imagenForm, esPrincipal: event.target.checked })}
    type="checkbox"
  /> Imagen principal
</label>
```

Cuando se guarda la imagen, el backend y la base de datos garantizan que no haya dos imágenes principales por obra. En `ImagenObraService.java` se hace esto:

```java
if (creada.esPrincipal()) {
    jdbcTemplate.update("UPDATE \"imagenesObra\" SET \"esPrincipal\" = FALSE WHERE \"obraId\" = ?", creada.obraId());
}
```

#### Orden de visualización

Cada imagen lleva `ordenVisualizacion`, y el catálogo público ordena `imagen.ordenVisualizacion` de forma ascendente:

```js
.filter((imagen) => imagen.obraId === obra.id)
.sort((first, second) => first.ordenVisualizacion - second.ordenVisualizacion);
```

#### Eliminación de imágenes

La UI elimina cada imagen individualmente:

```jsx
await imagenesObraApi.remove(imagen.id);
setImagenes((current) => current.filter((item) => item.id !== imagen.id));
```

No hay flujo para reemplazar una imagen existente; la acción es eliminación directa, y luego se puede crear una nueva.

## 5. Backend y persistencia

### 5.1 Arquitectura de comunicación

#### Frontend a backend

El cliente web usa objetos `obrasApi` e `imagenesObraApi` que se apoyan en `httpClient` y `fetch`.

El flujo real es:

```text
AdminObras.jsx
  -> obrasApi.create / update / remove
  -> httpClient.post / put / delete
  -> https://atelier-web-production-eda3.up.railway.app/api/obras
```

y

```text
AdminObras.jsx
  -> imagenesObraApi.create / remove
  -> httpClient.post / delete
  -> https://atelier-web-production-eda3.up.railway.app/api/imagenes-obra
```

#### Backend Java

Los endpoints reales son:

- `GET /api/obras`
- `GET /api/obras/{id}`
- `POST /api/obras`
- `PUT /api/obras/{id}`
- `DELETE /api/obras/{id}`

y

- `GET /api/imagenes-obra`
- `GET /api/imagenes-obra/{id}`
- `POST /api/imagenes-obra`
- `PUT /api/imagenes-obra/{id}`
- `DELETE /api/imagenes-obra/{id}`

La implementación está en:

- `../Backend/backend/src/main/java/com/example/backend/obra/ObraController.java`
- `../Backend/backend/src/main/java/com/example/backend/imagenobra/ImagenObraController.java`

#### Base de datos real

La capa backend usa `JdbcTemplate` cuando hay datasource disponible. Los servicios leen y escriben directamente a PostgreSQL/Supabase.

Las evidencias del esquema se encuentran en:

- `../supabase/migrations/20260907170000_obras.sql`
- `../supabase/migrations/20260907170400_imagenes_obra.sql`
- `../Backend/backend/src/main/java/com/example/backend/obra/ObraService.java`
- `../Backend/backend/src/main/java/com/example/backend/imagenobra/ImagenObraService.java`

No hay acceso directo desde el frontend a Supabase ni llamadas con `@supabase/supabase-js` en el código del frontend actual.

### 5.2 Modelo de datos de las obras

#### Tabla `obras`

Definida en `../supabase/migrations/20260907170000_obras.sql`:

```sql
CREATE TABLE "obras" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(200) NOT NULL,
    "descripcionArtistica" TEXT NOT NULL,
    "descripcionTecnica" TEXT NOT NULL,
    "precio" NUMERIC(12, 2) NOT NULL CHECK ("precio" >= 0),
    "moneda" CHAR(3) NOT NULL DEFAULT 'COP',
    "estado" "estadoObra" NOT NULL DEFAULT 'NO_DISPONIBLE',
    "fechaPublicacion" DATE NOT NULL DEFAULT CURRENT_DATE,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminadoEn" TIMESTAMPTZ
);
```

El estado está restringido al enum:

```sql
CREATE TYPE "estadoObra" AS ENUM (
    'DISPONIBLE',
    'NO_DISPONIBLE'
);
```

Esto coincide con la record de Java:

```java
public record Obra(
        UUID id,
        @NotBlank @Size(max = 200) String nombre,
        @NotBlank String descripcionArtistica,
        @NotBlank String descripcionTecnica,
        @NotBlank String dimensiones,
        @NotNull @DecimalMin("0.00") BigDecimal precio,
        @NotBlank @Size(min = 3, max = 3) String moneda,
        @NotNull EstadoObra estado,
        @NotNull LocalDate fechaPublicacion,
        OffsetDateTime creadoEn,
        OffsetDateTime actualizadoEn,
        OffsetDateTime eliminadoEn
) { ... }
```

#### Tabla `imagenesObra`

Definida en `../supabase/migrations/20260907170400_imagenes_obra.sql`:

```sql
CREATE TABLE "imagenesObra" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "obraId" UUID NOT NULL REFERENCES "obras" ("id") ON DELETE CASCADE,
    "urlImagen" TEXT NOT NULL,
    "textoAlternativo" VARCHAR(300) NOT NULL,
    "ordenVisualizacion" INTEGER NOT NULL DEFAULT 0 CHECK ("ordenVisualizacion" >= 0),
    "esPrincipal" BOOLEAN NOT NULL DEFAULT FALSE,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "obraOrdenImagenUnico" UNIQUE ("obraId", "ordenVisualizacion")
);
```

Además:

```sql
CREATE UNIQUE INDEX "indiceUnaImagenPrincipalPorObra"
    ON "imagenesObra" ("obraId")
    WHERE "esPrincipal" = TRUE;
```

Esto demuestra que:

- una obra puede tener varias imágenes;
- cada imagen pertenece a una sola obra;
- la relación es 1:N;
- solo puede haber una imagen principal por obra;
- el orden de visualización es único por obra.

### 5.3 Operaciones CRUD en la práctica

#### Crear obra

- Frontend: `obrasApi.create(payload)`
- HTTP: `POST /api/obras`
- Backend: `ObraController.crear()`
- Servicio: `ObraService.crear()`
- Persistencia real: `INSERT INTO "obras" ...`

#### Consultar obras

- Frontend: `obrasApi.getAll()`
- HTTP: `GET /api/obras`
- Backend: `ObraController.listar()`
- Servicio: `ObraService.listar()`
- SQL: `SELECT ... FROM "obras" WHERE "eliminadoEn" IS NULL ORDER BY "fechaPublicacion" DESC`

#### Editar obra

- Frontend: `obrasApi.update(id, payload)`
- HTTP: `PUT /api/obras/{id}`
- Backend: `ObraController.actualizar()`
- Servicio: `ObraService.actualizar()`
- SQL: `UPDATE "obras" SET ... WHERE "id" = ?`

#### Eliminar obra

- Frontend: `obrasApi.remove(id)`
- HTTP: `DELETE /api/obras/{id}`
- Backend: `ObraController.eliminar()`
- Servicio: `ObraService.eliminar()`
- SQL: `DELETE FROM "obras" WHERE "id" = ?`

#### Crear imagen

- Frontend: `imagenesObraApi.create({ ...imagenForm, obraId: selectedObraId })`
- HTTP: `POST /api/imagenes-obra`
- Backend: `ImagenObraController.crear()`
- Servicio: `ImagenObraService.crear()`
- SQL: `INSERT INTO "imagenesObra" ...`

#### Eliminar imagen

- Frontend: `imagenesObraApi.remove(id)`
- HTTP: `DELETE /api/imagenes-obra/{id}`
- Backend: `ImagenObraController.eliminar()`
- Servicio: `ImagenObraService.eliminar()`
- SQL: `DELETE FROM "imagenesObra" WHERE "id" = ?`

## 6. Conclusiones funcionales

1. El módulo administrativo real sí existe y está conectado al backend. No es solo una vista estática.
2. La navegación se hace por hash (`#admin-obras`) desde `App.jsx`.
3. El flujo real del formulario no sube archivos; solo manda URLs y metadatos.
4. La imagen principal existe en el modelo de datos y se gestiona con `esPrincipal`.
5. La base de datos usa relaciones con `ON DELETE CASCADE` para las imágenes asociadas.
6. La capa de almacenamiento de archivos no se observa como un bucket de Supabase Storage en el código analizado; el valor persistente es la URL de la imagen, no el archivo físico.
7. La implementación actual prioriza el trabajo con `JdbcTemplate` sobre JPA, y la capa de backend está preparada para trabajar con PostgreSQL/Supabase, no con un sistema local en memoria.

## 7. Recomendaciones de interpretación para futuras modificaciones

Cuando se desarrollen cambios para este módulo, conviene recordar lo siguiente:

- El módulo administrativo actual se comunica con la API REST, no con Supabase directo.
- Los datos persistentes reales están en la base de datos de PostgreSQL/Supabase.
- La UI no gestiona archivos binarios; solo captura una URL y metadatos visuales.
- La regla “una obra puede tener varias imágenes, una principal” sí está implementada en la base de datos y en el backend.
- La eliminación física de obra elimina registros relacionados si la base de datos usa la FK con cascade, pero no hay evidencia de borrado de archivos del almacenamiento externo.

Este documento debe servir como punto de partida para futuras modificaciones del módulo administrativo, manteniendo la implementación actual como referencia técnica válida del sistema real.
