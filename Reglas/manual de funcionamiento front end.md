# Manual de funcionamiento del frontend - Academia Atelier

## 1. Objetivo de este manual

Este documento explica cómo funciona actualmente el frontend de Academia Atelier, dónde vive cada parte de la interfaz y qué debe cambiarse más adelante para conectarlo correctamente con el backend Spring Boot y la base de datos PostgreSQL/Supabase.

La intención es que cualquier persona que modifique la aplicación pueda distinguir entre:

- Lo que ya funciona únicamente en el navegador.
- Lo que todavía usa datos de prueba.
- Lo que se comunica con WhatsApp.
- Lo que debe reemplazarse por llamadas a la API.
- Lo que requiere persistencia, autenticación o almacenamiento de archivos.

> Importante: la carpeta del frontend se llama `Fronted` en el repositorio. El nombre correcto en un proyecto nuevo normalmente sería `Frontend`, pero no se debe renombrar sin actualizar rutas, scripts y documentación.

## 2. Estado actual del sistema

El frontend funciona como una aplicación React construida con Vite.

Actualmente:

- La navegación se controla manualmente con `window.location.hash` desde `src/App.jsx`.
- No existe un cliente centralizado para consumir la API.
- El catálogo utiliza datos locales de `src/data/featuredProducts.js`.
- Las imágenes públicas de ejemplo provienen de URLs externas de Unsplash.
- El formulario de clases valida en el navegador, guarda una copia temporal en `localStorage` y prepara un mensaje de WhatsApp.
- El formulario de encargos personalizados valida en el navegador y prepara un mensaje de WhatsApp, pero no guarda la solicitud.
- No se usa Supabase desde el frontend.
- No se usa el backend Spring Boot desde el frontend.
- No existe autenticación administrativa conectada.
- No existen pagos, reservas confirmadas ni cotizaciones automáticas.

El backend tampoco está conectado todavía a una base de datos. Según `Reglas/backendInstruction.md`, utiliza `CrudStore` en memoria y excluye `DataSourceAutoConfiguration`.

Por tanto, el flujo actual es principalmente:

```text
Interfaz React
    |
    +-- Datos estáticos o estado local
    |
    +-- Validación en el navegador
    |
    +-- WhatsApp mediante enlace wa.me
```

El flujo futuro será:

```text
Interfaz React
    |
    +-- Cliente HTTP / API
              |
              +-- Backend Spring Boot
                        |
                        +-- PostgreSQL / Supabase
                        +-- Supabase Storage para imágenes
```

## 3. Cómo ejecutar el frontend

Desde la raíz del repositorio:

```powershell
Set-Location "Fronted"
npm install
npm run dev
```

El comando de producción es:

```powershell
Set-Location "Fronted"
npm run build
```

Para probar el resultado compilado:

```powershell
Set-Location "Fronted"
npm run preview
```

El `package.json` actual solo define:

- `dev`: inicia Vite.
- `build`: genera la aplicación de producción.
- `preview`: sirve la compilación local.

Cada vez que se modifique una integración importante se debe ejecutar `npm run build`.

## 4. Estructura general

La estructura relevante es:

```text
Fronted/
├── index.html
├── package.json
├── vite.config.js
├── Assets/
│   └── logo_Atelier.svg
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── constants/
    │   └── contact.js
    ├── data/
    │   └── featuredProducts.js
    ├── components/
    │   ├── Artist/
    │   ├── ArtworkDetail/
    │   ├── Button/
    │   ├── Catalog/
    │   ├── ClassesSection/
    │   ├── Common/
    │   ├── CustomOrderForm/
    │   ├── CustomOrdersSection/
    │   ├── Footer/
    │   ├── Gallery/
    │   ├── Header/
    │   ├── Hero/
    │   ├── Navigation/
    │   └── ProductCarousel/
    ├── pages/
    │   ├── About.jsx
    │   ├── Catalog.jsx
    │   ├── Classes.jsx
    │   ├── Contact.jsx
    │   ├── CustomOrders.jsx
    │   └── Home.jsx
    └── styles/
        ├── global.css
        └── variables.css
```

Cada componente visual suele tener esta forma:

```text
Componente/
├── Componente.jsx
└── Componente.module.css
```

El archivo `.jsx` contiene la estructura y el comportamiento. El archivo `.module.css` contiene los estilos aislados de ese componente.

