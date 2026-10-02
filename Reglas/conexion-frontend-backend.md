# Conexión Frontend - Backend

## 1. Resumen del proyecto

Academia Atelier tiene un frontend React con Vite en `Fronted/` y un backend Spring Boot con Java 21 en `Backend/backend/`. El backend configura PostgreSQL de Supabase mediante Spring Data JPA/JDBC. El código del frontend consume actualmente las APIs de obras e imágenes de obras; no se encontraron llamadas frontend a las APIs de solicitudes de clase, encargos personalizados o administradores.

El frontend construye sus llamadas con `VITE_API_BASE_URL`; si esa variable no está disponible al compilar, usa `http://localhost:8080`. El backend escucha en el puerto indicado por `PORT`, con `8080` como valor por defecto. Su CORS actual permite cualquier origen para `/api/**`.

El repositorio no permite confirmar los dominios ni las variables realmente configuradas en Vercel o Railway. Tampoco contiene configuración específica de esas plataformas. Por lo tanto, el código confirma que un build sin `VITE_API_BASE_URL` apunta a localhost, pero no confirma qué URL usa el despliegue publicado.

Los valores de conexión a la base de datos que aparecen en el archivo de propiedades se omiten aquí; la contraseña se referencia mediante una variable y no se reproduce ningún secreto.

## 2. Arquitectura actual

```text
Navegador (React/Vite)
  -> fetch() a {VITE_API_BASE_URL}/api/...
  -> Spring MVC (Spring Boot, puerto ${PORT:8080})
  -> JPA/JDBC
  -> PostgreSQL de Supabase
```

- **Confirmado por el código:** frontend y backend son proyectos separados; las llamadas del frontend son directas al origen configurado en `VITE_API_BASE_URL`, no a rutas relativas del dominio web.
- **Confirmado por el código:** Spring tiene un `CorsConfig` global para las rutas `/api/**`.
- **No se puede determinar con el repositorio:** las URLs públicas actuales, los dominios vinculados, los ajustes guardados en los paneles de Vercel/Railway y si el despliegue publicado corresponde al código local inspeccionado.
- El acceso al origen raíz del backend puede devolver 404: no se encontró un controlador o mapping para `/`. Sí existe `GET /api/test-db` como prueba de conectividad con la base de datos. El 404 del origen raíz, por sí solo, no prueba que la API esté caída.

## 3. Frontend

### 3.1 Tecnología

- React y React DOM (`Fronted/package.json`), con Vite (`vite` y `@vitejs/plugin-react`).
- El único cliente HTTP hallado en el código fuente es `fetch`, encapsulado en `Fronted/src/api/httpClient.js`. No se usa Axios para comunicarse con el backend.
- Las rutas de la interfaz se manejan con `window.location.hash`; no son llamadas al backend ni rutas HTTP de API.

### 3.2 Configuración HTTP

`Fronted/src/api/httpClient.js`:

- Define `API_BASE_URL` como `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'`.
- Forma la dirección final concatenando la base y el `path`: `` `${API_BASE_URL}${path}` ``.
- Usa `fetch` para GET, POST, PUT y DELETE. POST/PUT serializan el cuerpo con `JSON.stringify`.
- Envía `Content-Type: application/json` incluso en GET y DELETE. En solicitudes cross-origin esto puede causar una preflight CORS; la configuración backend actual acepta `OPTIONS` y todos los encabezados.
- Para HTTP no exitoso intenta leer el cuerpo de error y lanza una excepción. Para estado 204 devuelve `null`; para otros éxitos espera JSON.
- No hay manejo de credenciales/cookies ni configuración explícita de `credentials`.

Las rutas de API empiezan con `/api/...` y se anexan a la base. La base debería ser el origen público del servicio backend sin una ruta de API adicional; si termina en `/`, la concatenación produce `//api/...`.

### 3.3 URL base

- Variable consultada: `VITE_API_BASE_URL`.
- Valor alternativo escrito directamente en el código: `http://localhost:8080`.
- No se encontró una URL pública de Railway escrita en el código fuente.
- Las URLs de endpoint son rutas absolutas respecto al origen base, por ejemplo `/api/obras`; el cliente no usa rutas relativas al dominio de Vercel.
- No hay separación explícita de URLs por entorno dentro de `vite.config.js` ni en el cliente. Vite puede cargar variables por modo al compilar, pero los archivos locales correspondientes no se encontraron.
- No hay `server.proxy` en `Fronted/vite.config.js`; no existe un proxy de Vite configurado para el desarrollo local.

