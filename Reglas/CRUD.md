# CRUD del backend - Academia Atelier

## 1. Objetivo

El backend expone operaciones REST para administrar las entidades definidas en `ReglasBD/database.md`:

- Obras.
- Imagenes de obras.
- Solicitudes de clases.
- Solicitudes de trabajos personalizados.
- Imagenes de trabajos personalizados.
- Usuarios administradores.

Esta primera version **no conecta con Supabase**. Los servicios utilizan un almacenamiento en memoria para poder probar los endpoints y las reglas de negocio. Al reiniciar la aplicacion, los datos se pierden.

La conexion futura debe reemplazar la implementacion de `CrudStore` por adaptadores que consulten Supabase. Los controladores y las rutas publicas no deberian cambiar.

## 2. Ejecutar el backend

Desde `Backend/backend`:

```powershell
./mvnw.cmd spring-boot:run
```

La aplicacion inicia en el puerto predeterminado `8080`.

Para validar compilacion y pruebas:

```powershell
./mvnw.cmd test
```

## 3. Convenciones HTTP

Todos los recursos tienen estas operaciones:

| Metodo | Patron | Resultado |
|---|---|---|
| `GET` | `/api/recurso` | Lista todos los registros. |
| `GET` | `/api/recurso/{id}` | Obtiene un registro por UUID. |
| `POST` | `/api/recurso` | Crea un registro y devuelve `201 Created`. |
| `PUT` | `/api/recurso/{id}` | Reemplaza los datos editables y devuelve `200 OK`. |
| `DELETE` | `/api/recurso/{id}` | Elimina el registro temporal y devuelve `204 No Content`. |

Los cuerpos se envian como JSON. Los campos marcados como obligatorios en los modelos tienen validacion Bean Validation. Si el cuerpo es invalido, la API devuelve `400 Bad Request` con una respuesta de este formato:

```json
{
  "timestamp": "2026-09-11T12:00:00Z",
  "status": 400,
  "message": "El cuerpo de la solicitud no es valido",
  "details": [
    "nombre: no debe estar vacio"
  ]
}
```

Cuando un UUID no existe se devuelve `404 Not Found`.

## 4. Endpoints disponibles

### Obras

Ruta base: `/api/obras`

Ejemplo de creacion:

```json
{
  "nombre": "Luz de Atelier",
  "descripcionArtistica": "Obra inspirada en la luz del estudio.",
  "descripcionTecnica": "Acrilico sobre lienzo, 80 x 60 cm.",
  "precio": 1250000.00,
  "moneda": "COP",
  "estado": "NO_DISPONIBLE",
  "fechaPublicacion": "2026-09-11"
}
```

Reglas aplicadas:

- `precio` debe ser mayor o igual que cero.
- `moneda` debe tener tres caracteres.
- `estado` solo admite `DISPONIBLE` o `NO_DISPONIBLE`.
- El servicio genera `id`, `creadoEn` y `actualizadoEn`.

### Imagenes de obra

Ruta base: `/api/imagenes-obra`

Ejemplo:

```json
{
  "obraId": "UUID-DE-UNA-OBRA-EXISTENTE",
  "urlImagen": "https://almacenamiento.example/obras/luz-atelier.jpg",
  "textoAlternativo": "Obra Luz de Atelier en acrilico sobre lienzo",
  "ordenVisualizacion": 0,
  "esPrincipal": true
}
```

El servicio verifica que `obraId` exista antes de crear o actualizar la imagen. La URL representa un archivo externo; este CRUD no sube archivos a Supabase Storage.

### Solicitudes de clase

Ruta base: `/api/solicitudes-clase`

Ejemplo:

```json
{
  "nombreCliente": "Laura Gomez",
  "numeroWhatsapp": "+573001112233",
  "correoElectronico": "laura@example.com",
  "fechaSolicitada": "2026-10-05",
  "horaSolicitada": "15:00:00",
  "tipoClase": "Acuarela inicial",
  "cantidadEstudiantes": 1,
  "descripcionSolicitud": "Quiero aprender tecnicas basicas.",
  "observacionesAdicionales": "Tengo materiales propios."
}
```

Al crear una solicitud, el backend ignora el estado recibido y siempre almacena `SOLICITADA`, tal como exige la regla de negocio. La generacion del mensaje de WhatsApp queda para una siguiente integracion.

### Solicitudes de trabajo personalizado

Ruta base: `/api/solicitudes-trabajo-personalizado`

