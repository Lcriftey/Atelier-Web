import styles from './ProductCarousel.module.css';

/**
 * Representa una obra individual sin conocer de dónde provienen los datos.
 * Mantener esta pieza separada permite añadir acciones como "Agregar al carrito"
 * o badges de colección sin aumentar la complejidad del contenedor del carrusel.
 */
function ProductCard({ product, onAction }) {
  const name = product.name || product.nombre || 'Obra sin título';
  const image = product.image || product.imagen;
  const price = product.price ?? product.precio;
  const href = product.href || product.url || '#catalog';
  const availability = product.availability || product.disponibilidad;
  const description = product.description || product.descripcion;
  const technique = product.technique || product.tecnica;

  const handleAction = () => {
    onAction?.(product);
  };

  return (
    <article className={styles.card} data-product-card>
      <a className={styles.imageLink} href={href} onClick={handleAction}>
        <img alt={product.alt || name} className={styles.image} loading="lazy" src={image} />
      </a>
      <div className={styles.cardContent}>
        <div className={styles.cardMeta}>
          <h3>{name}</h3>
          {availability && <span className={styles.availability}>{availability}</span>}
        </div>
        {technique && <p className={styles.secondary}>{technique}</p>}
        {description && <p className={styles.description}>{description}</p>}
        {price !== undefined && price !== null && (
          <p className={styles.price}>{price}</p>
        )}
        <a className={styles.action} href={href} onClick={handleAction}>
          Ver obra <span aria-hidden="true">&#8594;</span>
        </a>
      </div>
    </article>
  );
}

export default ProductCard;