## 5. Punto de entrada de React

### `src/main.jsx`

`main.jsx` inicia React y monta `App` dentro del elemento raíz de `index.html`.

No se deben agregar llamadas a la API directamente en este archivo. Su responsabilidad debe permanecer limitada al arranque de la aplicación y a los estilos globales necesarios.

### `src/index.css`

Importa:

- `styles/variables.css`.
- `styles/global.css`.

Los estilos globales se cargan una sola vez desde este punto.

## 6. Componente principal y navegación

### `src/App.jsx`

`App.jsx` funciona actualmente como un enrutador manual basado en hashes.

La ruta se obtiene de:

```js
window.location.hash || '#home'
```

Las rutas actuales son:

| Hash | Vista renderizada |
|---|---|
| `#home` o vacío | Home compuesta por hero, encargos, obras y preguntas frecuentes. |
| `#catalog` | `CatalogView` con las obras locales. |
| `#gallery` | `GalleryView` con las obras locales. |
| `#about` | `ArtistView`. |
| `#custom-orders` | Página `CustomOrders`. |
| `#custom-order-form` | Página `CustomOrders` y scroll directo al formulario. |
| `#classes` | `ClassesSection` completa. |
| `#class-request-form` | `ClassesSection` y scroll directo al formulario. |
| `#obra/{id}` | `ArtworkDetail` para una obra del arreglo local. |

La aplicación escucha el evento `hashchange` y actualiza el estado `route`. Cuando la ruta corresponde a un formulario, espera a que la vista se renderice y luego ejecuta `scrollIntoView` sobre el elemento correspondiente.

### Reglas para cambiar la navegación

Si se agrega una ruta nueva:

1. Agregar el enlace en `Navigation` o en el componente que lo necesite.
2. Agregar la condición correspondiente en `App.jsx`.
3. Renderizar el componente dentro de `Header` y `Footer` como las demás vistas.
4. Si el enlace debe apuntar a un formulario, agregar el `id` del formulario y una regla de scroll posterior al renderizado.
5. Probar tanto el clic desde la home como la carga directa del hash.

### Migración futura a React Router

React Router aparece en algunos documentos de contexto, pero el código actual no lo utiliza. No se debe instalar o introducir una segunda estrategia de navegación sin decidir primero una migración completa.

Si se adopta React Router más adelante:

- Reemplazar el enrutamiento manual de `App.jsx` de forma coordinada.
- Crear rutas para cada página.
- Mantener URLs compatibles o definir redirecciones desde los hashes actuales.
- Actualizar navegación, pruebas y enlaces internos.

## 7. Composición de la página principal

La home actual se compone directamente en `App.jsx` en este orden:

1. `ClassesSection isHero`: invitación a clases y encargos.
2. `CustomOrdersSection`: introducción resumida a encargos personalizados.
3. `ProductCarousel`: obras destacadas.
4. `ClassesSection` con `showFaq`: preguntas frecuentes sin repetir el formulario.
5. `Footer`.

Esto significa que `pages/Home.jsx` no es actualmente el lugar que controla la home visible. Antes de cambiar la portada se debe revisar `App.jsx`.

## 8. Componentes principales

### `Header` y `Navigation`

Responsabilidades:

- Mostrar el logo.
- Mostrar los enlaces principales.
- Mantener la navegación pública.
- Controlar el menú responsive si corresponde.

No deben contener reglas de negocio ni llamadas directas a la base de datos.

### `Footer`

Contiene navegación secundaria, contacto y redes sociales. El número de WhatsApp se importa desde:

```text
src/constants/contact.js
```

No escribir el número directamente en nuevos enlaces.

### `ProductCarousel` y `ProductCard`

Muestran obras usando un arreglo de productos. El carrusel utiliza scroll horizontal nativo y botones de navegación.

Actualmente recibe los productos desde:

```text
src/data/featuredProducts.js
```

Más adelante debe recibir datos obtenidos desde la API, conservando inicialmente el mismo contrato de propiedades o usando un adaptador.

### `CatalogView`, `GalleryView` y `ArtworkDetail`

Estas vistas consumen la información de las obras. La información local mezcla nombres en español e inglés para compatibilidad con componentes existentes, por ejemplo:

