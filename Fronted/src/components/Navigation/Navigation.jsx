import { useState } from 'react';
import styles from './Navigation.module.css';

const links = [
  { href: '#home', label: 'Inicio' },
  { href: '#catalog', label: 'Obras' },
  { href: '#gallery', label: 'Galería' },
  { href: '#classes', label: 'Clases' },
  { href: '#about', label: 'Sobre mí' },
  { href: '#custom-orders', label: 'Encargos' },
  { href: '#contact', label: 'Contacto' },
];

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Navegación principal" className={styles.navigation}>
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        className={styles.menuButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`${styles.links} ${isOpen ? styles.linksOpen : ''}`}>
        {links.map((link) => (
          <a href={link.href} key={link.href} onClick={() => setIsOpen(false)}>
            {link.label}
          </a>
        ))}
        <a aria-label="Ver carrito" className={styles.cart} href="#cart">
          <span aria-hidden="true">♧</span>
        </a>
      </div>
    </nav>
  );
}

export default Navigation;
