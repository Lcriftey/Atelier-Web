import { useMemo, useState } from 'react';
import styles from './ClassesSection.module.css';

const WHATSAPP_NUMBER = '573217257261';
const REQUESTS_STORAGE_KEY = 'academia-atelier-class-requests';
const WEEKDAY_START_TIMES = ['07:00', '08:00', '09:30', '10:30', '14:00', '15:00', '16:30', '17:30', '19:00', '20:00'];
const WEEKDAY_END_TIMES = ['08:00', '09:00', '10:30', '11:30', '15:00', '16:00', '17:30', '18:30', '20:00', '21:00'];
const SATURDAY_START_TIMES = ['07:00', '08:00', '09:30', '10:30', '14:00', '15:00', '16:30', '17:30'];
const SATURDAY_END_TIMES = ['08:00', '09:00', '10:30', '11:30', '15:00', '16:00', '17:30', '18:30'];

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

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateParts(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'p. m.' : 'a. m.';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

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

function formatField(label, value) {
  return `${label}: ${value || 'No indicado'}`;
}

/**
 * Sección de clases y solicitud de agendamiento.
 *
 * El formulario conserva la información con una estructura estable y genera
 * el mismo texto que, en la siguiente etapa, podrá enviarse a una API. Mientras
 * el backend no esté conectado, localStorage simula el registro persistente
 * con estado SOLICITADA y fecha de creación.
 */
function ClassesSection({ showForm = true }) {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState('');
  const availableStartTimes = useMemo(
    () => getAvailableStartTimes(form.date),
    [form.date],
  );
  const availableEndTimes = useMemo(
    () => getAvailableEndTimes(form.date, form.startTime),
    [form.date, form.startTime],
  );

  const handleChange = ({ target }) => {
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [target.name]: target.value };
      if (target.name === 'date') {
        nextForm.startTime = '';
        nextForm.endTime = '';
      }
      if (target.name === 'startTime') {
        nextForm.endTime = '';
      }
      return nextForm;
    });
    setFeedback('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const selectedDate = getDateParts(form.date);
    const today = getDateParts(getToday());
    const isValidDate = form.date && selectedDate >= today && selectedDate.getDay() !== 0;
    const isValidTime = availableStartTimes.includes(form.startTime)
      && availableEndTimes.includes(form.endTime);

    if (!isValidDate || !isValidTime) {
      setFeedback('Selecciona un día y horario disponible para agendar tu clase.');
      return;
    }

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

    setFeedback('Solicitud preparada. Abriendo WhatsApp...');
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className={styles.classes} id="classes">
      <div className={styles.introduction}>
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
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1100&q=85"
          />
          <span aria-hidden="true" className={styles.imageCaption}>Taller / práctica / presencia</span>
        </div>
      </div>

      {showForm && <section aria-labelledby="classes-faq-title" className={styles.faq}>
        <div>
          <p className={styles.eyebrow}>Preguntas frecuentes</p>
          <h2 id="classes-faq-title">Antes de comenzar</h2>
        </div>
        <div className={styles.faqList}>
          <details>
            <summary>¿Necesito experiencia previa?</summary>
            <p>No. Las sesiones se adaptan a tu nivel y al objetivo que quieras explorar.</p>
          </details>
          <details>
            <summary>¿Las clases son individuales?</summary>
            <p>Se pueden agendar de forma individual o para grupos pequeños de acuerdo con la experiencia buscada.</p>
          </details>
          <details>
            <summary>¿Qué materiales debo llevar?</summary>
            <p>Al confirmar la clase recibirás una orientación sobre materiales. También podemos definirlos juntos.</p>
          </details>
          <details>
            <summary>¿Cómo confirmo el horario?</summary>
            <p>La solicitud se revisa por WhatsApp y allí se confirma la disponibilidad y los detalles de la sesión.</p>
          </details>
        </div>
      </section>}

      <div className={styles.ctaRow}>
        <a className={styles.cta} href={showForm ? '#class-request-form' : '#classes'}>
          Agendar una clase <span aria-hidden="true">&#8594;</span>
        </a>
      </div>

      {showForm && <div className={styles.formArea} id="class-request-form">
        <div className={styles.formHeading}>
          <p className={styles.eyebrow}>Comienza tu proceso</p>
          <h2>Solicita una clase</h2>
          <p>
            Cuéntame qué te gustaría explorar. Llena el formulario y así podré orientarte de mejor manera, continuaremos la comunicacion 
            por WhatsApp para confirmar disponibilidad y detalles.
          </p>
        </div>
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
