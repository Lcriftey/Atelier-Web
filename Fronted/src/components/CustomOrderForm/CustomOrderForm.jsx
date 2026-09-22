import { useState } from 'react';
import { WHATSAPP_NUMBER } from '../../constants/contact';
import styles from './CustomOrderForm.module.css';

const initialForm = {
  name: '',
  whatsapp: '',
  email: '',
  idea: '',
};

function getFieldError(name, value) {
  if (name === 'name' && !value.trim()) {
    return 'Este campo es necesario para continuar.';
  }

  if (name === 'idea' && !value.trim()) {
    return 'Cuéntame brevemente qué tienes en mente.';
  }

  if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Revisa el formato del correo electrónico.';
  }

  return '';
}

function CustomOrderForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');

  const handleChange = ({ target }) => {
    setForm((currentForm) => ({ ...currentForm, [target.name]: target.value }));
    setErrors((currentErrors) => ({ ...currentErrors, [target.name]: '' }));
    setStatus('');
    setFallbackUrl('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = Object.fromEntries(
      Object.entries(form).map(([name, value]) => [name, getFieldError(name, value)]),
    );
    const hasErrors = Object.values(nextErrors).some(Boolean);

    setErrors((currentErrors) => ({ ...currentErrors, ...nextErrors }));
    setFallbackUrl('');

    if (hasErrors) {
      setStatus('Revisa los campos marcados antes de continuar.');
      return;
    }

    const message = [
      `Hola, soy ${form.name}.`,
      '',
      'Me gustaría conversar sobre una obra personalizada.',
      '',
      'Esta es la idea que tengo:',
      form.idea,
      '',
      form.whatsapp ? `Mi número de WhatsApp es: ${form.whatsapp}` : '',
      form.email ? `Mi correo es: ${form.email}` : '',
    ].filter(Boolean).join('\n');
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    setStatus('Preparando tu mensaje...');
    setFallbackUrl(whatsappUrl);
    const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    if (!whatsappWindow) {
      setStatus('No pudimos abrir WhatsApp automáticamente. Puedes continuar desde este enlace.');
    } else {
      setStatus('Mensaje preparado. Puedes continuar la conversación en WhatsApp.');
    }
  };

  return (
    <section aria-labelledby="custom-order-form-title" className={styles.formSection} id="custom-order-form">
      <div className={styles.formIntro}>
        <p className={styles.eyebrow}>Primer paso</p>
        <h2 id="custom-order-form-title">Cuéntame qué tienes en mente.</h2>
        <p>
          No necesitas tenerlo todo definido. Comparte una idea, una sensación
          o una referencia y encontraremos juntos la mejor manera de convertirla
          en una obra.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fieldGrid}>
          <label className={styles.field} htmlFor="custom-order-name">
            Nombre
            <input
              aria-describedby={errors.name ? 'custom-order-name-error' : undefined}
              aria-invalid={Boolean(errors.name)}
              id="custom-order-name"
              name="name"
              onChange={handleChange}
              placeholder="¿Cómo te gustaría que te llamara?"
              type="text"
              value={form.name}
            />
            {errors.name && <span className={styles.error} id="custom-order-name-error">{errors.name}</span>}
          </label>

          <label className={styles.field} htmlFor="custom-order-whatsapp">
            WhatsApp
            <input
              aria-describedby={errors.whatsapp ? 'custom-order-whatsapp-error' : undefined}
              aria-invalid={Boolean(errors.whatsapp)}
              id="custom-order-whatsapp"
              name="whatsapp"
              onChange={handleChange}
              placeholder="Tu número de WhatsApp"
              type="tel"
              value={form.whatsapp}
            />
            {errors.whatsapp && <span className={styles.error} id="custom-order-whatsapp-error">{errors.whatsapp}</span>}
          </label>
        </div>

        <label className={styles.field} htmlFor="custom-order-email">
          Correo electrónico <span className={styles.optional}>(opcional)</span>
          <input
            aria-describedby={errors.email ? 'custom-order-email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            id="custom-order-email"
            name="email"
            onChange={handleChange}
            placeholder="Tu correo, si quieres compartirlo"
            type="email"
            value={form.email}
          />
          {errors.email && <span className={styles.error} id="custom-order-email-error">{errors.email}</span>}
        </label>

        <label className={styles.field} htmlFor="custom-order-idea">
          ¿Qué tienes en mente?
          <textarea
            aria-describedby={errors.idea ? 'custom-order-idea-error' : undefined}
            aria-invalid={Boolean(errors.idea)}
            id="custom-order-idea"
            name="idea"
            onChange={handleChange}
            placeholder="Cuéntame brevemente qué te gustaría crear, para quién es, qué te gustaría representar o cualquier detalle que quieras compartir..."
            rows="7"
            value={form.idea}
          />
          {errors.idea && <span className={styles.error} id="custom-order-idea-error">{errors.idea}</span>}
        </label>

        <div className={styles.submitArea}>
          <p aria-live="polite" className={styles.status}>{status}</p>
          <button className={styles.submit} disabled={Boolean(status === 'Preparando tu mensaje...')} type="submit">
            {status === 'Preparando tu mensaje...' ? 'Preparando...' : 'Enviar mi idea'}
          </button>
        </div>
        {fallbackUrl && status.startsWith('No pudimos') && (
          <a className={styles.fallback} href={fallbackUrl} rel="noreferrer" target="_blank">
            Abrir WhatsApp manualmente
          </a>
        )}
      </form>
    </section>
  );
}

export default CustomOrderForm;
