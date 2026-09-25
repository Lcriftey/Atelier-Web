import { getRandomPoster } from '../../data/posterAssets';
import styles from './CustomOrdersSection.module.css';

function CustomOrdersSection() {
  const poster = getRandomPoster();

  return (
    <section className={styles.section} aria-labelledby="custom-orders-heading">
      <div className={styles.imageWrap}>
        <img
          alt="Obra personalizada en proceso dentro del taller"
          src={poster}
        />
        <span className={styles.imageLabel}>Una obra hecha para ti</span>
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Encargos personalizados</p>
        <h2 id="custom-orders-heading">Una idea puede convertirse en una obra.</h2>
        <p>
          Trabajemos juntos para crear una pieza que tenga tu historia, tu espacio
          y la sensibilidad que buscas. Te acompaño desde el primer boceto hasta
          la entrega final.
        </p>
        <a className={styles.action} href="#custom-orders">
          Conocer el proceso <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}

export default CustomOrdersSection;
