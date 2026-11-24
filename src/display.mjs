const number = new Intl.NumberFormat('ko-KR');
export const formatNumber = (value) => number.format(value);
export const won = (value) => `${formatNumber(value)}원`;

export function salaryName(manwon) {
  if (manwon < 10_000) return `${formatNumber(manwon)}만 원`;
  const rest = manwon % 10_000;
  return `${Math.floor(manwon / 10_000)}억${rest ? ` ${formatNumber(rest)}만` : ''} 원`;
}

export const breakdown = [
  ['gross', '세전 급여'], ['pension', '국민연금'], ['health', '건강보험'],
  ['care', '장기요양보험'], ['employment', '고용보험'], ['incomeTax', '소득세'],
  ['localTax', '지방소득세'], ['deductions', '공제 합계'], ['net', '실수령액'],
];
