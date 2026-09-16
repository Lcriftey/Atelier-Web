import Navigation from '../Navigation/Navigation';
import logo from '../../../Assets/logo_Atelier.svg';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <a aria-label="Academia Atelier, inicio" className={styles.brand} href="/">
        <img alt="Logo de Academia Atelier" className={styles.logo} src={logo} />
      </a>
      <Navigation />
    </header>
  );
}

export default Header;
