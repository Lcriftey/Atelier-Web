/*
 * GUIA RAPIDA PARA EDITAR ESTE COMPONENTE
 *
 * Este archivo construye la seccion de clases y el formulario para solicitar
 * una cita. En React, un componente es una funcion que devuelve JSX: una
 * sintaxis parecida a HTML que permite escribir la interfaz.
 *
 * Zonas que puedes modificar con seguridad:
 * - Constantes del inicio: telefono, horarios y clave de almacenamiento.
 * - `initialForm`: campos que tiene el formulario y sus valores iniciales.
 * - Textos dentro del `return`: titulos, etiquetas, preguntas e instrucciones.
 * - URLs de las imagenes: cambia el valor de `src` y conserva el `alt`.
 * - `ClassesSection.module.css`: colores, tamanos y distribucion visual.
 *
 * Conceptos de React usados aqui:
 * - `useState`: guarda datos que pueden cambiar mientras la persona usa el
 *   formulario. Se actualiza llamando a la funcion que empieza por `set`.
 * - `useMemo`: calcula las horas disponibles solo cuando cambia la fecha o
 *   la hora de inicio. No es necesario modificarlo para cambiar el diseno.
 * - Props: `isHero` y `showForm` llegan desde otro archivo y deciden que
 *   partes se muestran. `isHero` muestra el llamado a inscribirse y `showForm`
 *   conserva el cuestionario para la pagina de clases.
 * - `styles.nombre`: conecta JSX con una clase del archivo CSS modular.
 *
 * Flujo del formulario:
 * 1. La persona escribe o selecciona datos.
 * 2. `handleChange` actualiza `form`.
 * 3. `handleSubmit` valida fecha y horario.
 * 4. La solicitud se guarda localmente y se prepara un mensaje.
 * 5. El navegador abre WhatsApp con la informacion codificada en la URL.
 */
import { useMemo, useState } from 'react';
import { getRandomPoster, getRandomPosterSet } from '../../data/posterAssets';
import { WHATSAPP_NUMBER } from '../../constants/contact';
import styles from './ClassesSection.module.css';

// Numero de WhatsApp en formato internacional, sin +, espacios ni guiones.

// Nombre con el que el navegador guarda las solicitudes en localStorage.
const REQUESTS_STORAGE_KEY = 'academia-atelier-class-requests';

// Horarios de lunes a viernes. Cada posicion de inicio corresponde a una
// posicion de salida; la validacion tambien impide elegir una salida anterior.
const WEEKDAY_START_TIMES = ['07:00', '08:00', '09:30', '10:30', '14:00', '15:00', '16:30', '17:30', '19:00', '20:00'];
const WEEKDAY_END_TIMES = ['08:00', '09:00', '10:30', '11:30', '15:00', '16:00', '17:30', '18:30', '20:00', '21:00'];

// Los sabados tienen un horario diferente y el domingo no ofrece horarios.
const SATURDAY_START_TIMES = ['07:00', '08:00', '09:30', '10:30', '14:00', '15:00', '16:30', '17:30'];
const SATURDAY_END_TIMES = ['08:00', '09:00', '10:30', '11:30', '15:00', '16:00', '17:30', '18:30'];

// Este objeto representa todos los datos que controla el formulario.
// Para agregar un nuevo campo, primero agregalo aqui y despues crea su label
// e input en el JSX del formulario.
const initialForm = {
  name: '',
  whatsapp: '',
  email: '',
  date: '',
  startTime: '',
  endTime: '',
  classType: '',
  students: '1',
  goals: '',
  observations: '',
};

