import * as calc from './labor.mjs';
import { laborRates as r, laborSources as s } from './labor-rates.mjs';
import { formatNumber, won } from './display.mjs';

export const brand = '일과 급여';
export const categories = [
  { id: 'pay', title: '급여·세금', description: '연봉 실수령액과 근로자·사업주의 보험료를 확인하세요.' },
  { id: 'hours', title: '시급·근로시간', description: '최저임금과 주휴수당을 확인하고 근로시간에 따른 급여를 계산하세요.' },
  { id: 'separation', title: '퇴직·실업', description: '퇴직금과 퇴사 후 받을 수 있는 구직급여를 비교하세요.' },
  { id: 'leave', title: '육아·휴가', description: '육아휴직·출산전후휴가의 급여와 근속에 따른 연차 일수를 확인하세요.' },
];

const number = (key, label, value, min = 0, max = 100_000_000, step = 1) => ({ key, label, value, min, max, step });
const select = (key, label, value, options) => ({ key, label, value, options });
const yesNo = [['yes', '예'], ['no', '아니요']];
const days = (x) => `${formatNumber(x)}일`;
const hours = (x) => `${formatNumber(Math.round(x * 100) / 100)}시간`;
const output = (key, label, format = won) => ({ key, label, format });
const choice = (values) => values.map(([label], index) => [index, label]);
const minimum = (year) => calc.minimumWage({ year });
const currentYear = r.minimum[0].year;
const nextYear = r.minimum[1].year;
const current = minimum(currentYear);
const next = minimum(nextYear);