### 3.4 Variables de entorno

- `VITE_API_BASE_URL`: única variable `VITE_` detectada en el código frontend. Usa el prefijo correcto para estar disponible mediante `import.meta.env` en Vite.
- Debe estar definida en el entorno de **build** de Vercel para que el bundle use el backend remoto. Vite incorpora este valor durante la compilación; cambiar una variable del panel sin volver a generar el build no permite concluir que el bundle existente la haya recibido.
- Si la variable está ausente o vacía durante el build, el fallback del código es `http://localhost:8080`.
- La búsqueda del workspace no encontró `.env`, `.env.local`, `.env.production` ni variantes. El `.gitignore` raíz excluye `.env`, `.env.local` y `.env.*.local`, así que archivos ignorados o variables definidas fuera del repositorio no pueden descartarse solo a partir del control de versiones.
- No se encontraron otras referencias `import.meta.env` ni nombres de variables Vite para la API.

### 3.5 Archivos relevantes

- `Fronted/src/api/httpClient.js`: URL base, `fetch`, métodos HTTP y tratamiento de errores.
- `Fronted/src/api/obrasApi.js`: operaciones HTTP de obras.
- `Fronted/src/api/imagenesObraApi.js`: operaciones HTTP de imágenes asociadas a obras.
- `Fronted/src/App.jsx`: carga ambas colecciones al iniciar y las usa para mostrar el catálogo; si falla la petición conserva productos de muestra sin mostrar el error de red.
- `Fronted/src/pages/AdminObras.jsx`: carga y administra obras e imágenes; muestra errores de API en la interfaz.
- `Fronted/vite.config.js`: plugin React, sin proxy ni configuración de servidor/API.
- `Fronted/package.json`: scripts `dev`, `build` (`vite build`) y `preview`.
- `Fronted/index.html`: entrada de la aplicación Vite.

Los formularios de solicitudes de clase y encargos personalizados preparan/abren una conversación de WhatsApp; no se encontró que envíen esos datos a los endpoints de solicitudes del backend.

## 4. Backend

### 4.1 Tecnología

- Spring Boot con Java 21; dependencias Spring Web MVC, Spring Data JPA, JDBC, PostgreSQL y validación (`Backend/backend/pom.xml`).
- Clase principal: `com.example.backend.BackendApplication`, archivo `Backend/backend/src/main/java/com/example/backend/BackendApplication.java`.
- Puerto: `server.port=${PORT:8080}` en `Backend/backend/src/main/resources/application.properties`. Usa `PORT` si está definido; de lo contrario, `8080`.
- No se encontró un `server.servlet.context-path` ni un perfil de producción `application-*.properties`.

### 4.2 Controladores

Controladores REST encontrados:

- `Backend/backend/src/main/java/com/example/backend/obra/ObraController.java`
- `Backend/backend/src/main/java/com/example/backend/imagenobra/ImagenObraController.java`
- `Backend/backend/src/main/java/com/example/backend/imagenpersonalizada/ImagenTrabajoPersonalizadoController.java`
- `Backend/backend/src/main/java/com/example/backend/solicitudclase/SolicitudClaseController.java`
- `Backend/backend/src/main/java/com/example/backend/solicitudpersonalizada/SolicitudTrabajoPersonalizadoController.java`
- `Backend/backend/src/main/java/com/example/backend/administrador/UsuarioAdministradorController.java`
- `Backend/backend/src/main/java/com/example/backend/controller/PruebaController.java`

No se encontró un mapping de controlador para `/`.

### 4.3 Endpoints

Rutas completas derivadas del mapping de clase y método. `{id}` es un UUID para los controladores CRUD.

