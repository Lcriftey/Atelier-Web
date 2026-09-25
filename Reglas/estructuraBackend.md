# Estado actual del backend de Academia Atelier

## 1. Alcance y método de análisis

Este documento describe el estado real actual del backend ubicado en `Backend/backend` y se basa únicamente en archivos existentes del proyecto, migraciones SQL de Supabase y documentación del repositorio. No se modificaron archivos ni se agregó lógica nueva.

> Regla principal: si algo no existe o no puede determinarse con evidencia, se indica como "No implementado actualmente." o "No determinado en los archivos analizados."

---

## 2. Ruta del backend analizado

- Ruta real del proyecto: `Backend/backend`
- Ruta relativa desde la raíz del workspace: `Backend/backend`
- Documentación relacionada revisada: `Reglas/database.md`, archivos SQL en `supabase/migrations/`

---

## 3. Estructura general del backend

### 3.1 Árbol principal

```text
Backend/
└── backend/
    ├── .gitignore
    ├── .gitattributes
    ├── .idea/
    ├── .mvn/
    ├── HELP.md
    ├── mvnw
    ├── mvnw.cmd
    ├── pom.xml
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── com/example/backend/
    │   │   │       ├── administrador/
    │   │   │       ├── config/
    │   │   │       ├── controller/
    │   │   │       ├── imagenobra/
    │   │   │       ├── imagenpersonalizada/
    │   │   │       ├── obra/
    │   │   │       ├── shared/
    │   │   │       ├── solicitudclase/
    │   │   │       └── solicitudpersonalizada/
    │   │   └── resources/
    │   │       └── application.properties
    │   └── test/
    │       └── java/com/example/backend/
    └── target/
```

### 3.2 Paquetes Java existentes

| Paquete | Descripción observada |
|---|---|
| `com.example.backend` | Clase principal de arranque Spring Boot y paquete raíz. |
| `com.example.backend.administrador` | CRUD de usuarios administradores. |
| `com.example.backend.config` | Configuraciones CORS y Supabase. |
| `com.example.backend.controller` | Controlador de prueba de conexión. |
| `com.example.backend.imagenobra` | CRUD de imágenes asociadas a obras. |
| `com.example.backend.imagenpersonalizada` | CRUD de imágenes asociadas a trabajos personalizados. |
| `com.example.backend.obra` | CRUD del catálogo de obras. |
| `com.example.backend.shared` | Excepciones, respuesta de error y almacenamiento temporal. |
| `com.example.backend.solicitudclase` | CRUD de solicitudes de clase. |
| `com.example.backend.solicitudpersonalizada` | CRUD de solicitudes de trabajo personalizado. |

### 3.3 Archivos y clases relevantes

| Ruta relativa | Tipo | Propósito | Dependencias relevantes | Relación observada |
|---|---|---|---|---|
| `Backend/backend/src/main/java/com/example/backend/BackendApplication.java` | Java / Spring Boot | Clase principal de arranque. | `@SpringBootApplication` | Inicia la aplicación. |
| `Backend/backend/src/main/resources/application.properties` | Properties | Configuración principal de Spring Boot y PostgreSQL. | `spring.datasource.*` y `spring.jpa.*` | Configura datasource y JPA. |
| `Backend/backend/src/main/java/com/example/backend/config/SupabaseDatabaseConfig.java` | Java / Config | DataSource JDBC opcional para Supabase. | `JdbcTemplate`, `DriverManagerDataSource` | Define bean para conexión directa. |
| `Backend/backend/src/main/java/com/example/backend/config/CorsConfig.java` | Java / Config | CORS para desarrollo. | `WebMvcConfigurer` | Expone endpoints a frontend. |
| `Backend/backend/src/main/java/com/example/backend/controller/PruebaController.java` | Controller | Prueba de conexión a PostgreSQL. | `JdbcTemplate` | Consulta `SELECT 1`. |
| `Backend/backend/src/main/java/com/example/backend/shared/AbstractCrudService.java` | Clase base | CRUD genérico en memoria. | `CrudStore` | Base para servicios principales. |
| `Backend/backend/src/main/java/com/example/backend/shared/CrudStore.java` | Persistencia temporal | Almacenamiento en memoria `ConcurrentHashMap`. | `UUID`, listas | Sustituye una BD real temporalmente. |
| `Backend/backend/src/main/java/com/example/backend/shared/ApiExceptionHandler.java` | `@RestControllerAdvice` | Mapea errores HTTP. | `ResourceNotFoundException` | Centraliza manejo de errores. |
| `.../obra/Obra.java` | `record` | Esquema de una obra. | Validaciones Bean Validation | Sin JPA. |
| `.../obra/ObraService.java` | `@Service` | CRUD de obras vía `JdbcTemplate` o `CrudStore`. | `AbstractCrudService`, `JdbcTemplate` | Usa tabla `"obras"`. |
| `.../obra/ObraController.java` | `@RestController` | API REST de obras. | `ObraService` | Expuesto en `/api/obras`. |
| `.../solicitudclase/SolicitudClase.java` | `record` | Modelo de solicitud de clase. | `@Valid` | Sin JPA. |
| `.../solicitudclase/SolicitudClaseService.java` | `@Service` | CRUD de solicitudes de clase. | `AbstractCrudService` | Usa lógica en memoria o `JdbcTemplate` si existe. |
| `.../solicitudpersonalizada/SolicitudTrabajoPersonalizado.java` | `record` | Modelo de solicitud personalizada. | Validaciones | Sin JPA. |
| `.../solicitudpersonalizada/SolicitudTrabajoPersonalizadoService.java` | `@Service` | CRUD de trabajos personalizados. | `AbstractCrudService` | Similar patrón. |
| `.../imagenobra/ImagenObra.java` | `record` | Modelo de imagen de obra. | `UUID`, validaciones | Referencia a `obraId`. |
| `.../imagenobra/ImagenObraService.java` | `@Service` | CRUD de imágenes con validación de obra. | `ObraService`, `JdbcTemplate` | Consulta `"imagenesObra"`. |
| `.../imagenpersonalizada/ImagenTrabajoPersonalizado.java` | `record` | Modelo de referencia visual. | Validaciones | Sin JPA. |
| `.../imagenpersonalizada/ImagenTrabajoPersonalizadoService.java` | `@Service` | CRUD de referencias de trabajo personalizado. | `SolicitudTrabajoPersonalizadoService` | Valida `solicitudId`. |
| `.../administrador/UsuarioAdministrador.java` | `record` | Modelo de administrador. | `@JsonProperty(WRITE_ONLY)` | No es entidad JPA. |
| `.../administrador/UsuarioAdministradorService.java` | `@Service` | CRUD de administradores. | `AbstractCrudService` | Usa `CrudStore`. |

### 3.4 Archivos de configuración y Maven

