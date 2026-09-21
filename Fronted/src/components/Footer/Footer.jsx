import logo from '../../../Assets/logo_Atelier.svg';
import styles from './Footer.module.css';

const navigation = [
  { href: '#home', label: 'Inicio' },
  { href: '#catalog', label: 'Obras' },
  { href: '#gallery', label: 'Galería' },
  { href: '#classes', label: 'Clases' },
  { href: '#about', label: 'El artista' },
  { href: '#custom-orders', label: 'Encargos' },
];

const socialLinks = [
  { href: 'https://www.instagram.com', label: 'Instagram' },
  { href: 'https://www.pinterest.com', label: 'Pinterest' },
  { href: 'https://www.facebook.com', label: 'Facebook' },
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
            <a href="https://wa.me/573217257261?text=Hola%20Academia%20Atelier%2C%20me%20gustar%C3%ADa%20consultar%20sobre%20una%20obra%20o%20una%20clase." target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>

        <div className={styles.column}>
          <h3>Redes</h3>
          <div className={styles.socialList}>
            {socialLinks.map((social) => (
              <a href={social.href} key={social.label} rel="noreferrer" target="_blank">
                {social.label}
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
