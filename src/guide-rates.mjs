const source = (name, url, effective) => ({ name, url, effective });
const laborLaw = (article) => source(`국가법령정보센터 · 근로기준법 ${article}`, `https://www.law.go.kr/법령/근로기준법/${article}`, '2026-10-08');

export const guideSources = {
  average: laborLaw('제2조'),
  ordinary: source('국가법령정보센터 · 근로기준법 시행령 제6조', 'https://www.law.go.kr/법령/근로기준법시행령/제6조', '2025-10-23'),
  dismissal: laborLaw('제26조'),
  shutdown: laborLaw('제46조'),
  standardHours: laborLaw('제50조'),
  overtimeHours: laborLaw('제53조'),
  freelance: source('국가법령정보센터 · 소득세법 제129조', 'https://www.law.go.kr/법령/소득세법/제129조', '2026-01-01'),
  local: source('국가법령정보센터 · 지방세법 제103조의13', 'https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1000226093', '2026-07-01'),
  income: source('국가법령정보센터 · 소득세법 제55조', 'https://www.law.go.kr/법령/소득세법/제55조', '2023-01-01'),
  vat: source('국가법령정보센터 · 부가가치세법 제30조', 'https://www.law.go.kr/법령/부가가치세법/제30조', '2026-01-02'),
  gift: source('국가법령정보센터 · 상속세 및 증여세법 제53조', 'https://www.law.go.kr/법령/상속세및증여세법/제53조', '2026-01-02'),
  welfare26: source('보건복지부 · 2026년 기준 중위소득 및 생계·의료급여 선정 기준 고시', 'https://www.mohw.go.kr/board.es?act=view&bid=0026&list_no=1487112&mid=a10409020000', '2026-01-01'),
  welfare27: source('국가법령정보센터 · 2027년 기준 중위소득 및 생계·의료급여 선정 기준 고시', 'https://www.law.go.kr/admRulInfoP.do?admRulSeq=2100000283464', '2027-01-01'),
  welfareRatios: source('대한민국 정책브리핑 · 2027년 기준 중위소득 및 급여별 선정 기준', 'https://www.korea.kr/news/policyNewsView.do?newsId=148968956', '2027-01-01'),
  welfareRatios26: source('보건복지부 · 기초생활보장 급여별 2026년 선정 기준', 'https://www.mohw.go.kr/menu.es?mid=a10708010300', '2026-01-01'),
  rent: source('국가법령정보센터 · 주택임대차보호법 제7조의2', 'https://www.law.go.kr/법령/주택임대차보호법/제7조의2', '2026-01-02'),
  rentDecree: source('국가법령정보센터 · 주택임대차보호법 시행령 제9조', 'https://law.go.kr/lsLinkCommonInfo.do?lspttninfSeq=130111', '2020-09-29'),
  bank: source('한국은행 · 기준금리 추이', 'https://www.bok.or.kr/portal/singl/baseRate/progress.do?dataSeCd=01&menuNo=200643'),
};

export const guideRates = {
  dismissalDays: 30,
  shutdownShare: 70,
  standardWeekly: 40,
  overtimeWeekly: 12,
  freelanceIncome: 3,
  freelanceLocalShare: 10,
  incomeBands: [[14_000_000, 6], [50_000_000, 15], [88_000_000, 24], [150_000_000, 35],
    [300_000_000, 38], [500_000_000, 40], [1_000_000_000, 42], [Infinity, 45]],
  vat: 10,
  gift: { spouse: 600_000_000, ancestor: 50_000_000, minor: 20_000_000, descendant: 50_000_000, relative: 10_000_000, other: 0 },
  median: {
    2026: [2_564_238, 4_199_292, 5_359_036, 6_494_738, 7_556_719, 8_555_952, 9_515_150],
    2027: [2_736_042, 4_480_645, 5_718_091, 6_929_885, 8_063_019, 9_129_201, 10_152_665],
  },
  welfare: { livelihood: 32, medical: 40, housing: 48, education: 50 },
  rent: { maximum: 10, spread: 2 },
};
