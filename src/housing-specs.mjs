import * as calc from './housing.mjs';
import { housingSources as s, publicRentalProfiles } from './housing-rates.mjs';
import { formatNumber, won } from './display.mjs';

const num = (key, label, value, min = 0, max = 10_000_000_000, step = 1) => ({ key, label, value, min, max, step });
const select = (key, label, value, options) => ({ key, label, value, options });
const out = (key, label, format = won) => ({ key, label, format });
const pct = (value) => `${formatNumber(value)}%`;
const ratio = (key, label, value, max = 100) => num(key, label, value, 0, max, 0.001);
const days = (value) => `${formatNumber(value)}일`;
const points = (value) => `${formatNumber(value)}점`;
const yesNo = [['yes', '예'], ['no', '아니요']];
const regions = [['metro', '수도권'], ['other', '수도권 밖']];
const entry = (name, description, scope, fields, outputs, calculate, sources, faq, related) =>
  ({ category: 'housing', name, description, scope, fields, outputs, calculate, sources, faq, related });

export const housingTools = {
  'public-rent-conversion': entry('LH·SH 전환보증금 계산기',
    'LH 국민임대·행복주택과 SH 매입임대 공고의 보증금 증액·감액 전환이율로 바뀌는 월 임대료를 계산하세요.',
    '공고 또는 계약서의 기본 임대조건과 비교하세요. LH는 선택한 방향의 최대 전환 임대보증금에서 기본 보증금을 뺀 차액의 절댓값을 입력해야 합니다. SH는 아래에 인용한 공고 예시이며 개별 하한·전환 단위나 계약 반올림에 따라 달라질 수 있습니다.',
    [select('profile', '기관·임대주택 유형', 'lhNational', Object.entries(publicRentalProfiles).map(([key, { name }]) => [key, name])),
      select('direction', '전환 방향', 'increase', [['increase', '보증금 증액 → 월 임대료 감소'], ['decrease', '보증금 감액 → 월 임대료 증가']]),
      num('deposit', '기본 임대보증금 (원)', 40_000_000), num('monthly', '기본 월 임대료 (원)', 300_000),
      num('change', '늘리거나 줄이는 보증금 (원)', 10_000_000), num('noticeLimit', 'LH 공고의 방향별 최대 보증금 차액 (원, SH는 미사용)', 20_000_000)],
    [out('rate', '전환이율 (연)', pct), out('limit', '최대 보증금 차액 (입력·공고 예시 기준)'), out('delta', '월 임대료 변동액'),
      out('deposit', '전환 후 보증금'), out('monthly', '전환 후 월 임대료')], calc.publicRent,
    [s.lh, s.lhNational, s.lhHappy, s.shYouth, s.shFamily], [
      ['LH에서 보증금 1,000만 원을 더 내면 월 임대료가 얼마나 줄어드나요?', '연 6%를 적용하는 계약에서 월 5만 원 줄어듭니다. 반대로 보증금을 1,000만 원 빼면 연 3.5% 기준 약 2만 9,167원 늘어납니다.'],
      ['SH는 전환 한도가 모두 같은가요?', '아닙니다. 인용한 신혼·신생아Ⅱ 공고는 월 임대료 기준 일반형 60%, 전세형 80%까지 보증금으로 전환할 수 있습니다. 반대 방향은 기본 보증금의 60%입니다. 다른 공고나 계약은 해당 조건을 확인하세요.'],
    ], ['rent-conversion']),
  'jeonse-guarantee-fee': entry('전세보증금 반환보증 보증료 계산기',
    'HUG 모바일 상품의 공식 보증료 범위, HF 일반전세지킴보증의 담보인정비율별 기본 보증료, SGI 견적 요율 적용액을 비교하세요.',
    '가입 가능 여부를 판단하지 않습니다. HUG는 공식 모바일 상품에서 안내한 범위만 표시합니다. HF는 우대 제외 기본 요율이며 연도별로 365일 또는 366일을 선택하세요. SGI는 공식 견적 연 보험료율을 입력한 단순 365일 환산 예시이며 실제 보험료는 견적을 따릅니다.',
    [select('provider', '기관', 'hug', [['hug', 'HUG · 모바일 전세보증금반환보증'], ['hf', 'HF · 일반전세지킴보증'], ['sgi', 'SGI · 공식 견적 요율 직접 입력']]),
      num('amount', '보증 신청액 (원)', 200_000_000, 1), ratio('ltv', 'HF 담보인정비율 (%, HF만 사용)', 75),
      num('days', '계산할 보증 기간 (일)', 365, 1, 3_660),
      select('yearDays', 'HF 일할 계산의 연간 일수 (HF만 사용)', 365, [[365, '일반 연도 365일'], [366, '윤년 366일']]),
      ratio('quote', 'SGI 공식 견적 연 보험료율 (%, SGI만 사용)', 0, 5)],
    [out('minRate', '연 요율 (최저)', pct), out('maxRate', '연 요율 (최고)', pct), out('minFee', '예상 보증료 (최저)'), out('maxFee', '예상 보증료 (최고)')],
    calc.guaranteeFee, [s.hug, s.hf, s.sgi], [
      ['보증료가 집마다 다른 이유는 무엇인가요?', 'HUG와 HF는 상품과 주택 위험도에 따라 요율을 달리 적용합니다. 실제 보증료와 보증 가능 금액은 각 기관 심사 결과를 확인하세요.'],
      ['전세대출 보증료를 계산하나요?', '아닙니다. 전세보증금 반환을 보장하는 상품이며, 은행의 전세대출 보증과는 다릅니다.'],
    ]),
  'jeonse-loan-interest': entry('버팀목·청년·신혼 전세대출 한도·월이자 계산기',
    '기금의 일반 버팀목, 청년전용 버팀목, 신혼부부전용 전세자금, 신생아 특례 버팀목의 공시 금리 범위와 신규 계약 한도를 비교하세요.',
    '호당 한도와 신규 계약의 보증금 비율만 반영합니다. 자격 심사, 소득·자산, 대상 주택, 보증 평가, 지역 금리 인하·우대 및 갱신 계약 한도는 별도입니다. 월이자는 실제 적용받는 금리를 입력한 이자만 납부하는 경우의 예시입니다.',
    [select('product', '대출 상품', 'general', [['general', '일반 버팀목'], ['youth', '청년전용 버팀목'], ['married', '신혼부부전용 전세자금'], ['newborn', '신생아 특례 버팀목']]),
      select('region', '주택 소재지', 'metro', regions),
      select('household', '해당하는 가구 조건', 'standard', [['standard', '기본'], ['children', '신혼·2자녀 이상 (일반 버팀목만)'], ['under25', '만 25세 미만 단독 세대주 (청년전용만)']]),
      num('deposit', '임차보증금 (원)', 180_000_000, 1), num('requested', '희망 대출액 (원)', 100_000_000, 1),
      ratio('rate', '본인이 확인한 최종 연금리 (%)', 2.8, 25)],
    [out('minRate', '공시 연금리 범위 (최저)', pct), out('maxRate', '공시 연금리 범위 (최고)', pct),
      out('share', '신규 계약의 보증금 한도 비율', pct), out('limit', '이론상 신규 계약 한도'), out('interest', '입력한 금리 기준 한 달 이자')],
    calc.jeonseLoan, [s.general, s.youth, s.married, s.newborn], [
      ['호당 한도까지 항상 빌릴 수 있나요?', '임차보증금 비율과 호당 한도 중 낮은 값부터 적용합니다. 보증 심사와 소득·자산·주택 조건에 따라 승인액은 더 적을 수 있습니다.'],
      ['금리를 어디서 확인할 수 있나요?', '각 주택도시기금 상품 페이지의 소득·보증금별 금리와 우대 요건을 확인한 뒤 적용받는 금리를 입력하세요.'],
    ], ['didimdol-payment']),
  'didimdol-payment': entry('디딤돌대출 원리금·월 상환액 계산기',
    '디딤돌대출의 공시 금리 범위와 호당 한도를 확인하고 원리금균등·원금균등 상환액을 비교하세요.',
    '담보인정비율과 호당 한도만 적용한 예시입니다. DTI, 주택 가격·면적, 소득·자산, 방공제, 우대·지방 금리 및 거치·체증식은 포함하지 않습니다. 고정 금리·무거치 월 상환의 근사치로, 은행의 일할·단수 계산과 다를 수 있습니다.',
    [select('household', '대출 한도 구분', 'standard', [['standard', '일반'], ['first', '생애최초 일반'], ['family', '신혼·2자녀 이상']]),
      select('region', '주택 소재지', 'restricted', [['restricted', '수도권 또는 규제지역'], ['other', '수도권 밖 비규제지역']]),
      num('price', '담보주택 평가액 (원)', 400_000_000, 1), num('principal', '대출 원금 (원)', 200_000_000, 1),
      ratio('rate', '본인이 확인한 최종 연금리 (%)', 3.5, 25),
      select('years', '기간', 30, [10, 15, 20, 30].map((n) => [n, `${n}년`])),
      select('method', '상환 방식', 'equal', [['equal', '원리금균등'], ['principal', '원금균등']])],
    [out('minRate', '공시 연금리 범위 (최저)', pct), out('maxRate', '공시 연금리 범위 (최고)', pct), out('ltv', '계산에 적용한 LTV', pct),
      out('limit', '호당·LTV 기준 한도'), out('first', '첫 달 원리금'), out('last', '마지막 달 원리금'), out('interest', '총 이자')],
    calc.mortgage, [s.mortgage], [['원금균등 상환은 월 납입액이 같은가요?', '같은 원금을 매달 갚고 남은 잔액에 이자를 내므로 첫 달 원리금이 가장 크고 시간이 지나며 줄어듭니다.']], ['jeonse-loan-interest']),
  'brokerage-fee': entry('서울 주택 중개보수 상한 계산기',
    '서울의 주택 매매·전세·월세 중개보수 상한과 월세 환산 거래금액을 확인하세요.',
    '서울특별시 주택 요율표의 거래 당사자 한쪽 기준입니다. 실제 보수는 상한 범위에서 협의하며 부가가치세와 실비는 별도입니다. 오피스텔·비주택 및 다른 시도 조례는 적용하지 않습니다.',
    [select('type', '거래 유형', 'monthly', [['sale', '매매·교환'], ['lease', '전세'], ['monthly', '월세']]),
      num('amount', '매매가 또는 임대보증금 (원)', 20_000_000), num('monthly', '월세 (원, 월세 계약만)', 700_000)],
    [out('value', '중개보수 기준 거래금액'), out('rate', '상한요율', pct), out('fee', '중개보수 상한 (부가세 제외)')], calc.brokerage,
    [s.brokerage, s.seoulBrokerage], [['월세 거래금액은 어떻게 환산하나요?', '보증금에 월세의 100배를 더합니다. 그 합계가 5,000만 원 미만이면 월세의 70배를 더해 다시 계산합니다.']]),
  'home-acquisition-tax': entry('주택 취득세·지방교육세 계산기',
    '유상 매매로 주택을 취득할 때 주택 수·조정대상지역·취득가에 따른 취득세와 지방교육세·농어촌특별세를 계산하세요.',
    '개인 기준입니다. 주택 수는 취득 후 법정 산정 주택 수를 입력하세요. 일시적 2주택, 생애최초 등 감면·예외, 주택 수에서 제외되는 물건 및 법인·증여·상속은 반영하지 않습니다. 적용 지역과 규모는 취득일 기준으로 확인하세요.',
    [num('price', '취득가액 (원)', 750_000_000, 1),
      select('count', '취득 후 산정 주택 수', 1, [[1, '1주택'], [2, '2주택'], [3, '3주택'], [4, '4주택 이상']]),
      select('location', '취득 주택 소재지', 'other', [['other', '비조정대상지역'], ['regulated', '조정대상지역']]),
      select('overArea', '농어촌특별세 면제에 적용하는 국민주택규모를 초과하나요?', 'no', yesNo)],
    [out('rate', '취득세 적용 세율', pct), out('base', '취득세'), out('education', '지방교육세'), out('rural', '농어촌특별세'), out('total', '세액 합계')],
    calc.acquisitionTax, [s.acquisition, s.acquisitionHeavy, s.acquisitionOther], [['전용면적이 결과에 영향을 주나요?', '국민주택규모를 넘으면 농어촌특별세가 추가될 수 있습니다. 일반적인 규모 기준은 85㎡이며, 수도권 밖 도시지역이 아닌 읍·면 등 법정 예외를 확인하세요.']]),
  'subscription-score': entry('민영주택 청약 가점 계산기',
    '무주택기간, 부양가족 수, 본인과 배우자의 청약통장 가입기간으로 청약 가점을 계산하세요.',
    '민영주택 일반공급 가점제의 점수 계산입니다. 무주택 인정 시작일, 주택 보유 예외, 부양가족 인정 및 미성년 가입기간 인정은 입주자 모집공고일 기준 청약홈에서 확인한 값만 입력하세요.',
    [num('homeFree', '인정 무주택기간 (지난 연수, 비해당 -1)', 10, -1, 100),
      num('dependents', '인정 부양가족 (본인 제외, 명)', 2, 0, 30), num('account', '본인 인정 가입기간 (지난 개월)', 110, 0, 1_200),
      num('spouse', '배우자 가입기간 (지난 개월, 미가입·해당없음 -1)', -1, -1, 1_200)],
    [out('noHome', '무주택기간', points), out('family', '부양가족', points), out('own', '본인 청약통장', points),
      out('spousePoints', '배우자 청약통장 (합산 상한 적용 전)', points), out('accounts', '통장 합산 (17점 한도)', points), out('total', '총 가점 (84점 만점)', points)],
    calc.subscriptionScore, [s.supply, s.score, s.spouseScore], [['배우자 청약통장은 몇 점까지 더하나요?', '배우자의 인정 가입기간은 50%만 반영해 최대 3점이며, 본인과 합한 청약통장 점수는 17점을 넘을 수 없습니다.']]),
  'tenancy-renewal-report': entry('임대차 갱신 5%·전월세 신고 대상 계산기',
    '일반 주택임대차의 5% 증액 상한 예시와 전월세 신고 금액 기준을 각각 확인하세요.',
    '증액 한도는 일반 주택임대차의 청구일 기준 1년 제한과 입력한 조례 상한을 기준으로, 보증금 또는 월세 하나만 변경할 때 표시합니다. 증액 권리나 임대차 특약의 효력을 판정하지 않으며 LH·SH 공공임대에는 그대로 적용하지 않습니다.',
    [select('type', '계약 구분', 'renewal', [['renewal', '갱신'], ['new', '신규']]),
      select('region', '신고제 대상 지역인가요? (수도권 전역·광역시·세종·제주·도 지역의 시)', 'yes', yesNo),
      select('elapsed', '계약 체결 또는 직전 증액 후 1년이 지났나요? (갱신만)', 'yes', yesNo),
      num('deposit', '기존 보증금 (원, 신규는 미사용)', 100_000_000), num('monthly', '기존 월세 (원, 신규는 미사용)', 400_000),
      num('newDeposit', '새 보증금 (원)', 100_000_000), num('newMonthly', '새 월세 (원)', 421_000),
      ratio('localCap', '해당 지역 조례 상한 (%, 별도 하향 규정이 없으면 5)', 5, 5)],
    [out('cap', '증액률 상한', pct), out('depositLimit', '보증금 한도 (월세 유지 시)'), out('monthlyLimit', '월세 한도 (보증금 유지 시)'),
      out('days', '신고 기한 (계약일부터)', days), out('report', '주택 임대차 신고 여부', String)],
    calc.tenancy, [s.renewal, s.renewalRight, s.report], [
      ['신고 대상 금액은 얼마인가요?', '대상 지역에서 보증금 6,000만 원 또는 월세 30만 원을 초과하면 해당합니다. 계약금액이 바뀌지 않은 갱신은 제외합니다. 대상 계약은 체결일부터 30일 이내에 신고합니다.'],
      ['갱신 때 임대료를 무조건 5% 올릴 수 있나요?', '5%는 증액 한도의 일반 상한이지 증액 권리를 보장하는 값이 아닙니다. 1년 이내 증액 제한과 지역 조례, 계약 유형 및 적용 법령도 확인하세요.'],
    ], ['rent-conversion']),
};
