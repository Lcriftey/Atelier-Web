# **Reglas de Negocio**

### **RN-01 — Acceso público al contenido artístico**

Toda la información destinada a la exhibición y promoción del artista deberá estar disponible públicamente sin necesidad de autenticación.

Esto incluye:

* Página de inicio.  
* Catálogo.  
* Galería.  
* Información del artista.  
* Información sobre clases.  
* Información sobre obras personalizadas.  
* Información de contacto.

---

### **RN-02 — No se requiere registro de usuarios**

El sistema no requerirá la creación de cuentas o perfiles para que un visitante pueda:

* Consultar obras.  
* Utilizar el carrito.  
* Solicitar una clase.  
* Consultar información del artista.  
* Contactar al artista.

---

### **RN-03 — Estado de disponibilidad de las obras**

Cada obra deberá contar con un estado que determine si puede ser presentada como disponible para adquisición.

Una obra podrá encontrarse, como mínimo, en uno de los siguientes estados:

* **Disponible**  
* **No disponible**

Solo las obras marcadas como **disponibles** deberán poder ser seleccionadas para iniciar el proceso de adquisición.

> Aquí te recomiendo no utilizar todavía "Vendida" como estado si el sistema no registra las ventas. "No disponible" es más coherente con el alcance actual.

---

### **RN-04 — Información obligatoria de una obra**

Una obra no podrá publicarse en el catálogo si no cuenta con la información mínima necesaria para su presentación.

Como mínimo deberá disponer de:

* Nombre.  
* Precio.  
* Descripción.  
* Descripción técnica.  
* Estado de disponibilidad.  
* Al menos una imagen.

---

### **RN-05 — Integridad de las imágenes de las obras**

Cada imagen asociada a una obra deberá pertenecer exclusivamente a dicha obra.

Las imágenes deberán permitir establecer:

* Orden de visualización.  
* Imagen principal.

La eliminación de una obra deberá gestionar correctamente las imágenes asociadas para evitar registros huérfanos.

---

### **RN-06 — Carrito de selección**

El carrito permitirá al visitante seleccionar múltiples obras disponibles para facilitar su consulta o intención de compra.

El carrito:

* No representa una compra realizada.  
* No genera una transacción.  
* No reserva una obra.  
* No garantiza la disponibilidad de una obra.  
* No requiere autenticación.

La disponibilidad final de las obras será determinada directamente por el artista.

---

### **RN-07 — Envío del carrito mediante WhatsApp**

Cuando el usuario decida continuar con la adquisición, el sistema deberá generar un mensaje de WhatsApp que contenga la información necesaria para identificar las obras seleccionadas.

Como mínimo deberá incluir:

* Nombre de cada obra.  
* Precio registrado de cada obra.

El proceso de negociación, disponibilidad, pago y entrega se realizará directamente entre el usuario y el artista.

---

### **RN-08 — Ausencia de transacciones en línea**

El sistema no realizará transacciones económicas.

No se procesarán mediante la plataforma:

* Pagos.  
* Datos de tarjetas.  
* Transferencias.  
* Confirmaciones de pago.  
* Facturación.  
* Gestión de envíos.

La página únicamente facilitará el contacto entre el potencial comprador y el artista.

---

# **Reglas de negocio para las clases**

### **RN-09 — Solicitud de clase**

El envío del formulario de clases representa una **solicitud**, no una confirmación de reserva.

El estado inicial de toda solicitud registrada será:

> **SOLICITADA**

---

### **RN-10 — Datos obligatorios para solicitar una clase**

El sistema deberá validar que los campos definidos como obligatorios estén diligenciados antes de registrar una solicitud.

Los campos obligatorios deberían ser, como mínimo:

* Nombre.  
* Número de WhatsApp.  
* Fecha deseada.  
* Hora deseada.  
* Tipo de clase.

La descripción de lo que busca el usuario y las observaciones pueden establecerse como campos obligatorios o opcionales dependiendo de lo que finalmente defina el artista.

---

### **RN-11 — Persistencia de solicitudes**

Toda solicitud enviada correctamente mediante el formulario deberá almacenarse en la base de datos, independientemente de que posteriormente el artista confirme o no la clase.

Esto permitirá conservar un historial de las solicitudes recibidas y utilizar esta información para futuras funcionalidades.

---

### **RN-12 — Comunicación mediante WhatsApp**

Después de registrar correctamente una solicitud, el sistema deberá generar un mensaje de WhatsApp dirigido al artista.

El mensaje deberá contener la información proporcionada por el usuario en el formulario.

La comunicación posterior y la coordinación definitiva de la clase se realizarán directamente entre el usuario y el artista.

---

### **RN-13 — Confirmación externa de la clase**

El sistema no será responsable de confirmar la disponibilidad ni la realización de una clase en la primera versión.

La confirmación será acordada directamente entre el usuario y el artista mediante los canales de contacto disponibles.

---

### **RN-14 — No se procesarán pagos por clases**

La plataforma no realizará cobros ni procesará pagos relacionados con las clases.

Cualquier proceso de pago acordado entre el usuario y el artista se realizará fuera de la plataforma.

---

# **Reglas de negocio administrativas**

### **RN-15 — Acceso restringido al panel administrativo**

Las funcionalidades de administración del catálogo deberán estar disponibles exclusivamente para usuarios autorizados.

Un visitante público no deberá poder:

* Crear obras.  
* Modificar obras.  
* Eliminar obras.  
* Modificar precios.  
* Modificar disponibilidad.  
* Administrar imágenes.

---

### **RN-16 — Autenticación administrativa**

El acceso al panel administrativo deberá requerir autenticación.

Las credenciales administrativas deberán mantenerse protegidas y no deberán formar parte del código fuente público de la aplicación.

---

### **RN-17 — Separación entre contenido público y administrativo**

El panel administrativo deberá mantenerse separado de la interfaz pública del sitio.

La existencia de una URL específica para acceder al panel **no debe considerarse por sí sola un mecanismo de seguridad**. Aunque el enlace no aparezca en la página pública, el acceso debe estar protegido mediante autenticación y autorización.

Esto es importante para tu requisito de:

> "solo con un link privado"

Yo lo modificaría técnicamente a:

> **"El panel administrativo estará ubicado en una ruta separada de la aplicación pública y su acceso estará protegido mediante autenticación."**

El hecho de que alguien conozca la URL no debería permitirle entrar.

---

### **RN-18 — Modificación del catálogo**

Los cambios realizados por un administrador sobre una obra deberán reflejarse en el catálogo público una vez hayan sido almacenados correctamente.

---

### **RN-19 — Eliminación de obras**

Una obra eliminada del catálogo no deberá continuar siendo visible públicamente.

Sin embargo, antes de implementar eliminación física, te recomiendo considerar una **eliminación lógica** o estado "No disponible". Esto es especialmente útil para un artista porque una obra vendida puede seguir siendo parte de su trayectoria y galería.

---

# **Reglas relacionadas con contenido**

### **RN-20 — Contenido administrado**

La información presentada públicamente deberá corresponder exclusivamente al contenido proporcionado y aprobado por el artista.

Esto incluye:

* Biografía.  
* Trayectoria.  
* Descripciones.  
* Información técnica.  
* Precios.  
* Fotografías.  
* Información de clases.  
* Información de obras personalizadas.

---

### **RN-21 — Información de contacto**

Los canales de contacto publicados deberán corresponder a los medios oficiales proporcionados por el artista.

El sistema no deberá exponer información de contacto privada que no haya sido destinada para uso público.