| Archivo | Determinación |
|---|---|
| `Backend/backend/pom.xml` | Sí existe. Define proyecto Spring Boot y dependencias. |
| `Backend/backend/mvnw` y `mvnw.cmd` | Sí existen. Permiten ejecutar Maven Wrapper. |
| `Backend/backend/src/main/resources/application.properties` | Sí existe. Configuración principal. |
| `Backend/backend/src/main/java/com/example/backend/config/SupabaseDatabaseConfig.java` | Sí existe. Configuración adicional de datasource JDBC. |
| `Backend/backend/src/main/java/com/example/backend/config/CorsConfig.java` | Sí existe. CORS para desarrollo. |
| `application.yml` / `application.yaml` | No implementado actualmente. |
| `bootstrap.yml` / `bootstrap.properties` | No implementado actualmente. |

### 3.5 Tests existentes

| Archivo | Tipo | Observación |
|---|---|---|
| `Backend/backend/src/test/java/com/example/backend/BackendApplicationTests.java` | Spring test | Verifica contexto de la aplicación. |
| `Backend/backend/src/test/java/com/example/backend/CrudServicesTests.java` | JUnit 5 | Prueba CRUD de `ObraService`, `SolicitudClaseService`, `ImagenObraService`. |

---

## 4. Tecnologías y versiones

### 4.1 Versión de Java

- Archivo fuente: `Backend/backend/pom.xml`
- Determinación: `java.version` = `21`

### 4.2 Versión de Spring Boot

- Archivo fuente: `Backend/backend/pom.xml`
- Determinación: `org.springframework.boot:spring-boot-starter-parent` versión `4.1.1`

### 4.3 Versión de Maven

- Archivo fuente: `Backend/backend/mvnw` y `Backend/backend/mvnw.cmd`
- Determinación: existe Maven Wrapper, pero la versión exacta del Maven runtime no se declara explícitamente en `pom.xml`. No determinado en los archivos analizados.

### 4.4 Dependencias de Spring

| Dependencia | Determinación |
|---|---|
| `spring-boot-starter-data-jpa` | Sí existe. |
| `spring-boot-starter-webmvc` | Sí existe. |
| `spring-boot-starter-validation` | Sí existe. |
| `spring-boot-starter-jdbc` | Sí existe. |
| `spring-boot-starter-data-jpa-test` | Sí existe, solo en test. |
| `spring-boot-starter-webmvc-test` | Sí existe, solo en test. |

### 4.5 Driver PostgreSQL

- Archivo fuente: `Backend/backend/pom.xml`
- Determinación: `org.postgresql:postgresql` con `scope=runtime`
- Versión: no se fija explícitamente en `pom.xml`; la versión es gestionada por Spring Boot 4.1.1
- Evidencia de los logs de test: `postgresql-42.7.13.jar`

### 4.6 Hibernate / JPA

- Archivo fuente: `Backend/backend/src/main/resources/application.properties`
- Determinación: `spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect`
- Evidencia de logs: Hibernate Core `7.4.5.Final`
- Observación: el proyecto declara JPA, pero no hay entidades JPA reales ni repositorios Spring Data. La capa JPA no está implementada con `@Entity` ni `JpaRepository`.

### 4.7 Otras dependencias relevantes

- `HikariCP` aparece en los logs de la ejecución de pruebas, lo cual indica uso de pool de conexiones de Spring Boot/JDBC por defecto.
- `Jakarta Validation` está habilitada mediante `spring-boot-starter-validation`.

---

## 5. Configuración de Spring Boot

### 5.1 `application.properties`

Archivo analizado: `Backend/backend/src/main/resources/application.properties`

```properties
spring.application.name=backend

spring.datasource.url=jdbc:postgresql://db.afktacjtvfvfddrqryym.supabase.co:5432/postgres?sslmode=require
spring.datasource.username=postgres
spring.datasource.password=${SUPABASE_DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

### 5.2 Parámetros detectados

| Parámetro | Valor observado | Estado |
|---|---|---|
| Nombre de la aplicación | `backend` | Detectado |
| Puerto | No especificado en `application.properties` | No determinado en los archivos analizados |
| Datasource URL | `jdbc:postgresql://db.afktacjtvfvfddrqryym.supabase.co:5432/postgres?sslmode=require` | Detectado |
| Usuario PostgreSQL | `postgres` | Detectado |
| Contraseña | `${SUPABASE_DB_PASSWORD}` | Nombre de variable detectado; valor no documentado por seguridad |
| `spring.jpa.hibernate.ddl-auto` | `none` | Detectado |
| `spring.jpa.show-sql` | `true` | Detectado |
| `spring.jpa.database-platform` | `org.hibernate.dialect.PostgreSQLDialect` | Detectado |
| `spring.jpa.open-in-view` | No configurado explícitamente | Detectado como habilitado por defecto en logs |
| Perfiles de Spring | No existen | No implementado actualmente |
| CORS | Configurado en `CorsConfig.java` | Detectado |

### 5.3 `SupabaseDatabaseConfig`

Archivo analizado: `Backend/backend/src/main/java/com/example/backend/config/SupabaseDatabaseConfig.java`

```java
@Configuration
@ConditionalOnProperty(name = "supabase.db.enabled", havingValue = "true")
public class SupabaseDatabaseConfig {
    @Value("${supabase.db.url}")
    private String databaseUrl;
    @Value("${supabase.db.username:postgres}")
    private String databaseUsername;
    @Value("${supabase.db.password}")
    private String databasePassword;
}
```

**Observaciones:**
- Esta configuración es opcional y solo se activa si `supabase.db.enabled=true` está presente.
- En la configuración actual, esa propiedad no aparece en `application.properties`.
- Usa `DriverManagerDataSource` con `org.postgresql.Driver` y `JdbcTemplate`.
- No se observa uso de `spring.datasource.hikari.*` ni configuración explícita de pool en el proyecto.

---

## 6. Conexión con PostgreSQL / Supabase

### 6.1 Datos de conexión actuales

| Campo | Valor detectado |
|---|---|
| Motor | PostgreSQL |
| Host | `db.afktacjtvfvfddrqryym.supabase.co` |
| Puerto | `5432` |
| Base de datos | `postgres` |
| Usuario | `postgres` |
| Driver | `org.postgresql.Driver` |
| Parámetros JDBC | `?sslmode=require` |
| SSL | `sslmode=require` |
| Variables de entorno | `SUPABASE_DB_PASSWORD` |
| Pool de conexiones | HikariCP por defecto de Spring Boot; no se configura explícitamente en el proyecto |

### 6.2 Estado real de Hibernate / DDL

- `spring.jpa.hibernate.ddl-auto=none`
- Esto significa que la app no intenta crear, alterar ni validar esquema automáticamente con Hibernate.
- En otra palabra: la base de datos no se gestiona por `ddl-auto` en este proyecto.

