import { useEffect, useMemo, useRef, useState } from 'react';
import obrasApi from '../api/obrasApi';
import imagenesObraApi from '../api/imagenesObraApi';
import { createGalleryObjectPath, MAX_GALLERY_IMAGE_SIZE, uploadGalleryImage, validateGalleryImage } from '../api/galleryStorageApi';
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
  esPrincipal: false,
};

function formatPrice(value, currency) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(value);
}

function getStorageErrorMessage(error) {
  const status = String(error?.statusCode || error?.status || '');
  const detail = `${error?.code || ''} ${error?.message || ''}`.toLowerCase();

  if (error?.code === 'duplicate_object') return error.message;
  if (status === '401' || /invalid.?jwt|expired.?token|jwt expired/.test(detail)) {
    return 'La sesión de Supabase no es válida o expiró. Vuelve a iniciar sesión.';
  }
  if (status === '403' || /row.level security|not allowed|unauthorized|permission/.test(detail)) {
    return 'Supabase Storage no autorizó la carga. Verifica los permisos del bucket Gallery.';
  }
  if (status === '413' || /too large|payload too large/.test(detail)) {
    return 'La imagen supera el límite permitido por el almacenamiento.';
  }
  if (error instanceof TypeError || /network|fetch|timeout|timed out/.test(detail)) {
    return 'No se pudo conectar con Storage. Reintenta la carga con el mismo archivo.';
  }
  return 'No se pudo subir la imagen. Inténtalo de nuevo.';
}

