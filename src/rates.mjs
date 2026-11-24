export const rates = {
  year: 2026,
  defaultTaxFree: 200_000,
  // 국민연금공단 (2026년 총 9.5%, 근로자 절반).
  pension: { numerator: 475, denominator: 10_000, periods: [
    { from: 1, min: 400_000, max: 6_370_000 },
    { from: 7, min: 410_000, max: 6_590_000 },
  ] },
  // 국민건강보험공단: 건강보험 총 7.19%, 근로자 절반; 고시 상하한도 절반.
  health: { numerator: 3595, denominator: 100_000, min: 10_080, max: 4_591_740 },
  // 보건복지부 2026년 장기요양위원회: 건강보험료 대비 13.14%.
  care: { numerator: 1314, denominator: 10_000, periods: [
    { from: 1, numerator: 9448, denominator: 71900 },
    { from: 11, numerator: 1314, denominator: 10_000 },
  ] },
  // 고용노동부 2026년 고용보험 안내: 일반 근로자 실업급여 부담 0.9%.
  employment: { numerator: 9, denominator: 1_000 },
  // 소득세법 시행령 별표 2 (100% 원천징수), 2026-03-01 개정 세액 적용.
  incomeTax: {
    childCredits: [
      { from: 1, one: 12_500, two: 29_160, additional: 25_000 },
      { from: 3, one: 20_830, two: 45_830, additional: 33_330 },
    ],
    // 월 과세 급여가 기준을 초과할 때 1,000만 원 세액에 더할 금액과 초과분 요율(10만분율).
    highBands: [
      { over: 10_000_000, base: 25_000, numerator: 34_300 },
      { over: 14_000_000, base: 1_397_000, numerator: 37_240 },
      { over: 28_000_000, base: 6_610_600, numerator: 39_200 },
      { over: 30_000_000, base: 7_394_600, numerator: 40_000 },
      { over: 45_000_000, base: 13_394_600, numerator: 42_000 },
      { over: 87_000_000, base: 31_034_600, numerator: 45_000 },
    ],
    highDenominator: 100_000,
    minimumWithholding: 1_000,
  },
  // 지방세법 제103조의13.
  localTax: { numerator: 1, denominator: 10 },
};

export const insurance2027 = {
  year: 2027,
  pension: { numerator: 5, denominator: 100, throughMonth: 6, min: 410_000, max: 6_590_000 },
  health: { numerator: 3595, denominator: 100_000 },
  care: { numerator: 1390, denominator: 10_000 },
};

export const insurance2027Sources = [
  { name: '국민연금공단 · 연도별 보험료율 (2026년 가입자 가이드북)', url: 'https://www.nps.or.kr/html/download/memberGuide2026.pdf', effective: '2027-01-01' },
  { name: '보건복지부 · 2027년도 건강보험료율 결정', url: 'https://www.mohw.go.kr/gallery.es?act=view&bid=0003&list_no=380402&mid=a10607030000', effective: '2027-01-01' },
  { name: '보건복지부 · 2027년도 장기요양보험료율 결정', url: 'https://www.mohw.go.kr/gallery.es?act=view&bid=0003&list_no=380579&mid=a10505000000', effective: '2027-01-01' },
];

export const sources = [
  ['국민연금공단 · 국민연금 가입대상 및 보험료', 'https://nps.or.kr/pnsinfo/ntpsklg/getOHAF0095M0.do', '2026-01-01'],
  ['보건복지부 · 2026년 상반기 국민연금 기준소득월액', 'https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000254486', '2025-07-01'],
  ['보건복지부 · 2026년 하반기 국민연금 기준소득월액', 'https://www.law.go.kr/admRulLsInfoR.do?admRulSeq=2100000274228', '2026-07-01'],
  ['국민건강보험공단 · 2026년 건강보험료율 및 장기요양보험료율', 'https://edi.nhis.or.kr/portal/images/popup/20251204_pop01longdesc.html', '2026-01-01'],
  ['국민건강보험공단 · 월별 건강보험료액 상한과 하한', 'https://www.nhis.or.kr/lm/lmxsrv/law/lawFullContent.do?SEQ=39', '2026-01-01'],
  ['보건복지부 · 건강보험료 대비 장기요양보험료율', 'https://www.mohw.go.kr/board.es?act=view&bid=0027&list_no=1487817&mid=a10503010100', '2026-01-01'],
  ['국가법령정보센터 · 장기요양보험료 산정 비율 반올림 (11월분부터)', 'https://www.law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010102&lsId=010436', '2026-11-27'],
  ['고용노동부 · 고용보험 안내', 'https://moel.go.kr/common/downloadFile.do?bbs_id=23&bbs_seq=20260200945&file_ext=pdf&file_seq=20260201644', '2026-01-01'],
  ['국세청 · 2026년 1~2월 근로소득 간이세액표', 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7862&mi=2466'],
  ['국가법령정보센터 · 근로소득 간이세액표 (2026년 3월부터)', 'https://www.law.go.kr/LSW/flDownload.do?bylClsCd=110201&flSeq=164391983', '2026-03-01'],
  ['국가법령정보센터 · 소득세 소액 부징수', 'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1032883279'],
  ['국가법령정보센터 · 지방소득세 특별징수', 'https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1000226093'],
];
