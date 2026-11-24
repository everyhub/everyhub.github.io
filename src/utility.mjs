import parseTweet from './utility-vendor/twitter-text-3.1.0.mjs';

const DAY = 86_400_000;
const AREA = 400 / 121;
export const maxArea = 1_000_000_000_000;
export const dateRange = ['1900-01-01', '2100-12-31'];
const graphemes = new Intl.Segmenter('ko', { granularity: 'grapheme' });
const count = (text) => {
  let total = 0;
  for (const segment of graphemes.segment(text)) total++;
  return total;
};

export function countText(text) {
  return { total: count(text), noSpace: count(text.replace(/\s/gu, '')), bytes: new TextEncoder().encode(text).length };
}

export function characterLimit(preset, custom, text = '') {
  if (preset === 'bluesky') return { characters: 300, bytes: 3000 };
  if (preset === 'x') return { characters: 280, weighted: parseTweet(text).weightedLength };
  const characters = preset === 'custom' ? custom : Number(preset);
  return Number.isInteger(characters) && characters >= 1 && characters <= 1_000_000 ? { characters } : {};
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < dateRange[0] || value > dateRange[1]) {
    throw new Error('1900~2100년 사이의 날짜를 네 자리 연도로 입력해 주세요.');
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value) throw new Error('존재하지 않는 날짜입니다.');
  return date;
}

export function difference(start, end) {
  return (parseDate(end) - parseDate(start)) / DAY;
}

export function ageAt(birth, date) {
  if (difference(birth, date) < 0) throw new Error('기준일은 생년월일보다 빠를 수 없습니다.');
  return Number(date.slice(0, 4)) - Number(birth.slice(0, 4)) - Number(date.slice(5) < birth.slice(5));
}

export function convertArea(value, unit) {
  if (!Number.isFinite(value) || value < 0 || value > maxArea || !['m2', 'pyeong'].includes(unit)) {
    throw new Error('0~1조 사이의 면적을 입력해 주세요.');
  }
  return unit === 'm2' ? value / AREA : value * AREA;
}

export function fitImage(width, height, bound) {
  if (![width, height, bound].every((value) => Number.isSafeInteger(value) && value > 0)) throw new Error('유효한 이미지와 최대 길이를 선택해 주세요.');
  const ratio = Math.min(1, bound / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
}
