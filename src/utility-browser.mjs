import { ageAt, convertArea, countText, difference, fitImage } from './utility.mjs';
import * as extra from './utility-extra.mjs';
import { cropWindow, drawQR, makePDF } from './utility-files.mjs';

const form = document.querySelector('[data-utility]');
const result = form.querySelector('output');
const fields = form.elements;
const tool = form.dataset.utility;
const number = (value) => value.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
const download = form.querySelector('.utility-download');
const preview = form.querySelector('.utility-preview');
let imageURL;
let revision = 0;
let bitmap;
let photoRevision = 0;

if (fields.reference) {
  const today = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  fields.reference.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

const calculate = {
  'character-count'() {
    const { total, noSpace, bytes } = countText(fields.text.value);
    const limit = fields.preset.value === 'custom' ? fields.target.valueAsNumber : Number(fields.preset.value);
    const progress = Number.isInteger(limit) && limit >= 1 && limit <= 1_000_000
      ? `\n목표 ${number(limit)}자 · ${total === limit ? '목표에 도달했습니다' : `${number(Math.abs(limit - total))}자 ${total < limit ? '남음' : '초과'}`}` : '';
    return `공백 포함 ${number(total)}자\n공백 제외 ${number(noSpace)}자\nUTF-8 ${number(bytes)}바이트${progress}`;
  },
  age: () => `만 ${ageAt(fields.birth.value, fields.reference.value)}세`,
  'date-difference'() {
    const days = difference(fields.reference.value, fields.target.value);
    return days === 0 ? 'D-day · 기준일과 같은 날' : days > 0 ? `D-${number(days)} · ${number(days)}일 남음` : `D+${number(-days)} · ${number(-days)}일 지남`;
  },
  'area-converter'() {
    return `${number(convertArea(fields.area.valueAsNumber, fields.unit.value))} ${fields.unit.value === 'm2' ? '평' : '㎡'}`;
  },
  'text-cleanup': () => extra.cleanText(fields.text.value, {
    spaces: fields.spaces.checked, blank: fields.blank.checked, unique: fields.unique.checked, casing: fields.casing.value,
  }),
  'text-compare'() {
    const rows = extra.compareLines(fields.first.value, fields.second.value);
    return rows.length ? `다른 줄 ${number(rows.length)}개\n${rows.slice(0, 100).map(([i, a, b]) =>
      `${i}행 · 원본: ${a ?? '(줄 없음)'}\n${i}행 · 비교: ${b ?? '(줄 없음)'}`).join('\n')}` : '두 텍스트가 같습니다.';
  },
  workdays() {
    const { work, weekends, holidays, length } = extra.workdays(fields.start.value, fields.end.value);
    return `근무일 ${number(work)}일 · 총 ${number(length)}일\n토·일요일 ${number(weekends)}일 · 평일 공휴일 ${number(holidays)}일`;
  },
  'world-time': () => extra.worldTime(fields.reference.value, fields.time.value).map(([city, time]) => `${city} · ${time}`).join('\n'),
  bmi() {
    const { value, category } = extra.bmi(fields.height.valueAsNumber, fields.weight.valueAsNumber);
    return `BMI ${value.toFixed(2)} · ${category} (한국 성인 기준)`;
  },
  'unit-converter'() {
    const { value, unit } = extra.convertUnit(fields.value.valueAsNumber, fields.pair.value);
    return `${number(value)} ${unit}`;
  },
  percentage() {
    const value = extra.percentage(fields.first.valueAsNumber, fields.second.valueAsNumber, fields.mode.value);
    return `${number(value)}${fields.mode.value === 'discount' ? '원' : '%'}`;
  },
  'split-bill'() {
    const people = fields.people.valueAsNumber;
    const { base, extra: remainder } = extra.splitBill(fields.total.valueAsNumber, people);
    return remainder ? `${number(people - remainder)}명: ${number(base)}원\n${number(remainder)}명: ${number(base + 1)}원` : `1인당 ${number(base)}원`;
  },
  'random-picker': () => extra.drawNames(fields.text.value, fields.count.valueAsNumber).join('\n'),
  'json-formatter': () => extra.formatJSON(fields.text.value, fields.mode.value === 'pretty'),
  'text-encoding'() {
    try {
      return extra.encodeText(fields.text.value, fields.mode.value);
    } catch {
      throw new Error('선택한 형식의 올바른 UTF-8 Base64 또는 URL 구성요소인지 확인해 주세요.');
    }
  },
  'password-generator': () => extra.randomPassword(fields.namedItem('length').valueAsNumber, fields.symbols.checked),
  'color-converter'() {
    const { hex, rgb } = extra.colorCode(fields.text.value);
    const ctx = preview.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, preview.width, preview.height);
    preview.hidden = false;
    return `${hex} · rgb(${rgb.join(', ')})`;
  },
};

function clearImage() {
  revision++;
  if (imageURL) URL.revokeObjectURL(imageURL);
  imageURL = undefined;
  download.removeAttribute('href');
  download.hidden = true;
  result.value = '';
}