### 6.3 Condición real de conexión

Se observó una prueba de conexión en `PruebaController`:

```java
@GetMapping("/api/test-db")
public String testDatabaseConnection() {
    Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
    return "Conexion exitosa. PostgreSQL respondio: " + result;
}
```

Sin embargo, en esta sesión, la ejecución de `mvn test` mostró:

> `Caused by: org.postgresql.util.PSQLException: FATAL: password authentication failed for user "postgres"`

Esto indica que la conexión real de Supabase no está autenticada correctamente en el entorno actual. La aplicación no presenta una conexión válida confirmada a Supabase en esta sesión.

---

## 7. JPA / Hibernate

### 7.1 Estado real

No existen entidades JPA reales en el proyecto. No se detectan:

- `@Entity`
- `@Table`
- `@Id`
- `@GeneratedValue`
- `@Column`
- `@OneToOne`
- `@OneToMany`
- `@ManyToOne`
- `@ManyToMany`
- `@JoinColumn`

Los modelos principales son `record` de Java, no entidades JPA. La persistencia real no se basa en Hibernate para los dominios principales.

### 7.2 Entidades / modelos detectados

| Nombre | Tipo | Tabla asociada | Observación |
|---|---|---|---|
| `Obra` | `record` | `"obras"` | Modelo del catálogo. |
| `UsuarioAdministrador` | `record` | `"usuariosAdministradores"` | Modelo administrativo. |
| `SolicitudClase` | `record` | `"solicitudesClase"` | Modelo de clases. |
| `SolicitudTrabajoPersonalizado` | `record` | `"solicitudesTrabajoPersonalizado"` | Modelo de encargo personalizado. |
| `ImagenObra` | `record` | `"imagenesObra"` | Modelo de imagen de obra. |
| `ImagenTrabajoPersonalizado` | `record` | `"imagenesTrabajoPersonalizado"` | Modelo de imagen de encargo personalizado. |
| `EstadoObra` | `enum` | `estadoObra` | Enumeración SQL del esquema. |
| `EstadoSolicitudClase` | `enum` | `estadoSolicitudClase` | Enumeración SQL del esquema. |
| `EstadoSolicitudTrabajoPersonalizado` | `enum` | `estadoSolicitudTrabajoPersonalizado` | Enumeración SQL del esquema. |

### 7.3 Campos detectados por entidad

#### `Obra`

| Campo | Tipo Java | Observación |
|---|---|---|
| `id` | `UUID` | Clave primaria lógica del registro. |
| `nombre` | `String` | `@NotBlank`, `@Size(max = 200)` |
| `descripcionArtistica` | `String` | `@NotBlank` |
| `descripcionTecnica` | `String` | `@NotBlank` |
| `dimensiones` | `String` | `@NotBlank` en constructor alternativo, se usa `No especificadas` por defecto |
| `precio` | `BigDecimal` | `@NotNull`, `@DecimalMin("0.00")` |
| `moneda` | `String` | `@Size(min = 3, max = 3)` |
| `estado` | `EstadoObra` | `@NotNull` |
| `fechaPublicacion` | `LocalDate` | `@NotNull` |
| `creadoEn` | `OffsetDateTime` | Fecha de creación |
| `actualizadoEn` | `OffsetDateTime` | Fecha de última modificación |
| `eliminadoEn` | `OffsetDateTime` | Soft delete contemplado |

#### `UsuarioAdministrador`

| Campo | Tipo Java | Observación |
|---|---|---|
| `id` | `UUID` | Identificador. |
| `correoElectronico` | `String` | `@Email`, `@Size(max = 254)` |
| `hashContrasena` | `String` | `@JsonProperty(WRITE_ONLY)` |
| `nombreCompleto` | `String` | `@Size(max = 150)` |
| `estaActivo` | `boolean` | Estado activo. |
| `creadoEn` | `OffsetDateTime` | Fecha de creación. |
| `actualizadoEn` | `OffsetDateTime` | Fecha de última modificación. |

#### `SolicitudClase`

| Campo | Tipo Java | Observación |
|---|---|---|
| `id` | `UUID` | Identificador. |
| `nombreCliente` | `String` | `@NotBlank`, `@Size(max = 150)` |
| `numeroWhatsapp` | `String` | `@NotBlank`, `@Size(max = 30)` |
| `correoElectronico` | `String` | `@Email`, `@Size(max = 254)` |
| `fechaSolicitada` | `LocalDate` | `@NotNull` |
| `horaSolicitada` | `LocalTime` | `@NotNull` |
| `tipoClase` | `String` | `@NotBlank`, `@Size(max = 120)` |
| `cantidadEstudiantes` | `Integer` | `@Min(1)` |
| `descripcionSolicitud` | `String` | Opcional |
| `observacionesAdicionales` | `String` | Opcional |
| `estado` | `EstadoSolicitudClase` | `@NotNull` |
| `creadoEn` | `OffsetDateTime` | Fecha creación |
| `actualizadoEn` | `OffsetDateTime` | Fecha actualización |

#### `SolicitudTrabajoPersonalizado`

| Campo | Tipo Java | Observación |
|---|---|---|
| `id` | `UUID` | Identificador. |
| `nombreCliente` | `String` | `@NotBlank` |
| `numeroWhatsapp` | `String` | `@NotBlank` |
| `correoElectronico` | `String` | `@Email` |
| `descripcionProyecto` | `String` | `@NotBlank` |
| `tecnicaDeseada` | `String` | Opcional |
| `materialDeseado` | `String` | Opcional |
| `tamanoDeseado` | `String` | Opcional |
| `fechaDeseada` | `LocalDate` | Opcional |
| `referenciaPresupuesto` | `String` | Opcional |
| `observacionesAdicionales` | `String` | Opcional |
| `estado` | `EstadoSolicitudTrabajoPersonalizado` | `@NotNull` |
| `creadoEn` | `OffsetDateTime` | Fecha creación |
| `actualizadoEn` | `OffsetDateTime` | Fecha actualización |

#### `ImagenObra`

| Campo | Tipo Java | Observación |
|---|---|---|
| `id` | `UUID` | Identificador. |
| `obraId` | `UUID` | `@NotNull` |
| `urlImagen` | `String` | `@NotBlank` |
| `textoAlternativo` | `String` | `@NotBlank`, `@Size(max = 300)` |
| `ordenVisualizacion` | `Integer` | `@Min(0)` |
| `esPrincipal` | `boolean` | Booleano |
| `creadoEn` | `OffsetDateTime` | Fecha creación |

#### `ImagenTrabajoPersonalizado`

| Campo | Tipo Java | Observación |
|---|---|---|
| `id` | `UUID` | Identificador. |
| `solicitudId` | `UUID` | `@NotNull` |
| `urlImagen` | `String` | `@NotBlank` |
| `nombreArchivoOriginal` | `String` | Opcional |
| `textoAlternativo` | `String` | Opcional |
| `creadoEn` | `OffsetDateTime` | Fecha creación |

