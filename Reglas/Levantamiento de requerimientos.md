## **1\. Objetivo general del proyecto**

Desarrollar una plataforma web profesional para un artista que permita:

1. **Exhibir y promocionar su obra artística.**  
2. **Presentar al artista**, su trayectoria, identidad y propuesta artística.  
3. **Gestionar solicitudes de agendamiento de clases.**  
4. **Exhibir y comercializar sus obras de arte.**  
5. **Orientar a potenciales clientes interesados en obras personalizadas.**  
6. Mantener una **persistencia básica de información** para clases agendadas y obras del catálogo.

# **2\. Requisitos funcionales**

Los requisitos funcionales describen **qué debe hacer el sistema**.

### **RF-01 — Página de inicio**

El sistema debe disponer de una página principal que:

* Presente al artista y su propuesta.  
* Muestre una selección destacada de sus obras.  
* Permita acceder fácilmente al catálogo.  
* Permita acceder al apartado de clases.  
* Permita conocer al artista.  
* Permita conocer el proceso para solicitar una obra personalizada.  
* Incluya llamados a la acción claros, por ejemplo:  
  * "Ver obras"  
  * "Agendar una clase"  
  * "Conocer al artista"  
  * "Encargar una obra"

---

### **RF-02 — Catálogo de obras**

El sistema debe permitir visualizar las obras disponibles en el catálogo.

Cada obra debe contar como mínimo con:

* Nombre.  
* Precio.  
* Fotografías.  
* Descripción artística.  
* Descripción técnica.  
* Información relevante de la obra.  
* Estado/disponibilidad.

Podrían contemplarse posteriormente atributos como:

* Técnica.  
* Dimensiones.  
* Año.  
* Materiales.  
* Categoría.  
* Orientación.  
* Disponibilidad.

### **RF-03 — Vista detallada de una obra**

El usuario debe poder seleccionar una obra y acceder a una página individual con información ampliada.

Esta página debería permitir:

* Visualizar las fotografías en forma de carrusel en mayor tamaño.   
* Consultar la descripción.  
* Consultar las características técnicas.  
* Consultar el precio.  
* Conocer su disponibilidad.  
* Contactar al artista para adquirirla.  
* Añadirla a un carrito de compras

### **RF-04 — Galería artística**

El sistema debe disponer de un espacio destinado exclusivamente a la exhibición visual de las obras.

La galería debe priorizar:

* Fotografías.  
* Composición visual.  
* Navegación sencilla.  
* Experiencia artística.  
* Calidad visual.

### **RF-05 — Información del artista**

El sistema debe disponer de una sección dedicada al artista.

Debe permitir presentar:

* Nombre artístico.  
* Biografía.  
* Trayectoria.  
* Formación.  
* Experiencia.  
* Exposiciones o reconocimientos.  
* Técnicas utilizadas.  
* Motivaciones.  
* Propuesta artística.  
* Fotografías del artista.  
* Información adicional relevante.

  ## **RF-06 — Solicitud de clases**

El sistema debe permitir al visitante diligenciar un formulario para solicitar información/agendar una clase.

El formulario podrá contener:

* Nombre.  
* Número de WhatsApp.  
* Correo electrónico.  
* Fecha deseada.  
* Hora deseada.  
* Tipo de clase.  
* Número de estudiantes, si aplica.  
* Descripción de lo que busca.  
* Observaciones adicionales.

Al enviarlo:

1. El sistema valida los datos.  
2. Registra la solicitud en la base de datos.  
3. Genera un mensaje de WhatsApp con la información suministrada.  
4. Redirige al usuario al WhatsApp del artista.  
5. El artista y el usuario continúan el proceso directamente.

   ### **Estado inicial**

Todas las solicitudes podrían almacenarse inicialmente como:

SOLICITADA

### **RF-07 — Registro de clases**

El sistema debe almacenar persistentemente las solicitudes/agendamientos realizados.

Como mínimo debería conservar:

* Identificador.  
* Datos del cliente.  
* Fecha.  
* Hora.  
* Tipo de clase.  
* Observaciones.  
* Fecha de creación de la solicitud.  
* Estado de la solicitud.

### **RF-08 — Gestión del catálogo**

Debe existir un panel administrativo el cual pueda:

* Crear obras.  
* Modificar obras.  
* Eliminar obras.  
* Marcar obras como disponibles/no disponibles.  
* Subir fotografías.  
* Modificar información técnica.  
* Actualizar precios.

Este debe estar protegido por un usuario administrador en un URL distinta, no debe poder permitirse su acceso desde la pagina web, solo con un link privado

