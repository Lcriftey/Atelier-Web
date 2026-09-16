# Instrucciones de contexto para IA - Backend Academia Atelier

> Este documento es la fuente de contexto operativo para cualquier IA que modifique el backend. Debe leerse antes de crear, mover o refactorizar archivos dentro de `Backend/backend`.

## 1. Identidad del proyecto

- **Proyecto:** Academia Atelier.
- **Responsabilidad del backend:** exponer una API REST para administrar obras de arte, imagenes, solicitudes de clases, solicitudes de trabajos personalizados y usuarios administradores.
- **Framework:** Spring Boot `4.1.1`.
- **Lenguaje:** Java `21`.
- **Build tool:** Maven Wrapper.
- **Modulo ejecutable:** `Backend/backend`.
- **Paquete raiz Java:** `com.example.backend`.
- **Clase de arranque:** `com.example.backend.BackendApplication`.
- **Puerto local predeterminado:** `8080`.

## 2. Estado de despliegue y persistencia

### Estado actual

El backend **no esta desplegado en un proveedor cloud** en este momento. El codigo fuente vive en el repositorio local dentro de:

```text
Academia Atelier/Backend/backend
```

Se puede ejecutar localmente con:

```powershell
Set-Location "Backend/backend"
./mvnw.cmd spring-boot:run
```

La API queda disponible normalmente en `http://localhost:8080`.

### Supabase

Supabase es el destino previsto para la base de datos y el almacenamiento de imagenes. Existe configuracion de Supabase en la carpeta hermana `supabase/`, pero el backend actual **no se conecta todavia a Supabase**.

La desconexion es intencional. En `src/main/resources/application.properties` se excluye `DataSourceAutoConfiguration` para que la aplicacion pueda iniciar sin credenciales ni URL de base de datos.

### Persistencia actual

Los servicios usan `CrudStore`, un almacenamiento temporal basado en `ConcurrentHashMap`:

```text
com.example.backend.shared.CrudStore
```

Por consecuencia:

- Los datos solo viven mientras el proceso esta encendido.
- Al reiniciar la aplicacion se pierden todos los registros.
- Todavia no hay transacciones reales.
- Todavia no hay consultas SQL ni repositorios JPA activos.
- Las URL de imagenes son solo metadatos; el backend no sube archivos.

Nunca describir el estado actual como una conexion funcional con Supabase. La integracion es una etapa futura.

## 3. Arquitectura actual

La aplicacion sigue una arquitectura sencilla por recurso:

```text
src/main/java/com/example/backend/
├── BackendApplication.java
├── administrador/
│   ├── UsuarioAdministrador.java
│   ├── UsuarioAdministradorController.java
│   └── UsuarioAdministradorService.java
├── imagenobra/
│   ├── ImagenObra.java
│   ├── ImagenObraController.java
│   └── ImagenObraService.java
├── imagenpersonalizada/
│   ├── ImagenTrabajoPersonalizado.java
│   ├── ImagenTrabajoPersonalizadoController.java
│   └── ImagenTrabajoPersonalizadoService.java
├── obra/
│   ├── EstadoObra.java
│   ├── Obra.java
│   ├── ObraController.java
│   └── ObraService.java
├── solicitudclase/
│   ├── EstadoSolicitudClase.java
│   ├── SolicitudClase.java
│   ├── SolicitudClaseController.java
│   └── SolicitudClaseService.java
├── solicitudpersonalizada/
│   ├── EstadoSolicitudTrabajoPersonalizado.java
│   ├── SolicitudTrabajoPersonalizado.java
│   ├── SolicitudTrabajoPersonalizadoController.java
│   └── SolicitudTrabajoPersonalizadoService.java
└── shared/
    ├── AbstractCrudService.java
    ├── ApiError.java
    ├── ApiExceptionHandler.java
    ├── CrudStore.java
    └── ResourceNotFoundException.java
```

