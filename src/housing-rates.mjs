const source = (name, url, effective) => ({ name, url, effective });
const fund = 'https://nhuf.molit.go.kr/FP/FP05/';

export const housingSources = {
  lh: source('LH 청약플러스 · 임대료 상호 전환이율 변경 안내', 'https://apply.lh.or.kr/lhapply/apply/noti/an/view.do?bbsSn=9102431119&ccrCnntSysDsCd=02&mi=1079', '2026-01-01'),
  lhNational: source('LH · 평택송화 국민임대 공고 (2026-11-05)', 'https://apply.lh.or.kr/lhapply/lhFile.do?fileid=69320623'),
  lhHappy: source('LH · 부천원종 A2 행복주택 공고 (2026-03-19)', 'https://apply.lh.or.kr/lhapply/lhFile.do?fileid=66067083'),
  shYouth: source('SH · 청년창업인 매입임대 공고 (2026년 7월)', 'https://www.i-sh.co.kr/com/file/innoFD.do?brdId=GS0401&fileSeq=1&fileTp=A&seq=306908'),
  shFamily: source('SH · 신혼·신생아 매입임대Ⅱ 공고 (2026-09-30)', 'https://www.i-sh.co.kr/main/com/file/innoFD.do?brdId=GS0401&fileSeq=2&fileTp=A&seq=310653'),
  hug: source('HUG · 모바일 전세보증금반환보증 상품안내', 'https://onestop.khug.or.kr/webView/webBiz/apply/goods001'),
  hf: source('HF · 일반전세지킴보증과 보증료율', 'https://www.hf.go.kr/ko/sub02/sub02_05_01.do', '2025-03-01'),
  sgi: source('SGI서울보증 · 공식 보험상품 안내', 'https://www.sgic.co.kr/'),
  general: source('주택도시기금 · 버팀목전세자금', `${fund}FP0502/FP05020101.jsp`),
  youth: source('주택도시기금 · 청년전용 버팀목전세자금', `${fund}FP0502/FP05020301.jsp`),
  married: source('주택도시기금 · 신혼부부전용 전세자금', `${fund}FP0502/FP05020401.jsp`),
  newborn: source('주택도시기금 · 전세자금 상품 목록 (신생아 특례 버팀목)', `${fund}FP0501/FP0501.jsp`),
  mortgage: source('주택도시기금 · 내집마련 디딤돌대출', `${fund}FP0503/FP05030104.jsp`),
  brokerage: source('국가법령정보센터 · 공인중개사법 시행규칙 제20조', 'https://www.law.go.kr/법령/공인중개사법시행규칙/제20조'),
  seoulBrokerage: source('서울특별시 · 부동산 중개보수 요율표', 'https://land.seoul.go.kr/land/broker/brokerageCommission.do'),
  acquisition: source('국가법령정보센터 · 지방세법 제11조', 'https://www.law.go.kr/법령/지방세법/제11조'),
  acquisitionHeavy: source('국가법령정보센터 · 지방세법 제13조의2', 'https://www.law.go.kr/법령/지방세법/제13조의2'),
  acquisitionOther: source('고흥군 · 지방교육세·농어촌특별세 포함 세율표', 'https://www.goheung.go.kr/contentsView.do?pageId=www527'),
  score: source('한국부동산원 청약홈 · 민영주택 청약가점 적용 기준', 'https://www.applyhome.co.kr/ar/ara/selectSubscrptIntroPreawnerSlctnView.do'),
  supply: source('국가법령정보센터 · 주택공급에 관한 규칙 별표 1', 'https://www.law.go.kr/법령/주택공급에관한규칙'),
  spouseScore: source('한국부동산원 청약홈 · 배우자 통장 가점 안내', 'https://www.applyhome.co.kr/ap/apg/selectAddpntCalculatorView.do'),
  renewal: source('국가법령정보센터 · 주택임대차보호법 제7조', 'https://www.law.go.kr/법령/주택임대차보호법/제7조'),
  renewalRight: source('국가법령정보센터 · 주택임대차보호법 제6조의3', 'https://www.law.go.kr/법령/주택임대차보호법/제6조의3'),
  report: source('국토교통부 부동산거래관리시스템 · 주택임대차계약 신고제', 'https://rtms.molit.go.kr/main/serviceInfo.do'),
};

export const publicRentalProfiles = {
  lhNational: { name: 'LH 국민임대 (공고별 한도)', increase: 6, decrease: 3.5, step: 1_000_000, source: 'lhNational' },
  lhHappy: { name: 'LH 행복주택 (공고별 한도)', increase: 6, decrease: 3.5, step: 1_000_000, source: 'lhHappy' },
  shYouth: { name: 'SH 청년창업인 매입임대 (공고 예시)', increase: 6.7, decrease: 2.5, shares: [60, 60], source: 'shYouth' },
  shFamily: { name: 'SH 신혼·신생아Ⅱ 일반형 (공고 예시)', increase: 6.7, decrease: 2.5, shares: [60, 60], source: 'shFamily' },
  shJeonse: { name: 'SH 신혼·신생아Ⅱ 전세형 (공고 예시)', increase: 6.7, decrease: 2.5, shares: [80, 60], source: 'shFamily' },
};

export const guaranteeRates = { hug: [0.115, 0.154], hf: [[70, 0.04], [80, 0.11], [90, 0.18]] };
export const jeonseLoanRules = {
  general: { rates: [2.5, 3.5], regional: [120_000_000, 80_000_000], ratios: [70, 80], family: [250_000_000, 160_000_000] },
  youth: { rates: [2.2, 3.3], regional: [150_000_000, 150_000_000], ratios: [80, 80], small: 120_000_000 },
  married: { rates: [1.9, 3.3], regional: [250_000_000, 160_000_000], ratios: [80, 80] },
  newborn: { rates: [1.3, 4.3], regional: [240_000_000, 240_000_000], ratios: [80, 80] },
};
export const mortgageRules = { rates: [2.85, 4.15], caps: { standard: 200_000_000, first: 240_000_000, family: 320_000_000 }, ltv: 70, firstLtv: 80 };
export const brokerageRules = {
  sale: [[50_000_000, 6, 250_000], [200_000_000, 5, 800_000], [900_000_000, 4], [1_200_000_000, 5], [1_500_000_000, 6], [Infinity, 7]],
  lease: [[50_000_000, 5, 200_000], [100_000_000, 4, 300_000], [600_000_000, 3], [1_200_000_000, 4], [1_500_000_000, 5], [Infinity, 6]],
};
export const reportRules = { deposit: 60_000_000, monthly: 300_000, days: 30, renewalCap: 5 };