function offerDownload(blob, filename) {
  imageURL = URL.createObjectURL(blob);
  download.href = imageURL;
  download.download = filename;
  download.hidden = false;
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
    offerDownload(blob, `image-${width}x${height}.${type === 'image/jpeg' ? 'jpg' : type.split('/')[1]}`);
    result.value = `${number(width)} × ${number(height)}px · ${number(blob.size)}바이트 (원본 ${number(file.size)}바이트)`;
  } catch (error) {
    if (revision === current) throw error;
  }
}

function paintPassport() {
  if (!bitmap) return;
  const { x, y, w, h } = cropWindow(bitmap.width, bitmap.height, fields.zoom.valueAsNumber, fields.x.valueAsNumber / 100, fields.y.valueAsNumber / 100);
  const ctx = preview.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, preview.width, preview.height);
  ctx.drawImage(bitmap, x, y, w, h, 0, 0, preview.width, preview.height);
  preview.hidden = false;
}

async function loadPassport() {
  const current = ++photoRevision;
  bitmap?.close();
  bitmap = undefined;
  preview.hidden = true;
  const file = fields.file.files[0];
  if (!file) return;
  if (file.size > 50_000_000) throw new Error('50MB 이하의 사진을 선택해 주세요.');
  const next = await createImageBitmap(file);
  if (current !== photoRevision) next.close();
  else {
    bitmap = next;
    paintPassport();
  }
}

const canvasBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

async function fileTool() {
  clearImage();
  const current = revision;
  result.value = '처리 중입니다.';
  try {
    if (tool === 'passport-photo') {
      if (!bitmap) throw new Error('사진을 먼저 선택하고 미리보기를 확인해 주세요.');
      let blob;
      for (const quality of [0.9, 0.75, 0.6]) {
        blob = await canvasBlob(preview, 'image/jpeg', quality);
        if (revision !== current) return;
        if (blob?.type === 'image/jpeg' && blob.size <= 500_000) break;
      }
      if (blob?.type !== 'image/jpeg' || blob.size > 500_000) throw new Error('500KB 이하 JPG를 만들 수 없습니다.');
      offerDownload(blob, 'passport-413x531.jpg');
      result.value = `413 × 531px · ${number(blob.size)}바이트`;
    } else if (tool === 'qr-generator') {
      preview.hidden = true;
      const canvas = document.createElement('canvas');
      await drawQR(canvas, fields.text.value);
      const blob = await canvasBlob(canvas, 'image/png');
      if (revision !== current) return;
      if (!blob) throw new Error('QR 이미지를 만들 수 없습니다.');
      preview.width = canvas.width;
      preview.height = canvas.height;
      preview.getContext('2d').drawImage(canvas, 0, 0);
      preview.hidden = false;
      offerDownload(blob, 'qr-code.png');
      result.value = 'QR 코드를 만들었습니다.';
    } else {
      const { blob, pages } = await makePDF(tool, Array.from(fields.file.files), fields.pages?.value);
      if (revision !== current) return;
      offerDownload(blob, `${tool}.pdf`);
      result.value = `${number(pages)}쪽 · ${number(blob.size)}바이트`;
    }
  } catch (error) {
    if (revision === current) throw error;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    if (tool === 'image-resize') await resizeImage();
    else if (download) await fileTool();
    else result.value = calculate[tool]();
  } catch (error) {
    result.value = error.message;
  }
});

form.addEventListener('reset', () => {
  if (download) {
    clearImage();
    photoRevision++;
    bitmap?.close();
    bitmap = undefined;
    if (preview) preview.hidden = true;
    form.querySelector('.utility-file-list')?.replaceChildren();
  }
  setTimeout(() => {
    if (tool === 'character-count') fields.preset.dispatchEvent(new Event('input', { bubbles: true }));
    else result.value = tool === 'area-converter' ? calculate[tool]() : '';
  });
});

if (tool === 'character-count') {
  form.addEventListener('input', () => {
    fields.target.disabled = fields.preset.value !== 'custom';
    result.value = calculate[tool]();
  });
  result.value = calculate[tool]();
} else if (download) {
  form.addEventListener('input', clearImage);
  if (tool === 'qr-generator') fields.text.addEventListener('input', () => { preview.hidden = true; });
  if (tool === 'passport-photo') {
    fields.file.addEventListener('change', () => { loadPassport().catch(() => { result.value = '사진을 열지 못했습니다. 파일 형식과 크기를 확인해 주세요.'; }); });
    for (const key of ['x', 'y', 'zoom']) fields[key].addEventListener('input', paintPassport);
  }
  const list = form.querySelector('.utility-file-list');
  if (list) fields.file.addEventListener('change', () => list.replaceChildren(...Array.from(fields.file.files, (file) => {
    const item = document.createElement('li');
    item.textContent = file.name;
    return item;
  })));
} else if (tool === 'area-converter') result.value = calculate[tool]();