```js
{
  id,
  nombre,
  name,
  image,
  images,
  precio,
  price,
  description,
  artisticDescription,
  technicalDescription,
  dimensions,
  availability
}
```

Cuando el backend entregue JSON en camelCase español, conviene crear una función adaptadora en lugar de modificar cada componente de manera independiente.

Ejemplo conceptual:

```js
function mapObraToProduct(obra) {
  return {
    id: obra.id,
    name: obra.nombre,
    nombre: obra.nombre,
    price: formatPrice(obra.precio, obra.moneda),
    precio: obra.precio,
    description: obra.descripcionArtistica,
    artisticDescription: obra.descripcionArtistica,
    technicalDescription: obra.descripcionTecnica,
    availability: obra.estado,
    images: obra.imagenes?.map((imagen) => imagen.urlImagen) ?? [],
  };
}
```

### `ClassesSection`

Tiene dos usos:

- `isHero`: versión resumida de la portada.
- Sin `isHero`: página completa con introducción, preguntas frecuentes y formulario.

Props importantes:

| Prop | Función |
|---|---|
| `isHero` | Muestra la invitación inicial de clases. |
| `showForm` | Muestra u oculta el formulario. |
| `showIntroduction` | Controla el bloque editorial de introducción. |
| `showFaq` | Controla las preguntas frecuentes. |
| `showCta` | Controla el enlace de agendamiento. |

El formulario actual:

- Mantiene los datos en React state.
- Valida fecha, día de la semana y horario.
- Usa arreglos locales de horarios.
- Guarda temporalmente una solicitud en `localStorage`.
- Genera un mensaje y abre WhatsApp.

Para conectarlo a la base de datos, se debe sustituir el bloque de `localStorage` por una llamada `POST` a la API. El mensaje de WhatsApp debe abrirse después de confirmar que la API respondió correctamente.

### `CustomOrdersSection`

Es el bloque resumido de encargos que aparece en la home. Su enlace lleva a `#custom-orders`.

No es el formulario completo. La página detallada y el formulario viven en `pages/CustomOrders.jsx` y `components/CustomOrderForm/`.

### `CustomOrderForm`

Es el formulario final de encargos personalizados.

Actualmente:

- Requiere nombre y descripción de la idea.
- Permite WhatsApp y correo como datos opcionales.
- No sube imágenes.
- No usa Supabase.
- No usa `localStorage`.
- Mantiene los datos únicamente mientras la página está abierta.
- Genera un mensaje de WhatsApp con los datos disponibles.
- Muestra un enlace alternativo si el navegador bloquea la apertura de WhatsApp.

El botón de la home apunta a `#custom-order-form`, y `App.jsx` carga la página completa y hace scroll hasta este componente.

## 9. Estado, formularios y validaciones

### Estado local

Los componentes usan `useState` para datos temporales de interacción. Ese estado se pierde al recargar o abandonar la página salvo que se indique explícitamente lo contrario.

No usar `localStorage` para solicitudes que deban formar parte del historial oficial. La persistencia futura debe suceder en el backend.

### Reglas actuales de clases

- Nombre, WhatsApp, correo, fecha, horarios y tipo de clase se manejan en el estado del formulario.
- Fecha y horario se validan en el navegador.
- No se puede elegir domingo.
- Para el día actual se eliminan horas ya pasadas.
- El estado de negocio inicial debe continuar siendo `SOLICITADA`.

### Reglas actuales de encargos

- Nombre y descripción son obligatorios.
- WhatsApp y correo son opcionales en la interfaz actual.
- El formulario no crea un registro.
- El formulario abre WhatsApp con un texto codificado.

### Qué debe permanecer en el frontend

El frontend debe validar para mejorar la experiencia, pero el backend debe repetir las validaciones importantes. Nunca se debe confiar únicamente en las restricciones HTML o JavaScript del navegador.

## 10. WhatsApp

El número común está centralizado en:

```text
src/constants/contact.js
```

Uso recomendado:

```js
import { WHATSAPP_NUMBER } from '../../constants/contact';

const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
```

WhatsApp es un canal de comunicación, no la persistencia oficial. Cuando exista API:

1. Validar los datos.
2. Enviar la solicitud al backend.
3. Confirmar respuesta exitosa.
4. Abrir WhatsApp con el mensaje.
5. Informar si el registro se guardó aunque la apertura de WhatsApp falle.