function AdminObras() {
  const [obras, setObras] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [selectedObraId, setSelectedObraId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [obraForm, setObraForm] = useState(emptyObra);
  const [imagenForm, setImagenForm] = useState(emptyImagen);
  const fileInputRef = useRef(null);
  const imageSubmitLock = useRef(false);
  const [selectedLocalImage, setSelectedLocalImage] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
    const [pendingStorageImage, setPendingStorageImage] = useState(null);
    const [imageSuccessOpen, setImageSuccessOpen] = useState(false);
  const [loadState, setLoadState] = useState({ status: 'loading', message: '' });
  const [saveState, setSaveState] = useState({ status: 'idle', message: '' });
  const [deleteState, setDeleteState] = useState({ status: 'idle', message: '' });
  const [imageState, setImageState] = useState({ status: 'idle', message: '' });

  const selectedObra = obras.find((obra) => obra.id === selectedObraId) || null;
  const selectedImages = useMemo(
    () => imagenes.filter((imagen) => imagen.obraId === selectedObraId),
    [imagenes, selectedObraId],
  );
  const hasPrimaryImage = selectedImages.some((imagen) => imagen.esPrincipal);

  useEffect(() => {
    if (!selectedLocalImage) {
      setLocalPreviewUrl('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(selectedLocalImage.file);
    setLocalPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedLocalImage]);

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

  async function createImageMetadata(urlImagen) {
    const payload = {
      obraId: selectedObraId,
      urlImagen,
      textoAlternativo: selectedObra.nombre,
      ordenVisualizacion: 0,
      esPrincipal: imagenForm.esPrincipal && !hasPrimaryImage,
    };

    try {
      return await imagenesObraApi.create(payload);
    } catch (postError) {
      const existingImages = await imagenesObraApi.getAll().catch(() => null);
      const existingImage = existingImages?.find((image) => (
        image.obraId === selectedObraId && image.urlImagen === urlImagen
      ));
      if (existingImage) return existingImage;
      throw postError;
    }
  }

  async function handleImageSubmit(event) {
    event.preventDefault();
    if (imageSubmitLock.current) return;
    if (!selectedObra || (!selectedLocalImage && !pendingStorageImage)) {
      setImageState({ status: 'error', message: 'Selecciona una obra y un archivo de imagen para continuar.' });
      return;
    }
    if ((selectedLocalImage && selectedLocalImage.obraId !== selectedObraId)
      || (pendingStorageImage && pendingStorageImage.obraId !== selectedObraId)) {
      setImageState({ status: 'error', message: 'Vuelve a seleccionar la obra a la que pertenece esta imagen.' });
      return;
    }

    imageSubmitLock.current = true;
    setImageState({ status: 'loading', message: pendingStorageImage ? 'Registrando metadatos...' : 'Preparando carga...' });
    try {
      let storedImage = pendingStorageImage;
      if (!storedImage && selectedLocalImage) {
        setSelectedLocalImage((current) => ({ ...current, uploadStarted: true }));
        setImageState({ status: 'loading', message: 'Subiendo imagen a Gallery...' });
        try {
          storedImage = await uploadGalleryImage(
            selectedLocalImage.file,
            selectedLocalImage.path,
            selectedLocalImage.mimeType,
          );
          storedImage = { ...storedImage, obraId: selectedObraId };
          setPendingStorageImage(storedImage);
        } catch (error) {
          setImageState({ status: 'error', message: getStorageErrorMessage(error) });
          return;
        }
      }

      const imageUrl = storedImage.publicUrl;
      setImageState({ status: 'loading', message: 'Registrando metadatos de la obra...' });
      let created;
      try {
        created = await createImageMetadata(imageUrl);
      } catch {
        setImageState({
          status: 'error',
          message: storedImage
            ? 'El archivo está en Storage, pero no se confirmaron sus metadatos. Reintenta para registrarlos sin volver a subirlo.'
            : 'No se pudo registrar la imagen. Revisa la conexión e inténtalo de nuevo.',
        });
        return;
      }

      setImagenes((current) => [
        ...current.filter((image) => image.id !== created.id).map((image) => (
          created.esPrincipal && image.obraId === created.obraId
            ? { ...image, esPrincipal: false }
            : image
        )),
        created,
      ]);
      setImagenForm(emptyImagen);
      setSelectedLocalImage(null);
      setPendingStorageImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImageState({ status: 'success', message: 'Imagen subida y registrada correctamente.' });
      setImageSuccessOpen(true);
    } finally {
      imageSubmitLock.current = false;
    }
  }

  async function handleImageFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (pendingStorageImage) {
      event.target.value = '';
      return;
    }
    if (selectedLocalImage?.uploadStarted && !window.confirm(
      'La carga anterior pudo completarse aunque no llegara una confirmación. Si la descartas, el archivo podría quedar pendiente en Storage. ¿Continuar?',
    )) {
      event.target.value = '';
      return;
    }

    setImageState({ status: 'loading', message: 'Validando imagen...' });
    try {
      const mimeType = await validateGalleryImage(file);
      const path = createGalleryObjectPath(mimeType);
      setSelectedLocalImage({ file, mimeType, path, obraId: selectedObraId, uploadStarted: false });
      setImagenForm((current) => ({ ...current, urlImagen: '' }));
      setImageState({ status: 'success', message: 'Imagen válida y lista para subir.' });
    } catch (error) {
      event.target.value = '';
      setSelectedLocalImage(null);
      setImageState({ status: 'error', message: error.message });
    }
  }

  function cancelLocalImage() {
    if (!selectedLocalImage) return;
    if (selectedLocalImage.uploadStarted && !window.confirm(
      'La carga pudo completarse aunque no llegara una confirmación. Si cancelas, el archivo podría quedar pendiente en Storage. ¿Cancelar selección?',
    )) return;
    setSelectedLocalImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setImageState({ status: 'idle', message: '' });
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
        <p className={styles.eyebrow}>11-10 Atelier academia de arte / Administración</p>
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
                    <td data-label="Obra"><strong>{obra.nombre}</strong><small>{obra.moneda}</small></td>
                    <td data-label="Precio">{formatPrice(obra.precio, obra.moneda)}</td>
                    <td data-label="Estado"><span className={styles.status}>{obra.estado}</span></td>
                    <td data-label="Fecha">{obra.fechaPublicacion}</td>
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
        <div className={styles.imageLayout}>
          <div className={styles.imageList}>
            {selectedObra
              ? selectedImages.map((imagen) => <article className={styles.imageItem} key={imagen.id}><img src={imagen.urlImagen} alt={`Imagen de ${selectedObra.nombre}`} /><div><strong>{imagen.esPrincipal ? 'Imagen principal' : `Imagen ${imagen.ordenVisualizacion}`}</strong><small>Orden {imagen.ordenVisualizacion}</small></div><button className={styles.dangerText} type="button" onClick={() => handleDeleteImage(imagen)}>Eliminar</button></article>)
              : <p className={styles.muted}>Selecciona una obra para consultar o agregar sus imágenes.</p>}
            {selectedObra && !selectedImages.length && <p className={styles.muted}>Esta obra aún no tiene imágenes.</p>}
          </div>
          <form className={`${styles.imageForm} ${!selectedObra ? styles.imageFormDisabled : ''}`} onSubmit={handleImageSubmit}>
            <h3>Agregar imagen</h3>
            <fieldset disabled={!selectedObra || imageState.status === 'loading'}>
              <label>Seleccionar desde este dispositivo<input ref={fileInputRef} accept="image/jpeg,image/png,image/webp" disabled={Boolean(pendingStorageImage)} onChange={handleImageFileChange} type="file" /></label>
              <p className={styles.fileHint}>JPG, PNG o WebP · máximo {MAX_GALLERY_IMAGE_SIZE / (1024 * 1024)} MB</p>
              {selectedLocalImage && <div className={styles.selectedFile}><span>{selectedLocalImage.file.name}</span><small>{(selectedLocalImage.file.size / (1024 * 1024)).toFixed(2)} MB</small><button className={styles.dangerText} onClick={cancelLocalImage} type="button">Cancelar selección</button></div>}
              {pendingStorageImage && <p className={styles.pendingUpload} role="status">Archivo subido a Gallery ({pendingStorageImage.path}). Los metadatos siguen pendientes; reintenta para registrarlos sin volver a subir.</p>}
              {(localPreviewUrl || pendingStorageImage?.publicUrl || imagenForm.urlImagen) && <img className={styles.imagePreview} src={pendingStorageImage?.publicUrl || localPreviewUrl || imagenForm.urlImagen} alt={`Vista previa de ${selectedObra?.nombre || 'la imagen seleccionada'}`} />}
              {!hasPrimaryImage && <label className={styles.checkbox}><input checked={imagenForm.esPrincipal} onChange={(event) => setImagenForm({ ...imagenForm, esPrincipal: event.target.checked })} type="checkbox" /> Imagen principal</label>}
              <button className={styles.primaryButton} type="submit" disabled={imageState.status === 'loading'}>{imageState.status === 'loading' ? imageState.message : pendingStorageImage ? 'Reintentar registro' : selectedLocalImage ? 'Subir y agregar imagen' : 'Agregar imagen'}</button>
            </fieldset>
            {selectedObra && imageState.message && <p className={imageState.status === 'error' ? styles.error : styles.success} role={imageState.status === 'error' ? 'alert' : 'status'}>{imageState.message}</p>}
          </form>
        </div>
      </section>

      {imageSuccessOpen && <div className={styles.successOverlay}>
        <section aria-labelledby="image-success-title" aria-modal="true" className={styles.successDialog} role="dialog">
          <span aria-hidden="true" className={styles.successMark}>✓</span>
          <p className={styles.eyebrow}>Contenido visual actualizado</p>
          <h2 id="image-success-title">Imagen subida con éxito</h2>
          <p>La imagen ya está disponible en la galería de {selectedObra?.nombre || 'la obra'}.</p>
          <button autoFocus className={styles.primaryButton} onClick={() => setImageSuccessOpen(false)} type="button">Continuar</button>
        </section>
      </div>}
    </main>
  );
}

export default AdminObras;