import ProductCard from '../ProductCarousel/ProductCard';
import styles from './CatalogView.module.css';

function CatalogView({ products }) {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Colección disponible</p>
        <h1>Galería</h1>
        <p className={styles.lead}>
          Una selección de piezas originales, reunidas para ser contempladas con calma.
        </p>
      </header>
      <section aria-label="Galería de obras" className={styles.catalogGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}

export default CatalogView;