// Devuelve la fecha actual en el formato que necesita un input type="date":
// AAAA-MM-DD. Tambien se usa para impedir reservar fechas anteriores a hoy.
function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convierte una fecha escrita como AAAA-MM-DD en un objeto Date de JavaScript.
// Los meses de Date empiezan en cero, por eso se resta 1 al mes.
function getDateParts(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Convierte una hora interna como "14:00" a un texto legible como "2:00 p. m.".
// El valor interno sigue siendo de 24 horas para que las comparaciones sean fiables.
function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'p. m.' : 'a. m.';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

// Decide que horas de inicio aparecen segun el dia escogido.
// En la fecha de hoy elimina las horas que ya pasaron.
function getAvailableStartTimes(date) {
  if (!date) return [];

  const now = new Date();
  const today = getToday();
  const dayOfWeek = getDateParts(date).getDay();
  const startTimes = dayOfWeek === 0
    ? []
    : dayOfWeek === 6 ? SATURDAY_START_TIMES : WEEKDAY_START_TIMES;

  return startTimes.filter((time) => {
    if (date !== today) return true;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes > now.getHours() * 60 + now.getMinutes();
  });
}

// Devuelve las horas de salida posteriores a la hora de inicio seleccionada.
function getAvailableEndTimes(date, startTime) {
  if (!date || !startTime) return [];

  const dayOfWeek = getDateParts(date).getDay();
  const endTimes = dayOfWeek === 6 ? SATURDAY_END_TIMES : WEEKDAY_END_TIMES;
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const startValue = startHours * 60 + startMinutes;

  return endTimes.filter((time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes > startValue;
  });
}

// Forma una linea del mensaje de WhatsApp y evita dejar un valor vacio.
function formatField(label, value) {
  return `${label}: ${value || 'No indicado'}`;
}

/**
 * Seccion de clases y solicitud de agendamiento.
 *
 * `showForm` permite mostrar el cuestionario en la pagina de clases.
 * `showFaq` permite reutilizar solo las preguntas frecuentes en otra vista.
 * `compactFaq` elimina el espacio exterior cuando la FAQ cierra la home.
 * `showIntroduction` y `showCta` controlan los bloques editoriales de clases.
 * `isHero` muestra el llamado a inscribirse en la portada y oculta el
 * cuestionario. Ambos valores tienen `false` o `true` por defecto para que el
 * componente tambien funcione si se usa sin props.
 *
 * Mientras el backend no esta conectado, localStorage simula el registro
 * persistente con estado SOLICITADA y fecha de creacion.
 */
function ClassesSection({
  isHero = false,
  compactFaq = false,
  showCta = true,
  showFaq = true,
  showForm = true,
  showIntroduction = true,
}) {
  // `form` contiene los valores actuales de todos los campos.
  // `setForm` provoca que React vuelva a dibujar la interfaz con esos valores.
  const [form, setForm] = useState(initialForm);

  // Mensaje temporal para errores de horario o confirmacion de envio.
  const [feedback, setFeedback] = useState('');

  // Estas listas alimentan los dos select de horario.
  // Se recalculan cuando cambia la fecha o la hora de inicio.
  const availableStartTimes = useMemo(
    () => getAvailableStartTimes(form.date),
    [form.date],
  );
  const availableEndTimes = useMemo(
    () => getAvailableEndTimes(form.date, form.startTime),
    [form.date, form.startTime],
  );

  // Se ejecuta cada vez que cambia cualquier input del formulario.
  // `target.name` identifica el campo y `target.value` contiene su nuevo valor.
  const handleChange = ({ target }) => {
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [target.name]: target.value };
      // Al cambiar la fecha, las horas anteriores ya no son confiables.
      // Se limpian para obligar a escogerlas de nuevo.
      if (target.name === 'date') {
        nextForm.startTime = '';
        nextForm.endTime = '';
      }

      // La hora de salida depende de la hora de inicio.
      if (target.name === 'startTime') {
        nextForm.endTime = '';
      }
      return nextForm;
    });
    setFeedback('');
  };

  // Se ejecuta al presionar "Concretar clase".
  const handleSubmit = (event) => {
    // Evita que el navegador recargue la pagina al enviar el formulario.
    event.preventDefault();

    // La fecha debe ser hoy o posterior y no puede caer en domingo.
    const selectedDate = getDateParts(form.date);
    const today = getDateParts(getToday());
    const isValidDate = form.date && selectedDate >= today && selectedDate.getDay() !== 0;
    const isValidTime = availableStartTimes.includes(form.startTime)
      && availableEndTimes.includes(form.endTime);

    // Si el horario no es valido, mostramos el mensaje y no continuamos.
    if (!isValidDate || !isValidTime) {
      setFeedback('Selecciona un día y horario disponible para agendar tu clase.');
      return;
    }

    // Esta es la estructura interna de una solicitud. Si mas adelante se
    // conecta una API, este objeto puede enviarse como JSON al backend.
    const request = {
      id: `clase-${Date.now()}`,
      client: {
        name: form.name,
        whatsapp: form.whatsapp,
        email: form.email,
      },
      date: form.date,
      time: `${form.startTime} - ${form.endTime}`,
      startTime: form.startTime,
      endTime: form.endTime,
      classType: form.classType,
      students: Number(form.students),
      description: form.goals,
      observations: form.observations,
      createdAt: new Date().toISOString(),
      status: 'SOLICITADA',
    };

    // localStorage pertenece al navegador. El try/catch evita que un bloqueo
    // del almacenamiento impida abrir WhatsApp.
    try {
      const savedRequests = JSON.parse(
        localStorage.getItem(REQUESTS_STORAGE_KEY) || '[]',
      );
      localStorage.setItem(
        REQUESTS_STORAGE_KEY,
        JSON.stringify([...savedRequests, request]),
      );
    } catch {
      // El enlace a WhatsApp sigue siendo útil aunque el almacenamiento local esté bloqueado.
    }

    // Este arreglo se convierte en un mensaje de varias lineas para WhatsApp.
    // Para cambiar el texto inicial, modifica la primera cadena.
    const message = [
      'Hola, quiero solicitar una clase en Academia Atelier.',
      '',
      formatField('Nombre', form.name),
      formatField('WhatsApp', form.whatsapp),
      formatField('Correo', form.email),
      formatField('Fecha deseada', form.date),
      formatField('Hora de entrada', formatTime(form.startTime)),
      formatField('Hora de salida', formatTime(form.endTime)),
      formatField('Tipo de clase', form.classType),
      formatField('Número de estudiantes', form.students),
      formatField('Qué busco aprender', form.goals),
      formatField('Observaciones', form.observations),
    ].join('\n');

    // `encodeURIComponent` convierte espacios y saltos de linea en una URL
    // valida. Al asignar window.location, el navegador abre WhatsApp.
    setFeedback('Solicitud preparada. Abriendo WhatsApp...');
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    // `section` es el contenedor visual de toda la seccion.
    // Las clases cambian automaticamente segun `isHero`.
    <section className={`${styles.classes} ${isHero ? styles.heroClasses : ''}`} id="classes">
      {isHero && <div className={styles.enrollmentHero}>
        <div className={styles.enrollmentCopy}>
          <p className={styles.eyebrow}>Clases particulares de arte</p>
          <h1>¡Trabajemos juntos!</h1>
          <p>
            Quizás quieras aprender, explorar una nueva técnica o convertir una idea 
            que tienes en una obra única. Cuéntame qué tienes en mente y encontremos 
            juntos la mejor manera de hacerlo realidad..
          </p>
          <div className={styles.enrollmentActions}>
            <a
              className={styles.enrollmentButton}
              href="#class-request-form"
            >
              Quiero inscribirme a una clase
            </a>
            <a className={styles.enrollmentButton} href="#custom-order-form">
              Quiero cotizar un encargo personalizado
            </a>
          </div>
        </div>
        <div className={styles.imageCollage} aria-label="Momentos de una clase de arte">
          {getRandomPosterSet(3).map((poster, index) => (
            <img
              key={`${poster}-${index}`}
              alt={index === 0 ? 'Pinceles y pintura sobre una mesa de trabajo' : index === 1 ? 'Manos trabajando sobre un lienzo' : 'Detalle de una paleta con colores de pintura'}
              className={index === 0 ? styles.collageImageOne : index === 1 ? styles.collageImageTwo : styles.collageImageThree}
              src={poster}
            />
          ))}
        </div>
      </div>}

      {/* En la portada se oculta esta introduccion y queda visible en #classes. */}
      {!isHero && showIntroduction && <div className={styles.introduction}>
        <div className={styles.introCopy}>
          <p className={styles.eyebrow}>Aprender haciendo</p>
          <h2>Una clase también puede ser una forma de mirar.</h2>
          <p>
            Explora el color, la materia y el gesto en sesiones pensadas para
            acompañar tu proceso, tengas experiencia previa o estés comenzando.
          </p>
          <div className={styles.learningList}>
            <span>01 <strong>Técnicas pictóricas</strong></span>
            <span>02 <strong>Composición y color</strong></span>
            <span>03 <strong>Proceso creativo</strong></span>
          </div>
        </div>
        <div className={styles.imageFrame}>
          <img
            alt="Persona aprendiendo técnicas de pintura en un taller artístico"
            className={styles.classImage}
            loading="lazy"
            src={getRandomPoster()}
          />
          <span aria-hidden="true" className={styles.imageCaption}>Taller / práctica / presencia</span>
        </div>
      </div>}

      {/* Preguntas frecuentes: solo aparecen en la pagina completa de clases. */}
      {!isHero && showFaq && <section
        aria-labelledby="classes-faq-title"
        className={`${styles.faq} ${compactFaq ? styles.compactFaq : ''}`}
      >
        <div>
          <p className={styles.eyebrow}>Preguntas frecuentes</p>
          <h2 id="classes-faq-title">Antes de comenzar</h2>
        </div>
        <div className={styles.faqList}>
          <details>
            <summary>¿Necesito experiencia previa para las clases?</summary>
            <p>No. Las sesiones se adaptan a tu nivel y al objetivo que quieras explorar.</p>
          </details>
          <details>
            <summary>¿Las clases son individuales?</summary>
            <p>Se pueden agendar de forma individual o para grupos pequeños. En Atelier priorizamos un enfoque personalizado para garantizar la calidad de cada clase.</p>
          </details>
          <details>
            <summary>¿Qué materiales debo llevar?</summary>
            <p>Al confirmar la clase recibirás una orientación sobre materiales. Puedes traer los tuyos y complementarlos con los que te proporcionaremos en cada clase.</p>
          </details>
          <details>
            <summary>¿Cómo confirmo el horario?</summary>
            <p>La solicitud se revisa por WhatsApp y allí se confirma la disponibilidad y los detalles de la sesión.</p>
          </details>
        </div>
      </section>}

      {/* En la vista completa este enlace lleva hasta el formulario. */}
      {!isHero && showCta && <div className={styles.ctaRow}>
        <a className={styles.cta} href={showForm ? '#class-request-form' : '#classes'}>
          Agendar una clase <span aria-hidden="true">&#8594;</span>
        </a>
      </div>}

      {/*
       * Area principal de solicitud. Si quieres cambiar su posicion o ancho,
      * busca `.formArea` en ClassesSection.module.css.
       */}
      {!isHero && showForm && <div className={styles.formArea} id="class-request-form">
        {/* Columna izquierda: textos de apoyo del formulario. */}
        <div className={styles.formHeading}>
          <p className={styles.eyebrow}>Tu próximo momento para crear</p>
          <h2>Reserva una clase para volver a mirar con intención.</h2>
          <p>
            Elige un horario y cuéntame qué quieres aprender. Diseñaremos una
            sesión a tu medida y confirmaremos los detalles contigo por WhatsApp.
          </p>
        </div>

        {/*
         * Cada label contiene el texto visible y un campo editable.
         * Para agregar una pregunta, copia un label, cambia `name` y agrega
         * la misma propiedad en `initialForm`.
         */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Nombre completo
            <input name="name" onChange={handleChange} required type="text" value={form.name} />
          </label>
          <label>
            Número de WhatsApp
            <input
              name="whatsapp"
              onChange={handleChange}
              pattern="[0-9 +()-]{7,}"
              placeholder="321 725 7261"
              required
              type="tel"
              value={form.whatsapp}
            />
          </label>
          <label>
            Correo electrónico
            <input name="email" onChange={handleChange} required type="email" value={form.email} />
          </label>
          <label>
            Fecha deseada
            <input aria-describedby="schedule-help" min={getToday()} name="date" onChange={handleChange} required type="date" value={form.date} />
          </label>
          <label>
            Hora de entrada
            <select name="startTime" onChange={handleChange} required value={form.startTime}>
              <option value="">Selecciona una hora</option>
              {availableStartTimes.map((time) => (
                <option key={time} value={time}>{formatTime(time)}</option>
              ))}
            </select>
          </label>
          <label>
            Hora de salida
            <select name="endTime" onChange={handleChange} required value={form.endTime}>
              <option value="">Selecciona una hora</option>
              {availableEndTimes.map((time) => (
                <option key={time} value={time}>{formatTime(time)}</option>
              ))}
            </select>
          </label>
          <label>
            Tipo de clase
            <select name="classType" onChange={handleChange} required value={form.classType}>
              <option value="">Selecciona una opción</option>
              <option value="Iniciación a la pintura">Iniciación a la pintura</option>
              <option value="Técnica y color">Técnica y color</option>
              <option value="Clase personalizada">Clase personalizada</option>
            </select>
          </label>
          <label>
            Número de estudiantes
            <input min="1" name="students" onChange={handleChange} required type="number" value={form.students} />
          </label>

          {/* Ayuda visible sobre los horarios atendidos. */}
          <p className={`${styles.fullField} ${styles.scheduleHelp}`} id="schedule-help">
            Atención de lunes a viernes de 7:00 a. m. a 9:00 p. m. y sábados hasta las 6:30 p. m.
          </p>
          <label className={styles.fullField}>
            ¿Qué te gustaría aprender?
            <textarea name="goals" onChange={handleChange} required rows="3" value={form.goals} />
          </label>
          <label className={styles.fullField}>
            ¿Alguna duda?   
            <textarea name="observations" onChange={handleChange} rows="3" value={form.observations} />
          </label>

          {/* Zona final: mensaje de estado y boton que envia la solicitud. */}
          <div className={styles.submitRow}>
            <p aria-live="polite" className={styles.feedback}>{feedback}</p>
            <button className={styles.submit} type="submit">Concretar clase</button>
          </div>
        </form>
      </div>}
    </section>
  );
}

export default ClassesSection;
