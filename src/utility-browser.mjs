import { ageAt, convertArea, countText, difference, fitImage } from './utility.mjs';

const form = document.querySelector('[data-utility]');
const result = form.querySelector('output');
const fields = form.elements;
const tool = form.dataset.utility;
const number = (value) => value.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
let imageURL;
let revision = 0;

if (fields.reference) {
  const today = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  fields.reference.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

const calculate = {
  'character-count'() {
    const { total, noSpace, bytes } = countText(fields.text.value);
    return `공백 포함 ${number(total)}자\n공백 제외 ${number(noSpace)}자\nUTF-8 ${number(bytes)}바이트`;
  },
  age: () => `만 ${ageAt(fields.birth.value, fields.reference.value)}세`,
  'date-difference'() {
    const days = difference(fields.reference.value, fields.target.value);
    return days === 0 ? 'D-day · 기준일과 같은 날' : days > 0 ? `D-${number(days)} · ${number(days)}일 남음` : `D+${number(-days)} · ${number(-days)}일 지남`;
  },
  'area-converter'() {
    return `${number(convertArea(fields.area.valueAsNumber, fields.unit.value))} ${fields.unit.value === 'm2' ? '평' : '㎡'}`;
  },
};

function clearImage() {
  revision++;
  if (imageURL) URL.revokeObjectURL(imageURL);
  imageURL = undefined;
  const link = form.querySelector('.utility-download');
  link.removeAttribute('href');
  link.hidden = true;
  result.value = '';
}

async function resizeImage() {
  clearImage();
  const current = revision;
  const file = fields.file.files[0];
  if (!file || !/^image\/(jpeg|png|webp|gif|bmp|avif)$/.test(file.type)) throw new Error('지원하는 이미지 파일을 선택해 주세요.');
  const type = fields.format.value;
  const quality = fields.quality.valueAsNumber / 100;
  const bound = fields.bound.valueAsNumber;
  result.value = '이미지를 변환하는 중입니다.';
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const { width, height } = fitImage(bitmap.width, bitmap.height, bound);
    try {
      if (revision !== current) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (type === 'image/jpeg') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(bitmap, 0, 0, width, height);
    } finally {
      bitmap.close();
    }
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
    if (revision !== current) return;
    if (blob?.type !== type) throw new Error('이 브라우저는 선택한 저장 형식을 지원하지 않습니다.');
    const link = form.querySelector('.utility-download');
    imageURL = URL.createObjectURL(blob);
    link.href = imageURL;
    link.download = `image-${width}x${height}.${type === 'image/jpeg' ? 'jpg' : type.split('/')[1]}`;
    link.hidden = false;
    result.value = `${number(width)} × ${number(height)}px · ${number(blob.size)}바이트 (원본 ${number(file.size)}바이트)`;
  } catch (error) {
    if (revision === current) throw error;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    if (tool === 'image-resize') await resizeImage();
    else result.value = calculate[tool]();
  } catch (error) {
    result.value = error.message;
  }
});

if (tool === 'character-count') {
  fields.text.addEventListener('input', () => { result.value = calculate[tool](); });
  result.value = calculate[tool]();
} else if (tool === 'image-resize') {
  form.addEventListener('input', clearImage);
} else if (tool === 'area-converter') result.value = calculate[tool]();