export const tools = {
  'minimum-wage': {
    category: 'hours', name: '최저임금 계산기',
    description: `${currentYear}년 최저시급 ${won(current.hourly)}과 ${nextYear}년 고시 금액을 비교하세요. 8시간 일급, 209시간 월급, 세전 연봉을 보여줍니다.`,
    scope: '월급은 주 40시간 근무와 유급주휴 8시간을 포함한 월 209시간 기준입니다. 주 40시간 미만의 월급은 시급·월급·연봉 변환에서 확인하세요.',
    fields: [select('year', '최저임금 적용 연도', currentYear, r.minimum.map(({ year }) => [year, `${year}년`]))],
    outputs: [output('hourly', '최저시급'), output('daily', '8시간 일급'), output('monthly', '209시간 월급'), output('yearly', '세전 연봉')],
    calculate: calc.minimumWage, sources: [s.minimum26, s.minimum27],
    faq: [
      [`${currentYear}년 최저임금 월급은 얼마인가요?`, `시급 ${won(current.hourly)}에 월 209시간을 곱하면 세전 ${won(current.monthly)}입니다.`],
      [`${nextYear}년 최저임금은 언제 적용되나요?`, `${nextYear}년 1월 1일부터 시급 ${won(next.hourly)}, 월 209시간 기준 ${won(next.monthly)}입니다. ${currentYear}년 기준과 구분하세요.`],
    ],
  },
  'weekly-holiday-pay': {
    category: 'hours', name: '주휴수당 계산기',
    description: '시급과 주 소정근로시간으로 유급 주휴시간, 주휴수당, 주급을 계산하세요. 주 15시간 기준과 개근 요건을 확인할 수 있습니다.',
    scope: '주 5일·40시간인 통상근로자와 같은 사업장, 매주 일정한 소정근로시간을 가정합니다. 주 15시간 기준은 원칙적으로 4주 평균(4주 미만은 그 기간)이며, 실제로 일한 연장시간과 다릅니다.',
    fields: [number('hourly', '통상시급 (원)', current.hourly, 1), number('hours', '주 소정근로시간 (시간)', 20, 0, 40, 0.01), select('attendance', '해당 주의 소정근로일을 모두 출근했나요?', 'yes', yesNo)],
    outputs: [output('paidHours', '유급 주휴시간', hours), output('holidayPay', '주휴수당'), output('weeklyPay', '주휴 포함 예상 주급')],
    calculate: calc.weeklyHoliday, sources: [s.partTime, s.weekly, s.weeklyExample],
    faq: [
      ['주 15시간 미만이라면 주휴수당을 받나요?', '4주 평균 주 소정근로시간이 15시간 미만인 근로자에게는 법정 유급주휴일 규정이 적용되지 않습니다. 15시간 이상이면 그 주의 소정근로일 개근 여부도 확인하세요.'],
      ['월급제도 주휴수당을 별도로 받나요?', '월급제는 월급에 주휴수당이 이미 포함되는 경우가 있습니다. 월급에 포함된 금액을 다시 더하지 않도록 계약서와 급여명세서를 확인하세요.'],
    ],
  },
  'wage-converter': {
    category: 'hours', name: '시급·월급·연봉 변환기',
    description: '시급을 세전 월급이나 연봉으로, 월급과 연봉을 시급으로 바꾸세요. 주 소정근로시간과 유급 주휴 포함 여부를 선택할 수 있습니다.',
    scope: '주 40시간·유급 주휴 8시간이면 월 209시간을 적용합니다. 그 외에는 주 유급시간에 365일 ÷ 7 ÷ 12를 곱한 월평균을 사용합니다. 퇴직금·상여·가산수당·세금은 포함하지 않습니다.',
    fields: [number('amount', '환산할 급여 금액 (원)', 12_000, 1, 1_000_000_000), select('unit', '입력 급여 단위', 'hour', [['hour', '시급'], ['month', '월급'], ['year', '연봉']]), number('hours', '주 소정근로시간 (시간)', 40, 0.01, 40, 0.01), select('holiday', '유급 주휴 포함', 'yes', yesNo)],
    outputs: [output('hourly', '세전 시급'), output('monthly', '세전 월급'), output('yearly', '세전 연봉'), output('monthlyHours', '월 환산시간', hours)],
    calculate: calc.wageConversion, sources: [s.minimum26, s.partTime, s.weekly, s.weeklyExample],
    faq: [
      ['주 40시간인데 왜 월 209시간을 적용하나요?', '주에 일하는 40시간 외에 유급주휴 8시간을 포함한 환산시간입니다. 최저임금 고시도 이 기준을 사용합니다.'],
      ['환산 월급과 통장에 들어오는 금액이 같은가요?', '환산 결과는 세전입니다. 국민연금 등 보험료와 근로소득세를 뺀 금액은 연봉 실수령액 계산기에서 확인하세요.'],
    ],
  },
  'overtime-pay': {
    category: 'hours', name: '연장·야간·휴일수당 계산기',
    description: '통상시급을 기준으로 연장근로, 휴일근로와 야간근로 가산수당을 계산하세요. 휴일 8시간 초과와 야간 중복을 구분합니다.',
    scope: '상시 5인 이상 일반 사업장 기준입니다. 휴일근로를 평일 연장에 중복 입력하지 마세요. 야간 시간에는 평일·휴일 밤 10시~다음 날 오전 6시 근무를 모두 넣으세요. 유급휴일 자체에 대한 임금은 결과에 포함하지 않습니다.',
    fields: [number('hourly', '통상시급 (원)', 12_000, 1), number('extended', '휴일을 제외한 연장근로 (시간)', 2, 0, 744, 0.01), number('holiday', '각 휴일의 처음 8시간 합계 (시간)', 8, 0, 744, 0.01), number('holidayExtra', '각 휴일의 8시간 초과분 합계 (시간)', 2, 0, 744, 0.01), number('night', '야간근로 (중복 포함, 시간)', 2, 0, 744, 0.01)],
    outputs: [output('extraBase', '연장·휴일에 실제 일한 시간의 기본임금'), output('extendedPremium', '연장 가산분'), output('holidayPremium', '휴일 가산분'), output('nightPremium', '야간 가산분'), output('extraPay', '기본임금 포함 추가 지급액')],
    calculate: calc.overtimePay, sources: [s.overtime, s.overtimeExample],
    faq: [
      ['휴일에 10시간 근무하면 가산률은 어떻게 되나요?', '처음 8시간은 통상임금의 50%, 초과한 2시간은 100%를 추가합니다. 이 중 야간에 일한 시간에는 야간 가산 50%를 더합니다.'],
      ['야간근로 시간의 기본임금도 결과에 들어가나요?', '정규 근무시간의 기본임금은 포함하지 않습니다. 평일 연장·휴일에 실제 일한 시간만 기본임금으로 더하고 모든 야간근로에 대해 가산분만 더합니다.'],
    ],
  },
  'severance-pay': {
    category: 'separation', name: '퇴직금 계산기',
    description: '퇴직 전 3개월 임금, 산정 일수와 재직일수로 세전 퇴직금을 계산하세요. 1일 통상임금이 더 큰 경우도 반영합니다.',
    scope: '계속근로기간 1년 이상이고 4주 평균 주 소정근로시간이 15시간 이상인 일반 퇴직금제도를 가정합니다. 산정 제외 기간이 있다면 임금·일수를 함께 조정한 자료를 입력하고, 퇴직연금 계좌 예상액이나 세후액은 반영하지 않습니다.',
    fields: [
      number('wageTotal', '퇴직 전 3개월 산정 대상 임금 합계 (원)', 9_000_000, 1, 1_000_000_000),
      number('periodDays', '퇴직 전 3개월 산정 대상 달력 일수 (일)', 90, 1, 92),
      number('annualBonus', '산입 대상 연간 상여금 (원)', 0),
      number('annualLeavePay', '산입 대상 연간 연차수당 (원)', 0),
      number('ordinaryDaily', '1일 통상임금 (원, 미입력 시 0)', 0),
      number('serviceDays', '계속근로일수 (일)', 1_095, 1, 40_000),
      select('eligible', '계속근로 1년 이상 및 주 15시간 요건 충족', 'yes', yesNo),
    ],
    outputs: [output('dailyAverage', '1일 평균임금 (원 단위 표시)', (x) => won(Math.round(x))), output('dailyBasis', '계산에 적용한 1일 임금 (원 단위 표시)', (x) => won(Math.round(x))), output('severance', '세전 예상 퇴직금')],
    calculate: calc.severancePay, sources: [s.severance, s.severanceExample],
    faq: [
      ['퇴직 전 3개월은 언제부터 언제까지인가요?', '퇴직일 전날까지 역으로 달력상 3개월을 계산합니다. 3개월은 항상 90일이 아닙니다. 산정에서 빼야 하는 기간과 임금이 있으면 숫자를 조정하세요.'],
      ['통상임금과 평균임금 중 어떤 금액을 적용하나요?', '산정한 1일 평균임금보다 1일 통상임금이 더 크면 통상임금을 기준으로 계산합니다. 통상임금을 넣지 않으면 평균임금만으로 추정합니다.'],
    ],
  },
  'unemployment-pay': {
    category: 'separation', name: '실업급여·구직급여 계산기',
    description: '2026년 이직 상용근로자의 구직급여 1일 상·하한, 소정급여일수와 예상 총액을 계산하세요.',
    scope: '2026년 이직한 상용근로자로 수급자격을 충족한 경우만 가정합니다. 고용24의 수급자격 확인, 피보험 단위기간과 이직 사유 판단을 대신하지 않습니다. 실제 지급은 실업 인정일에 따릅니다.',
    fields: [number('dailyWage', '급여기초 임금일액 (원)', 100_000, 1), number('hours', '이직확인서의 1일 소정근로시간 (시간)', 8, 1, 8), number('insuranceMonths', '소정급여일수 산정용 피보험기간 (완료 개월)', 36, 0, 720), number('age', '이직 당시 만 나이 (세)', 35, 15, 100), select('disability', '법정 장애인 구분', 'no', yesNo)],
    outputs: [output('floor', '일 하한액'), output('cap', '일 상한액'), output('daily', '예상 일 지급액'), output('days', '소정급여일수', days), output('expected', '예상 총 구직급여')],
    calculate: calc.unemploymentPay, sources: [s.unemployment, s.unemploymentLimit, s.unemploymentDays, s.unemploymentExample],
    faq: [
      ['2026년 구직급여 상한과 하한은 얼마인가요?', '2026년 이직 기준 하루 상한액은 68,100원입니다. 하루 소정근로 8시간의 하한액은 66,048원이고, 소정근로시간이 짧으면 달라집니다.'],
      ['구직급여를 몇 일 동안 받을 수 있나요?', '이직일의 만 나이, 법정 장애인 여부와 피보험기간에 따라 120~270일입니다. 개월 수만으로 수급자격이 결정되지는 않습니다.'],
    ],
  },
  'parental-leave-pay': {
    category: 'leave', name: '육아휴직급여 계산기',
    description: '육아휴직 월 통상임금과 사용 개월 수로 1~3개월, 4~6개월, 7개월 이후 수당을 계산하세요. 6+6과 한부모 특례도 비교합니다.',
    scope: '법정 휴직과 고용보험 수급 요건을 충족하고 월 전체를 휴직한 경우입니다. 13~18개월은 법정 연장 요건을 충족할 때만 입력하세요. 부분월 일할 계산과 신청 요건은 고용24에서 확인하세요.',
    fields: [number('monthlyWage', '휴직 개시일 월 통상임금 (원)', 3_000_000, 1), number('months', '육아휴직 사용 개월 (개월)', r.parental.months, 1, r.parental.extendedMonths), select('type', '육아휴직 적용 구분', 'general', [['general', '일반'], ['shared', '부모 함께 6+6 특례'], ['single', '한부모 특례']]), number('sharedMonths', '부모 모두 사용한 특례 적용 공통 개월 (6+6 선택 시)', 6, 1, 6)],
    outputs: [output('first', '1개월째 지급액'), output('second', '4개월째 지급액'), output('third', '7개월째 지급액'), output('expected', '휴직 기간 예상 총액')],
    iterate: 'amounts', calculate: calc.parentalPay, sources: [s.parental, s.parentalSpecial, s.parentalGuide],
    faq: [
      ['일반 육아휴직급여 월 상한은 얼마인가요?', '1~3개월 월 250만 원, 4~6개월 월 200만 원, 7개월부터 월 160만 원입니다. 7개월부터는 월 통상임금의 80%에 상·하한을 적용합니다.'],
      ['부모 함께 6+6은 언제 적용되나요?', '자녀 생후 18개월 이내에 부모 모두 육아휴직을 사용하고 요건을 충족한 기간에 적용합니다. 서로 같은 기간에 동시에 쓸 필요는 없습니다.'],
    ],
  },
  'maternity-leave-pay': {
    category: 'leave', name: '출산전후휴가급여 계산기',
    description: '출산 전후 법정 휴가일수와 2026년 고용보험 지원액을 계산하세요. 단태아, 미숙아와 다태아, 기업 구분을 반영합니다.',
    scope: '2026년 주 40시간·월 209시간 근로자, 고용보험 자격 충족, 전체 휴가 사용을 가정합니다. 단시간·계약만료·유산·사산·예술인 및 노무제공자 급여는 계산하지 않습니다.',
    fields: [number('monthlyWage', '휴가 개시일 월 통상임금 (원)', 3_000_000, 1), select('type', '출산 유형', 'single', Object.entries(r.maternity.types).map(([key, { label }]) => [key, label])), select('company', '기업 지원 구분', 'preferred', [['preferred', '우선지원대상기업'], ['large', '대규모기업']])],
    outputs: [output('leaveDays', '총 휴가기간', days), output('postBirth', '출산 후 최소 확보 기간', days), output('supported', '고용보험 지원 일수', days), output('benefit', '고용보험 예상 지급액'), output('employer', '사업주 예상 부담액'), output('expected', '합산 예상 지급액')],
    calculate: calc.maternityPay, sources: [s.maternity, s.maternityDays, s.maternityGuide, s.minimum26],
    faq: [
      ['출산전후휴가는 며칠인가요?', '단태아 90일, 법정 요건을 충족한 미숙아 100일, 다태아 120일입니다. 출산 후에는 최소 45일(다태아 60일)을 확보해야 합니다.'],
      ['출산휴가 급여는 회사와 고용보험 중 누가 지급하나요?', '최초 60일(다태아 75일)은 법정 유급입니다. 우선지원대상기업의 고용보험 지급분은 회사 부담액에서 차감하고, 대규모기업의 고용보험은 그 이후 기간을 지원합니다.'],
    ],
  },
  'annual-leave': {
    category: 'leave', name: '연차휴가 일수 계산기',
    description: '근속연수, 출근율, 한 달 개근 횟수로 근로기준법 기준 발생 연차 일수를 확인하세요.',
    scope: '주 15시간 이상 상시 5인 이상 사업장의 일반 근로자를 기준으로 한 발생분입니다. 회계연도 기준, 단시간근로자의 시간 환산, 이월·사용·소멸, 휴직에 따른 출근 간주, 계약 종료일의 연차 인정 여부는 별도로 확인하세요.',
    fields: [number('years', '이미 채운 근속연수 (년)', 3, 0, 60), number('attendance', '직전 1년 출근율 (%, 1년 미만이면 무관)', 100, 0, 100, 0.01), number('fullMonths', '1년 미만 또는 출근율 80% 미만일 때 개근한 개월', 0, 0, 12), select('eligible', '주 15시간 이상·상시 5인 이상 사업장', 'yes', yesNo)],
    outputs: [output('days', '예상 발생 연차', days)], calculate: calc.annualLeave, sources: [s.annualLeave, s.partTime],
    faq: [
      ['입사 첫해 연차는 최대 몇 일인가요?', '1년 미만 근로 중에는 1개월 개근할 때마다 1일씩 최대 11일 발생합니다. 첫 1년을 채운 뒤 새로 발생하는 15일과 구별하세요.'],
      ['근속연수가 길면 연차가 얼마나 늘어나나요?', '직전 1년 출근율 80% 이상인 경우 첫 1년을 빼고 근속 2년마다 1일이 늘어납니다. 3년 근속 시 16일이고 최대 25일입니다.'],
    ],
  },
  'social-insurance': {
    category: 'pay', name: '4대보험료 계산기',
    description: '2026년 월 신고 보수로 국민연금·건강보험·장기요양·고용보험의 근로자 부담과 산재보험을 포함한 사업주 부담을 계산하세요.',
    scope: '일반 직장가입자 기준입니다. 각 보험 신고 보수액이 같다고 가정하고 보수 외 소득, 보험료 감면, 정산, 해외파견 등 예외는 미반영입니다. 업종은 근로복지공단에서 부여한 산재보험 사업종류를 선택하세요.',
    fields: [number('taxable', '월 신고 보수 (원, 비과세 제외)', 3_000_000, 1), select('month', '2026년 적용월', 11, Array.from({ length: 12 }, (_, i) => [i + 1, `${i + 1}월`])), select('business', '고용안정·직업능력개발 사업 구분', 0, choice(r.employer.employmentAdditions)), select('industry', '사업종류 (산재보험)', 0, choice(r.employer.industries))],
    outputs: [output('pension', '국민연금 (노·사 각각)'), output('health', '건강보험 (노·사 각각)'), output('care', '장기요양 (노·사 각각)'), output('employment', '실업급여 보험료 (노·사 각각)'), output('development', '고용안정·직업능력개발 (사업주)'), output('accident', '산재보험 및 출퇴근재해 (사업주)'), output('workerTotal', '근로자 부담 합계'), output('employerTotal', '사업주 부담 합계')],
    calculate: calc.insuranceContributions, sources: [s.employment, s.accident], payrollSources: true,
    faq: [
      ['4대보험 중 근로자와 사업주가 나눠 내는 보험은 무엇인가요?', '일반 직장가입자의 국민연금·건강보험(장기요양 포함)과 고용보험 실업급여분은 근로자와 사업주가 부담합니다. 산재보험과 고용안정·직업능력개발 사업 보험료는 사업주가 부담합니다.'],
      ['사업주 산재보험료는 왜 업종마다 다른가요?', '고용노동부의 사업종류별 요율이 다르고, 여기에 2026년 전체 업종 공통 출퇴근재해 요율 0.06%를 더합니다. 실제 적용 업종과 감면은 사업장별로 확인해야 합니다.'],
    ],
  },
};

export const toolPath = (id) => `tools/${id}/`;
export const defaultsFor = (tool) => Object.fromEntries(tool.fields.map(({ key, value }) => [key, value]));