### **RF-09 — Persistencia de obras**

Las obras publicadas deben almacenarse persistentemente.

La información podría dividirse conceptualmente en:

**Obra**

* ID  
* Nombre  
* Descripción  
* Descripción técnica  
* Precio  
* Estado  
* Fecha de publicación

**Imágenes**

* ID  
* ID de obra  
* URL/ruta  
* Orden  
* Imagen principal

Esto permite que una obra tenga múltiples fotografías sin duplicar información.

### **RF-10 — Encargo de obras personalizadas**

Debe existir una sección dedicada a personas interesadas en solicitar una obra personalizada.

Esta sección debería explicar previamente:

* Cómo funciona el proceso.  
* Qué tipo de obras realiza.  
* Técnicas disponibles.  
* Materiales.  
* Tamaños posibles.  
* Tiempos aproximados.  
* Factores que afectan el precio.  
* Qué información debe proporcionar el cliente.  
* Ejemplos de encargos anteriores.  
* Condiciones relevantes.  
* Cómo iniciar el proceso de contacto.

### **RF-11 — Contacto**

El sistema debe permitir que el usuario contacte fácilmente al artista mediante los canales definidos.

Por ejemplo:

* WhatsApp.  
* Correo electrónico.  
* Redes sociales.

# **3\. Requisitos no funcionales**

Aquí entran las características de **calidad, rendimiento, seguridad, mantenibilidad, etc.**

### **RNF-01 — Identidad visual**

La página debe poseer una dirección artística coherente con la identidad del artista.

Debe transmitir:

* Profesionalismo.  
* Calidad.  
* Exclusividad.  
* Identidad artística.  
* Coherencia visual.

La interfaz no debería sentirse como una plantilla genérica de e-commerce.

### **RNF-02 — Diseño responsive**

La aplicación debe poder utilizarse correctamente desde:

* Computadores.  
* Tablets.  
* Teléfonos móviles.

Esto es particularmente importante porque una parte considerable del tráfico probablemente llegará desde redes sociales y dispositivos móviles.

### **RNF-02 — UX/UI**

La interfaz debe ser intuitiva incluso para usuarios con poca experiencia utilizando procesos digitales.

Debe priorizar:

* Navegación sencilla.  
* Jerarquía visual clara.  
* Botones fácilmente identificables.  
* Formularios simples.  
* Información organizada.  
* Retroalimentación al usuario.  
* Compatibilidad con dispositivos móviles.

### **RNF-03 — Rendimiento**

La página debe presentar tiempos de carga reducidos.

Se debe prestar especial atención a:

* Optimización de imágenes.  
* Lazy loading.  
* Compresión de recursos.  
* Minimización de JavaScript/CSS cuando corresponda.  
* Optimización de fuentes.  
* Caché.  
* Uso eficiente de almacenamiento.

### **RNF-04 — SEO**

La aplicación debe estar optimizada para motores de búsqueda.

Debe contemplar, como mínimo:

* Meta title.  
* Meta description.  
* URLs amigables.  
* Estructura semántica HTML.  
* Etiquetas `H1`, `H2`, etc.  
* `alt` descriptivos para imágenes.  
* Sitemap.  
* Robots.txt.  
* Open Graph.  
* Datos estructurados cuando corresponda.  
* Buen rendimiento.  
* Diseño responsive.  
* Contenido indexable.

### **RNF-05 — Escalabilidad**

Aunque inicialmente se manejará un volumen reducido de información, la arquitectura debe permitir aumentar posteriormente:

* Número de obras.  
* Número de imágenes.  
* Número de clases.  
* Usuarios administrativos.  
* Funcionalidades comerciales.

### **NF-06 — Persistencia**

La información de:

* Obras.  
* Imágenes asociadas.  
* Solicitudes de clases.

debe almacenarse persistentemente y conservarse entre sesiones.

### **RNF-07 — Seguridad**

La aplicación debe proteger:

* Información de los clientes.  
* Datos de las solicitudes.  
* Acceso administrativo.  
* Credenciales.  
* Operaciones de modificación/eliminación.

### **RNF-09 — Mantenibilidad**

El código debe estar estructurado de forma que permita:

* Agregar nuevas obras.  
* Modificar contenido.  
* Añadir nuevas secciones.  
* Modificar estilos.  
* Incorporar nuevas funcionalidades.

sin tener que reconstruir completamente la aplicación.

### **RNF-10 — Compatibilidad**

La aplicación debe funcionar correctamente en los principales navegadores modernos:

* Chrome.  
* Edge.  
* Firefox.  
* Safari.

