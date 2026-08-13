/**
 * Utility untuk crop gambar (sesuai area yang dipilih user di react-easy-crop)
 * lalu otomatis di-resize & dikompres sebelum diupload ke server.
 *
 * Kenapa perlu ini:
 * - User bebas upload foto ukuran berapapun (bahkan 10MB+ dari kamera HP)
 * - Setelah di-crop sesuai rasio yang dipilih (1:1, 3:4, 4:3), hasilnya
 *   di-resize supaya sisi terpanjang nggak lebih dari MAX_OUTPUT_DIMENSION,
 *   lalu dikompres bertahap (quality diturunkan) sampai ukurannya
 *   di bawah TARGET_MAX_SIZE_BYTES.
 * - Hasil akhirnya adalah File asli (bukan base64) yang siap dikirim
 *   sebagai multipart/form-data ke backend.
 */

export interface PixelCropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---- Konfigurasi kompresi (bisa disesuaikan) ----
const MAX_OUTPUT_DIMENSION = 1600; // px, sisi terpanjang hasil crop
const TARGET_MAX_SIZE_BYTES = 800 * 1024; // ~800KB
const MIN_QUALITY = 0.4;
const QUALITY_STEP = 0.08;
const INITIAL_QUALITY = 0.92;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Gagal memproses gambar (toBlob gagal).'));
      },
      'image/jpeg',
      quality
    );
  });
}

async function compressCanvasToTarget(
  canvas: HTMLCanvasElement,
  targetBytes: number
): Promise<Blob> {
  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, quality);

  // Turunkan quality bertahap sampai ukurannya pas atau mentok minimum
  while (blob.size > targetBytes && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
    blob = await canvasToBlob(canvas, quality);
    if (quality === MIN_QUALITY) break;
  }

  return blob;
}

/**
 * Crop gambar sesuai pixelCrop (dari react-easy-crop), resize, kompres,
 * lalu kembalikan sebagai File siap upload (selalu berformat .jpg).
 */
export async function getCroppedCompressedFile(
  imageSrc: string,
  pixelCrop: PixelCropArea,
  originalFileName: string
): Promise<File> {
  const image = await createImage(imageSrc);

  let outputWidth = pixelCrop.width;
  let outputHeight = pixelCrop.height;
  const largestSide = Math.max(outputWidth, outputHeight);

  if (largestSide > MAX_OUTPUT_DIMENSION) {
    const scale = MAX_OUTPUT_DIMENSION / largestSide;
    outputWidth = Math.round(outputWidth * scale);
    outputHeight = Math.round(outputHeight * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Browser tidak mendukung canvas untuk memproses gambar.');
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const blob = await compressCanvasToTarget(canvas, TARGET_MAX_SIZE_BYTES);

  const baseName = originalFileName.replace(/\.[^/.]+$/, '') || 'foto-produk';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}