---

## 8. Repositories

### Estado actual

No existen interfaces `JpaRepository`, `CrudRepository`, ni clases anotadas con `@Repository`.

**Conclusión:** `No implementado actualmente.`

### Repositorios esperados según la estructura SQL

| Tabla | Entidad | Repository | Estado |
|---|---|---|---|
| `obras` | `Obra` | No existe | No implementado actualmente |
| `usuariosAdministradores` | `UsuarioAdministrador` | No existe | No implementado actualmente |
| `solicitudesClase` | `SolicitudClase` | No existe | No implementado actualmente |
| `solicitudesTrabajoPersonalizado` | `SolicitudTrabajoPersonalizado` | No existe | No implementado actualmente |
| `imagenesObra` | `ImagenObra` | No existe | No implementado actualmente |
| `imagenesTrabajoPersonalizado` | `ImagenTrabajoPersonalizado` | No existe | No implementado actualmente |

---

## 9. Services

### 9.1 Servicios detectados

| Servicio | Estado | Observaciones |
|---|---|---|
| `ObraService` | Implementado | CRUD real con `JdbcTemplate` y fallback a `CrudStore`. |
| `UsuarioAdministradorService` | Implementado | CRUD básico con `CrudStore`. |
| `SolicitudClaseService` | Implementado | CRUD básico con `CrudStore`. |
| `SolicitudTrabajoPersonalizadoService` | Implementado | CRUD básico con `CrudStore`. |
| `ImagenObraService` | Implementado | Validación de `obraId` y CRUD con `JdbcTemplate`. |
| `ImagenTrabajoPersonalizadoService` | Implementado | Validación de `solicitudId` y CRUD básico. |

### 9.2 Lógica de negocio detectada

- `ObraService`:
  - `listar()`: consulta `SELECT ... FROM "obras" WHERE "eliminadoEn" IS NULL`
  - `buscar(id)`: filtra por `"id"` y `"eliminadoEn" IS NULL`
  - `crear(...)`: genera UUID, fecha actual, inserta en `"obras"`
  - `actualizar(...)`: actualiza registro
  - `eliminar(...)`: elimina físicamente con `DELETE FROM "obras"`
- `ImagenObraService`:
  - valida que `obraId` exista antes de crear/actualizar
  - marca `esPrincipal = FALSE` para todas las imágenes de la obra cuando se crea otra principal
- `UsuarioAdministradorService`:
  - `hashContrasena` se conserva como valor de entrada y no se ejecuta hashing real en la aplicación
- `SolicitudClaseService`:
  - al crear, forcea `estado = SOLICITADA`
- `SolicitudTrabajoPersonalizadoService`:
  - al crear, forcea `estado = RECIBIDA`

### 9.3 Operaciones CRUD por servicio

| Entidad/tabla | CREATE | READ | UPDATE | DELETE |
|---|---|---|---|---|
| `Obra` | Implementado | Implementado | Implementado | Implementado |
| `UsuarioAdministrador` | Implementado | Implementado | Implementado | Implementado |
| `SolicitudClase` | Implementado | Implementado | Implementado | Implementado |
| `SolicitudTrabajoPersonalizado` | Implementado | Implementado | Implementado | Implementado |
| `ImagenObra` | Implementado | Implementado | Implementado | Implementado |
| `ImagenTrabajoPersonalizado` | Implementado | Implementado | Implementado | Implementado |

**Nota:** La capa CRUD existe, pero no se apoya en una arquitectura de repositorio real ni en entidades JPA. La persitencia efectiva es mixta: `CrudStore` en memoria y SQL directo con `JdbcTemplate` cuando el bean se crea.

---

## 10. Controllers / API REST

### 10.1 Controladores detectados

| Controlador | Ruta base | Observación |
|---|---|---|
| `PruebaController` | `/api/test-db` | Prueba de conexión. |
| `ObraController` | `/api/obras` | CRUD catálogo. |
| `UsuarioAdministradorController` | `/api/administradores` | CRUD administradores. |
| `SolicitudClaseController` | `/api/solicitudes-clase` | CRUD solicitudes clases. |
| `SolicitudTrabajoPersonalizadoController` | `/api/solicitudes-trabajo-personalizado` | CRUD encargos personalizados. |
| `ImagenObraController` | `/api/imagenes-obra` | CRUD imágenes de obra. |
| `ImagenTrabajoPersonalizadoController` | `/api/imagenes-trabajo-personalizado` | CRUD imágenes de solicitud personalizada. |

### 10.2 Endpoints reales detectados

