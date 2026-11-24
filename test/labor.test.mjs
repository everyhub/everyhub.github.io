import assert from 'node:assert/strict';
import test from 'node:test';
import * as calc from '../src/labor.mjs';
import { monthlyContributions } from '../src/calculator.mjs';

test('최저임금위원회 월 209시간 환산액: 2026·2027년', () => {
  assert.deepEqual(calc.minimumWage({ year: 2026 }), {
    hourly: 10_320, daily: 82_560, monthly: 2_156_880, yearly: 25_882_560,
  });
  assert.equal(calc.minimumWage({ year: 2027 }).monthly, 2_236_300);
});

test('주휴수당: 고용노동부 20시간 사례, 15시간 경계와 미개근', () => {
  const base = { hourly: 10_320, hours: 20, attendance: 'yes' };
  assert.deepEqual(calc.weeklyHoliday(base), { paidHours: 4, holidayPay: 41_280, weeklyPay: 247_680 });
  assert.equal(calc.weeklyHoliday({ ...base, hours: 14.99 }).holidayPay, 0);
  assert.equal(calc.weeklyHoliday({ ...base, hours: 15 }).holidayPay, 30_960);
  assert.equal(calc.weeklyHoliday({ ...base, attendance: 'no' }).holidayPay, 0);
});

test('시급·월급·연봉 변환: 주 40시간, 역환산, 주 20시간', () => {
  const base = { amount: 12_000, unit: 'hour', hours: 40, holiday: 'yes' };
  assert.deepEqual(calc.wageConversion(base), { hourly: 12_000, monthly: 2_508_000, yearly: 30_096_000, monthlyHours: 209 });
  assert.deepEqual(calc.wageConversion({ ...base, amount: 30_096_000, unit: 'year' }), calc.wageConversion(base));
  assert.equal(calc.wageConversion({ ...base, amount: 2_508_000, unit: 'month' }).hourly, 12_000);
  assert.equal(calc.wageConversion({ ...base, hours: 20 }).monthly, 1_251_429);
});

test('근로기준법 제56조: 휴일 8시간 초과와 야간 중첩', () => {
  assert.deepEqual(calc.overtimePay({ hourly: 12_000, extended: 2, holiday: 8, holidayExtra: 2, night: 2 }), {
    extraBase: 144_000, extendedPremium: 12_000, holidayPremium: 72_000, nightPremium: 12_000, extraPay: 240_000,
  });
});

test('고용노동부 1,080일 퇴직금 예제와 통상임금 하한', () => {
  const example = {
    wageTotal: 7_080_000, periodDays: 92, annualBonus: 4_000_000, annualLeavePay: 300_000,
    ordinaryDaily: 0, serviceDays: 1_080, eligible: 'yes',
  };
  const result = calc.severancePay(example);
  assert.equal(result.dailyAverage.toFixed(2), '88641.30');
  assert.equal(result.severance, 7_868_434);
  assert.equal(calc.severancePay({ ...example, ordinaryDaily: 100_000, serviceDays: 365 }).severance, 3_000_000);
  assert.equal(calc.severancePay({ ...example, eligible: 'no' }).severance, 0);
});

test('2026 구직급여: 8시간 하한·상한·피보험기간·장애인 적용', () => {
  const base = { dailyWage: 100_000, hours: 8, insuranceMonths: 36, age: 35, disability: 'no' };
  assert.deepEqual(calc.unemploymentPay(base), { floor: 66_048, cap: 68_100, daily: 66_048, days: 180, expected: 11_888_640 });
  assert.equal(calc.unemploymentPay({ ...base, dailyWage: 200_000, disability: 'yes' }).expected, 14_301_000);
  assert.equal(calc.unemploymentPay({ ...base, hours: 2, dailyWage: 20_000, insuranceMonths: 11 }).daily, 16_512);
  assert.equal(calc.unemploymentPay({ ...base, age: 50, insuranceMonths: 120 }).days, 270);
  assert.deepEqual(calc.unemploymentPay({ ...base, year: 2027 }), { floor: 68_480, days: 180 });
});

test('육아휴직급여: 일반 12개월·6+6 특례·한부모·하한', () => {
  const base = { monthlyWage: 5_000_000, months: 12, type: 'general', sharedMonths: 6 };
  assert.equal(calc.parentalPay(base).expected, 23_100_000);
  assert.deepEqual(calc.parentalPay({ ...base, type: 'shared', months: 6 }).amounts,
    [2_500_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000]);
  assert.equal(calc.parentalPay({ ...base, type: 'shared', sharedMonths: 3 }).amounts[3], 2_000_000);
  assert.equal(calc.parentalPay({ ...base, type: 'single' }).expected, 24_600_000);
  assert.equal(calc.parentalPay({ ...base, monthlyWage: 300_000 }).amounts[11], 700_000);
});

test('출산전후휴가급여: 단태아·미숙아·다태아의 기업별 지급', () => {
  const base = { monthlyWage: 3_000_000, type: 'single', company: 'preferred' };
  assert.deepEqual(calc.maternityPay(base), { leaveDays: 90, postBirth: 45, supported: 90, benefit: 6_600_000, employer: 1_600_000, expected: 8_200_000 });
  assert.equal(calc.maternityPay({ ...base, type: 'premature' }).benefit, 7_333_330);
  assert.equal(calc.maternityPay({ ...base, type: 'multiple', company: 'large' }).benefit, 3_300_000);
  assert.equal(calc.maternityPay({ ...base, monthlyWage: 2_156_880, company: 'large' }).benefit, 2_156_880);
});

test('연차휴가: 첫해·출근율 80% 경계·근속 가산과 상한', () => {
  const base = { years: 3, attendance: 80, fullMonths: 4, eligible: 'yes' };
  assert.equal(calc.annualLeave(base).days, 16);
  assert.equal(calc.annualLeave({ ...base, years: 0, fullMonths: 12 }).days, 11);
  assert.equal(calc.annualLeave({ ...base, attendance: 79.99 }).days, 4);
  assert.equal(calc.annualLeave({ ...base, years: 30 }).days, 25);
  assert.equal(calc.annualLeave({ ...base, eligible: 'no' }).days, 0);
});

test('4대보험: 150인 미만 도소매업의 노·사 부담과 7월 상한 변경', () => {
  assert.deepEqual(calc.insuranceContributions({ taxable: 3_000_000, business: 0, industry: 0, month: 11 }), {
    pension: 142_500, health: 107_850, care: 14_170, employment: 27_000,
    development: 7_500, accident: 25_800, workerTotal: 291_520, employerTotal: 324_820,
  });
  assert.equal(monthlyContributions(8_000_000, 6).pension, 302_570);
  assert.equal(monthlyContributions(8_000_000, 7).pension, 313_020);
});