| Controlador | Mapping de clase | Endpoints expuestos |
|---|---|---|
| `ObraController` | `/api/obras` | `GET /api/obras`, `GET /api/obras/{id}`, `POST /api/obras`, `PUT /api/obras/{id}`, `DELETE /api/obras/{id}` |
| `ImagenObraController` | `/api/imagenes-obra` | `GET /api/imagenes-obra`, `GET /api/imagenes-obra/{id}`, `POST /api/imagenes-obra`, `PUT /api/imagenes-obra/{id}`, `DELETE /api/imagenes-obra/{id}` |
| `ImagenTrabajoPersonalizadoController` | `/api/imagenes-trabajo-personalizado` | `GET /api/imagenes-trabajo-personalizado`, `GET /api/imagenes-trabajo-personalizado/{id}`, `POST /api/imagenes-trabajo-personalizado`, `PUT /api/imagenes-trabajo-personalizado/{id}`, `DELETE /api/imagenes-trabajo-personalizado/{id}` |
| `SolicitudClaseController` | `/api/solicitudes-clase` | `GET /api/solicitudes-clase`, `GET /api/solicitudes-clase/{id}`, `POST /api/solicitudes-clase`, `PUT /api/solicitudes-clase/{id}`, `DELETE /api/solicitudes-clase/{id}` |
| `SolicitudTrabajoPersonalizadoController` | `/api/solicitudes-trabajo-personalizado` | `GET /api/solicitudes-trabajo-personalizado`, `GET /api/solicitudes-trabajo-personalizado/{id}`, `POST /api/solicitudes-trabajo-personalizado`, `PUT /api/solicitudes-trabajo-personalizado/{id}`, `DELETE /api/solicitudes-trabajo-personalizado/{id}` |
| `UsuarioAdministradorController` | `/api/administradores` | `GET /api/administradores`, `GET /api/administradores/{id}`, `POST /api/administradores`, `PUT /api/administradores/{id}`, `DELETE /api/administradores/{id}` |
| `PruebaController` | Sin mapping de clase | `GET /api/test-db` |

Las rutas de la tabla corresponden a mappings explícitos del código; la tabla no afirma que todos hayan sido probados en Railway.

### 4.4 CORS

`Backend/backend/src/main/java/com/example/backend/config/CorsConfig.java` implementa `WebMvcConfigurer` y registra:

- Patrón: `/api/**`.
- Orígenes permitidos: `allowedOriginPatterns("*")`, es decir, cualquier origen según la configuración actual.
- Métodos: GET, POST, PUT, DELETE y OPTIONS.
- Encabezados: `allowedHeaders("*")`.
- No configura `allowCredentials`.
- No se encontró `@CrossOrigin` ni otra configuración CORS en los controladores.

**Contradicción a tener en cuenta:** el comentario de `CorsConfig.java` califica la política amplia como deliberadamente local y dice que debería reemplazarse por los dominios reales antes del despliegue. Sin embargo, la configuración ejecutable que contiene actualmente sigue permitiendo cualquier origen para `/api/**`. Por tanto, el código inspeccionado no confirma que Vercel esté bloqueado por una lista CORS restrictiva; hay que validar la respuesta HTTP del servicio desplegado para confirmar qué versión/configuración está activa.

### 4.5 Variables de entorno

Según `application.properties`:

- `PORT`: opcional; establece el puerto del servidor y usa `8080` si no se proporciona.
- `SUPABASE_DB_PASSWORD`: requerida para resolver `spring.datasource.password` y establecer la conexión a PostgreSQL. No se incluye su valor.
- La URL JDBC y el nombre de usuario de la base de datos están escritos en `application.properties` y no se muestran aquí. La URL apunta a un pooler de Supabase y exige SSL (`sslmode=require`). No se encontró que el host, la base o el usuario se obtengan de variables de entorno.
- No se encontró otra referencia `${...}` a variables de entorno de aplicación en `src/main/resources`.

### 4.6 Configuración relevante

`Backend/backend/src/main/resources/application.properties` también define `spring.jpa.hibernate.ddl-auto=none`, muestra SQL (`spring.jpa.show-sql=true`) y usa el dialecto PostgreSQL. No se encontraron propiedades separadas para producción ni cambios de CORS por perfil.

`Backend/backend/src/main/java/com/example/backend/controller/PruebaController.java` expone `GET /api/test-db`, que ejecuta `SELECT 1`; sirve para diferenciar una API alcanzable de un problema de conexión con la base de datos. No se encontró configuración de redirecciones HTTP, URL base pública ni endpoint raíz.

## 5. Comunicación Frontend → Backend

La URL base de todas las filas es `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'`, leída por `Fronted/src/api/httpClient.js`. La URL final se forma concatenando esa base con el endpoint.

