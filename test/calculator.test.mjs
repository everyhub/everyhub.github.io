import assert from 'node:assert/strict';
import test from 'node:test';
import { calculate } from '../src/calculator.mjs';

test('월 과세급여 400만 원: 별표 2 세액과 2026년 근로자 보험료', () => {
  const { monthly, annual } = calculate({ annualSalary: 50_400_000 });
  assert.deepEqual(monthly, {
    pension: 190_000, health: 143_800, care: 18_890, employment: 36_000,
    incomeTax: 195_960, localTax: 19_590, gross: 4_200_000,
    deductions: 604_240, net: 3_595_760,
  });
  assert.equal(annual.net, 43_149_120);
});

test('월 과세급여 350만 원, 공제대상 4명: 3월 자녀 공제 변경을 반영', () => {
  const { annual } = calculate({ annualSalary: 44_400_000, dependents: 3, children: 2 });
  assert.equal(annual.incomeTax, 20_180 * 2 + 3_510 * 10);
  assert.equal(annual.localTax, 2_010 * 2 + 350 * 10);
});

test('월 과세급여 1,200만 원: 고액 급여 별표 산식과 연금 상한 변경', () => {
  const { monthly, annual } = calculate({ annualSalary: 144_000_000, monthlyTaxFree: 0 });
  assert.equal(monthly.incomeTax, 1_507_400 + 686_000 + 25_000);
  assert.equal(annual.pension, (302_570 + 313_020) * 6);
});

test('연금 하한을 적용하고 소득세가 없는 구간을 처리', () => {
  const { annual, monthly } = calculate({ annualSalary: 6_000_000 });
  assert.equal(annual.pension, (19_000 + 19_470) * 6);
  assert.equal(monthly.incomeTax, 0);
});

test('세액표 미만/이상 경계, 연봉 나머지 금액, 입력 검증', () => {
  assert.equal(calculate({ annualSalary: 48_000_000, monthlyTaxFree: 0 }).monthly.incomeTax, 195_960);
  assert.ok(calculate({ annualSalary: 47_999_988, monthlyTaxFree: 0 }).monthly.incomeTax < 195_960);
  assert.equal(calculate({ annualSalary: 40_000_001 }).annual.gross, 40_000_001);
  assert.throws(() => calculate({ annualSalary: 40_000_000, children: 1 }), RangeError);
  assert.throws(() => calculate({ annualSalary: 40_000_000, monthlyTaxFree: 4_000_000 }), RangeError);
});
