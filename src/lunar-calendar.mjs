export const lunarSources = [
  { name: '한국천문연구원 · 2026년 달력자료', url: 'https://astro.kasi.re.kr/file/1785891552343_1.txt' },
  { name: '한국천문연구원 · 2027년 달력자료', url: 'https://astro.kasi.re.kr/file/1785891930084_1.txt' },
  { name: '한국천문연구원 · 2028년 달력자료', url: 'https://astro.kasi.re.kr/file/1785891508509_1.txt' },
];

const data = [
  [2026, '2026-02-17 2026-03-19 2026-04-17 2026-05-17 2026-06-15 2026-07-14 2026-08-13 2026-09-11 2026-10-11 2026-11-09 2026-12-09 2027-01-08'],
  [2027, '2027-02-07 2027-03-08 2027-04-07 2027-05-06 2027-06-05 2027-07-04 2027-08-02 2027-09-01 2027-09-30 2027-10-29 2027-11-28 2027-12-28'],
  [2028, '2028-01-27 2028-02-25 2028-03-26 2028-04-25 2028-05-24 2028-06-23 2028-07-22 2028-08-20 2028-09-19 2028-10-18 2028-11-16 2028-12-16 2029-01-15', 5],
];
const dayMs = 86_400_000;
const time = (iso) => Date.parse(iso + 'T00:00:00Z');
const end = '2029-02-13';
const months = data.flatMap(([year, dates, leap]) => dates.split(' ')
  .map((date, i) => ({ year, month: i + 1 - Number(leap != null && i >= leap), leap: i === leap, start: time(date) })));
export const lunarSolarRange = ['2026-02-17', '2029-02-12'];

export function solarToLunar(date) {
  const value = time(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(value) ||
      date < lunarSolarRange[0] || date > lunarSolarRange[1] || new Date(value).toISOString().slice(0, 10) !== date) {
    throw new Error('자료 범위 안의 실제 양력 날짜를 입력해 주세요.');
  }
  const { year, month, leap, start } = months.findLast((month) => month.start <= value);
  return { year, month, leap, day: (value - start) / dayMs + 1 };
}

export function lunarToSolar(year, month, day, leap = false) {
  const i = months.findIndex((item) => item.year === year && item.month === month && item.leap === leap);
  if (i < 0) throw new Error('해당 음력 연월 또는 윤달이 없습니다.');
  const value = months[i].start + (day - 1) * dayMs;
  if (!Number.isInteger(day) || day < 1 || value >= (months[i + 1]?.start ?? time(end))) {
    throw new Error('해당 음력 월에 없는 날짜입니다.');
  }
  return new Date(value).toISOString().slice(0, 10);
}
