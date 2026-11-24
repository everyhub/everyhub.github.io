export const verifiedOn = '2026-11-24';

const source = (name, url, effective) => ({ name, url, effective });
export const laborSources = {
  minimum26: source('최저임금위원회 · 2026년 적용 최저임금 고시', 'https://www.minimumwage.go.kr/file/downloadSeq.do?bultnId=4657&fileSeq=1', '2026-01-01'),
  minimum27: source('최저임금위원회 · 2027년 적용 최저임금 고시', 'https://www.minimumwage.go.kr/file/downloadSeq.do?bultnId=4774&fileSeq=3', '2027-01-01'),
  partTime: source('국가법령정보센터 · 근로기준법 제18조', 'https://law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1010523521', '2026-10-08'),
  weekly: source('국가법령정보센터 · 근로기준법 시행령 제30조 및 별표 2', 'https://www.law.go.kr/LSW/lsInfoR.do?efYd=20251023&lsiSeq=270551', '2025-10-23'),
  weeklyExample: source('고용노동부 · 주휴수당 계산 예시', 'https://www.moel.go.kr/mainpop2.do'),
  overtime: source('국가법령정보센터 · 근로기준법 제56조', 'https://www.law.go.kr/법령/근로기준법/제56조', '2026-10-08'),
  overtimeExample: source('고용노동부 · 휴일근로의 임금 및 가산수당', 'https://1350.moel.go.kr/home/hp/data/faqView.do?faq_idx=1000000818'),
  annualLeave: source('국가법령정보센터 · 근로기준법 제60조', 'https://www.law.go.kr/법령/근로기준법/제60조', '2026-10-08'),
  severance: source('국가법령정보센터 · 근로자퇴직급여 보장법 제4조·제8조', 'https://www.law.go.kr/LSW/lsInfoR.do?chrClsCd=010202&efYd=20260918&lsiSeq=284455', '2026-09-18'),
  severanceExample: source('고용노동부 · 퇴직금 계산 및 금액 예제', 'https://www.moel.go.kr/retirementpayCal.do'),
  unemployment: source('국가법령정보센터 · 고용보험법 제46조', 'https://www.law.go.kr/법령/고용보험법/제46조', '2019-10-01'),
  unemploymentLimit: source('국가법령정보센터 · 고용보험법 시행령 제68조', 'https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1031081101', '2026-01-01'),
  unemploymentProposal: source('국민참여입법센터 · 구직급여 상한 산정 방식 변경 입법예고 (확정 기준 아님)', 'https://opinion.lawmaking.go.kr/gcom/ogLmPp/88794'),
  unemploymentDays: source('국가법령정보센터 · 고용보험법 별표 1', 'https://www.law.go.kr/LSW/flDownload.do?flSeq=162395969', '2019-10-01'),
  unemploymentExample: source('고용노동부 · 2026년 근로시간별 구직급여 하한액', 'https://1350.moel.go.kr/rtmview.do?id=1000329198', '2026-01-01'),
  parental: source('국가법령정보센터 · 고용보험법 시행령 제95조', 'https://www.law.go.kr/법령/고용보험법시행령/제95조', '2025-01-01'),
  parentalSpecial: source('국가법령정보센터 · 고용보험법 시행령 제95조의3', 'https://www.law.go.kr/LSW/lsLinkProc.do?joNo=009503&lsClsCd=L&lsNm=%EA%B3%A0%EC%9A%A9%EB%B3%B4%ED%97%98%EB%B2%95+%EC%8B%9C%ED%96%89%EB%A0%B9&mode=11', '2026-09-18'),
  parentalGuide: source('고용24 · 육아휴직급여 일반·6+6·한부모', 'https://www.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systId=SI00000402', '2025-01-01'),
  maternity: source('국가법령정보센터 · 출산전후휴가 급여등 상한액 고시', 'https://www.law.go.kr/LSW/admRulInfoR.do?admRulSeq=2100000271634', '2026-01-01'),
  maternityLatest: source('고용노동부 · 출산전후휴가 급여 등 상한액 최신 고시', 'https://moel.go.kr/info/lawinfo/instruction/view.do?bbs_seq=20260900589', '2026-09-18'),
  maternityProposal: source('고용노동부 · 출산전후휴가 급여 등 상한액 개정 행정예고 (확정 기준 아님)', 'https://www.moel.go.kr/info/lawinfo/lawmaking/view.do?bbs_seq=20261100031'),
  maternityDays: source('국가법령정보센터 · 근로기준법 제74조', 'https://law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1007688853', '2025-02-23'),
  maternityGuide: source('고용24 · 출산전후휴가급여 지원 범위와 지급액', 'https://www.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systId=SI00000407'),
  employment: source('국가법령정보센터 · 고용·산재보험료징수법 시행령 제12조', 'https://law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000953537', '2025-12-23'),
  accident: source('국가법령정보센터 · 2026년 사업종류별 산재보험료율 고시 별지', 'https://www.law.go.kr/LSW/flDownload.do?flSeq=160837293', '2026-01-01'),
};