| Método HTTP | Endpoint | Controller | Función | Parámetros | Request Body | Response | Estado |
|---|---|---|---|---|---|---|---|
| GET | `/api/test-db` | `PruebaController` | Validar conexión SQL | Ninguno | Ninguno | `String` con respuesta de prueba | Existente |
| GET | `/api/obras` | `ObraController` | Listar obras | Ninguno | Ninguno | `List<Obra>` | Existente |
| GET | `/api/obras/{id}` | `ObraController` | Buscar obra por id | `UUID id` | Ninguno | `Obra` | Existente |
| POST | `/api/obras` | `ObraController` | Crear obra | Ninguno | `Obra` | `ResponseEntity<Obra>` | Existente |
| PUT | `/api/obras/{id}` | `ObraController` | Actualizar obra | `UUID id` | `Obra` | `Obra` | Existente |
| DELETE | `/api/obras/{id}` | `ObraController` | Eliminar obra | `UUID id` | Ninguno | `204 No Content` | Existente |
| GET | `/api/administradores` | `UsuarioAdministradorController` | Listar administradores | Ninguno | Ninguno | `List<UsuarioAdministrador>` | Existente |
| GET | `/api/administradores/{id}` | `UsuarioAdministradorController` | Buscar administrador | `UUID id` | Ninguno | `UsuarioAdministrador` | Existente |
| POST | `/api/administradores` | `UsuarioAdministradorController` | Crear administrador | Ninguno | `UsuarioAdministrador` | `ResponseEntity<UsuarioAdministrador>` | Existente |
| PUT | `/api/administradores/{id}` | `UsuarioAdministradorController` | Actualizar administrador | `UUID id` | `UsuarioAdministrador` | `UsuarioAdministrador` | Existente |
| DELETE | `/api/administradores/{id}` | `UsuarioAdministradorController` | Eliminar administrador | `UUID id` | Ninguno | `204 No Content` | Existente |
| GET | `/api/solicitudes-clase` | `SolicitudClaseController` | Listar solicitudes de clase | Ninguno | Ninguno | `List<SolicitudClase>` | Existente |
| GET | `/api/solicitudes-clase/{id}` | `SolicitudClaseController` | Buscar solicitud | `UUID id` | Ninguno | `SolicitudClase` | Existente |
| POST | `/api/solicitudes-clase` | `SolicitudClaseController` | Crear solicitud | Ninguno | `SolicitudClase` | `ResponseEntity<SolicitudClase>` | Existente |
| PUT | `/api/solicitudes-clase/{id}` | `SolicitudClaseController` | Actualizar solicitud | `UUID id` | `SolicitudClase` | `SolicitudClase` | Existente |
| DELETE | `/api/solicitudes-clase/{id}` | `SolicitudClaseController` | Eliminar solicitud | `UUID id` | Ninguno | `204 No Content` | Existente |
| GET | `/api/solicitudes-trabajo-personalizado` | `SolicitudTrabajoPersonalizadoController` | Listar solicitudes personalizadas | Ninguno | Ninguno | `List<SolicitudTrabajoPersonalizado>` | Existente |
| GET | `/api/solicitudes-trabajo-personalizado/{id}` | `SolicitudTrabajoPersonalizadoController` | Buscar solicitud | `UUID id` | Ninguno | `SolicitudTrabajoPersonalizado` | Existente |
| POST | `/api/solicitudes-trabajo-personalizado` | `SolicitudTrabajoPersonalizadoController` | Crear solicitud | Ninguno | `SolicitudTrabajoPersonalizado` | `ResponseEntity<SolicitudTrabajoPersonalizado>` | Existente |
| PUT | `/api/solicitudes-trabajo-personalizado/{id}` | `SolicitudTrabajoPersonalizadoController` | Actualizar solicitud | `UUID id` | `SolicitudTrabajoPersonalizado` | `SolicitudTrabajoPersonalizado` | Existente |
| DELETE | `/api/solicitudes-trabajo-personalizado/{id}` | `SolicitudTrabajoPersonalizadoController` | Eliminar solicitud | `UUID id` | Ninguno | `204 No Content` | Existente |
| GET | `/api/imagenes-obra` | `ImagenObraController` | Listar imágenes de obra | Ninguno | Ninguno | `List<ImagenObra>` | Existente |
| GET | `/api/imagenes-obra/{id}` | `ImagenObraController` | Buscar imagen | `UUID id` | Ninguno | `ImagenObra` | Existente |
| POST | `/api/imagenes-obra` | `ImagenObraController` | Crear imagen | Ninguno | `ImagenObra` | `ResponseEntity<ImagenObra>` | Existente |
| PUT | `/api/imagenes-obra/{id}` | `ImagenObraController` | Actualizar imagen | `UUID id` | `ImagenObra` | `ImagenObra` | Existente |
| DELETE | `/api/imagenes-obra/{id}` | `ImagenObraController` | Eliminar imagen | `UUID id` | Ninguno | `204 No Content` | Existente |
| GET | `/api/imagenes-trabajo-personalizado` | `ImagenTrabajoPersonalizadoController` | Listar imágenes de solicitud | Ninguno | Ninguno | `List<ImagenTrabajoPersonalizado>` | Existente |
| GET | `/api/imagenes-trabajo-personalizado/{id}` | `ImagenTrabajoPersonalizadoController` | Buscar imagen | `UUID id` | Ninguno | `ImagenTrabajoPersonalizado` | Existente |
| POST | `/api/imagenes-trabajo-personalizado` | `ImagenTrabajoPersonalizadoController` | Crear imagen | Ninguno | `ImagenTrabajoPersonalizado` | `ResponseEntity<ImagenTrabajoPersonalizado>` | Existente |
| PUT | `/api/imagenes-trabajo-personalizado/{id}` | `ImagenTrabajoPersonalizadoController` | Actualizar imagen | `UUID id` | `ImagenTrabajoPersonalizado` | `ImagenTrabajoPersonalizado` | Existente |
| DELETE | `/api/imagenes-trabajo-personalizado/{id}` | `ImagenTrabajoPersonalizadoController` | Eliminar imagen | `UUID id` | Ninguno | `204 No Content` | Existente |

---

## 11. DTOs y validaciones

### 11.1 DTOs / records detectados

| Clase | Tipo | Observación |
|---|---|---|
| `Obra` | `record` | DTO de entrada/salida del catálogo. |
| `UsuarioAdministrador` | `record` | DTO de entrada/salida administrativo. |
| `SolicitudClase` | `record` | DTO de solicitud. |
| `SolicitudTrabajoPersonalizado` | `record` | DTO de encargo. |
| `ImagenObra` | `record` | DTO de referencia visual. |
| `ImagenTrabajoPersonalizado` | `record` | DTO de imagen de referencia. |
| `ApiError` | `record` | Respuesta uniforme de error. |

### 11.2 Validaciones detectadas

| Anotación | Uso observado | Ejemplo |
|---|---|---|
| `@Valid` | Validación de request body en controllers | `crear(@Valid @RequestBody Obra solicitud)` |
| `@NotBlank` | Campos obligatorios de texto | `nombre`, `descripcionArtistica` |
| `@NotNull` | Campos requeridos | `precio`, `estado`, `fechaPublicacion` |
| `@Size` | Longitud máxima o mínima | `nombre`, `correoElectronico` |
| `@Email` | Validación de correo | `UsuarioAdministrador`, `SolicitudClase` |
| `@DecimalMin` | Precio mínimo | `precio >= 0.00` |
| `@Min` | Validación mínima | `cantidadEstudiantes` y `ordenVisualizacion` |
| `@JsonProperty(WRITE_ONLY)` | Ocultamiento en serialización | `hashContrasena` |

### 11.3 Transporte de datos actual

- Los modelos se usan directamente como request/response bodies entre controller, servicio y datos.
- No existen DTO separados para cada capa ni validaciones de entidad JPA.
- Hay un manejo centralizado de errores con `@RestControllerAdvice`.

---

## 12. Manejo de errores

### 12.1 Componentes detectados

| Componente | Detección |
|---|---|
| `ApiExceptionHandler` | Sí existe |
| `@RestControllerAdvice` | Sí existe |
| `@ExceptionHandler` | Sí existe |
| `ResourceNotFoundException` | Sí existe |
| `ApiError` | Sí existe |

### 12.2 Mapeos reales

| Exception | Código HTTP | Observación |
|---|---|---|
| `ResourceNotFoundException` | `404 Not Found` | `"No se encontro ... con id ..."` |
| `MethodArgumentNotValidException` | `400 Bad Request` | Campos inválidos del body |
| `ConstraintViolationException` | `400 Bad Request` | Parámetros no válidos |

### 12.3 Respuesta uniforme

```java
public record ApiError(
        Instant timestamp,
        int status,
        String message,
        List<String> details
) {}
```

Esto confirma que el backend tiene manejo centralizado y uniforme de errores.

---

