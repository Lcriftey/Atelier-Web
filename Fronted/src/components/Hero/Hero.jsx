import Button from '../Button/Button';
import styles from './Hero.module.css';

function Hero() {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Academia Atelier / Escuela de arte</p>
        <h1>Aprende a mirar. Atrévete a crear.</h1>
        <p className={styles.description}>
          En nuestra academia encontrarás cursos diseñados para aprender a tu
          ritmo, desarrollar nuevas habilidades y alcanzar tus objetivos.
        </p>
        <div className={styles.actions}>
          <Button href="#catalog">Explorar la galería</Button>
          <a className={styles.secondaryAction} href="#about">
            Conocer al artista <span aria-hidden="true">&#8594;</span>
          </a>
        </div>
      </div>
      <div className={styles.artwork} aria-label="Composición de obras artísticas" role="img">
        <img
          alt="Pintura abstracta en proceso"
          className={styles.painting}
          src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=85"
        />
        <img
          alt="Artista pintando frente a un lienzo"
          className={styles.artistPhoto}
          src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=700&q=85"
        />
        <span className={styles.palette} aria-hidden="true" />
      </div>
    </section>
  );
}

export default Hero;
