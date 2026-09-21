import { useEffect, useState } from 'react';
import styles from './ArtworkDetail.module.css';

function ArtworkDetail({ product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const images = product.images || [product.image];
  const activeImage = images[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
    setIsAdded(false);
  }, [product.id]);

  const move = (direction) => {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  };

  return (
    <main className={styles.page}>
      <div className={styles.backRow}>
        <a href="#catalog">← Volver a obras</a>
        <span>Obra original / {product.technique}</span>
      </div>
      <div className={styles.layout}>
        <section aria-label={`Imágenes de ${product.name}`} className={styles.visualArea}>
          <div className={styles.mainImageWrap}>
            <img alt={product.alt} className={styles.mainImage} src={activeImage} />
            {images.length > 1 && (
              <div className={styles.imageControls}>
                <button aria-label="Imagen anterior" onClick={() => move(-1)} type="button">←</button>
                <span>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
                <button aria-label="Imagen siguiente" onClick={() => move(1)} type="button">→</button>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div aria-label="Seleccionar imagen" className={styles.thumbnails}>
              {images.map((image, index) => (
                <button
                  aria-label={`Ver imagen ${index + 1}`}
                  className={index === activeIndex ? styles.thumbnailActive : ''}
                  key={image}
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  <img alt="" src={image} />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className={styles.infoArea}>
          <p className={styles.eyebrow}>{product.technique}</p>
          <h1>{product.name}</h1>
          <div className={styles.priceLine}>
            <p>{product.price}</p>
            <span className={product.availability === 'Disponible' ? styles.available : styles.unavailable}>
              {product.availability}
            </span>
          </div>
          <div className={styles.rule} />
          <p className={styles.artistDescription}>{product.artisticDescription}</p>
          <dl className={styles.details}>
            <div><dt>Técnica</dt><dd>{product.technique}</dd></div>
            <div><dt>Dimensiones</dt><dd>{product.dimensions}</dd></div>
            <div><dt>Publicada</dt><dd>{product.published}</dd></div>
          </dl>
          <p className={styles.technicalDescription}>{product.technicalDescription}</p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#contact">Contactar al artista <span>→</span></a>
            <button className={styles.secondaryAction} onClick={() => setIsAdded(true)} type="button">
              {isAdded ? 'Obra añadida' : 'Añadir al carrito'} <span>{isAdded ? '✓' : '+'}</span>
            </button>
          </div>
          <p className={styles.note}>La compra se coordina directamente con el artista.</p>
        </section>
      </div>
    </main>
  );
}

export default ArtworkDetail;