No se debe presentar una solicitud como reserva confirmada, venta o cotización aprobada.

## 11. Estilos y sistema visual

### `src/styles/variables.css`

Define los colores y fuentes principales:

- `--color-paper`: fondo claro.
- `--color-white`: blanco cálido.
- `--color-navy`: azul principal.
- `--color-gold`: dorado de acento.
- `--color-gold-dark`: dorado para texto.
- `--color-ink`: texto oscuro.
- `--font-body`: tipografía de cuerpo.
- `--font-display`: tipografía de títulos y controles.

### `src/styles/global.css`

Define:

- `box-sizing` global.
- Fondo y tipografía del body.
- Tipografías de encabezados, botones y enlaces.
- Scroll suave.
- Clase `visually-hidden` para contenido accesible visualmente oculto.

### CSS Modules

Los archivos `*.module.css` generan clases locales. No cambiar una clase en JSX pensando que es una clase global: debe existir en el módulo importado por ese componente.

Al modificar estilos:

- Reutilizar variables existentes.
- Mantener los focos visibles.
- Revisar mobile en anchos menores a 760 px.
- Evitar overflow horizontal.
- No colocar lógica de datos dentro del CSS.
- No usar colores nuevos si existe una variable equivalente.

## 12. Relación futura entre frontend, backend y base de datos

La base de datos definida en `Reglas/database.md` y las migraciones de `supabase/migrations/` contemplan:

- `obras`.
- `imagenesObra`.
- `solicitudesClase`.
- `solicitudesTrabajoPersonalizado`.
- `imagenesTrabajoPersonalizado`.
- `usuariosAdministradores`.

El backend documentado en `Reglas/backendInstruction.md` expone estos recursos con endpoints REST:

| Recurso | Endpoint |
|---|---|
| Obras | `/api/obras` |
| Imágenes de obras | `/api/imagenes-obra` |
| Solicitudes de clase | `/api/solicitudes-clase` |
| Solicitudes de encargos | `/api/solicitudes-trabajo-personalizado` |
| Imágenes de encargos | `/api/imagenes-trabajo-personalizado` |
| Administradores | `/api/administradores` |

Todos usan las operaciones base `GET`, `GET/{id}`, `POST`, `PUT` y `DELETE`, según el recurso.

### Diferencias que deben resolverse antes de conectar

#### Solicitudes de clases

El frontend actual maneja:

- `name`.
- `whatsapp`.
- `email`.
- `date`.
- `startTime`.
- `endTime`.
- `classType`.
- `students`.
- `goals`.
- `observations`.

El backend espera nombres de dominio como:

- `nombreCliente`.
- `numeroWhatsapp`.
- `correoElectronico`.
- `fechaSolicitada`.
- `horaSolicitada`.
- `tipoClase`.
- `cantidadEstudiantes`.
- `descripcionSolicitud`.
- `observacionesAdicionales`.

Antes de llamar a la API se debe crear un adaptador. También se debe decidir si `startTime` y `endTime` se guardan como rango, si se agrega un campo de salida o si `horaSolicitada` representa solo el inicio.

#### Solicitudes de encargos

El frontend actual maneja principalmente:

- Nombre.
- Descripción de la idea.
- WhatsApp opcional.
- Correo opcional.

El modelo de base de datos documentado considera como obligatorios nombre, WhatsApp y descripción. Esta es una incompatibilidad pendiente: el equipo debe decidir si WhatsApp vuelve a ser obligatorio en el frontend o si se modifica la regla de negocio y la restricción del backend.

No conectar hasta tomar esa decisión, porque de lo contrario el frontend podría enviar datos que el backend rechace.

Además, la tabla permite técnica, material, tamaño, fecha deseada y presupuesto de referencia, pero el formulario actual no solicita esos datos. Deben permanecer opcionales hasta que exista una decisión de producto.

## 13. Capa de acceso a la API que debe crearse

Cuando se autorice la integración, crear una capa única, por ejemplo:

```text
Fronted/src/api/
├── httpClient.js
├── obrasApi.js
├── clasesApi.js
└── encargosApi.js
```

### `httpClient.js`

Debe centralizar:

- URL base.
- Headers.
- Serialización JSON.
- Manejo de respuestas no exitosas.
- Timeout si se decide implementarlo.
- Token de autenticación cuando exista panel administrativo.

