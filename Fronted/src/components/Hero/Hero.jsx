import Button from '../Button/Button';
import { getRandomPosterSet } from '../../data/posterAssets';
import styles from './Hero.module.css';

function Hero() {
  const [mainPoster, secondaryPoster] = getRandomPosterSet(2);

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
          src={mainPoster}
        />
        <img
          alt="Artista pintando frente a un lienzo"
          className={styles.artistPhoto}
          src={secondaryPoster}
        />
        <span className={styles.palette} aria-hidden="true" />
      </div>
    </section>
  );
}

export default Hero;