| Funcionalidad | Archivo frontend | Método HTTP | Endpoint utilizado | URL base | Controlador backend correspondiente |
|---|---|---|---|---|---|
| Cargar catálogo público | `Fronted/src/App.jsx` vía `Fronted/src/api/obrasApi.js` | GET | `/api/obras` | `VITE_API_BASE_URL` o fallback local | `ObraController` |
| Cargar imágenes del catálogo | `Fronted/src/App.jsx` vía `Fronted/src/api/imagenesObraApi.js` | GET | `/api/imagenes-obra` | `VITE_API_BASE_URL` o fallback local | `ImagenObraController` |
| Cargar obras de administración | `Fronted/src/pages/AdminObras.jsx` vía `Fronted/src/api/obrasApi.js` | GET | `/api/obras` | `VITE_API_BASE_URL` o fallback local | `ObraController` |
| Cargar imágenes de administración | `Fronted/src/pages/AdminObras.jsx` vía `Fronted/src/api/imagenesObraApi.js` | GET | `/api/imagenes-obra` | `VITE_API_BASE_URL` o fallback local | `ImagenObraController` |
| Crear obra | `Fronted/src/pages/AdminObras.jsx` vía `Fronted/src/api/obrasApi.js` | POST | `/api/obras` | `VITE_API_BASE_URL` o fallback local | `ObraController` |
| Actualizar obra | `Fronted/src/pages/AdminObras.jsx` vía `Fronted/src/api/obrasApi.js` | PUT | `/api/obras/{id}` | `VITE_API_BASE_URL` o fallback local | `ObraController` |
| Eliminar obra | `Fronted/src/pages/AdminObras.jsx` vía `Fronted/src/api/obrasApi.js` | DELETE | `/api/obras/{id}` | `VITE_API_BASE_URL` o fallback local | `ObraController` |
| Crear imagen de obra | `Fronted/src/pages/AdminObras.jsx` vía `Fronted/src/api/imagenesObraApi.js` | POST | `/api/imagenes-obra` | `VITE_API_BASE_URL` o fallback local | `ImagenObraController` |
| Eliminar imagen de obra | `Fronted/src/pages/AdminObras.jsx` vía `Fronted/src/api/imagenesObraApi.js` | DELETE | `/api/imagenes-obra/{id}` | `VITE_API_BASE_URL` o fallback local | `ImagenObraController` |
| Obtener obra por ID | `Fronted/src/api/obrasApi.js` define `getById`; no se encontró un llamador | GET | `/api/obras/{id}` | `VITE_API_BASE_URL` o fallback local | `ObraController` |

La API frontend no define actualmente `getById`/`update` para imágenes aunque `ImagenObraController` sí expone GET por ID y PUT. No se detectó un consumidor frontend de esos endpoints.

Aunque el backend también expone controladores para solicitudes de clase, trabajo personalizado, imágenes de trabajo personalizado y administradores, no se encontraron llamadas frontend a esas rutas. Los formularios visibles de clase y encargo usan WhatsApp en lugar de esos endpoints.

## 6. Configuración de despliegue

### 6.1 Vercel

- **Framework:** React + Vite, inferido de `Fronted/package.json`, `Fronted/vite.config.js` y la entrada `Fronted/index.html`.
- **Root Directory:** no se puede determinar desde el repositorio. El proyecto Vite está dentro de `Fronted/`; el valor configurado en Vercel es externo.
- **Build command:** el proyecto declara `npm run build`, cuyo script ejecuta `vite build`. Es el comando del proyecto, no evidencia del valor guardado en el panel de Vercel.
- **Output directory:** Vite usa `dist` por defecto y no se cambió en `vite.config.js`; por tanto, el directorio esperado es `Fronted/dist`. El valor configurado en Vercel no se puede verificar.
- **Variables que parece necesitar:** `VITE_API_BASE_URL`, con la URL pública HTTPS del backend como valor esperado para producción. El valor real configurado y los entornos de Preview/Production son externos.
- No se encontró `vercel.json`, configuración de rewrites ni configuración propia de Vercel.
- `.gitignore` excluye `Fronted/dist/`. El directorio puede generarse durante el build, pero no se puede determinar si Vercel recompila el código fuente o cómo se configura el despliegue actual.

### 6.2 Railway

