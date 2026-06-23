/**
 * L4D — client-side image compression pipeline.
 *
 * Scales high-resolution smartphone photos down inside an in-memory canvas and
 * transcodes them to WebP before they ever hit the presigned S3 upload, slashing
 * network overhead and speeding up the gallery — all with native browser APIs
 * (no dependencies). Falls back to the original file if WebP encoding isn't
 * supported or compression wouldn't actually shrink the file.
 */
const DEFAULTS = {
  maxDimension: 1600, // longest edge, px
  quality: 0.82,
  mimeType: 'image/webp',
};

const loadBitmap = async (file) => {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to <img> decode */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return { width: img.naturalWidth, height: img.naturalHeight, _img: img };
  } finally {
    URL.revokeObjectURL(url);
  }
};

const scaleDimensions = (width, height, maxDimension) => {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) return { width, height };
  const ratio = maxDimension / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
};

const canvasToBlob = (canvas, mimeType, quality) =>
  new Promise((resolve) => {
    if (canvas.toBlob) canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    else resolve(null);
  });

const swapExtension = (name, mimeType) => {
  const ext = mimeType === 'image/webp' ? 'webp' : (mimeType.split('/')[1] || 'img');
  const base = (name || 'photo').replace(/\.[^./\\]+$/, '');
  return `${base}.${ext}`;
};

export const compressImage = async (file, options = {}) => {
  const { maxDimension, quality, mimeType } = { ...DEFAULTS, ...options };
  if (!file || !file.type?.startsWith('image/')) return file;

  let bitmap;
  try {
    bitmap = await loadBitmap(file);
  } catch {
    return file; // can't decode → upload original untouched
  }

  const srcWidth = bitmap.width;
  const srcHeight = bitmap.height;
  const { width, height } = scaleDimensions(srcWidth, srcHeight, maxDimension);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap._img || bitmap, 0, 0, width, height);
  if (typeof bitmap.close === 'function') bitmap.close();

  const blob = await canvasToBlob(canvas, mimeType, quality);
  // No WebP support, or the transcode grew the file (already-optimized small
  // image): keep the original to avoid a pointless/larger upload.
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], swapExtension(file.name, mimeType), {
    type: mimeType,
    lastModified: Date.now(),
  });
};