### Responsabilidades por capa

- **Modelo (`*.java`):** records Java que representan los datos de la API y contienen restricciones Bean Validation.
- **Enum:** define estados permitidos y evita valores arbitrarios.
- **Controller:** recibe solicitudes HTTP, valida cuerpos con `@Valid`, devuelve codigos HTTP y delega en el servicio.
- **Service:** contiene reglas de negocio, genera UUID y fechas, y verifica relaciones entre recursos.
- **`AbstractCrudService`:** reutiliza listar, buscar, guardar y eliminar.
- **`CrudStore`:** persistencia temporal reemplazable.
- **`ApiExceptionHandler`:** transforma errores en respuestas JSON uniformes.
- **`ResourceNotFoundException`:** representa un recurso inexistente.

No mezclar logica de negocio compleja dentro de los controladores. Si una regla no es exclusivamente HTTP, debe vivir en el servicio o en una capa de dominio reutilizable.

## 4. Recursos y endpoints

Todos los recursos implementan:

| Metodo | Endpoint | Resultado |
|---|---|---|
| `GET` | `/api/recurso` | Lista registros. |
| `GET` | `/api/recurso/{id}` | Busca por UUID. |
| `POST` | `/api/recurso` | Crea y responde `201 Created`. |
| `PUT` | `/api/recurso/{id}` | Actualiza y responde `200 OK`. |
| `DELETE` | `/api/recurso/{id}` | Elimina temporalmente y responde `204 No Content`. |

### Obras

- **Endpoint:** `/api/obras`.
- **Modelo:** `Obra`.
- **Estado:** `DISPONIBLE`, `NO_DISPONIBLE`.
- **Reglas:** precio no negativo, moneda de tres caracteres, campos descriptivos obligatorios.
- **Creacion:** genera UUID y fechas automaticamente.
- **Imagen minima:** una obra necesita al menos una imagen para publicarse. Esta regla todavia debe validarse en la capa persistente o mediante un caso de uso antes de conectar Supabase.
- **Eliminacion:** la primera version tiene delete CRUD, pero el modelo de negocio recomienda eliminacion logica para conservar historial artistico.

### Imagenes de obras

- **Endpoint:** `/api/imagenes-obra`.
- **Modelo:** `ImagenObra`.
- **Relacion:** cada imagen necesita un `obraId` existente.
- **Reglas:** `ordenVisualizacion >= 0`; texto alternativo obligatorio; una imagen puede ser principal.
- **Archivos:** el backend actual no procesa multipart ni sube imagenes; solo guarda `urlImagen`.

### Solicitudes de clase

- **Endpoint:** `/api/solicitudes-clase`.
- **Modelo:** `SolicitudClase`.
- **Estado inicial obligatorio:** `SOLICITADA`.
- **Estados:** `SOLICITADA`, `CONTACTADA`, `CONFIRMADA`, `ATENDIDA`, `CANCELADA`.
- **Regla principal:** una solicitud no es una reserva confirmada.
- **Comunicacion:** todavia no se genera el mensaje ni la redireccion a WhatsApp.
- **Campos validos:** nombre, WhatsApp, fecha, hora y tipo de clase son obligatorios; cantidad de estudiantes, si existe, debe ser positiva.

### Solicitudes de trabajo personalizado

- **Endpoint:** `/api/solicitudes-trabajo-personalizado`.
- **Modelo:** `SolicitudTrabajoPersonalizado`.
- **Estado inicial obligatorio:** `RECIBIDA`.
- **Estados:** `RECIBIDA`, `EN_REVISION`, `CONTACTADA`, `ACEPTADA`, `RECHAZADA`, `CANCELADA`, `FINALIZADA`.
- **Regla principal:** la solicitud no crea cotizacion, contrato, pago ni reserva automatica.
- **Campos obligatorios:** nombre, WhatsApp y descripcion del proyecto.