- El backend se encuentra en `Backend/backend/` y contiene `pom.xml` y `mvnw.cmd`; no se encontró `Dockerfile`, `railway.toml`, `nixpacks.toml`, `Procfile` ni archivo específico de Railway.
- **Root Directory**, build/start commands, dominio público, puerto publicado y configuración de health check no se pueden determinar desde los archivos inspeccionados.
- Spring escucha en `${PORT:8080}`. El valor asignado a `PORT` en el proceso desplegado es externo al repositorio.
- La variable requerida por la configuración de base de datos es `SUPABASE_DB_PASSWORD`; no se informa ni reproduce su valor. El host/URL JDBC está definido directamente en `application.properties` (detalle omitido) y no se carga desde una variable de URL.
- No se encontró en el repositorio una configuración que redirija o bloquee las peticiones HTTP externas. Esto no permite descartar ajustes del servicio/proxy o diferencias entre el código local y el desplegado.

## 7. Diferencias entre entorno local y producción

| Aspecto | Local según el código | Producción según el código/configuración disponible |
|---|---|---|
| URL del backend frontend | Fallback `http://localhost:8080`, salvo variable Vite presente | Requiere que el build reciba `VITE_API_BASE_URL`; su valor desplegado no se conoce |
| Puerto Spring | `8080` como fallback | Lee `PORT` cuando existe; valor externo no conocido |
| CORS | La misma política amplia está en `CorsConfig` | No hay perfil distinto; el código versionado sigue permitiendo `*` para `/api/**` |
| Proxy Vite | No configurado | No hay proxy; frontend llama directamente al origen base |
| Base de datos | URL JDBC fija en propiedades y contraseña por `SUPABASE_DB_PASSWORD` | Igual configuración del repositorio; existencia/valor de la variable en Railway no verificable |
| Compilación frontend | `npm run dev`/`npm run build` según los scripts del proyecto | Ajustes reales de Vercel no están en el repositorio |

En Vite, `import.meta.env` se resuelve al compilar. La configuración del navegador desplegado depende del valor disponible al generar el bundle, no de que el backend local funcione ni de la variable existente en otra etapa de despliegue.

## 8. Problemas potenciales

### Confirmados

- **Fallback local en el código fuente:** si `VITE_API_BASE_URL` no tiene valor en el build, las llamadas se dirigen a `http://localhost:8080`, no al dominio Railway. En el navegador de cada visitante, `localhost` identifica la propia máquina del visitante.
- **No hay proxy Vite:** una ruta `/api/...` no se reescribe automáticamente al backend; en este proyecto además se concatena con la URL base.
- **Rutas de solicitud no conectadas desde el frontend:** los controladores de solicitudes existen, pero los formularios de clase y encargos no los consumen actualmente.
- **La carga inicial oculta el fallo en la página principal:** `App.jsx` atrapa el error de las dos peticiones y conserva el catálogo de muestra. Por eso la página puede seguir renderizándose sin demostrar que el backend haya respondido.
- **No hay endpoint raíz:** el 404 en `/` es consistente con los mappings encontrados y no es una prueba del fallo de `/api/...`.
- **Comentario/configuración CORS discordantes:** el comentario dice sustituir la política amplia antes de desplegar, pero el código activo permite cualquier origen bajo `/api/**`.

### Posibles

- Si la variable de Vercel está ausente, vacía o apunta a un valor equivocado, las peticiones podrían ir a localhost o a un host/ruta incorrectos. Se confirma inspeccionando la URL de Request en Network o el valor de la variable (sin revelar secretos).
- Si `VITE_API_BASE_URL` contiene `http://` mientras la página de Vercel está en HTTPS, el navegador puede bloquear la solicitud como contenido mixto. El código no muestra la URL pública que está configurada.
- Si la base contiene una ruta adicional no esperada o una barra final, la concatenación puede producir una ruta equivocada o `//api/...`.
- El encabezado `Content-Type: application/json` en todas las solicitudes cross-origin normalmente provoca preflight. El CORS versionado permite `OPTIONS` y todos los encabezados, por lo que no se identifica una denegación CORS en el código actual; aun así, una respuesta distinta en Railway, un artefacto antiguo o configuración externa debe verificarse en Network.
- Si Railway no publica el puerto que usa Spring, si `PORT` no se resuelve, o si Vercel usa Root Directory/build/output diferentes a los esperados, la comunicación puede fallar. Esos ajustes no están versionados.
- `Fronted/dist/` existe como directorio de artefactos local e ignorado por Git. En una búsqueda del bundle generado se observó una referencia a `http://localhost:8080`; si un despliegue sirve un artefacto antiguo en vez de recompilar el código actual, podría conservar esa URL. No se puede determinar desde el repositorio qué artefacto está publicado.
- Una excepción de base de datos puede afectar endpoints que acceden a datos, aunque el proceso Spring haya arrancado. `GET /api/test-db` y los logs permiten distinguir esa condición de un bloqueo CORS o una URL incorrecta.

