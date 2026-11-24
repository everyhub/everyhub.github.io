import * as calc from './guides.mjs';
import { compareInsurance } from './calculator.mjs';
import { guideSources as s } from './guide-rates.mjs';
import { insurance2027Sources, sources as payrollSources } from './rates.mjs';
import { laborSources } from './labor-rates.mjs';
import { formatNumber, won } from './display.mjs';

const num = (key, label, value, min = 0, max = 1_000_000_000, step = 1) => ({ key, label, value, min, max, step });
const select = (key, label, value, options) => ({ key, label, value, options });
const out = (key, label, format = won) => ({ key, label, format });
const pct = (value) => `${formatNumber(value)}%`;
const hours = (value) => `${formatNumber(value)}시간`;
const year = () => select('year', '기준 연도', 2026, [[2026, '2026년'], [2027, '2027년']]);
const entry = (category, name, description, scope, fields, outputs, calculate, sources, faq) =>
  ({ category, name, description, scope, fields, outputs, calculate, sources, faq });

export const guideTools = {
  'insurance-rates': entry('pay', '2026·2027년 직장인 보험료 비교',
    '국민연금, 건강보험, 장기요양보험과 고용보험의 근로자 부담을 2026년과 2027년 기준으로 비교하세요.',
    '2027년 국민연금은 1~6월에 근로자 요율 5%와 기준소득월액 41만~659만 원을 적용합니다. 7월 이후 국민연금 상·하한과 2027년 건강보험 보수월액보험료 상·하한은 새 공식 고시를 확인하지 못했습니다. 2027년 건강보험·장기요양보험은 상·하한 적용 전 금액만 표시합니다. 고용보험 실업급여분은 현행 법령의 근로자 부담률 0.9%입니다. 2027년 산재보험과 연봉 실수령액은 표시하지 않습니다.',
    [year(), num('taxable', '월 신고 보수 (원, 비과세 제외)', 3_000_000, 1), select('month', '적용 월', 1, Array.from({ length: 12 }, (_, i) => [i + 1, `${i + 1}월`]))],
    [out('pension', '국민연금'), out('health', '건강보험 (상·하한 적용)'), out('care', '장기요양보험 (상·하한 적용)'), out('healthBeforeLimits', '건강보험 (상·하한 적용 전)'), out('careBeforeLimits', '장기요양보험 (상·하한 적용 전)'), out('employment', '고용보험 실업급여분')],
    compareInsurance, [...insurance2027Sources, laborSources.employment, ...payrollSources.slice(0, 7).map(([name, url, effective]) => ({ name, url, effective }))],
    [['2027년 국민연금 근로자 부담률은 얼마인가요?', '보험료율은 총 10%이며 일반 사업장 가입자는 근로자와 사업주가 5%씩 부담합니다.'],
      ['2027년 건강보험과 장기요양보험 요율은 어떻게 바뀌나요?', '건강보험료율은 총 7.19%로 유지됩니다. 장기요양보험료는 건강보험료의 13.90%이며 소득 대비 장기요양보험료율은 0.9994%입니다.']]),
  'ordinary-wage': entry('hours', '통상임금 계산기',
    '월 통상임금과 산정 기준시간으로 시간급과 일급 통상임금을 계산하세요.',
    '통상임금에 산입할 월 임금이 확정된 경우에 사용하세요. 월 기준시간에는 소정근로시간 외에 유급 처리되는 시간을 포함합니다.',
    [num('monthly', '산입할 월 통상임금 (원)', 2_508_000), num('monthlyHours', '월 통상임금 산정 기준시간', 209, 1, 744, 0.01), num('dailyHours', '1일 소정근로시간', 8, 0.01, 24, 0.01)],
    [out('hourly', '시간급 통상임금'), out('daily', '일급 통상임금')], calc.ordinaryWage, [s.ordinary, laborSources.minimum26],
    [['월 통상임금은 209시간으로 나누면 되나요?', '주 40시간과 유급 주휴 8시간을 적용한 통상적인 예입니다. 소정근로시간과 유급시간이 다르면 월 기준시간도 달라집니다.']]),
  'average-wage': entry('separation', '1일 평균임금 계산기',
    '산정 대상 임금 합계와 달력 일수로 평균임금을 계산하고 일급 통상임금과 비교하세요.',
    '산정 사유 발생일 이전 3개월에 포함되는 임금과 달력 일수를 입력하세요. 제외 기간이 있다면 임금과 일수를 조정하며, 상여금 포함 여부는 따로 확인하세요.',
    [num('wages', '산정 대상 임금 합계 (원)', 9_000_000), num('days', '산정 대상 기간의 달력 일수', 90, 1, 92), num('ordinary', '일급 통상임금 (원)', 96_000)],
    [out('raw', '임금 합계 ÷ 달력 일수'), out('applicable', '통상임금 하한을 적용한 1일 평균임금')], calc.averageWage, [s.average, laborSources.severanceExample],
    [['평균임금이 통상임금보다 낮으면 어떻게 하나요?', '법에서 정한 평균임금이 일급 통상임금보다 낮으면 일급 통상임금을 평균임금으로 봅니다.']]),
  'dismissal-pay': entry('separation', '해고예고수당 계산기',
    '30일 전에 해고 예고를 받지 않았을 때 적용되는 통상임금 기준 해고예고수당을 계산하세요.',
    '30일 전 예고가 없고 법정 예외에 해당하지 않는 경우의 최저액입니다. 3개월 미만 계속근로 등은 예외이며, 해고가 정당한지 별도로 판단해야 합니다.',
    [num('ordinary', '일급 통상임금 (원)', 100_000, 0, 10_000_000), select('applies', '30일 전 예고가 없고 법정 예외가 없나요?', 'yes', [['yes', '예'], ['no', '아니요']])],
    [out('minimum', '법정 최소 해고예고수당')], calc.dismissalPay, [s.dismissal],
    [['10일 전에 예고하면 나머지 20일분만 지급하나요?', '30일 전에 예고하지 않았고 예외에도 해당하지 않는다면 30일분 이상의 통상임금을 지급해야 합니다.']]),
  'shutdown-pay': entry('hours', '휴업수당 계산기',
    '사업주의 귀책사유로 하루 전체를 휴업했을 때 평균임금과 통상임금을 기준으로 휴업수당을 계산하세요.',
    '근로기준법 제46조가 적용되는 전일 휴업을 가정합니다. 일부 시간만 휴업하거나 노동위원회 승인을 받은 경우는 계산하지 않습니다.',
    [num('average', '1일 평균임금 (원)', 100_000), num('ordinary', '일급 통상임금 (원)', 96_000), num('days', '휴업 일수', 5, 1, 366)],
    [out('daily', '1일 법정 최소액'), out('total', '휴업 기간 법정 최소액')], calc.shutdownPay, [s.shutdown],
    [['휴업수당이 항상 평균임금의 70%인가요?', '평균임금의 70%가 일급 통상임금을 초과하면 일급 통상임금을 지급할 수 있습니다. 불가피한 사유와 노동위원회 승인이 있는 경우에는 별도 기준이 적용됩니다.']]),
  'weekly-hours': entry('hours', '주 52시간 근로시간 계산기',
    '1주 법정근로 40시간과 합의 연장근로 12시간의 일반 한도를 확인하세요.',
    '상시 5인 이상 일반 사업장의 성인 근로자 기준입니다. 휴게시간은 빼고 입력하세요. 탄력·선택근로, 특례 업종, 예외 승인 또는 하루 8시간 기준 위반 여부를 판단하지 않습니다.',
    [num('regular', '주간 기본 근로시간 (휴게시간 제외)', 40, 0, 168, 0.01), num('overtime', '주간 연장근로시간 (휴게시간 제외)', 12, 0, 168, 0.01)],
    [out('combined', '합계', hours), out('regularExcess', '기본 40시간 초과', hours), out('overtimeExcess', '연장 12시간 초과', hours)],
    calc.weeklyHours, [s.standardHours, s.overtimeHours], [['주 52시간은 어떻게 계산하나요?', '일반적으로 1주 40시간에 당사자가 합의한 연장근로 최대 12시간을 더합니다. 휴게시간은 근로시간에서 제외합니다.']]),
  'freelance-tax': entry('tax', '프리랜서 3.3% 원천징수 계산기',
    '원천징수 대상 사업소득의 소득세, 개인지방소득세와 입금 예상액을 계산하세요.',
    '거주자의 3.3% 원천징수 대상 사업소득으로 한정합니다. 이 금액은 최종 세금이 아니며, 종합소득세 환급 여부는 다른 소득·경비·공제에 따라 달라집니다.',
    [num('amount', '세전 지급액 (원)', 1_000_000, 1)],
    [out('income', '소득세'), out('local', '개인지방소득세'), out('total', '원천징수 합계'), out('net', '입금 예상액')],
    calc.freelanceWithholding, [s.freelance, s.local], [['3.3%는 어떻게 구성되나요?', '소득세는 지급액의 3%이며, 개인지방소득세는 그 소득세의 10%입니다.']]),
  'income-tax': entry('tax', '종합소득세 기본세율 계산기',
    '과세표준을 입력해 소득세 기본세율과 누진 계산한 산출세액을 확인하세요.',
    '과세표준은 소득금액에서 소득공제 등을 뺀 금액입니다. 신고용 결정세액과 달리 세액공제·감면, 기납부세액과 개인지방소득세는 포함하지 않습니다.',
    [num('base', '종합소득 과세표준 (원)', 30_000_000, 0, 10_000_000_000)], [out('rate', '최고 적용 구간의 세율', pct), out('tax', '종합소득 산출세액')],
    calc.incomeTax, [s.income], [['과세표준 전체에 같은 세율을 곱하나요?', '아니요. 해당 구간의 초과분에만 각 세율을 적용합니다. 산출세액은 구간별 세액을 합산한 금액입니다.']]),
  'vat-calculator': entry('tax', '부가가치세 10% 계산기',
    '공급가액에서 부가가치세 포함 금액을 구하거나 총금액에서 공급가액과 세액을 나누세요.',
    '일반과세 10%가 적용되는 거래 한 건의 금액을 원 단위로 나눕니다. 면세·영세율·간이과세와 신고 납부세액은 계산하지 않습니다.',
    [num('amount', '계산할 금액 (원)', 110_000, 1), select('unit', '입력 금액의 종류', 'gross', [['gross', '부가가치세 포함'], ['supply', '공급가액']])],
    [out('supply', '공급가액'), out('vat', '부가가치세'), out('gross', '부가가치세 포함 금액')], calc.vatSplit, [s.vat],
    [['부가가치세 포함 금액에서 세금만 어떻게 구하나요?', '10% 거래라면 총금액을 11로 나누면 부가가치세를 구할 수 있습니다. 원 단위 반올림에 따라 1원 차이가 날 수 있습니다.']]),
  'gift-allowance': entry('tax', '증여재산공제 한도 계산기',
    '배우자, 부모, 자녀 등과의 관계에 따라 10년간 기본 공제 한도와 남은 금액을 확인하세요.',
    '국내 거주자의 기본 증여재산공제만 계산합니다. 혼인·출산 추가 공제, 종전 증여 합산 및 최종 증여세는 별도로 확인하세요.',
    [select('relation', '증여자와의 관계', 'ancestor', [['spouse', '배우자'], ['ancestor', '직계존속 (성년 수증자)'], ['minor', '직계존속 (미성년 수증자)'], ['descendant', '직계비속'], ['relative', '그 밖의 4촌 이내 혈족·3촌 이내 인척'], ['other', '그 밖의 관계']]), num('used', '같은 공제 구분에서 지난 10년간 사용한 공제액 (원)', 0), num('gift', '이번 증여가액 (원)', 60_000_000)],
    [out('limit', '10년 기본 공제 한도'), out('left', '증여 전 남은 한도'), out('deducted', '이번 증여에 적용할 공제액'), out('remainder', '기본 공제 후 남은 이번 증여가액')],
    calc.giftAllowance, [s.gift], [['부모가 각각 증여하면 공제 한도가 두 배인가요?', '직계존속 구분의 공제 한도를 부모 각각에 별도로 적용하지 않습니다. 지난 10년간 같은 구분에서 적용받은 공제액을 확인하세요.']]),
  'median-income': entry('living', '2026·2027년 기준 중위소득 계산기',
    '가구원 수별 기준 중위소득과 입력한 비율의 소득 기준, 생계·의료·주거·교육급여 선정 기준을 확인하세요.',
    '1~7인 가구의 월 기준입니다. 실제 선정에는 소득인정액, 부양의무자 등 급여별 요건을 추가로 적용합니다. 월급을 그대로 소득인정액으로 보지 않습니다.',
    [year(), num('size', '가구원 수 (명)', 4, 1, 7), num('ratio', '확인할 기준 중위소득 비율 (%)', 100, 1, 500, 0.1)],
    [out('median', '기준 중위소득 (100%)'), out('selected', '입력한 비율의 월 소득 기준'), out('livelihood', '생계급여 선정 기준 (32%)'), out('medical', '의료급여 선정 기준 (40%)'), out('housing', '주거급여 선정 기준 (48%)'), out('education', '교육급여 선정 기준 (50%)')],
    calc.medianIncome, [s.welfare26, s.welfareRatios26, s.welfare27, s.welfareRatios],
    [['2027년 4인 가구 기준 중위소득은 얼마인가요?', '보건복지부 고시에 따르면 월 6,929,885원입니다. 2026년 월 6,494,738원과 구분해 적용하세요.']]),
  'rent-conversion': { ...entry('housing', '전세·보증금 월세 전환 한도 계산기',
    '주택임대차보호법에 따라 보증금의 전부 또는 일부를 월세로 전환할 때 법정 전환율과 월세 증가 한도를 계산하세요.',
    '보증금을 월세로 전환하는 경우에 적용합니다. 반대로 월세를 보증금으로 바꾸는 경우, 신규 계약의 가격 산정, 별도의 임대료 증액 요건은 계산하지 않습니다. 전환 시점의 한국은행 기준금리를 직접 입력하세요.',
    [num('depositReduction', '줄이는 보증금 (원)', 100_000_000), num('baseRate', '전환 시점의 한국은행 기준금리 (%)', 2.5, 0, 20, 0.01), num('existing', '기존 월세 (원)', 0)],
    [out('rate', '법정 전환율 상한 (연)', pct), out('increase', '월세 증가 한도'), out('monthly', '전환 후 한도 (기존 월세 포함)')],
    calc.rentConversion, [s.rent, s.rentDecree, s.bank], [
      ['월세 전환율은 어떻게 계산하나요?', '연 10%와 한국은행 기준금리에 2%포인트를 더한 값 중 낮은 값을 적용합니다. 줄인 보증금에 이 연이율을 곱하고 12로 나누면 월세 증가 한도가 됩니다.'],
      ['LH·SH 전환보증금도 같은 방식인가요?', '아닙니다. 공공임대의 증액·감액에는 LH·SH가 안내한 방향별 전환이율과 공고·계약의 한도를 확인해야 합니다.'],
    ]), related: ['public-rent-conversion', 'tenancy-renewal-report'] },
};
