import { holidayCalendar } from './information.mjs';
import { dateRange, difference } from './utility.mjs';

const lines = (text) => text.split(/\r\n?|\n/);

export function cleanText(text, { spaces, blank, unique, casing }) {
  let items = lines(text);
  if (spaces) items = items.map((line) => line.trim().replace(/[^\S\r\n]+/gu, ' '));
  if (blank) items = items.filter((line) => line.trim());
  if (casing === 'upper') items = items.map((line) => line.toUpperCase());
  if (casing === 'lower') items = items.map((line) => line.toLowerCase());
  return (unique ? [...new Set(items)] : items).join('\n');
}

export function compareLines(first, second) {
  const a = lines(first);
  const b = lines(second);
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [i + 1, a[i], b[i]])
    .filter(([, left, right]) => left !== right);
}

export function workdays(start, end) {
  const length = difference(start, end) + 1;
  if (length < 1) throw new Error('종료일이 시작일보다 빠릅니다.');
  if (start < '2026-01-01' || end > '2027-12-31') throw new Error('공식 달력 자료가 있는 2026~2027년만 계산합니다.');
  const dates = new Set([2026, 2027].flatMap((year) => holidayCalendar(year).holidays.map(({ date }) => date)));
  let weekends = 0;
  let holidays = 0;
  const current = new Date(start + 'T00:00:00Z');
  for (let i = 0; i < length; i++, current.setUTCDate(current.getUTCDate() + 1)) {
    const weekday = current.getUTCDay();
    if (weekday === 0 || weekday === 6) weekends++;
    else if (dates.has(current.toISOString().slice(0, 10))) holidays++;
  }
  return { work: length - weekends - holidays, weekends, holidays, length };
}

export const worldCities = [
  ['서울', 'Asia/Seoul'], ['도쿄', 'Asia/Tokyo'], ['싱가포르', 'Asia/Singapore'], ['런던', 'Europe/London'],
  ['파리', 'Europe/Paris'], ['뉴욕', 'America/New_York'], ['로스앤젤레스', 'America/Los_Angeles'], ['시드니', 'Australia/Sydney'],
];

export const worldTimeRange = ['1989-01-01', dateRange[1]];

export function worldTime(date, time) {
  difference(date, date);
  if (date < worldTimeRange[0]) throw new Error('서울 시각에 UTC+9를 적용하는 1989년 이후 날짜만 계산합니다.');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('시각을 정확히 입력해 주세요.');
  const instant = new Date(date + 'T' + time + ':00+09:00');
  return worldCities.map(([city, timeZone]) => [city, new Intl.DateTimeFormat('ko-KR', {
    timeZone, dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23',
  }).format(instant)]);
}

export function bmi(cm, kg) {
  if (!(cm > 0 && kg > 0) || !Number.isFinite(cm + kg)) throw new Error('키와 체중을 각각 0보다 큰 수로 입력해 주세요.');
  const value = kg / (cm / 100) ** 2;
  return { value, category: [[18.5, '저체중'], [23, '정상'], [25, '비만 전단계'], [30, '1단계 비만'],
    [35, '2단계 비만'], [Infinity, '3단계 비만']].find(([limit]) => value < limit)[1] };
}

export const unitPairs = {
  'cm-in': ['인치', (n) => n / 2.54], 'in-cm': ['cm', (n) => n * 2.54],
  'kg-lb': ['lb', (n) => n / 0.45359237], 'lb-kg': ['kg', (n) => n * 0.45359237],
  'c-f': ['°F', (n) => n * 9 / 5 + 32], 'f-c': ['°C', (n) => (n - 32) * 5 / 9],
};

export function convertUnit(value, pair) {
  const [unit, convert] = unitPairs[pair];
  return { value: convert(value), unit };
}

