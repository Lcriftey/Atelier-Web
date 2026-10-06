import { useEffect, useState } from 'react';
import Navigation from '../Navigation/Navigation';
import logo from '../../../Assets/logo_Atelier.svg';
import styles from './Header.module.css';

function Header() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let previousScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 12 || currentScrollY < previousScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > previousScrollY) {
        setIsVisible(false);
      }

      previousScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isVisible ? styles.headerVisible : styles.headerHidden}`}>
      <a aria-label="11-10 Atelier academia de arte, inicio" className={styles.brand} href="/">
        <img alt="Logo de 11-10 Atelier academia de arte" className={styles.logo} src={logo} />
      </a>
      <Navigation />
    </header>
  );
}

export default Header;
