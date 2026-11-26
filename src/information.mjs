export const wishTreeSection = {
  path: 'info/christmas-wish-tree/',
  name: '크리스마스 소원 트리',
  description: '소원을 적으면 불빛을 따라 빙글빙글 도는 나만의 크리스마스 트리가 자라납니다.',
};

export const informationSections = [
  { path: 'info/holidays/2026/', name: '2026년 공휴일·연휴', description: '노동절과 제헌절을 반영한 공휴일, 대체공휴일 및 주 5일제 연휴' },
  { path: 'info/holidays/2027/', name: '2027년 공휴일·연휴', description: '설날, 추석, 노동절·제헌절 대체공휴일과 3일 이상 연휴' },
  { path: 'info/tax-calendar/', name: '주요 세금 신고·납부 일정', description: '종합소득세와 일반·간이과세자의 부가가치세 신고 기간' },
  { path: 'info/yearly-rates/', name: '2026·2027년 최저임금·보험료 비교표', description: '확정된 연도별 최저임금 및 직장인 보험료율 변경 사항' },
  { path: 'info/support-calendar/', name: '정부 지원금·신청 일정', description: '주요 지원 제도의 공식 신청 기간과 접수처' },
];

export const supportApplications = [
  {
    name: '2025년 귀속 근로·자녀장려금 기한 후 신청', deadline: '2026-12-01',
    details: '정기 신청을 놓친 가구가 대상입니다. 소득·재산 요건을 확인한 뒤 홈택스에서 신청하세요.',
    agency: '국세청 기한 후 신청 공고', notice: 'https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?nttSn=1355806', apply: 'https://www.hometax.go.kr/',
  },
  {
    name: '2026년 에너지바우처', start: '2026-06-15', deadline: '2026-12-31',
    details: '기초생활수급 자격과 세대원 특성 요건을 모두 충족해야 합니다. 온라인 접수나 주소지 행정복지센터 방문이 가능합니다.',
    agency: '복지로 신청 공고', notice: 'https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309896_1141.html', apply: 'https://www.bokjiro.go.kr/',
  },
  {
    name: '2026년 연탄전환 에너지바우처', start: '2026-08-07', deadline: '2026-12-31',
    details: '연탄보일러를 교체한 세대 중 소득 요건을 충족하는 경우입니다. 교체 시기와 필요 서류는 공고를 확인하세요.',
    agency: '복지로 신청 공고', notice: 'https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309896_1141.html', apply: 'https://www.bokjiro.go.kr/',
  },
  {
    name: '국민취업지원제도',
    details: '고용24에서 현재 신청할 수 있는지, 지원 유형별 자격은 무엇인지 확인하세요.',
    agency: '국가법령정보센터 · 취업지원 신청 근거', notice: 'https://www.law.go.kr/LSW/lsLinkProc.do?joNo=000800&lsClsCd=L&lsNm=구직자취업촉진및생활안정지원에관한법률&mode=11',
    apply: 'https://www.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systClId=SC00000274&systId=SI00000316',
  },
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
