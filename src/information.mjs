export const informationSections = [
  { path: 'info/holidays/2026/', name: '2026년 공휴일·연휴', description: '노동절과 제헌절을 반영한 공휴일, 대체공휴일 및 주 5일제 연휴' },
  { path: 'info/holidays/2027/', name: '2027년 공휴일·연휴', description: '설날, 추석, 노동절·제헌절 대체공휴일과 3일 이상 연휴' },
  { path: 'info/tax-calendar/', name: '주요 세금 신고·납부 일정', description: '종합소득세와 일반·간이과세자의 부가가치세 신고 기간' },
  { path: 'info/yearly-rates/', name: '2026·2027년 최저임금·보험료 비교표', description: '확정된 연도별 최저임금 및 직장인 보험료율 변경 사항' },
];

const source = (name, url, effective) => ({ name, url, effective });
export const informationSources = {
  calendar2026: source('한국천문연구원 · 2026년 월력요항', 'https://astro.kasi.re.kr/life/post/almanac?year=2026', '2026-01-01'),
  calendar2027: source('우주항공청 · 2027년 월력요항 발표', 'https://www.kasa.go.kr/prog/plcyBrf/brief/kor/sub01_01_04/view.do?plcyBrfNo=431', '2027-01-01'),
  holidayLaw: source('국가법령정보센터 · 관공서의 공휴일에 관한 규정 개정 이유', 'https://www.law.go.kr/LSW/lsRvsRsnListP.do?chrClsCd=010102&lsId=002404', '2026-05-01'),
  incomeTax: source('국세청 · 종합소득세 신고·납부 안내', 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7664&mi=2225'),
  vat: source('국세청 · 부가가치세 신고·납부 기간', 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2273'),
  tax2026: source('국세청 · 2026년 세무일정', 'https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2026'),
  tax2027: source('국세청 · 2027년 세무일정', 'https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=2027'),
};

const alternate = (day, reason) => [day, `대체공휴일(${reason})`];
const fixed = [
  ['01-01', '1월 1일'], ['03-01', '삼일절'], ['05-01', '노동절'], ['05-05', '어린이날'], ['06-06', '현충일'],
  ['07-17', '제헌절'], ['08-15', '광복절'], ['10-03', '개천절'], ['10-09', '한글날'], ['12-25', '성탄절'],
];
const byYear = {
  2026: [['02-16', '설 연휴'], ['02-17', '설날'], ['02-18', '설 연휴'], alternate('03-02', '삼일절'),
    ['05-24', '부처님오신날'], alternate('05-25', '부처님오신날'), ['06-03', '전국동시지방선거'],
    alternate('08-17', '광복절'), ['09-24', '추석 연휴'], ['09-25', '추석'], ['09-26', '추석 연휴'], alternate('10-05', '개천절')],
  2027: [['02-06', '설 연휴'], ['02-07', '설날'], ['02-08', '설 연휴'], alternate('02-09', '설날'),
    alternate('05-03', '노동절'), ['05-13', '부처님오신날'], alternate('07-19', '제헌절'),
    alternate('08-16', '광복절'), ['09-14', '추석 연휴'], ['09-15', '추석'], ['09-16', '추석 연휴'],
    alternate('10-04', '개천절'), alternate('10-11', '한글날'), alternate('12-27', '성탄절')],
};

const iso = (day) => day.toISOString().slice(0, 10);

export function holidayCalendar(year) {
  const holidays = [...fixed, ...byYear[year]].sort(([first], [second]) => first.localeCompare(second))
    .map(([day, name]) => ({ date: `${year}-${day}`, name }));
  const dates = new Set(holidays.map(({ date }) => date));
  const blocks = [];
  let daysOff = 0;
  let block = [];
  const day = new Date(Date.UTC(year, 0, 1));
  const flush = () => {
    if (block.length >= 3) blocks.push({ first: block[0], last: block.at(-1), days: block.length });
    block = [];
  };
  while (day.getUTCFullYear() === year) {
    const date = iso(day);
    if (day.getUTCDay() === 0 || day.getUTCDay() === 6 || dates.has(date)) {
      block.push(date);
      daysOff++;
    } else flush();
    day.setUTCDate(day.getUTCDate() + 1);
  }
  flush();
  return { holidays, blocks, daysOff };
}