## 13. CORS y comunicación con frontend

### 13.1 Configuración actual

Archivo analizado: `Backend/backend/src/main/java/com/example/backend/config/CorsConfig.java`

```java
registry.addMapping("/api/**")
        .allowedOriginPatterns("*")
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*");
```

### 13.2 Estado

| Parámetro | Valor observado |
|---|---|
| Orígenes permitidos | `*` mediante `allowedOriginPatterns("*")` |
| Métodos permitidos | `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` |
| Headers | `*` |
| Credenciales | No configuradas explícitamente |
| Aplicación | `@Configuration` sobre `WebMvcConfigurer` |

**Conclusión:** existe CORS para desarrollo, pero no está restringido a dominios reales.

---

## 14. Seguridad

### 14.1 Estado actual

Se revisaron los archivos del backend y no se detectaron:

- `Spring Security` en `pom.xml`
- `WebSecurityConfigurerAdapter`
- `SecurityFilterChain`
- `JWT`
- `AuthenticationManager`
- roles de usuario
- filtros de seguridad
- usuarios administradores autenticados mediante login real

### 14.2 Observación importante

`UsuarioAdministrador` incluye `hashContrasena`, pero no existe ni:
- encriptación/hasheo en la app,
- login JWT,
- regla de autorización,
- verificación de permisos por endpoint.

**Conclusión:** `No implementado actualmente.`

---

## 15. Relación con las tablas de Supabase

La base de datos de Supabase está documentada en `Reglas/database.md` y en los archivos SQL en `supabase/migrations/`.

### 15.1 Tablas y estado real del backend

| Tabla | Entidad equivalente | Repository | Service | Controller | DTOs | CRUD | Estado |
|---|---|---|---|---|---|---|---|
| `obras` | `Obra` | No existe | `ObraService` | `ObraController` | `Obra` | Sí | Implementado parcialmente con SQL directo y fallback in-memory |
| `usuariosAdministradores` | `UsuarioAdministrador` | No existe | `UsuarioAdministradorService` | `UsuarioAdministradorController` | `UsuarioAdministrador` | Sí | Implementado parcialmente |
| `solicitudesClase` | `SolicitudClase` | No existe | `SolicitudClaseService` | `SolicitudClaseController` | `SolicitudClase` | Sí | Implementado parcialmente |
| `solicitudesTrabajoPersonalizado` | `SolicitudTrabajoPersonalizado` | No existe | `SolicitudTrabajoPersonalizadoService` | `SolicitudTrabajoPersonalizadoController` | `SolicitudTrabajoPersonalizado` | Sí | Implementado parcialmente |
| `imagenesObra` | `ImagenObra` | No existe | `ImagenObraService` | `ImagenObraController` | `ImagenObra` | Sí | Implementado parcialmente |
| `imagenesTrabajoPersonalizado` | `ImagenTrabajoPersonalizado` | No existe | `ImagenTrabajoPersonalizadoService` | `ImagenTrabajoPersonalizadoController` | `ImagenTrabajoPersonalizado` | Sí | Implementado parcialmente |

### 15.2 Relación con la base de datos documental

La documentación en `Reglas/database.md` confirma que las tablas principales son:

- `obras`
- `imagenesObra`
- `solicitudesClase`
- `solicitudesTrabajoPersonalizado`
- `imagenesTrabajoPersonalizado`
- `usuariosAdministradores`

**No se detecta** ninguna entidad JPA que las represente con `@Entity`; por lo tanto, la relación con la BD no está modelada en JPA, sino con `record` y SQL directo.

---

## 16. Migraciones / SQL

### 16.1 Archivos SQL revisados

| Archivo | Descripción |
|---|---|
| `supabase/migrations/20260907170000_obras.sql` | Crea `estadoObra` y tabla `obras` |
| `supabase/migrations/20260907170100_usuarios_administradores.sql` | Crea tabla `usuariosAdministradores` |
| `supabase/migrations/20260907170200_solicitudes_clase.sql` | Crea `estadoSolicitudClase` y tabla `solicitudesClase` |
| `supabase/migrations/20260907170300_solicitudes_trabajo_personalizado.sql` | Crea `estadoSolicitudTrabajoPersonalizado` y tabla `solicitudesTrabajoPersonalizado` |
| `supabase/migrations/20260907170400_imagenes_obra.sql` | Crea tabla `imagenesObra` con FK a `obras` |
| `supabase/migrations/20260907170500_imagenes_trabajo_personalizado.sql` | Crea tabla `imagenesTrabajoPersonalizado` con FK a `solicitudesTrabajoPersonalizado` |
| `supabase/migrations/20260922100000_dimensiones_obra.sql` | Agrega columna `dimensiones` a `obras` |

### 16.2 Qué crean realmente

#### `obras`

```sql
CREATE TYPE "estadoObra" AS ENUM ('DISPONIBLE', 'NO_DISPONIBLE');
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
    "eliminadoEn" TIMESTAMPTZ,
    "dimensiones" TEXT NOT NULL DEFAULT 'No especificadas'
);
```

#### `usuariosAdministradores`

```sql
CREATE TABLE "usuariosAdministradores" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "correoElectronico" VARCHAR(254) NOT NULL UNIQUE,
    "hashContrasena" TEXT NOT NULL,
    "nombreCompleto" VARCHAR(150) NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT TRUE,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### `solicitudesClase`

```sql
CREATE TYPE "estadoSolicitudClase" AS ENUM (
    'SOLICITADA', 'CONTACTADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'
);
CREATE TABLE "solicitudesClase" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nombreCliente" VARCHAR(150) NOT NULL,
    "numeroWhatsapp" VARCHAR(30) NOT NULL,
    "correoElectronico" VARCHAR(254),
    "fechaSolicitada" DATE NOT NULL,
    "horaSolicitada" TIME NOT NULL,
    "tipoClase" VARCHAR(120) NOT NULL,
    "cantidadEstudiantes" INTEGER CHECK ("cantidadEstudiantes" IS NULL OR "cantidadEstudiantes" > 0),
    "descripcionSolicitud" TEXT,
    "observacionesAdicionales" TEXT,
    "estado" "estadoSolicitudClase" NOT NULL DEFAULT 'SOLICITADA',
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### `solicitudesTrabajoPersonalizado`