Ejemplo:

```json
{
  "nombreCliente": "Carlos Ruiz",
  "numeroWhatsapp": "+573009998877",
  "correoElectronico": "carlos@example.com",
  "descripcionProyecto": "Retrato familiar para sala.",
  "tecnicaDeseada": "Oleo",
  "materialDeseado": "Lienzo",
  "tamanoDeseado": "100 x 70 cm",
  "fechaDeseada": "2027-01-15",
  "referenciaPresupuesto": "Entre 2 y 3 millones COP",
  "observacionesAdicionales": "Me gustaria revisar un boceto previo."
}
```

Al crear una solicitud, el estado se establece automaticamente como `RECIBIDA`. El CRUD no crea cotizaciones, contratos ni pagos.

### Imagenes de trabajo personalizado

Ruta base: `/api/imagenes-trabajo-personalizado`

Ejemplo:

```json
{
  "solicitudId": "UUID-DE-UNA-SOLICITUD-EXISTENTE",
  "urlImagen": "https://almacenamiento.example/referencias/retrato.jpg",
  "nombreArchivoOriginal": "retrato-familiar.jpg",
  "textoAlternativo": "Imagen de referencia para el retrato familiar"
}
```

El servicio verifica que la solicitud exista. La validacion de tipo MIME, tamano y almacenamiento seguro del archivo debe implementarse cuando se conecte Supabase Storage.

### Usuarios administradores

Ruta base: `/api/administradores`

Ejemplo interno de creacion:

```json
{
  "correoElectronico": "admin@atelier.example",
  "hashContrasena": "HASH_GENERADO_CON_ARGON2ID_O_BCRYPT",
  "nombreCompleto": "Administrador Atelier",
  "estaActivo": true
}
```

`hashContrasena` es de solo escritura en JSON: Jackson no lo incluye en las respuestas. El cliente debe enviar un hash ya generado; el backend todavia no implementa inicio de sesion ni generacion de hashes.

## 5. Estructura del codigo

```text
src/main/java/com/example/backend/
├── administrador/
│   ├── UsuarioAdministrador.java
│   ├── UsuarioAdministradorController.java
│   └── UsuarioAdministradorService.java
├── imagenobra/
├── imagenpersonalizada/
├── obra/
├── solicitudclase/
├── solicitudpersonalizada/
└── shared/
    ├── AbstractCrudService.java
    ├── ApiError.java
    ├── ApiExceptionHandler.java
    ├── CrudStore.java
    └── ResourceNotFoundException.java
```

- **Modelo:** records Java que representan las entidades y sus validaciones.
- **Controller:** define las rutas HTTP y los codigos de respuesta.
- **Service:** contiene las reglas de negocio y no depende del transporte HTTP.
- **CrudStore:** persistencia temporal intercambiable.
- **shared:** manejo reutilizable de CRUD y errores.

## 6. Conexion futura con Supabase

Cuando se implemente la conexion:

1. Configurar `spring.datasource.url`, usuario y contrasena mediante variables de entorno. Nunca guardar credenciales en el repositorio.
2. Retirar gradualmente la exclusion `DataSourceAutoConfiguration` de `application.properties`.
3. Crear adaptadores persistentes para las operaciones de `AbstractCrudService`, preferiblemente usando Spring Data JPA o el cliente REST de Supabase.
4. Mapear los nombres camelCase a las columnas de PostgreSQL con las comillas y nombres definidos en `ReglasBD/database.md`.
5. Implementar transacciones para guardar solicitudes y sus imagenes relacionadas.
6. Reemplazar la eliminacion fisica por eliminacion logica para obras cuando corresponda.
7. Configurar Supabase Storage para las imagenes; la base de datos debe conservar solo las rutas y metadatos.
8. Agregar autenticacion y autorizacion al panel administrativo antes de desplegarlo.

## 7. Consideraciones de seguridad

- Los endpoints `/api/administradores` estan creados para completar el CRUD, pero aun no tienen autenticacion. No deben exponerse en produccion hasta integrar Spring Security o un mecanismo equivalente.
- Nunca aceptar ni devolver contrasenas en texto plano.
- Las credenciales de Supabase deben venir de variables de entorno o un gestor de secretos.
- Las imagenes de encargos pueden contener informacion privada; sus URLs deben tener permisos adecuados.
- CORS, limites de tamano, rate limiting y auditoria deben definirse antes del despliegue.
