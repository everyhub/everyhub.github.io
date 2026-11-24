const maxBytes = 50_000_000;
const a4 = [595.28, 841.89];
export const passportSize = [413, 531];

export function pdfPageSelection(input, total) {
  const pages = new Set();
  for (const part of input.split(',')) {
    const range = /^\s*(\d+)(?:\s*[-–]\s*(\d+))?\s*$/.exec(part);
    if (!range) throw new Error('페이지 번호를 쉼표와 하이픈으로 구분해 주세요. 예: 1, 3-5');
    const first = Number(range[1]);
    const last = Number(range[2] ?? range[1]);
    if (first < 1 || last < first || last > total) throw new Error(`1~${total} 사이의 유효한 페이지와 범위를 입력해 주세요.`);
    for (let n = first; n <= last; n++) pages.add(n - 1);
  }
  return [...pages];
}

export function cropWindow(width, height, zoom, x, y) {
  const [outWidth, outHeight] = passportSize;
  const scale = Math.max(outWidth / width, outHeight / height) * zoom;
  const w = outWidth / scale;
  const h = outHeight / scale;
  return { x: Math.max(0, width - w) * x, y: Math.max(0, height - h) * y, w, h };
}

export async function makePDF(mode, files, selection) {
  if (files.length < (mode === 'pdf-merge' ? 2 : 1)) throw new Error(mode === 'pdf-merge' ? 'PDF를 두 개 이상 선택해 주세요.' : '파일을 선택해 주세요.');
  if (files.length > 30 || files.reduce((total, file) => total + file.size, 0) > maxBytes) throw new Error('파일은 최대 30개, 합계 50MB 이하로 선택해 주세요.');
  const { PDFDocument } = await import('./utility-vendor/pdf-lib-1.17.1.mjs');
  const output = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    if (mode === 'images-to-pdf') {
      const kind = new Uint8Array(bytes, 0, Math.min(4, bytes.byteLength));
      let image;
      if (kind[0] === 0xff && kind[1] === 0xd8) image = await output.embedJpg(bytes);
      else if (kind[0] === 0x89 && kind[1] === 0x50 && kind[2] === 0x4e && kind[3] === 0x47) image = await output.embedPng(bytes);
      else throw new Error('JPG 또는 PNG만 사용할 수 있습니다.');
      const page = output.addPage(a4);
      const scale = Math.min((a4[0] - 48) / image.width, (a4[1] - 48) / image.height);
      const { width, height } = image.scale(scale);
      page.drawImage(image, { x: (a4[0] - width) / 2, y: (a4[1] - height) / 2, width, height });
    } else {
      let input;
      try {
        input = await PDFDocument.load(bytes);
      } catch {
        throw new Error('PDF를 읽을 수 없습니다. 손상되었거나 암호화된 파일인지 확인해 주세요.');
      }
      const indices = mode === 'pdf-split' ? pdfPageSelection(selection, input.getPageCount()) : input.getPageIndices();
      for (const page of await output.copyPages(input, indices)) output.addPage(page);
    }
  }
  if (!output.getPageCount()) throw new Error('저장할 PDF 페이지가 없습니다.');
  return { blob: new Blob([await output.save()], { type: 'application/pdf' }), pages: output.getPageCount() };
}

export async function drawQR(canvas, text) {
  const { default: qrcode } = await import('./utility-vendor/qrcode-2.0.4.mjs');
  qrcode.stringToBytes = (value) => Array.from(new TextEncoder().encode(value));
  const qr = qrcode(0, 'M');
  qr.addData(text, 'Byte');
  qr.make();
  const size = qr.getModuleCount();
  const cell = 5;
  const margin = 4;
  canvas.width = canvas.height = (size + margin * 2) * cell;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
    if (qr.isDark(row, col)) ctx.fillRect((col + margin) * cell, (row + margin) * cell, cell, cell);
  }
}
