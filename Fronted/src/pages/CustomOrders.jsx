import { getRandomPosterSet } from '../data/posterAssets';
import styles from './CustomOrders.module.css';
import CustomOrderForm from '../components/CustomOrderForm/CustomOrderForm';


const processSteps = [
  {
    number: '01',
    title: 'Cuéntanos tu idea',
    text: 'Comparte la historia, referencia o sensación que quieres convertir en una pieza.',
  },
  {
    number: '02',
    title: 'Definamos la propuesta',
    text: 'Acordamos concepto, formato, tecnica, materiales, tiempos y una estimación clara.',
  },
  {
    number: '03',
    title: 'Empezamos a trabajar',
    text: 'La pieza toma forma en el taller con avances demostrablesy conversaciones durante el proceso para garantizar tu satisfaccion.',
  },
  {
    number: '04',
    title: 'Entregamos la obra',
    text: 'Coordinamos la entrega de tu obra finalizada, lista para acompañarte por el resto de tu vida.',
  },
];

const details = [
  ['Tipo de obras', 'Piezas abstractas, retratos, paisajes y composiciones creadas a partir de una historia personal.'],
  ['Técnicas', 'Óleo, acrílico, pigmento y técnica mixta, según el lenguaje que mejor sirva a tu visión.'],
  ['Materiales', 'Lienzo y soportes preparados con materiales seleccionados para conservar la textura y el color.'],
  ['Tamaños', 'Formatos pequeños, medianos y de gran escala. El tamaño se define según tu deseo.'],
  ['Tiempos', 'El desarrollo es independiente de cada trabajo, esta sujeto a la complejidad de la obra, disponibilidad de materiales y nuestra agenda.'],
  ['Precio', 'Se calcula según tamaño, técnica, materiales, nivel de detalle, urgencia y condiciones de entrega.'],
];

function CustomOrders({ works = [] }) {
  const [heroPoster] = getRandomPosterSet(1);
  const featuredWork = works[0];
  const featuredImage = featuredWork?.image || featuredWork?.images?.[0] || heroPoster;
  const featuredYear = featuredWork?.published ? String(featuredWork.published).slice(0, 4) : '';
  const worksCount = String(works.length).padStart(2, '0');

  return (
    <main className={styles.page} id="custom-orders">
      <section className={styles.hero} aria-labelledby="custom-orders-title">
        <div>
          <p className={styles.eyebrow}>Encargos personalizados</p>
          <h1 id="custom-orders-title">Una obra que comienza con tu idea.</h1>
          <p className={styles.lead}>
            Cada encargo es una conversación. Conozcamos lo que quieres expresar,
            construyamos una propuesta y llevémosla al lienzo con calma y atención.
          </p>
        </div>
        <figure className={styles.heroFigure}>
          <img
            alt="Detalle de una pintura abstracta creada en el taller"
            src={heroPoster}
          />
          <figcaption>Del primer intercambio a la pieza final</figcaption>
        </figure>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <p className={styles.sectionLabel}>El proceso</p>
        <h2 id="process-title" className="visually-hidden">Cómo se crea tu obra personalizada</h2>
        <div className={styles.processGrid}>
          {processSteps.map((step) => (
            <article className={styles.processStep} key={step.number}>
              <span className={styles.number}>{step.number}</span>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.details} aria-labelledby="details-title">
        <div className={styles.detailsIntro}>
          <p className={styles.eyebrow}>Antes de comenzar</p>
          <h2 id="details-title">Todo lo que necesitas saber.</h2>
          <p>
            Definir estos aspectos desde el inicio permite que la propuesta sea
            honesta, viable y fiel a lo que estás buscando.
          </p>
        </div>
        <ul className={styles.detailList}>
          {details.map(([label, value]) => (
            <li key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.examples} aria-labelledby="examples-title">
        <div className={styles.examplesMeta}>
          <p className={styles.eyebrow}>Trabajos anteriores</p>
          <span aria-label={`Obra 1 de ${works.length}`} className={styles.examplesCount}>
            01 / {worksCount}
          </span>
        </div>
        <div className={styles.examplesCopy}>
          <h2 id="examples-title">
            <span>Piezas con una</span>
            <span>historia propia.</span>
          </h2>
          <p>Una selección de lenguajes, escalas y atmósferas.</p>
          <span aria-hidden="true" className={styles.examplesRule} />
          <a className={styles.examplesCta} href="#catalog">
            Descubrir las obras <span aria-hidden="true">→</span>
          </a>
        </div>
        <a
          aria-label={`Descubrir la galería. Obra destacada: ${featuredWork?.name || 'obra de arte de 11-10 Atelier academia de arte'}`}
          className={styles.examplesArtwork}
          href="#catalog"
        >
          <img
            alt={featuredWork?.name || featuredWork?.alt || 'Obra de arte de 11-10 Atelier academia de arte'}
            src={featuredImage}
          />
          <span className={styles.examplesArtworkMeta}>
            <span>{featuredWork?.technique || 'Obra de la colección'}</span>
            {featuredYear && <span>{featuredYear}</span>}
          </span>
        </a>
      </section>

      <CustomOrderForm />
    </main>
  );
}

export default CustomOrders;