export const laborRates = {
  minimum: [
    { year: 2026, hourly: 10_320, source: laborSources.minimum26 },
    { year: 2027, hourly: 10_700, source: laborSources.minimum27 },
  ],
  hours: { daily: 8, weekly: 40, monthlyFullTime: 209, eligibilityWeekly: 15 },
  overtime: { extended: 0.5, night: 0.5, holiday: 0.5, holidayExtra: 1, holidayCutoff: 8, nightFrom: 22, nightUntil: 6 },
  severance: { dailyMultiple: 30, daysPerYear: 365 },
  unemployment: {
    share: 0.6, baseMaximum: 113_500, minimumShare: 0.8, seniorAge: 50,
    days: [[0, 120, 120], [12, 150, 180], [36, 180, 210], [60, 210, 240], [120, 240, 270]],
  },
  parental: {
    minimum: 700_000, general: [[1, 1, 2_500_000], [4, 1, 2_000_000], [7, 0.8, 1_600_000]],
    shared: [2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000],
    singleParent: 3_000_000, singleParentMonths: 3, months: 12, extendedMonths: 18,
  },
  maternity: {
    monthlyCap: 2_200_000, monthDays: 30,
    types: {
      single: { label: '단태아', total: 90, employerDays: 60, postBirth: 45, cap: 6_600_000 },
      premature: { label: '법정 미숙아 요건 충족', total: 100, employerDays: 60, postBirth: 45, cap: 7_333_330 },
      multiple: { label: '다태아', total: 120, employerDays: 75, postBirth: 60, cap: 8_800_000 },
    },
  },
  annualLeave: { attendance: 80, normal: 15, ceiling: 25, firstYearMax: 11, extraEveryYears: 2 },
  employer: {
    employmentAdditions: [
      ['150인 미만', 25],
      ['150인 이상 우선지원대상기업', 45],
      ['150~999인 (우선지원대상기업 제외)', 65],
      ['1,000인 이상 (우선지원대상기업 제외)·국가/지자체 직접 사업', 85],
    ],
    employmentDenominator: 10_000, accidentDenominator: 1_000, commute: 0.6,
    industries: [
      ['도소매·음식·숙박업', 8], ['기타의 각종사업', 8], ['시설관리 및 사업지원 서비스업', 8],
      ['전문·보건·교육·여가관련 서비스업', 6], ['부동산 및 임대업', 7], ['금융 및 보험업', 5],
      ['국가 및 지방자치단체의 사업', 9], ['건설업', 35], ['석탄광업 및 채석업', 185],
      ['석회석·금속·비금속·기타광업', 57], ['식료품 제조업', 16], ['섬유 및 섬유제품 제조업', 11],
      ['목재 및 종이제품 제조업', 20], ['출판·인쇄·제본업', 9], ['화학 및 고무제품 제조업', 13],
      ['의약품·화장품·연탄·석유제품 제조업', 7], ['기계기구·금속·비금속광물제품 제조업', 13],
      ['금속제련업', 10], ['전기기계기구·정밀기구·전자제품 제조업', 6], ['선박건조 및 수리업', 24],
      ['수제품 및 기타제품 제조업', 12], ['전기·가스·증기·수도사업', 7],
      ['철도·항공·창고·운수관련서비스업', 8], ['육상 및 수상운수업', 18], ['통신업', 9],
      ['임업', 58], ['어업', 27], ['농업', 20],
    ],
  },
};