No repetir `fetch` con URLs escritas directamente dentro de cada componente.

### Variables de entorno

En Vite, las variables públicas deben comenzar con `VITE_`, por ejemplo:

```text
VITE_API_BASE_URL=http://localhost:8080
```

No guardar en el frontend:

- Contraseñas.
- `service_role` de Supabase.
- Claves privadas.
- Secretos JWT.
- Credenciales administrativas.

Solo una clave pública de Supabase, si se decide usar el SDK desde el navegador, puede exponerse con las protecciones correspondientes. Las operaciones sensibles deben permanecer en el backend.

## 14. Plan de conexión por etapas

### Etapa 1: definir contratos

1. Confirmar los campos obligatorios de clases y encargos.
2. Resolver la diferencia entre `horaSolicitada` y el rango de horas del frontend.
3. Confirmar los estados iniciales `SOLICITADA` y `RECIBIDA`.
4. Confirmar los nombres JSON en camelCase español.
5. Documentar el contrato en `backendInstruction.md` y `CRUD.md`.

### Etapa 2: crear el cliente API

1. Crear `VITE_API_BASE_URL` en `.env.local`.
2. Crear `httpClient.js`.
3. Crear adaptadores de salida del formulario.
4. Crear funciones de lectura de obras.
5. Crear funciones de creación de solicitudes.
6. Centralizar el manejo de errores.

### Etapa 3: conectar el catálogo

1. Reemplazar `featuredProducts.js` por una carga desde `GET /api/obras`.
2. Mapear las obras al contrato que esperan `ProductCard`, `GalleryView` y `ArtworkDetail`.
3. Filtrar o indicar correctamente obras `NO_DISPONIBLE`.
4. Agregar estados de carga, error y lista vacía.
5. Mantener una estrategia de fallback solo si se decide formalmente.

### Etapa 4: conectar solicitudes de clases

1. Mantener la validación visual del formulario.
2. Crear el payload en el formato del backend.
3. Enviar `POST /api/solicitudes-clase`.
4. Eliminar el uso de `localStorage` como fuente de persistencia.
5. Mostrar confirmación de registro.
6. Abrir WhatsApp después del registro exitoso.
7. No llamar dos veces si el usuario hace doble clic.

### Etapa 5: conectar solicitudes de encargos

1. Resolver si WhatsApp será obligatorio según la regla final.
2. Enviar `POST /api/solicitudes-trabajo-personalizado`.
3. Guardar la solicitud antes de abrir WhatsApp.
4. Mostrar estados de cargando, éxito y error.
5. Mantener el texto de WhatsApp como comunicación complementaria.
6. No afirmar que existe una cotización automática.

### Etapa 6: imágenes

El formulario actual no permite imágenes. Si se habilitan en el futuro:

1. Validar MIME, extensión, tamaño y cantidad en frontend.
2. Enviar los archivos a un endpoint multipart o a un flujo de Storage autorizado.
3. Obtener URLs seguras.
4. Crear los registros de `imagenesTrabajoPersonalizado` asociados a la solicitud.
5. Proteger las referencias privadas.
6. No enviar archivos locales directamente mediante `wa.me`.

### Etapa 7: Supabase y persistencia real

El backend actual excluye `DataSourceAutoConfiguration`. Para conectar persistencia:

1. Configurar variables de entorno del datasource.
2. Elegir Spring Data JPA, JDBC o cliente REST de Supabase.
3. No mezclar estrategias sin una decisión arquitectónica.
4. Crear repositorios persistentes.
5. Usar transacciones para operaciones relacionadas.
6. Verificar claves foráneas e índices.
7. Reemplazar `CrudStore` solo después de tener pruebas de integración.
8. Mantener las migraciones como fuente de la estructura de PostgreSQL.

## 15. Panel administrativo y seguridad futura

El panel administrativo no debe protegerse únicamente ocultando un enlace.

Antes de exponer `/api/administradores` o cualquier operación de escritura se debe implementar:

- Autenticación.
- Autorización por rol.
- Protección de endpoints de creación, edición y eliminación.
- Hash seguro de contraseñas.
- No devolver `hashContrasena`.
- CORS limitado a los dominios reales.
- Validación de entrada en backend.
- Registro de errores sin filtrar secretos.
- Variables de entorno para credenciales.

