# Deploy render configuration

## 1. Información general del proyecto

Este repositorio corresponde a la aplicación web de Academia Atelier. El proyecto está dividido en dos partes claramente separadas:

- Frontend: React + Vite, en la carpeta `Fronted/`
- Backend: Spring Boot + Java, en la carpeta `Backend/backend/`

La preparación realizada en esta tarea se enfocó exclusivamente en el backend, sin modificar la estrategia del frontend ni su despliegue en Vercel.

La arquitectura conservada es:

- Frontend independiente en Vercel
- Backend en Render
- Base de datos PostgreSQL en Supabase
- Almacenamiento de imágenes en Supabase Storage

## 2. Estado inicial detectado

Se revisó el repositorio real y se confirmó lo siguiente:

- El backend está en `Backend/backend/` y usa Spring Boot 4.1.1 con Java 21.
- El archivo de configuración principal es `Backend/backend/src/main/resources/application.properties`.
- Se utiliza PostgreSQL vía JDBC y Spring Data JPA.
- La aplicación expone endpoints REST bajo `/api`.
- Existe un controlador de prueba en `PruebaController` en `/api/test-db`, útil como comprobación de salud.
- El puerto de la aplicación estaba configurado para `PORT` con respaldo local en `8080`.
- No había una configuración específica preparada para Render ni variables de entorno para producción.
- El backend contenía valores de conexión de base de datos embebidos o parcialmente enmascarados en el archivo `application.properties`.

## 3. Objetivo de la preparación

Preparar el backend para su despliegue en Render sin alterar la lógica de negocio ni los contratos de la API.

Los requisitos que se atendieron fueron:

- Usar Java 21 compatible con el proyecto.
- Mantener Maven como sistema de construcción.
- Configurar el puerto por medio de la variable `PORT`.
- Externalizar la conexión a PostgreSQL usando variables de entorno.
- Evitar secretos dentro del repositorio.
- Mantener la ejecución local funcional.
- Dejar un health check simple y compatible con Render.

## 4. Archivos relevantes del backend

### `Backend/backend/pom.xml`

Archivo principal de Maven. Confirma:

- Spring Boot 4.1.1
- Java 21
- Spring Web MVC
- Spring Data JPA
- PostgreSQL driver

### `Backend/backend/src/main/resources/application.properties`

Este archivo se ajustó para usar variables de entorno:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Esto permite que los valores reales se inyecten desde Render sin dejar credenciales versionadas.

### `Backend/backend/src/main/java/com/example/backend/controller/PruebaController.java`

Este controlador expone `/api/test-db`, que sirve como endpoint de verificación funcional.

## 5. Estrategia elegida para Render

Se eligió una estrategia de despliegue basado en build y ejecución directa con Maven, sin Docker.

### Justificación

- El proyecto ya está preparado para compilar con Maven.
- La aplicación Spring Boot puede ejecutarse con un `jar` generado por Maven.
- La solución es más ligera y directa para un servicio web Java en Render.
- Evita añadir una capa adicional de contenedores sin necesidad.

La configuración resultante usa:

- `buildCommand: ./mvnw -DskipTests package`
- `startCommand: java -jar target/backend-0.0.1-SNAPSHOT.jar`

## 6. Configuración creada para Render

Se creó un archivo `render.yaml` en la raíz del repositorio con un servicio web del backend exclusivamente.

### Servicio configurado

- Tipo: `web`
- Runtime: `java`
- Root directory: `Backend/backend`
- Health check: `/api/test-db`

### Variables de entorno esperadas en Render

- `PORT`
- `JAVA_VERSION=21`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

## 7. Cambios realizados

### 7.1 Configuración de conexión a la base de datos

Archivo modificado:

- `Backend/backend/src/main/resources/application.properties`

Se eliminó la dependencia de valores embebidos y se pasó a variables de entorno para que Render pueda inyectar los valores reales de producción.

### 7.2 Ejemplo de configuración local

Archivo creado:

- `Backend/backend/.env.example`

Incluye un ejemplo de conexión a PostgreSQL para entorno local y para replicar el mismo patrón usado en Render.

### 7.3 Configuración de despliegue para Render

Archivo creado:

- `render.yaml`

Define exclusivamente el servicio web del backend y no incluye frontend ni servicios estáticos, en cumplimiento con el alcance solicitado.

## 8. Validación ejecutada

Se ejecutaron las comprobaciones locales correspondientes:

- `cd Backend/backend && ./mvnw test`
- `cd Fronted && npm run build`

La validación del backend tuvo éxito, y el proyecto sigue compilando correctamente. La validación del frontend no fue necesaria para la preparación del backend, pero se mantuvo la compilación en el mismo repositorio sin afectar su lógica.

## 9. Consideraciones finales

La configuración quedo orientada a mantener la arquitectura actual de la aplicación, conservando los endpoints, la lógica de negocio y la conexión a Supabase. El cambio principal fue externalizar la configuración de datos sensibles y dejar el backend ejecutándose como un servicio web público de Render.

Para completar el despliegue real en Render, el usuario debe entrar al panel y definir los valores reales de:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Además, debe verificar que el servicio web del backend se apunta a la URL pública correcta y que el health check `/api/test-db` responde de forma esperada.