export function percentage(first, second, mode) {
  if (mode === 'discount') {
    if (second > 100) throw new Error('할인율은 100% 이하여야 합니다.');
    return first * (100 - second) / 100;
  }
  if (!first) throw new Error('기준값은 0보다 커야 합니다.');
  return (mode === 'change' ? second - first : second) * 100 / first;
}

export function splitBill(total, people) {
  if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(people) || people < 1) throw new Error('총액과 인원을 정수로 입력해 주세요.');
  return { base: Math.floor(total / people), extra: total % people };
}

export function secureIndex(size, cryptoSource = globalThis.crypto) {
  if (!Number.isSafeInteger(size) || size < 1 || size > 2 ** 32) throw new RangeError('지원하지 않는 범위입니다.');
  const slot = new Uint32Array(1);
  const bound = 2 ** 32 - (2 ** 32 % size);
  do cryptoSource.getRandomValues(slot); while (slot[0] >= bound);
  return slot[0] % size;
}

export function drawNames(text, count, random = secureIndex) {
  const items = [...new Set(lines(text).map((line) => line.trim()).filter(Boolean))];
  if (!Number.isSafeInteger(count) || count < 1 || count > items.length) throw new Error('당첨 인원은 1명 이상, 중복을 뺀 후보 수 이하로 입력해 주세요.');
  for (let i = 0; i < count; i++) {
    const j = i + random(items.length - i);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items.slice(0, count);
}

export function randomPassword(length, symbols, random = secureIndex) {
  if (!Number.isSafeInteger(length) || length < 8 || length > 128) throw new Error('비밀번호 길이를 8~128자로 입력해 주세요.');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + (symbols ? '!@#$%^&*_-+=' : '');
  return Array.from({ length }, () => alphabet[random(alphabet.length)]).join('');
}

export function ladderDraw(people, choices, random = secureIndex) {
  const entries = (input) => lines(input).map((line) => line.trim()).filter(Boolean);
  const players = entries(people);
  const results = entries(choices);
  if (players.length < 2 || players.length > 8 || players.length !== results.length || new Set(players).size !== players.length) {
    throw new Error('서로 다른 참가자와 결과의 개수를 2~8개로 맞춰 주세요.');
  }
  const positions = players.map((_, index) => index);
  const target = positions.slice();
  for (let i = target.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [target[i], target[j]] = [target[j], target[i]];
  }
  const rungs = [];
  for (const [end, index] of target.entries()) {
    for (let from = positions.indexOf(index); from > end; from--) {
      [positions[from - 1], positions[from]] = [positions[from], positions[from - 1]];
      rungs.push(from - 1);
    }
  }
  const matches = positions.map((index, end) => ({ index, end, player: players[index], result: results[end] }))
    .sort((a, b) => a.index - b.index);
  return { rungs, matches };
}

export function encodeText(text, mode) {
  if (mode === 'url-encode') return encodeURIComponent(text);
  if (mode === 'url-decode') return decodeURIComponent(text);
  if (mode === 'base64-encode') return btoa(Array.from(new TextEncoder().encode(text), (byte) => String.fromCharCode(byte)).join(''));
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(Uint8Array.from(atob(text), (char) => char.charCodeAt(0)));
}

export const formatJSON = (text, pretty) => JSON.stringify(JSON.parse(text), null, pretty ? 2 : 0);

export function colorCode(input) {
  const value = input.trim();
  let rgb;
  if (/^#?([\da-f]{3}|[\da-f]{6})$/i.test(value)) {
    let hex = value.replace('#', '');
    if (hex.length === 3) hex = hex.replace(/./g, '$&$&');
    rgb = hex.match(/../g).map((part) => parseInt(part, 16));
  } else {
    const match = /^(?:rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)|(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3}))$/i.exec(value);
    if (match) rgb = (match[1] === undefined ? match.slice(4) : match.slice(1, 4)).map(Number);
  }
  if (!rgb || rgb.some((n) => n > 255)) throw new Error('예: #07764F 또는 rgb(7, 118, 79)');
  return { rgb, hex: '#' + rgb.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase() };
}
