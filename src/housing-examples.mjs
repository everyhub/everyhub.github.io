export const housingExamples = [
  { id: 'public-rent-conversion', path: 'housing/lh-deposit-1000/', title: 'LH 전환보증금 1,000만 원과 월 임대료',
    description: 'LH 국민임대·행복주택의 연 6% 증액, 연 3.5% 감액 전환이율을 비교합니다. 기본 보증금 4,000만 원·월 임대료 30만 원, 방향별 전환 한도 2,000만 원을 가정합니다.',
    rowKeys: ['rate', 'deposit', 'monthly'], cases: [['보증금 1,000만 원 증액', {}], ['보증금 1,000만 원 감액', { direction: 'decrease' }]] },
  { id: 'public-rent-conversion', path: 'housing/sh-deposit-1000/', title: 'SH 전환보증금 1,000만 원과 월 임대료',
    description: 'SH 신혼·신생아 매입임대Ⅱ 일반형 공고를 기준으로 미리 계산합니다. 기본 보증금은 4,000만 원, 월 임대료는 30만 원으로 가정합니다.',
    rowKeys: ['rate', 'deposit', 'monthly'], cases: [['보증금 1,000만 원 증액', { profile: 'shFamily' }], ['보증금 1,000만 원 감액', { profile: 'shFamily', direction: 'decrease' }]] },
  { id: 'tenancy-renewal-report', path: 'housing/renewal-5-percent/', title: '전세 2억·월세 60만 원의 갱신 5% 계산',
    description: '이전 계약·증액으로부터 1년이 지나고 조례상 더 낮은 상한이 없을 때, 순수 전세와 월세의 갱신 한도를 비교합니다.',
    rowKeys: ['depositLimit', 'monthlyLimit'], cases: [
      ['전세 보증금 2억 원', { deposit: 200_000_000, monthly: 0, newDeposit: 210_000_000, newMonthly: 0 }],
      ['월세 60만 원 (보증금 1,000만 원 유지)', { deposit: 10_000_000, monthly: 600_000, newDeposit: 10_000_000, newMonthly: 630_000 }],
    ] },
  { id: 'brokerage-fee', path: 'housing/jeonse-brokerage-3eok/', title: '서울 전세 3억 원과 월세 중개보수',
    description: '서울 전세 보증금 3억 원과 보증금 3,000만 원·월세 100만 원의 주택 임대차 중개보수 상한을 비교합니다.',
    rowKeys: ['value', 'rate', 'fee'], cases: [['전세 3억 원', { type: 'lease', amount: 300_000_000 }],
      ['보증금 3,000만 원·월세 100만 원', { type: 'monthly', amount: 30_000_000, monthly: 1_000_000 }]] },
];
