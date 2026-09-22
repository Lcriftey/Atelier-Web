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
    title: 'Definimos la propuesta',
    text: 'Acordamos concepto, formato, materiales, tiempos y una estimación clara.',
  },
  {
    number: '03',
    title: 'Se desarrolla la obra',
    text: 'La pieza toma forma en el taller con avances y conversaciones durante el proceso.',
  },
  {
    number: '04',
    title: 'Entrega de la obra',
    text: 'Coordinamos la entrega de una obra preparada para acompañar tu espacio.',
  },
];

const details = [
  ['Tipo de obras', 'Piezas abstractas, retratos, paisajes y composiciones creadas a partir de una historia personal.'],
  ['Técnicas', 'Óleo, acrílico, pigmento y técnica mixta, según el lenguaje que mejor sirva a la propuesta.'],
  ['Materiales', 'Lienzo y soportes preparados con materiales seleccionados para conservar la textura y el color.'],
  ['Tamaños', 'Formatos pequeños, medianos y de gran escala. El tamaño se define según la obra y el espacio.'],
  ['Tiempos', 'El desarrollo suele tomar entre cuatro y ocho semanas, dependiendo de la complejidad y el formato.'],
  ['Precio', 'Se calcula según tamaño, técnica, materiales, nivel de detalle, urgencia y condiciones de entrega.'],
];

function CustomOrders() {
  return (
    <main className={styles.page} id="custom-orders">
      <section className={styles.hero} aria-labelledby="custom-orders-title">
        <div>
          <p className={styles.eyebrow}>Obras personalizadas</p>
          <h1 id="custom-orders-title">Una obra que comienza con tu idea.</h1>
          <p className={styles.lead}>
            Cada encargo es una conversación. Conozcamos lo que quieres expresar,
            construyamos una propuesta y llevémosla al lienzo con calma y atención.
          </p>
        </div>
        <figure className={styles.heroFigure}>
          <img
            alt="Detalle de una pintura abstracta creada en el taller"
            src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=88"
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
        <div className={styles.examplesHeader}>
          <div>
            <p className={styles.eyebrow}>Trabajos anteriores</p>
            <h2 id="examples-title">Piezas con una historia propia.</h2>
          </div>
          <p>Una selección de lenguajes, escalas y atmósferas posibles.</p>
        </div>
        <div className={styles.exampleGrid}>
          <figure className={styles.example}>
            <img alt="Composición artística de gran formato en tonos cálidos" src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=88" />
            <figcaption>Composición de gran formato</figcaption>
          </figure>
          <figure className={styles.example}>
            <img alt="Pintura contemporánea con formas geométricas" src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=88" />
            <figcaption>Abstracción y color</figcaption>
          </figure>
          <figure className={styles.example}>
            <img alt="Detalle de una obra pictórica con textura" src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=88" />
            <figcaption>Materia y textura</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.conditions} aria-labelledby="conditions-title">
        <h2 id="conditions-title">Una colaboración clara desde el principio.</h2>
        <p>
          La propuesta se confirma antes de iniciar la obra. Los cambios posteriores,
          materiales especiales, entregas fuera de la ciudad o solicitudes urgentes
          pueden modificar el presupuesto y el tiempo acordado. Cada detalle se conversa
          contigo antes de avanzar.
        </p>
      </section>

      <CustomOrderForm />
    </main>
  );
}

export default CustomOrders;
