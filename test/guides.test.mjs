import assert from 'node:assert/strict';
import test from 'node:test';
import * as calc from '../src/guides.mjs';
import { compareInsurance } from '../src/calculator.mjs';

test('보험료 비교: 2027년 국민연금과 확인된 건강·장기요양보험 요율', () => {
  const base = { taxable: 3_000_000, month: 1 };
  assert.deepEqual(compareInsurance({ ...base, year: 2026 }), { pension: 142_500, health: 107_850, care: 14_170, employment: 27_000 });
  assert.deepEqual(compareInsurance({ ...base, year: 2027 }), { pension: 150_000, healthBeforeLimits: 107_850, careBeforeLimits: 14_990, employment: 27_000 });
  assert.equal(compareInsurance({ taxable: 10_000_000, month: 6, year: 2027 }).pension, 329_500);
  assert.equal(compareInsurance({ taxable: 10_000_000, month: 7, year: 2027 }).pension, undefined);
});

test('통상임금은 월 산정 기준시간과 일 소정근로시간을 적용', () => {
  assert.deepEqual(calc.ordinaryWage({ monthly: 2_508_000, monthlyHours: 209, dailyHours: 8 }), { hourly: 12_000, daily: 96_000 });
});

test('평균임금은 산정 기간의 달력 일수와 통상임금 하한을 적용', () => {
  assert.deepEqual(calc.averageWage({ wages: 9_000_000, days: 90, ordinary: 101_000 }), { raw: 100_000, applicable: 101_000 });
});

test('법정 해고예고수당 30일분과 비해당 조건', () => {
  assert.equal(calc.dismissalPay({ ordinary: 96_000, applies: 'yes' }).minimum, 2_880_000);
  assert.equal(calc.dismissalPay({ ordinary: 96_000, applies: 'no' }).minimum, 0);
});

test('휴업수당은 평균임금 70%와 통상임금 예외를 적용', () => {
  assert.deepEqual(calc.shutdownPay({ average: 100_000, ordinary: 90_000, days: 3 }), { daily: 70_000, total: 210_000 });
  assert.deepEqual(calc.shutdownPay({ average: 150_000, ordinary: 90_000, days: 3 }), { daily: 90_000, total: 270_000 });
});

test('법정 40시간과 연장 12시간 한도를 별도로 표시', () => {
  assert.deepEqual(calc.weeklyHours({ regular: 40, overtime: 12 }), { combined: 52, regularExcess: 0, overtimeExcess: 0 });
  assert.deepEqual(calc.weeklyHours({ regular: 41, overtime: 13 }), { combined: 54, regularExcess: 1, overtimeExcess: 1 });
});

test('3.3% 사업소득 원천징수는 소득세와 지방소득세를 분리', () => {
  assert.deepEqual(calc.freelanceWithholding({ amount: 1_000_000 }), { income: 30_000, local: 3_000, total: 33_000, net: 967_000 });
});

test('종합소득 산출세액은 각 구간에 누진세율을 적용', () => {
  assert.deepEqual(calc.incomeTax({ base: 14_000_000 }), { rate: 6, tax: 840_000 });
  assert.deepEqual(calc.incomeTax({ base: 50_000_000 }), { rate: 15, tax: 6_240_000 });
  assert.deepEqual(calc.incomeTax({ base: 1_100_000_000 }), { rate: 45, tax: 429_060_000 });
});

test('일반과세 부가가치세 10% 정방향과 역방향', () => {
  const expected = { supply: 100_000, vat: 10_000, gross: 110_000 };
  assert.deepEqual(calc.vatSplit({ amount: 100_000, unit: 'supply' }), expected);
  assert.deepEqual(calc.vatSplit({ amount: 110_000, unit: 'gross' }), expected);
});

test('증여재산공제는 관계와 10년간 사용액을 반영', () => {
  assert.deepEqual(calc.giftAllowance({ relation: 'minor', used: 7_000_000, gift: 18_000_000 }), { limit: 20_000_000, left: 13_000_000, deducted: 13_000_000, remainder: 5_000_000 });
  assert.equal(calc.giftAllowance({ relation: 'spouse', used: 0, gift: 1 }).limit, 600_000_000);
});

test('2026·2027년 기준 중위소득과 2027년 4인 가구 선정 기준', () => {
  assert.equal(calc.medianIncome({ year: 2026, size: 4, ratio: 100 }).median, 6_494_738);
  assert.deepEqual(calc.medianIncome({ year: 2027, size: 4, ratio: 150 }), {
    median: 6_929_885, selected: 10_394_828, livelihood: 2_217_563, medical: 2_771_954, housing: 3_326_345, education: 3_464_943,
  });
});

test('월세 전환율은 기준금리 가산값과 연 10% 중 낮은 값', () => {
  assert.deepEqual(calc.rentConversion({ depositReduction: 100_000_000, baseRate: 2.5, existing: 200_000 }), { rate: 4.5, increase: 375_000, monthly: 575_000 });
  assert.equal(calc.rentConversion({ depositReduction: 100_000_000, baseRate: 9, existing: 0 }).rate, 10);
});
