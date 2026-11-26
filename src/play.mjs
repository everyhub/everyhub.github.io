import { lunarToSolar } from './lunar-calendar.mjs';
import { secureIndex } from './utility-extra.mjs';
import { ageAt, dateRange, difference } from './utility.mjs';

export const newYear = Date.parse('2027-01-01T00:00:00+09:00');
export const playLimits = { names: 40, choices: 16, name: 40, resolution: 120, memory: 90 };
export const wheelColors = ['#a42957', '#245c82', '#2a6a57', '#6d3d89', '#785018', '#384f94', '#8b3c39', '#376669'];

export function countdown(now) {
  const remaining = Math.max(0, Math.ceil((newYear - now) / 1000));
  return { done: remaining === 0, values: [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60, remaining % 60] };
}

export function validateEntries(values, { max = playLimits.names, allowRepeats = false } = {}) {
  const items = values.map((value) => value.trim().normalize());
  if (items.length < 2 || items.length > max) throw new Error(`2~${max}개를 입력해 주세요.`);
  if (items.some((item) => !item)) throw new Error('빈 칸을 채워 주세요.');
  if (items.some((item) => [...item].length > playLimits.name)) throw new Error(`이름이나 항목은 ${playLimits.name}자 이내로 입력해 주세요.`);
  if (!allowRepeats && new Set(items).size !== items.length) throw new Error('겹치는 이름이나 항목이 있습니다. 같은 이름은 별명으로 구분해 주세요.');
  return items;
}

function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function secretPairs(items, random = secureIndex) {
  const order = shuffle(items, random);
  return new Map(order.map((name, i) => [name, order[(i + 1) % order.length]]));
}

export function splitTeams(items, count, random = secureIndex) {
  if (!Number.isInteger(count) || count < 2 || count > Math.min(10, items.length)) {
    throw new Error('팀 수는 2~10개이며 참가자 수를 넘을 수 없습니다.');
  }
  const teams = Array.from({ length: count }, () => []);
  shuffle(items, random).forEach((name, i) => teams[i % count].push(name));
  return teams;
}

export function roulettePick(items, random = secureIndex) {
  const index = random(items.length);
  return { index, winner: items[index], angle: 360 - (index + 0.5) * 360 / items.length };
}

export const kstToday = (now = Date.now()) => new Date(now + 9 * 3600_000).toISOString().slice(0, 10);
const animals = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
const stems = [...'갑을병정무기경신임계'];
const branches = [...'자축인묘진사오미신유술해'];
const zodiac = (year) => {
  const offset = year - 4;
  return { year, animal: animals[offset % 12], cycle: stems[offset % 10] + branches[offset % 12] };
};

export function yearZodiac(value) {
  if (!/^\d{4}$/.test(value) || value < dateRange[0].slice(0, 4) || value > dateRange[1].slice(0, 4)) {
    throw new Error('1900~2100년 사이의 출생연도를 입력해 주세요.');
  }
  return { after: zodiac(Number(value)), before: zodiac(Number(value) - 1) };
}

export function birthdayZodiac(birth, today = kstToday()) {
  const age = ageAt(birth, today);
  const { after, before } = yearZodiac(birth.slice(0, 4));
  if ([2026, 2027, 2028].includes(after.year)) {
    const seollal = lunarToSolar(after.year, 1, 1);
    return { age, sign: birth < seollal ? before : after, seollal, source: 'official' };
  }
  try {
    const lunar = new Intl.DateTimeFormat('en-u-ca-dangi', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'Asia/Seoul' });
    const parts = lunar.formatToParts(new Date(`${birth}T12:00:00+09:00`));
    const year = Number(parts.find(({ type }) => type === 'relatedYear')?.value);
    if (lunar.resolvedOptions().calendar === 'dangi' && [after.year, before.year].includes(year)) {
      return { age, sign: zodiac(year), source: 'browser' };
    }
  } catch { }
  return { age, before, after, source: 'unavailable' };
}

export function wrapCardText(text, fits) {
  const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
  return text.split(/\r\n?|\n/).flatMap((paragraph) => {
    const lines = [];
    let line = '';
    for (const { segment } of segmenter.segment(paragraph)) {
      if (line && !fits(line + segment)) {
        lines.push(line.trimEnd());
        line = segment.trimStart();
      } else line += segment;
    }
    return [...lines, line.trimEnd()];
  });
}
