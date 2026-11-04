import { createWorker } from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number;
}

/**
 * Preprocesa una imagen en un Canvas HTML para maximizar la precisión de Tesseract:
 * 1. Redimensiona si es excesivamente grande para no sobrecargar el móvil.
 * 2. Convierte a escala de grises.
 * 3. Aplica estiramiento de contraste y umbralización (binarización)
 *    para eliminar sombras y arrugas de papel.
 */
export async function preprocessReceiptImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Limitar tamaño máximo para móviles (~1600px en el lado mayor) manteniendo nitidez
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Paso 1: Escala de grises y cálculo de brillo medio
        let totalBrightness = 0;
        const grayValues = new Uint8Array(width * height);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Luminancia estándar percibida
          const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          grayValues[i / 4] = gray;
          totalBrightness += gray;
        }

        const avgBrightness = totalBrightness / (width * height);
        // Umbral adaptativo según la luz general de la foto
        const threshold = Math.max(90, Math.min(160, avgBrightness * 0.92));

        // Paso 2: Aumento de contraste y binarización
        for (let i = 0; i < data.length; i += 4) {
          const gray = grayValues[i / 4];
          // Contraste alto con umbral suave
          const val = gray < threshold ? Math.max(0, gray - 40) : Math.min(255, gray + 40);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Escanea un archivo de imagen (JPG, PNG, WebP) usando el motor Tesseract.js
 * con idioma español e inglés y devuelve el texto estructurado del ticket.
 */
export async function recognizeReceiptText(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<string> {
  try {
    // 1. Notificar preprocesado
    onProgress?.({ status: 'Preparando imagen y mejorando contraste...', progress: 0.1 });
    const preprocessedDataUrl = await preprocessReceiptImage(file);

    // 2. Iniciar Worker Tesseract
    onProgress?.({ status: 'Iniciando motor de lectura OCR...', progress: 0.25 });
    
    // Configuramos worker con español e inglés
    const worker = await createWorker(['spa', 'eng'], undefined, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const p = 0.3 + (m.progress || 0) * 0.65;
          onProgress?.({
            status: `Leyendo texto del ticket (${Math.round((m.progress || 0) * 100)}%)...`,
            progress: Number(p.toFixed(2))
          });
        }
      }
    });

    // 3. Ejecutar reconocimiento sobre la imagen optimizada
    const ret = await worker.recognize(preprocessedDataUrl);
    await worker.terminate();

    onProgress?.({ status: '¡Texto extraído con éxito!', progress: 1.0 });

    const rawText = ret.data.text || '';
    return cleanReceiptOcrText(rawText);
  } catch (err) {
    console.error('Error en Tesseract OCR:', err);
    throw err;
  }
}

/**
 * Limpia errores visuales comunes que cometen los OCRs en tickets térmicos de caja
 */
export function cleanReceiptOcrText(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      let l = line.trim();
      // Corregir cuando confunde el símbolo del euro o caracteres extraños en los precios
      // ej: "1,85 €" o "1.85E" o "1,85€"
      l = l.replace(/(\d+[.,]\d{2})\s*[€eE]/g, '$1 €');
      // Eliminar caracteres basura de los márgenes
      l = l.replace(/^[|~«»°•\-_*]+\s*/, '');
      l = l.replace(/\s*[|~«»°•\-_*]+$/, '');
      return l;
    })
    .filter((line) => line.length > 2)
    .join('\n');
}