### Imagenes de trabajos personalizados

- **Endpoint:** `/api/imagenes-trabajo-personalizado`.
- **Modelo:** `ImagenTrabajoPersonalizado`.
- **Relacion:** cada imagen necesita un `solicitudId` existente.
- **Privacidad:** pueden ser referencias privadas del cliente. Al conectar almacenamiento deben protegerse sus URLs y permisos.

### Usuarios administradores

- **Endpoint:** `/api/administradores`.
- **Modelo:** `UsuarioAdministrador`.
- **Campo sensible:** `hashContrasena` es de solo escritura en JSON mediante `@JsonProperty(access = WRITE_ONLY)`.
- **Estado:** `estaActivo` permite revocar acceso sin borrar el registro.
- **Estado actual de seguridad:** el CRUD existe, pero estos endpoints aun no tienen autenticacion ni autorizacion. No deben exponerse en produccion hasta integrar Spring Security, Supabase Auth u otra solucion equivalente.

## 5. Contrato de errores

`ApiExceptionHandler` produce respuestas uniformes:

- `400 Bad Request`: cuerpo invalido o restriccion de validacion incumplida.
- `404 Not Found`: UUID inexistente.

Formato base:

```json
{
  "timestamp": "2026-09-11T12:00:00Z",
  "status": 404,
  "message": "No se encontro obra con id ...",
  "details": []
}
```

Cuando se agreguen nuevos errores, conservar este formato. No devolver trazas internas, contrasenas, tokens ni informacion de infraestructura.

## 6. Reglas incambiables

Estas decisiones forman parte del contrato del sistema y no deben cambiarse sin actualizar requisitos, `ReglasBD/database.md`, pruebas y consumidores de la API:

1. **No inventar persistencia:** mientras no se configure Supabase, el almacenamiento sigue siendo temporal y debe declararse como tal.
2. **No guardar secretos en codigo:** credenciales de Supabase, contrasenas, JWT y claves de Storage deben venir de variables de entorno o un gestor de secretos.
3. **No exponer contrasenas:** nunca devolver `hashContrasena` ni aceptar contrasenas en texto plano como si fueran hashes.
4. **No procesar pagos en esta version:** no agregar ordenes, tarjetas, facturacion o envios sin ampliar formalmente el alcance.
5. **No convertir solicitudes en reservas:** una solicitud de clase solo expresa interes; la confirmacion es externa.
6. **Estado inicial de clases:** toda creacion valida debe comenzar en `SOLICITADA`.
7. **Estado inicial de encargos:** toda creacion valida debe comenzar en `RECIBIDA`.
8. **No requerir cuentas publicas:** los visitantes pueden enviar solicitudes sin crear perfiles.
9. **Conservar las relaciones:** una imagen de obra debe apuntar a una obra existente; una imagen de encargo debe apuntar a una solicitud existente.
10. **Mantener UUID:** no sustituir los identificadores por indices incrementales sin migracion y justificacion.
11. **Mantener camelCase publico:** los nombres JSON actuales estan en camelCase en espanol, por ejemplo `descripcionArtistica` y `fechaSolicitada`.
12. **Separar HTTP y negocio:** los controladores no deben convertirse en repositorios ni contener reglas de persistencia.
13. **Mantener compatibilidad REST:** no cambiar rutas ni metodos HTTP sin versionar la API o actualizar consumidores.
14. **No borrar historial artisticamente sin decision:** para obras se prefiere eliminacion logica o `NO_DISPONIBLE` sobre borrado fisico.
15. **No subir archivos sin validacion:** toda futura carga de imagen debe validar MIME, tamano, extension, permisos y nombre seguro.

## 7. Integracion futura con Supabase

Cuando se autorice la conexion persistente:

