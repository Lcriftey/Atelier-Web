import { getRandomPosterSet } from '../../data/posterAssets';
import styles from './ArtistView.module.css';

function ArtistView() {
  const [trajectoryPoster, techniquePoster, experiencePoster, proposalPoster] = getRandomPosterSet(4);

  return (
    <main className={styles.page}>
      <section className={styles.mission}>
        <p className={styles.eyebrow}>Misión</p>
        <blockquote>La pintura no ilustra lo que ya sabemos; abre un lugar para mirar de nuevo.</blockquote>
      </section>

      <section className={styles.mosaic}>
        <article className={`${styles.mosaicTile} ${styles.mosaicTrajectory}`}>
          <p className={styles.eyebrow}>Trayectoria</p>
          <h2>Una práctica en movimiento.</h2>
          <img alt="Obra pictórica expuesta en una galería" src={trajectoryPoster} />
          <p>Exposiciones, encargos y años de taller han ampliado una investigación nacida de la memoria y el paisaje interior.</p>
        </article>
        <article className={`${styles.mosaicTile} ${styles.mosaicTechnique}`}>
          <p className={styles.eyebrow}>Conocimiento técnico</p>
          <h2>La materia también cuenta.</h2>
          <img alt="Pinceles y materiales de pintura en el taller" src={techniquePoster} />
          <p>Óleo, acrílico, pigmento y técnica mixta se convierten en capas para registrar decisiones, correcciones y cambios de luz.</p>
          <ul className={styles.techniques}>
            <li>Óleo</li>
            <li>Acrílico</li>
            <li>Pigmento</li>
            <li>Técnica mixta</li>
          </ul>
        </article>
        <article className={`${styles.mosaicTile} ${styles.mosaicExperience}`}>
          <p className={styles.eyebrow}>Experiencia</p>
          <h2>Aprender haciendo.</h2>
          <img alt="Artista trabajando en una pintura dentro de su taller" src={experiencePoster} />
          <p>El trabajo combina la práctica pictórica con el acompañamiento de otros procesos creativos. Enseñar también es otra forma de mirar.</p>
        </article>
        <article className={`${styles.mosaicTile} ${styles.mosaicProposal}`}>
          <p className={styles.eyebrow}>Propuesta artística</p>
          <h2>Crear es una forma de permanecer atento.</h2>
          <img alt="Detalle de una composición abstracta en tonos azules" src={proposalPoster} />
          <p>Academia Atelier nace de una práctica paciente: observar la materia, escuchar el color y convertir cada hallazgo en una conversación.</p>
        </article>
      </section>
    </main>
  );
}

export default ArtistView;
