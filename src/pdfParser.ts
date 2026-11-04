import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for Vite environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter((s: string) => s.trim().length > 0);
    
    fullText += pageStrings.join('\n') + '\n';
  }

  return fullText;
}