1. Definir variables de entorno para URL JDBC, usuario, contrasena y SSL.
2. Retirar la exclusion de `DataSourceAutoConfiguration` solo cuando la configuracion sea valida.
3. Elegir una estrategia persistente: Spring Data JPA, JDBC o cliente REST de Supabase. No mezclar estrategias sin una razon clara.
4. Crear interfaces de repositorio o puertos para que `AbstractCrudService` no dependa directamente del proveedor.
5. Mapear los modelos a las tablas de `ReglasBD/database.md`: `obras`, `imagenesObra`, `solicitudesClase`, `solicitudesTrabajoPersonalizado`, `imagenesTrabajoPersonalizado` y `usuariosAdministradores`.
6. Respetar las restricciones de PostgreSQL, enums, claves foraneas e indices ya definidos.
7. Usar transacciones para operaciones relacionadas, especialmente solicitudes con imagenes.
8. Implementar eliminacion logica para obras y filtros que excluyan registros archivados del catalogo publico.
9. Configurar Supabase Storage para archivos y dejar en PostgreSQL solo URL/ruta y metadatos.
10. Integrar autenticacion y autorizacion antes de habilitar cualquier endpoint administrativo.
11. Agregar pruebas de integracion contra una base de datos de prueba antes de retirar `CrudStore`.
12. Actualizar este documento, `CRUD.md` y `ReglasBD/database.md` cuando cambie el contrato.

## 8. Convenciones para futuras modificaciones

- Mantener una carpeta por recurso.
- Usar nombres de clases en espanol y PascalCase.
- Usar nombres JSON en espanol y camelCase.
- Usar `record` para modelos inmutables mientras no exista una necesidad clara de mutabilidad.
- Agregar validaciones en el modelo y reglas relacionales en el servicio o repositorio.
- Reutilizar `AbstractCrudService` y `ApiExceptionHandler` antes de duplicar infraestructura.
- Escribir pruebas para cada regla nueva, especialmente estados iniciales y relaciones.
- Documentar cualquier endpoint nuevo en `CRUD.md`.
- Ejecutar siempre `./mvnw.cmd test` despues de modificar codigo.
- No editar la carpeta `target/`; es salida generada por Maven.
- No introducir dependencias nuevas sin explicar su necesidad en el cambio.

## 9. Pruebas actuales

La suite actual incluye:

- Prueba de carga del contexto Spring Boot.
- Creacion de una obra con UUID y fechas.
- Estado inicial `SOLICITADA` para clases.
- Rechazo de imagen cuando la obra padre no existe.

Comando oficial:

```powershell
Set-Location "Backend/backend"
./mvnw.cmd test
```

El build debe terminar con `BUILD SUCCESS` antes de considerar terminada una modificacion.

## 10. Archivos de referencia

- `Backend/backend/CRUD.md`: guia de endpoints y ejemplos JSON.
- `ReglasBD/database.md`: modelo de datos, nombres de tablas, campos y relaciones.
- `ReglasBD/Reglas de Negocio.md`: reglas funcionales y administrativas originales.
- `Backend/backend/pom.xml`: versiones y dependencias.
- `Backend/backend/src/main/resources/application.properties`: configuracion actual y exclusion intencional de la base de datos.

## 11. Checklist para una IA

Antes de editar:

- Leer este archivo y `CRUD.md`.
- Identificar si el cambio afecta una regla incambiable.
- Revisar rutas y modelos existentes.
- Confirmar si la tarea pide almacenamiento temporal o Supabase real.

Durante la edicion:

- Mantener la arquitectura controller-service-shared.
- Evitar credenciales y datos sensibles.
- Preservar nombres JSON y estados.
- Agregar o actualizar pruebas.
- Documentar cambios de contrato.

Antes de finalizar:

- Ejecutar `./mvnw.cmd test`.
- Revisar errores de compilacion.
- Verificar que no se modifico `target/` manualmente.
- Informar si la conexion con Supabase continua pendiente.
- Indicar cualquier limitacion de seguridad o despliegue que siga vigente.
