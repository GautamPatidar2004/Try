const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Capture each `[data-pdf-page]` element in the preview as a single full A4 page.
 * The preview is responsible for fitting all content inside each page frame, so
 * the exporter never slices, never paginates, and always produces exactly N pages
 * (typically 2).
 */
export async function exportMediaKitPdf(rootEl: HTMLElement): Promise<Blob> {
  const pages = Array.from(
    rootEl.querySelectorAll<HTMLElement>('[data-pdf-page]'),
  );
  if (pages.length === 0) throw new Error('No pages to export');

  // Load the heavy PDF libs on demand so they stay out of the main bundle.
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  for (let i = 0; i < pages.length; i++) {
    const el = pages[i];
    const bg = getComputedStyle(el).backgroundColor || '#ffffff';
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: bg,
      logging: false,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });
    if (i > 0) pdf.addPage();
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      A4_WIDTH_MM,
      A4_HEIGHT_MM,
    );
  }

  return pdf.output('blob');
}