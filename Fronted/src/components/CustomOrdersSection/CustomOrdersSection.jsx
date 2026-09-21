import styles from './CustomOrdersSection.module.css';

function CustomOrdersSection() {
  return (
    <section className={styles.section} aria-labelledby="custom-orders-heading">
      <div className={styles.imageWrap}>
        <img
          alt="Obra personalizada en proceso dentro del taller"
          src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=88"
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
