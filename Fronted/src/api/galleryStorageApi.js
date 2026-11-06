import { supabase } from '../lib/supabaseClient';

export const MAX_GALLERY_IMAGE_SIZE = 5 * 1024 * 1024;

const imageFormats = {
  'image/jpeg': { extension: 'jpg', signature: [0xff, 0xd8, 0xff] },
  'image/png': { extension: 'png', signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  'image/webp': { extension: 'webp' },
};

function detectImageMimeType(bytes) {
  for (const [mimeType, format] of Object.entries(imageFormats)) {
    if (format.signature && format.signature.every((byte, index) => bytes[index] === byte)) {
      return mimeType;
    }
  }

  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }

  return null;
}

export async function validateGalleryImage(file) {
  if (!file.size) throw new Error('El archivo está vacío.');
  if (file.size > MAX_GALLERY_IMAGE_SIZE) {
    throw new Error('La imagen supera el límite de 5 MB.');
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const mimeType = detectImageMimeType(header);
  if (!mimeType || (file.type && file.type !== mimeType)) {
    throw new Error('Formato no permitido. Selecciona un archivo JPG, PNG o WebP válido.');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    if (!bitmap.width || !bitmap.height) throw new Error('La imagen no tiene dimensiones válidas.');
  } catch {
    throw new Error('El archivo no contiene una imagen válida.');
  } finally {
    bitmap?.close();
  }

  return mimeType;
}

export function createGalleryObjectPath(mimeType) {
  const format = imageFormats[mimeType];
  if (!format) throw new Error('Formato de imagen no permitido.');
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('Este navegador no permite generar un nombre seguro para el archivo.');
  }

  return `${globalThis.crypto.randomUUID()}.${format.extension}`;
}

function isDuplicateError(error) {
  return String(error?.statusCode) === '409'
    || error?.code === 'Duplicate'
    || error?.error === 'Duplicate';
}

async function sameFileContents(firstFile, secondFile) {
  if (firstFile.size !== secondFile.size) return false;
  const [firstBytes, secondBytes] = await Promise.all([
    firstFile.arrayBuffer(),
    secondFile.arrayBuffer(),
  ]);
  const first = new Uint8Array(firstBytes);
  const second = new Uint8Array(secondBytes);
  return first.every((byte, index) => byte === second[index]);
}

export async function uploadGalleryImage(file, path, mimeType) {
  if (!supabase) throw new Error('Supabase no está configurado.');

  const bucket = supabase.storage.from('Gallery');
  const { error } = await bucket.upload(path, file, {
    cacheControl: '3600',
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    if (!isDuplicateError(error)) throw error;

    const { data: existingFile, error: readError } = await bucket.download(path);
    if (readError || !existingFile || !(await sameFileContents(file, existingFile))) {
      const duplicateError = new Error('Ya existe un archivo distinto con ese nombre.');
      duplicateError.code = 'duplicate_object';
      throw duplicateError;
    }
  }

  const { data } = bucket.getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}
