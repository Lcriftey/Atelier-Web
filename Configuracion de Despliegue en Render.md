# Configuración de Despliegue en Render

## 1. Introducción

El objetivo de esta preparación es dejar el backend de Academia Atelier listo para desplegarse en Render sin tocar la lógica del negocio ni la estrategia de despliegue del frontend.

El alcance de los cambios se limita exclusivamente al backend Spring Boot y a la configuración de conexión con PostgreSQL/Supabase. El frontend no se modifica ni se prepara para alojarse en Render.

Antes de la preparación, el repositorio ya tenía una separación clara entre el frontend React/Vite y el backend Spring Boot. El backend estaba configurado con conexión a PostgreSQL usando valores de entorno parcialmente embebidos o no centralizados, y no contaba con una estrategia de despliegue explícita para Render.

## 2. Análisis del proyecto

### Arquitectura identificada

La aplicación está compuesta por dos proyectos separados:

- `Fronted/`: interfaz React con Vite
- `Backend/backend/`: API REST en Spring Boot

La parte relevante para esta tarea es el backend, que expone endpoints bajo `/api` y usa PostgreSQL de Supabase como base de datos.

### Tecnologías y versiones detectadas

- Backend: Spring Boot 4.1.1
- Java: 21
- Build tool: Maven
- Base de datos: PostgreSQL
- Driver: PostgreSQL JDBC

### Estado del backend antes del cambio

Se comprobó que:

- el backend usa Spring MVC y JPA
- el puerto está configurado para `PORT` con fallback local en `8080`
- el servicio de conexión a la base de datos no estaba completamente externalizado en variables de entorno
- la configuración no estaba preparada para un despliegue seguro y reproducible en Render

## 3. Estrategia de despliegue

### Componente desplegado en Render

- Backend Spring Boot como servicio web público

### Componentes que permanecen fuera de Render

- Frontend React/Vite
- Base de datos PostgreSQL en Supabase
- Storage de Supabase

### Justificación técnica

Se mantiene la arquitectura actual y se reduce el alcance a la pieza que debe migrarse: el backend. No se modifica la lógica ni la experiencia del frontend, ni se cambia la estructura del repositorio.

### Método de construcción y ejecución

El backend se despliega como un Web Service con runtime Docker. Render usa `Backend/backend` como directorio raíz, por lo que `dockerfilePath: ./Dockerfile` y `dockerContext: .` apuntan respectivamente a `Backend/backend/Dockerfile` y a la carpeta `Backend/backend/`.

El Dockerfile realiza una construcción multi-stage:

1. La etapa `build` usa Maven 3.9.9 con Eclipse Temurin Java 21, descarga dependencias y ejecuta `mvn -B package`.
2. La etapa `runtime` usa Eclipse Temurin Java 21 JRE y copia `target/backend-0.0.1-SNAPSHOT.jar` como `/app/app.jar`.
3. El contenedor inicia con `java -jar /app/app.jar`.

Spring Boot usa `${PORT:8080}`: en Render escucha en el puerto entregado por la plataforma; en local conserva el puerto 8080 como fallback.

## 4. Rama de trabajo

La rama utilizada para esta tarea es `Render_deploy`.

Su objetivo es aislar los cambios de despliegue del backend para que no mezclen el esfuerzo de migración con trabajo ajeno ya presente en el repositorio.

## 5. Modificaciones realizadas

### `Backend/backend/src/main/resources/application.properties`

Se actualizó la configuración para usar variables de entorno en lugar de depender de valores de conexión embebidos dentro del archivo versionado.

Se definieron variables esperadas:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Esto permite que Render inyecte los valores reales sin dejar credenciales en el código fuente.

### `Backend/backend/.env.example`

Se agregó un ejemplo de configuración para entorno local con los nombres de variables necesarios para que la aplicación pueda ejecutarse de forma equivalente al despliegue.

### `Backend/backend/Dockerfile`

Se agregó un Dockerfile multi-stage para construir la aplicación con Maven y Java 21 y ejecutarla en una imagen JRE Java 21. El artefacto copiado corresponde al nombre y versión declarados en `Backend/backend/pom.xml`: `target/backend-0.0.1-SNAPSHOT.jar`.

### `Backend/backend/.dockerignore`

Excluye del contexto de Docker archivos locales, metadatos de Git/IDE, logs y el directorio `target`, que se genera en la etapa de construcción.

### `render.yaml`

Se creó la configuración de Render enfocada exclusivamente en el backend.

Incluye:

- servicio web de tipo `web`
- runtime `docker`
- root directory `Backend/backend`
- Dockerfile `./Dockerfile` y contexto `.` (ambos relativos al directorio raíz del servicio)
- health check en `/api/test-db`, endpoint existente que ejecuta `SELECT 1` mediante `JdbcTemplate` y comprueba que la API puede acceder a PostgreSQL
- variables de entorno de base de datos sin secretos embebidos

Render proporciona la variable `PORT` al Web Service; no se fija manualmente en `render.yaml`.

## 6. Validación

Se ejecutó la validación del backend con:

- `cd Backend/backend && ./mvnw test`

La comprobación terminó correctamente. La correspondencia del JAR se verificó contra `artifactId` y `version` en `pom.xml`, que generan `target/backend-0.0.1-SNAPSHOT.jar`. La construcción de la imagen Docker debe validarse con `docker build` si Docker está disponible en el entorno local.

## 7. Consideraciones finales

La migración quedó enfocada exclusivamente en el backend. No se realizaron cambios de despliegue ni configuración del frontend.

La parte final del despliegue real en Render requiere definir las variables de entorno reales en el panel del servicio, especialmente:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Sin esas variables, el backend no podrá conectarse a la base de datos de Supabase en Render.