El contenido público puede ser de lectura abierta, pero las operaciones administrativas deben estar protegidas en servidor.

## 16. Manejo de estados de interfaz al conectar API

Cada pantalla que consuma backend debe contemplar:

```text
idle       -> todavía no se ha solicitado información
loading    -> solicitud en curso
success    -> respuesta válida
empty      -> respuesta válida sin registros
error      -> solicitud fallida
```

Para formularios:

```text
idle -> submitting -> success
                   -> error
```

No se debe ocultar un error de red mostrando una confirmación falsa. El usuario debe saber si la solicitud fue guardada, si solo se preparó WhatsApp o si debe intentar nuevamente.

## 17. Pruebas necesarias antes de conectar producción

### Frontend

- Build de Vite.
- Navegación a cada hash.
- Formularios con datos vacíos.
- Formularios con datos válidos.
- Doble clic en botones.
- Errores de red.
- Respuestas vacías.
- Pantallas mobile y desktop.
- Teclado y foco visible.
- Contraste y mensajes accesibles.

### Backend

- `./mvnw.cmd test` desde `Backend/backend`.
- Pruebas de validación.
- Pruebas de estados iniciales.
- Pruebas de relaciones entre imágenes y solicitudes.
- Pruebas de respuestas `400`, `404` y `500`.
- Pruebas de persistencia real contra base de datos de prueba.

### Supabase

- Aplicar migraciones en un entorno de prueba.
- Verificar restricciones y claves foráneas.
- Verificar políticas de acceso.
- Probar Storage si se habilita.
- Confirmar que las credenciales no se incluyan en el repositorio.

## 18. Lista de cambios que deben hacerse más adelante

Antes de considerar completa la conexión, realizar esta lista en orden:

- [ ] Confirmar el contrato definitivo de clases.
- [ ] Confirmar si WhatsApp es obligatorio para encargos.
- [ ] Confirmar los campos adicionales de encargos.
- [ ] Crear cliente API centralizado.
- [ ] Configurar `VITE_API_BASE_URL`.
- [ ] Reemplazar catálogo local por `GET /api/obras`.
- [ ] Reemplazar `localStorage` de clases por `POST /api/solicitudes-clase`.
- [ ] Reemplazar el flujo de encargos solo-WhatsApp por `POST /api/solicitudes-trabajo-personalizado`.
- [ ] Agregar estados de carga y error.
- [ ] Configurar CORS.
- [ ] Conectar el backend a PostgreSQL/Supabase.
- [ ] Reemplazar `CrudStore` con persistencia real.
- [ ] Integrar autenticación administrativa.
- [ ] Definir políticas RLS o autorización equivalente.
- [ ] Diseñar Storage solo si vuelven a requerirse imágenes de referencia.
- [ ] Agregar pruebas de integración.
- [ ] Actualizar `CRUD.md`, `database.md` y este manual.

## 19. Reglas para futuras modificaciones

1. Revisar primero `App.jsx` para saber dónde se monta realmente una vista.
2. No asumir que una página dentro de `src/pages` es la ruta activa sin comprobar `App.jsx`.
3. No duplicar números de WhatsApp, URLs base ni contratos de API.
4. No mezclar llamadas HTTP con JSX de presentación cuando pueda existir una capa API.
5. No guardar solicitudes oficiales únicamente en el navegador.
6. No conectar el frontend directamente con secretos de Supabase.
7. No modificar el contrato de JSON sin actualizar backend, base de datos, pruebas y consumidores.
8. Mantener la distinción entre solicitud, reserva, compra y cotización.
9. Mantener accesibilidad en labels, foco, errores y estados de carga.
10. Ejecutar `npm run build` después de cada cambio relevante.
11. Ejecutar las pruebas Maven después de modificar el contrato backend.
12. No editar `Fronted/dist` ni `Backend/backend/target`; son salidas generadas.

## 20. Referencias internas

- [Diseño de base de datos](database.md)
- [Instrucciones del backend](backendInstruction.md)
- [Reglas de negocio](Reglas%20de%20Negocio.md)
- `Fronted/src/App.jsx`
- `Fronted/src/constants/contact.js`
- `Fronted/src/data/featuredProducts.js`
- `Backend/backend/src/main/resources/application.properties`
- `supabase/config.toml`
- `supabase/migrations/`
