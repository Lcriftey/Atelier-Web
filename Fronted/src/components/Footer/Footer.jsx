import logo from '../../../Assets/logo_Atelier.svg';
import styles from './Footer.module.css';
import { WHATSAPP_NUMBER } from '../../constants/contact';

const navigation = [
  { href: '#home', label: 'Inicio' },
  { href: '#catalog', label: 'Obras' },
  { href: '#classes', label: 'Clases' },
  { href: '#about', label: 'El artista' },
  { href: '#custom-orders', label: 'Encargos' },
];

const socialLinks = [
  {
    href: 'https://www.instagram.com/11_10_atelier/',
    label: 'Instagram',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <rect height="17" rx="5" stroke="currentColor" strokeWidth="2" width="17" x="3.5" y="3.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.6" cy="6.7" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: 'https://www.patreon.com/cw/JordyArtista?utm_campaign=creatorshare_creator&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAafGpTz4X6DVB1IvSVW-eYwGwvq79wYeKL9wBxD9Z0v1lxvSU3AhheaElel-EQ_aem_yCBpig7UyKPw7UlC9s5t5A',
    label: 'Patreon',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 3h4v18H4zM15 3a6 6 0 0 1 0 12h-4V3h4z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: 'https://www.facebook.com',
    label: 'Facebook',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M14.2 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H8v3.1h2.8v8h3.4z" fill="currentColor" />
      </svg>
    ),
  },
];

function Footer() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <a aria-label="Academia Atelier, inicio" className={styles.brand} href="#home">
            <img alt="Logo de Academia Atelier" className={styles.logo} src={logo} />
            <span>Academia Atelier</span>
          </a>
          <p>
            Arte contemporáneo, clases y obras originales pensadas para espacios con identidad.
          </p>
        </div>

        <div className={styles.column}>
          <h3>Navegación</h3>
          <nav aria-label="Navegación del footer" className={styles.navList}>
            {navigation.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.column}>
          <h3>Contacto</h3>
          <div className={styles.contactList}>
            <a href="mailto:hola@academiaatelier.com">hola@academiaatelier.com</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20Academia%20Atelier%2C%20me%20gustar%C3%ADa%20consultar%20sobre%20una%20obra%20o%20una%20clase.`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>

        <div className={styles.column}>
          <h3>Redes</h3>
          <div className={styles.socialList}>
            {socialLinks.map((social) => (
              <a aria-label={social.label} href={social.href} key={social.label} rel="noreferrer" target="_blank" title={social.label}>
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.meta}>
        <span>© 2026 Academia Atelier</span>
        <span>Todos los derechos reservados</span>
      </div>
    </footer>
  );
}

export default Footer;
