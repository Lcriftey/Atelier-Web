import styles from './GalleryView.module.css';

function GalleryView({ products }) {
  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Archivo visual</p>
        <h1>Galería</h1>
        <p>Fragmentos de color, materia y silencio del taller.</p>
      </header>
      <section aria-label="Galería de obras" className={styles.masonry}>
        {products.map((product, index) => (
          <a className={`${styles.item} ${styles[`item${index + 1}`]}`} href={`#obra/${product.id}`} key={product.id}>
            <img alt={product.alt} loading="lazy" src={(product.images || [product.image])[index % (product.images?.length || 1)]} />
            <span>{product.name} <b>↗</b></span>
          </a>
        ))}
      </section>
    </main>
  );
}

export default GalleryView;
