import { useCallback, useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import styles from './ProductCarousel.module.css';

/**
 * Carrusel horizontal reutilizable para obras o productos del catálogo.
 *
 * @param {object} props
 * @param {string} [props.title] - Título de la colección.
 * @param {Array<object>} props.products - Productos que serán representados por ProductCard.
 * @param {string} [props.label] - Etiqueta accesible de la región del carrusel.
 * @param {function} [props.onProductAction] - Callback opcional para personalizar la acción de una tarjeta.
 *
 * Cada producto necesita como mínimo `id`, `name` o `nombre`, `image` o `imagen`,
 * y `price` o `precio`. También puede incluir `description`, `availability`,
 * `technique`, `alt` y `href`; los campos adicionales se conservan en el objeto
 * y pueden utilizarse en ProductCard cuando crezca el catálogo.
 *
 * La navegación se apoya en scroll nativo en lugar de una librería: así el gesto
 * táctil y el teclado siguen funcionando dentro del mismo contenedor, mientras
 * los botones ofrecen una alternativa clara para escritorio.
 */
function ProductCarousel({
  title,
  products = [],
  label = 'Carrusel de productos',
  onProductAction,
}) {
  const viewportRef = useRef(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateNavigationState = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    setCanScrollPrevious(viewport.scrollLeft > 1);
    setCanScrollNext(viewport.scrollLeft < maxScrollLeft - 1);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    updateNavigationState();
    viewport.addEventListener('scroll', updateNavigationState, { passive: true });
    window.addEventListener('resize', updateNavigationState);

    const resizeObserver = new ResizeObserver(updateNavigationState);
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', updateNavigationState);
      window.removeEventListener('resize', updateNavigationState);
      resizeObserver.disconnect();
    };
  }, [products.length, updateNavigationState]);

  const scrollByCard = (direction) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const card = viewport.querySelector('[data-product-card]');
    const gap = Number.parseFloat(getComputedStyle(viewport).columnGap) || 0;
    const distance = (card?.getBoundingClientRect().width || viewport.clientWidth) + gap;

    viewport.scrollBy({
      behavior: 'smooth',
      left: direction * distance,
    });

    // El scroll suave puede terminar después del último evento observable en
    // algunos navegadores; esta lectura final mantiene los controles sincronizados.
    window.setTimeout(updateNavigationState, 450);
  };

  if (!products.length) {
    return null;
  }

  return (
    <section aria-label={label} className={styles.carousel}>
      <div className={styles.heading}>
        {title && <h2>{title}</h2>}
        <div className={styles.controls}>
          <button
            aria-label="Ver productos anteriores"
            className={styles.control}
            disabled={!canScrollPrevious}
            onClick={() => scrollByCard(-1)}
            type="button"
          >
            <span aria-hidden="true">&#8592;</span>
          </button>
          <button
            aria-label="Ver más productos"
            className={styles.control}
            disabled={!canScrollNext}
            onClick={() => scrollByCard(1)}
            type="button"
          >
            <span aria-hidden="true">&#8594;</span>
          </button>
        </div>
      </div>
      <div className={styles.viewport} ref={viewportRef} tabIndex="0">
        <div className={styles.track}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              onAction={onProductAction}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductCarousel;