```sql
CREATE TYPE "estadoSolicitudTrabajoPersonalizado" AS ENUM (
    'RECIBIDA', 'EN_REVISION', 'CONTACTADA', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'FINALIZADA'
);
CREATE TABLE "solicitudesTrabajoPersonalizado" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nombreCliente" VARCHAR(150) NOT NULL,
    "numeroWhatsapp" VARCHAR(30) NOT NULL,
    "correoElectronico" VARCHAR(254),
    "descripcionProyecto" TEXT NOT NULL,
    "tecnicaDeseada" VARCHAR(120),
    "materialDeseado" VARCHAR(120),
    "tamanoDeseado" VARCHAR(120),
    "fechaDeseada" DATE,
    "referenciaPresupuesto" TEXT,
    "observacionesAdicionales" TEXT,
    "estado" "estadoSolicitudTrabajoPersonalizado" NOT NULL DEFAULT 'RECIBIDA',
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### `imagenesObra`

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

#### `imagenesTrabajoPersonalizado`

```sql
CREATE TABLE "imagenesTrabajoPersonalizado" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "solicitudId" UUID NOT NULL REFERENCES "solicitudesTrabajoPersonalizado" ("id") ON DELETE CASCADE,
    "urlImagen" TEXT NOT NULL,
    "nombreArchivoOriginal" VARCHAR(255),
    "textoAlternativo" VARCHAR(300),
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 16.3 Observaciones sobre migraciones

- Las migraciones son SQL reales para PostgreSQL/Supabase.
- El código Java no las ejecuta automáticamente.
- El backend usa consultas directas con nombres de columnas entre comillas dobles y tipos `UUID`, `TIMESTAMPTZ`, etc., lo cual coincide con la estructura SQL.

---

## 17. Flujo actual de datos

### 17.1 Flujo real observado

```text
Frontend / navegador
   ↓
Controller REST (`@RestController`)
   ↓
Service (`@Service`)
   ↓
AbstractCrudService
   ├── CrudStore (en memoria)
   └── JdbcTemplate para SQL directo (si el bean existe)
   ↓
PostgreSQL / Supabase
```

### 17.2 Qué ya existe y qué no

| Capa | Estado |
|---|---|
| Frontend React | Sí existe en otra carpeta del workspace, pero no se analizó como parte del backend |
| Controller | Sí existe |
| Service | Sí existe |
| Repository / Data Access Layer JPA | No implementado actualmente |
| Entity JPA | No implementado actualmente |
| Hibernate ORM | Configurado parcialmente, pero no aplicado a entidades reales |
| PostgreSQL/Supabase | Existe configuración y SQL de esquema, pero la conexión real no está autenticada en este entorno actual |

---

## 18. Estado actual del CRUD

| Entidad / tabla | CREATE | READ | UPDATE | DELETE | Evidencia |
|---|---|---|---|---|---|
| `obras` | Implementado | Implementado | Implementado | Implementado | `ObraService`, `ObraController`, SQL directo |
| `usuariosAdministradores` | Implementado | Implementado | Implementado | Implementado | `UsuarioAdministradorService`, `UsuarioAdministradorController` |
| `solicitudesClase` | Implementado | Implementado | Implementado | Implementado | `SolicitudClaseService`, `SolicitudClaseController` |
| `solicitudesTrabajoPersonalizado` | Implementado | Implementado | Implementado | Implementado | `SolicitudTrabajoPersonalizadoService`, `SolicitudTrabajoPersonalizadoController` |
| `imagenesObra` | Implementado | Implementado | Implementado | Implementado | `ImagenObraService`, `ImagenObraController` |
| `imagenesTrabajoPersonalizado` | Implementado | Implementado | Implementado | Implementado | `ImagenTrabajoPersonalizadoService`, `ImagenTrabajoPersonalizadoController` |

**Importante:** este CRUD existe a nivel de servicio y API, pero la persistencia real no se basa en repositorios JPA ni en un modelo de entidades ORM. Hay una mezcla de `CrudStore` en memoria y consultas SQL directas con `JdbcTemplate`.

---

## 19. Problemas o inconsistencias detectadas

### 19.1 Faltan entidades JPA y repositorios reales

- `pom.xml` incluye `spring-boot-starter-data-jpa`.
- Sin embargo, no existe ninguna clase marcada con `@Entity` ni ninguna interfaz `Repository`.
- La lógica de acceso a datos no usa la capa estándar de Spring Data.

**Justificación:** evidencia directa en archivos Java del proyecto.

### 19.2 La persistencia actual es híbrida y no uniforme

- `AbstractCrudService` usa `CrudStore` en memoria.
- Servicios de `Obra` e `ImagenObra` usan `JdbcTemplate` si el bean existe.
- No existe un contrato único de repositorio para todos los casos.

**Justificación:** `CrudStore.java`, `AbstractCrudService.java`, `ObraService.java`, `ImagenObraService.java`.

### 19.3 `supabase.db.enabled` no está habilitado por defecto

- `SupabaseDatabaseConfig` solo se activa si `supabase.db.enabled=true`.
- No se observa esa propiedad en `application.properties`.
- Por lo tanto, la configuración extra de `SupabaseDatabaseConfig` no está activa por defecto.

**Justificación:** `SupabaseDatabaseConfig.java` y `application.properties`.

### 19.4 Existe una inconsistencia entre el soft delete y el delete real

- La tabla `obras` incluye `"eliminadoEn"` y `ObraService.listar()` y `buscar()` usan `WHERE "eliminadoEn" IS NULL`.
- Sin embargo, `ObraService.eliminar()` ejecuta `DELETE FROM "obras" WHERE "id" = ?`.
- Eso elimina físicamente el registro, en lugar de aplicar borrado lógico usando `eliminadoEn`.

**Justificación:** las consultas y la lógica de `ObraService`.

### 19.5 La conexión real a Supabase falla en este entorno

Se evidenció en la salida de ejecución de pruebas:

- `FATAL: password authentication failed for user "postgres"`

Esto significa que la conexión a la base de datos no está validada en el entorno actual y requiere credenciales correctas.

### 19.6 No existe ninguna capa de seguridad real

- `UsuarioAdministrador` tiene `hashContrasena`, pero no hay login, JWT, roles ni permisos.
- No existe un `SecurityFilterChain`, `AuthenticationProvider` ni autorización por endpoint.

**Justificación:** revisión del árbol del proyecto y del contenido de `pom.xml`.

### 19.7 El patrón de CORS es muy amplio

- `allowedOriginPatterns("*")` acepta cualquier origen.
- Esto puede ser útil para pruebas locales, pero no para un entorno de producción real.

**Justificación:** `CorsConfig.java`.

---

## 20. Componentes verificados

### 20.1 Elementos confirmados por archivos

- El proyecto es una aplicación Spring Boot con `@SpringBootApplication`.
- El proyecto usa Java 21 y Spring Boot 4.1.1.
- La configuración de PostgreSQL está en `application.properties`.
- La conexión usa `org.postgresql.Driver`.
- La aplicación declara `spring.jpa.hibernate.ddl-auto=none`.
- Hay un `JdbcTemplate` y `DataSource` configurado para PostgreSQL.
- Hay SQL de creación de esquema en `supabase/migrations`.
- Hay endpoints REST para las principales entidades del negocio.
- Hay manejo centralizado de errores con `@RestControllerAdvice`.