### No determinables con el repositorio

- URL pública real de Vercel y URL pública real de Railway.
- Valor efectivo de `VITE_API_BASE_URL` en cada entorno de Vercel, y si el último despliegue se compiló después de configurarla.
- Root Directory, build command y output directory elegidos en Vercel; comandos, root, dominio y puerto asignado en Railway.
- Si los dominios desplegados responden, redirigen HTTP a HTTPS, o si Railway entrega los encabezados CORS esperados.
- Estado HTTP, contenido de respuesta y encabezados reales de las peticiones desde el navegador.
- Presencia de `SUPABASE_DB_PASSWORD` en Railway y conectividad efectiva con Supabase. No se debe compartir el valor de la contraseña.
- Si el servicio en Railway ejecuta el mismo commit/configuración que el repositorio inspeccionado.

## 9. Información externa pendiente

Para completar el diagnóstico, proporcionar (sin compartir secretos):

- URL pública de Vercel y URL pública de Railway.
- En Vercel, confirmar si `VITE_API_BASE_URL` está definida para Production y Preview; mostrar solo el nombre/presencia y, si se puede compartir, indicar si apunta al dominio Railway, ocultando cualquier valor sensible.
- Root Directory, build command y output directory efectivos en Vercel; identificar el commit/versión desplegada más reciente.
- En Railway, Root Directory, build/start command, dominio público, puerto/health check y commit desplegado.
- Confirmación de que `SUPABASE_DB_PASSWORD` está definida en Railway, sin mostrar su valor; indicar si hay otra variable de datasource configurada.
- Desde DevTools > Network, una petición fallida completa: Request URL (puede ocultarse cualquier dato sensible), método, status, mensaje de error y encabezados de respuesta CORS. Desde Console, el error íntegro relevante.
- Logs de Railway coincidentes temporalmente con esa petición, ocultando credenciales y datos personales.
- Resultado HTTP de `GET https://<dominio-publico-railway>/api/test-db` (sustituir por el dominio real), sin incluir valores secretos.

## 10. Archivos relevantes del proyecto

**Frontend**

- `Fronted/src/api/httpClient.js`
- `Fronted/src/api/obrasApi.js`
- `Fronted/src/api/imagenesObraApi.js`
- `Fronted/src/App.jsx`
- `Fronted/src/pages/AdminObras.jsx`
- `Fronted/vite.config.js`
- `Fronted/package.json`
- `Fronted/index.html`

**Backend**

- `Backend/backend/src/main/java/com/example/backend/BackendApplication.java`
- `Backend/backend/src/main/java/com/example/backend/config/CorsConfig.java`
- `Backend/backend/src/main/resources/application.properties`
- `Backend/backend/src/main/java/com/example/backend/obra/ObraController.java`
- `Backend/backend/src/main/java/com/example/backend/imagenobra/ImagenObraController.java`
- `Backend/backend/src/main/java/com/example/backend/imagenpersonalizada/ImagenTrabajoPersonalizadoController.java`
- `Backend/backend/src/main/java/com/example/backend/solicitudclase/SolicitudClaseController.java`
- `Backend/backend/src/main/java/com/example/backend/solicitudpersonalizada/SolicitudTrabajoPersonalizadoController.java`
- `Backend/backend/src/main/java/com/example/backend/administrador/UsuarioAdministradorController.java`
- `Backend/backend/src/main/java/com/example/backend/controller/PruebaController.java`
- `Backend/backend/pom.xml`

**Despliegue y variables**

- `.gitignore`
- `Backend/backend/.gitignore`
- No se encontraron `vercel.json`, `railway.toml`, `nixpacks.toml`, `Dockerfile`, `Procfile` ni archivos `.env` visibles durante la inspección.
