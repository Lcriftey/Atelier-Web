import { useEffect, useMemo, useState } from 'react';
import obrasApi from '../api/obrasApi';
import imagenesObraApi from '../api/imagenesObraApi';
import styles from './AdminObras.module.css';

const emptyObra = {
  nombre: '',
  descripcionArtistica: '',
  descripcionTecnica: '',
  dimensiones: '',
  precio: '',
  moneda: 'COP',
  estado: 'DISPONIBLE',
  fechaPublicacion: '',
};

const emptyImagen = {
  urlImagen: '',
  textoAlternativo: '',
  ordenVisualizacion: 0,
  esPrincipal: false,
};

function formatPrice(value, currency) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(value);
}

function AdminObras() {
  const [obras, setObras] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [selectedObraId, setSelectedObraId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [obraForm, setObraForm] = useState(emptyObra);
  const [imagenForm, setImagenForm] = useState(emptyImagen);
  const [loadState, setLoadState] = useState({ status: 'loading', message: '' });
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const [deleteState, setDeleteState] = useState({ status: 'idle', message: '' });
  const [imageState, setImageState] = useState({ status: 'idle', message: '' });

  const selectedObra = obras.find((obra) => obra.id === selectedObraId) || null;
  const selectedImages = useMemo(
    () => imagenes.filter((imagen) => imagen.obraId === selectedObraId),
    [imagenes, selectedObraId],
  );

  useEffect(() => {
    let active = true;
    Promise.all([obrasApi.getAll(), imagenesObraApi.getAll()])
      .then(([obraData, imageData]) => {
        if (!active) return;
        setObras(obraData);
        setImagenes(imageData);
        setLoadState({ status: 'success', message: '' });
      })
      .catch((error) => {
        if (active) setLoadState({ status: 'error', message: error.message });
      });
    return () => { active = false; };
  }, []);

  function handleObraChange(event) {
    const { name, value } = event.target;
    setObraForm((current) => ({ ...current, [name]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setObraForm(emptyObra);
    setSaveState({ status: 'idle', message: '' });
  }

  function startEdit(obra) {
    setEditingId(obra.id);
    setSelectedObraId(obra.id);
    setObraForm({
      nombre: obra.nombre,
      descripcionArtistica: obra.descripcionArtistica,
      descripcionTecnica: obra.descripcionTecnica,
      dimensiones: obra.dimensiones || '',
      precio: obra.precio,
      moneda: obra.moneda,
      estado: obra.estado,
      fechaPublicacion: obra.fechaPublicacion,
    });
    setSaveState({ status: 'idle', message: '' });
  }

  async function handleObraSubmit(event) {
    event.preventDefault();
    if (!obraForm.nombre.trim() || !obraForm.descripcionArtistica.trim()
      || !obraForm.descripcionTecnica.trim() || !obraForm.dimensiones.trim() || !obraForm.fechaPublicacion
      || !obraForm.moneda.trim() || Number(obraForm.precio) < 0 || obraForm.precio === '') {
      setSaveState({ status: 'error', message: 'Completa todos los campos y usa un precio valido.' });
      return;
    }

    const payload = { ...obraForm, precio: Number(obraForm.precio), moneda: obraForm.moneda.toUpperCase() };
    setSaveState({ status: 'loading', message: '' });
    try {
      const saved = editingId ? await obrasApi.update(editingId, payload) : await obrasApi.create(payload);
      setObras((current) => (editingId
        ? current.map((obra) => (obra.id === editingId ? saved : obra))
        : [...current, saved]));
      setSelectedObraId(saved.id);
      setEditingId(saved.id);
      setObraForm({ ...payload });
      setSaveState({ status: 'success', message: editingId ? 'Obra actualizada.' : 'Obra creada.' });
    } catch (error) {
      setSaveState({ status: 'error', message: error.message });
    }
  }

  async function handleDeleteObra(obra) {
    if (!window.confirm(`¿Eliminar la obra "${obra.nombre}"? Esta accion no se puede deshacer.`)) return;
    setDeleteState({ status: 'loading', message: '' });
    try {
      await obrasApi.remove(obra.id);
      setObras((current) => current.filter((item) => item.id !== obra.id));
      setImagenes((current) => current.filter((imagen) => imagen.obraId !== obra.id));
      if (selectedObraId === obra.id) {
        setSelectedObraId(null);
        startCreate();
      }
      setDeleteState({ status: 'success', message: 'Obra eliminada.' });
    } catch (error) {
      setDeleteState({ status: 'error', message: error.message });
    }
  }

  async function handleImageSubmit(event) {
    event.preventDefault();
    if (!selectedObraId || !imagenForm.urlImagen.trim() || !imagenForm.textoAlternativo.trim()
      || Number(imagenForm.ordenVisualizacion) < 0) {
      setImageState({ status: 'error', message: 'Selecciona una obra y completa los datos de la imagen.' });
      return;
    }

    setImageState({ status: 'loading', message: '' });
    try {
      const created = await imagenesObraApi.create({
        ...imagenForm,
        obraId: selectedObraId,
        ordenVisualizacion: Number(imagenForm.ordenVisualizacion),
      });
      setImagenes((current) => [
        ...current.map((imagen) => (
          created.esPrincipal && imagen.obraId === created.obraId
            ? { ...imagen, esPrincipal: false }
            : imagen
        )),
        created,
      ]);
      setImagenForm(emptyImagen);
      setImageState({ status: 'success', message: 'Imagen agregada.' });
    } catch (error) {
      setImageState({ status: 'error', message: error.message });
    }
  }

  async function handleDeleteImage(imagen) {
    if (!window.confirm('¿Eliminar esta imagen? Esta accion no se puede deshacer.')) return;
    setImageState({ status: 'loading', message: '' });
    try {
      await imagenesObraApi.remove(imagen.id);
      setImagenes((current) => current.filter((item) => item.id !== imagen.id));
      setImageState({ status: 'success', message: 'Imagen eliminada.' });
    } catch (error) {
      setImageState({ status: 'error', message: error.message });
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Academia Atelier / Administración</p>
        <h1>Catálogo de obras</h1>
        <p>Gestiona las piezas del catálogo y sus imágenes desde este espacio privado.</p>
      </header>

      {loadState.status === 'loading' && <p className={styles.notice}>Cargando catálogo...</p>}
      {loadState.status === 'error' && <p className={`${styles.notice} ${styles.error}`}>{loadState.message}</p>}
      {deleteState.message && <p className={`${styles.notice} ${deleteState.status === 'error' ? styles.error : styles.success}`}>{deleteState.message}</p>}

      <section className={styles.layout}>
        <div className={styles.listPanel}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Inventario</p><h2>Obras registradas</h2></div>
            <button className={styles.primaryButton} type="button" onClick={startCreate}>Nueva obra</button>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead><tr><th>Nombre</th><th>Precio</th><th>Estado</th><th>Fecha</th><th><span className={styles.visuallyHidden}>Acciones</span></th></tr></thead>
              <tbody>
                {obras.map((obra) => (
                  <tr key={obra.id} className={selectedObraId === obra.id ? styles.selectedRow : ''}>
                    <td><strong>{obra.nombre}</strong><small>{obra.moneda}</small></td>
                    <td>{formatPrice(obra.precio, obra.moneda)}</td>
                    <td><span className={styles.status}>{obra.estado}</span></td>
                    <td>{obra.fechaPublicacion}</td>
                    <td className={styles.actions}>
                      <button type="button" onClick={() => startEdit(obra)}>Editar</button>
                      <button type="button" onClick={() => setSelectedObraId(obra.id)}>Imágenes</button>
                      <button className={styles.dangerText} type="button" onClick={() => handleDeleteObra(obra)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {!obras.length && loadState.status === 'success' && <tr><td className={styles.empty} colSpan="5">Aún no hay obras registradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <form className={styles.formPanel} onSubmit={handleObraSubmit}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Ficha</p><h2>{editingId ? 'Editar obra' : 'Nueva obra'}</h2></div></div>
          <div className={styles.formGrid}>
            <label>Nombre<input name="nombre" value={obraForm.nombre} onChange={handleObraChange} maxLength="200" required /></label>
            <label>Fecha de publicación<input name="fechaPublicacion" type="date" value={obraForm.fechaPublicacion} onChange={handleObraChange} required /></label>
            <label className={styles.wide}>Descripción artística<textarea name="descripcionArtistica" value={obraForm.descripcionArtistica} onChange={handleObraChange} required /></label>
            <label className={styles.wide}>Descripción técnica<textarea name="descripcionTecnica" value={obraForm.descripcionTecnica} onChange={handleObraChange} required /></label>
            <label>Dimensiones<input name="dimensiones" value={obraForm.dimensiones} onChange={handleObraChange} placeholder="Ej. 80 × 100 cm" required /></label>
            <label>Precio<input name="precio" type="number" min="0" step="0.01" value={obraForm.precio} onChange={handleObraChange} required /></label>
            <label>Moneda<input name="moneda" value={obraForm.moneda} onChange={handleObraChange} maxLength="3" required /></label>
            <label>Estado<select name="estado" value={obraForm.estado} onChange={handleObraChange}><option value="DISPONIBLE">DISPONIBLE</option><option value="NO_DISPONIBLE">NO_DISPONIBLE</option></select></label>
          </div>
          <div className={styles.formFooter}><button className={styles.primaryButton} type="submit" disabled={saveState.status === 'loading'}>{saveState.status === 'loading' ? 'Guardando...' : 'Guardar obra'}</button>{saveState.message && <p className={saveState.status === 'error' ? styles.error : styles.success}>{saveState.message}</p>}</div>
        </form>
      </section>

      <section className={styles.imagesSection}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Contenido visual</p><h2>Imágenes {selectedObra ? `de ${selectedObra.nombre}` : 'de la obra seleccionada'}</h2></div></div>
        {!selectedObra && <p className={styles.muted}>Selecciona una obra para consultar o agregar sus imágenes.</p>}
        {selectedObra && <div className={styles.imageLayout}>
          <div className={styles.imageList}>{selectedImages.map((imagen) => <article className={styles.imageItem} key={imagen.id}><img src={imagen.urlImagen} alt={imagen.textoAlternativo} /><div><strong>{imagen.textoAlternativo}</strong><small>Orden {imagen.ordenVisualizacion} {imagen.esPrincipal && ' · Principal'}</small></div><button className={styles.dangerText} type="button" onClick={() => handleDeleteImage(imagen)}>Eliminar</button></article>)}{!selectedImages.length && <p className={styles.muted}>Esta obra aún no tiene imágenes.</p>}</div>
          <form className={styles.imageForm} onSubmit={handleImageSubmit}><h3>Agregar imagen</h3><label>URL de imagen<input value={imagenForm.urlImagen} onChange={(event) => setImagenForm({ ...imagenForm, urlImagen: event.target.value })} type="url" required /></label>{imagenForm.urlImagen && <img className={styles.imagePreview} src={imagenForm.urlImagen} alt="Vista previa de la nueva imagen" />}<label>Texto alternativo<input value={imagenForm.textoAlternativo} onChange={(event) => setImagenForm({ ...imagenForm, textoAlternativo: event.target.value })} maxLength="300" required /></label><label>Orden de visualización<input value={imagenForm.ordenVisualizacion} onChange={(event) => setImagenForm({ ...imagenForm, ordenVisualizacion: event.target.value })} type="number" min="0" required /></label><label className={styles.checkbox}><input checked={imagenForm.esPrincipal} onChange={(event) => setImagenForm({ ...imagenForm, esPrincipal: event.target.checked })} type="checkbox" /> Imagen principal</label><button className={styles.primaryButton} type="submit" disabled={imageState.status === 'loading'}>{imageState.status === 'loading' ? 'Guardando...' : 'Agregar imagen'}</button>{imageState.message && <p className={imageState.status === 'error' ? styles.error : styles.success}>{imageState.message}</p>}</form>
        </div>}
      </section>
    </main>
  );
}

export default AdminObras;