### 20.2 Elementos verificados por logs de ejecución

Durante la ejecución de pruebas del proyecto, se observó:

- Inicialización de Hibernate (`LocalContainerEntityManagerFactoryBean`)
- Base de datos detectada como PostgreSQL (`PostgreSQLDialect`)
- `spring.jpa.open-in-view` habilitado por defecto
- `HikariCP` presente en el classpath

Sin embargo, la conexión final a Supabase no quedó validada correctamente en este entorno debido a:

> `FATAL: password authentication failed for user "postgres"`

**Conclusión:** el contexto de la app se carga parcialmente y la capa de persistencia se inicializa, pero la conexión real a la base de datos no está autenticada en la sesión actual.

---

## 21. Pendientes técnicos

### 21.1 Estado de los componentes principales

| Componente | Estado real |
|---|---|
| Supabase PostgreSQL | Configurado parcialmente, pero la autenticación real no está validada en este entorno |
| Entity JPA | No implementado actualmente |
| Repository | No implementado actualmente |
| Service | Implementado parcialmente |
| Controller | Implementado |
| API REST | Implementada |
| React frontend | Existe fuera del backend, no se analizó dentro de esta carpeta |
| Seguridad JWT / roles | No implementado actualmente |
| CORS producción | No implementado actualmente (solo CORS amplio de desarrollo) |

### 21.2 Pendientes que faltan para completar el flujo real

- Definir entidades JPA o un adaptador de persistencia consistente.
- Crear `Repository` o capa equivalente para cada entidad.
- Consolidar el patrón de acceso a datos para evitar la mezcla `CrudStore` + `JdbcTemplate`.
- Asegurar credenciales reales y entorno de variables de entorno para Supabase.
- Definir una estrategia clara para `usuariosAdministradores` con seguridad real.
- Revisar si se desea borrar lógico o físico para `obras`.

---

## 22. Información de referencia para continuar el desarrollo

### 22.1 Estructura del proyecto

- Backend principal: `Backend/backend`
- Paquetes principales: `administrador`, `config`, `controller`, `imagenobra`, `imagenpersonalizada`, `obra`, `shared`, `solicitudclase`, `solicitudpersonalizada`
- Archivos de configuración: `pom.xml`, `src/main/resources/application.properties`

### 22.2 Versiones y dependencias

- Java: `21`
- Spring Boot: `4.1.1`
- Driver PostgreSQL: `org.postgresql:postgresql` (versión gestionada por Spring Boot)
- JPA: presente por dependencia, pero no implementada con entidades reales
- Hibernate: `7.4.5.Final` detectado en logs

### 22.3 Configuración PostgreSQL / Supabase

- Host: `db.afktacjtvfvfddrqryym.supabase.co`
- Puerto: `5432`
- Base de datos: `postgres`
- Usuario: `postgres`
- Contraseña: variable `${SUPABASE_DB_PASSWORD}`; no se documenta el valor por seguridad
- SSL: `sslmode=require`
- ddl-auto: `none`
- show-sql: `true`
- database-platform: `org.hibernate.dialect.PostgreSQLDialect`

### 22.4 Entidades / modelos existentes

- `Obra`
- `UsuarioAdministrador`
- `SolicitudClase`
- `SolicitudTrabajoPersonalizado`
- `ImagenObra`
- `ImagenTrabajoPersonalizado`
- Enumeraciones: `EstadoObra`, `EstadoSolicitudClase`, `EstadoSolicitudTrabajoPersonalizado`

### 22.5 Tablas reales documentadas

- `obras`
- `usuariosAdministradores`
- `solicitudesClase`
- `solicitudesTrabajoPersonalizado`
- `imagenesObra`
- `imagenesTrabajoPersonalizado`

### 22.6 Repositories, services y controllers

- No hay `Repository` real.
- Servidores funcionales detectados: `ObraService`, `UsuarioAdministradorService`, `SolicitudClaseService`, `SolicitudTrabajoPersonalizadoService`, `ImagenObraService`, `ImagenTrabajoPersonalizadoService`.
- Los controllers REST detectados son los mencionados en la sección de endpoints y rutas anteriores.

### 22.7 Endpoints relevantes

- `/api/obras`
- `/api/administradores`
- `/api/solicitudes-clase`
- `/api/solicitudes-trabajo-personalizado`
- `/api/imagenes-obra`
- `/api/imagenes-trabajo-personalizado`
- `/api/test-db`

### 22.8 Estado del CRUD

- CRUD implementado en servicio/controller para todas las entidades principales.
- La implementación actual no es ORM/JPA estándar ni repositorio Spring Data.
- Hay persistencia en memoria y SQL directo a Supabase.

### 22.9 Problemas conocidos

- No hay `@Entity` ni repositories.
- `ddl-auto=none` evita generación automática del esquema.
- La conexión a Supabase no está autenticada correctamente en la sesión actual.
- Existe un soft-delete previsto para `obras` pero la eliminación real usa `DELETE` físico.
- No existe seguridad real de la aplicación.

### 22.10 Conclusión general

El backend actual está en una etapa de prototipo funcional de API REST, pero no en una implementación estándar de JPA/Spring Data con schema automanejo. La lectura de archivos SQL y la configuración de la app muestran claramente que la intención es conectar con PostgreSQL/Supabase, pero la capa de persistencia y la seguridad aún no están resueltas en la práctica.

---

## 23. Verificación final del análisis

Se verificaron:

1. Toda la carpeta `Backend` fue revisada.
2. `pom.xml` fue revisado.
3. Los archivos de configuración fueron revisados.
4. Entidades y modelos principales fueron revisados.
5. Services y controllers fueron revisados.
6. No existen repositories JPA ni entidades JPA reales.
7. La configuración de PostgreSQL/Supabase fue revisada.
8. Las migraciones SQL fueron revisadas.
9. La documentación `Reglas/database.md` fue revisada.
10. El estado del CRUD real se documentó con evidencia.
11. No se incluyeron secretos reales ni contraseñas en este documento.

### Información no determinada

- Versión explícita de Maven en el proyecto: `No determinado en los archivos analizados.`
- Puerto de la aplicación: `No determinado en los archivos analizados.`
- Si el entorno actual tiene variables de entorno válidas para Supabase: `No determinado en los archivos analizados.`
- Si la configuración de `supabase.db.enabled` está activa por defecto: `No implementado actualmente.`

---

## 24. Resumen ejecutivo

El backend actual tiene una API REST funcional en el nivel de controllers y servicios, y está orientado a PostgreSQL/Supabase, pero no está implementado como una solución JPA con repositorios y entidades de Spring Data. La capa de acceso a datos es híbrida, la conexión real a Supabase no fue autenticada en esta sesión y la seguridad todavía no existe.

Este documento refleja el estado real observado en el código y la configuración actual.
