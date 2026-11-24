import { insurance2027, rates } from './rates.mjs';
import { withholdingTable } from './withholding-table.mjs';

export const limits = { annualSalary: 1_000_000_000, dependents: 99 };
export const defaults = {
  annualSalary: 40_000_000,
  monthlyTaxFree: rates.defaultTaxFree,
  dependents: 0,
  children: 0,
};

const deductionKeys = ['pension', 'health', 'care', 'employment', 'incomeTax', 'localTax'];
const floorTen = (amount) => Math.floor(amount / 10) * 10;
const percentage = (amount, { numerator, denominator }) => amount * numerator / denominator;
const clamp = (amount, { min, max }) => Math.min(max, Math.max(min, amount));
const periodFor = (periods, month) => periods.findLast(({ from }) => month >= from);

function taxRow(taxable) {
  let low = 0;
  let high = withholdingTable.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (withholdingTable[middle][0] * 1_000 <= taxable) low = middle + 1;
    else high = middle;
  }
  return withholdingTable[low - 1];
}

function monthlyIncomeTax(taxable, family, children, month) {
  const row = taxRow(taxable);
  if (!row) return 0;
  const lastColumn = row.length - 1;
  const tax = family <= lastColumn
    ? row[family]
    : row[lastColumn] - (row[lastColumn - 1] - row[lastColumn]) * (family - lastColumn);
  const config = rates.incomeTax;
  const band = config.highBands.findLast(({ over }) => taxable > over);
  const extra = band
    ? band.base + percentage(taxable - band.over, { ...band, denominator: config.highDenominator })
    : 0;
  const credit = periodFor(config.childCredits, month);
  const childCredit = children === 0 ? 0 : children === 1 ? credit.one
    : credit.two + (children - 2) * credit.additional;
  const withheld = floorTen(tax + extra - childCredit);
  return withheld >= config.minimumWithholding ? withheld : 0;
}

export function monthlyContributions(taxable, month) {
  const pensionBase = clamp(Math.floor(taxable / 1_000) * 1_000, periodFor(rates.pension.periods, month));
  const pension = floorTen(percentage(pensionBase, rates.pension));
  const health = floorTen(clamp(percentage(taxable, rates.health), rates.health));
  const care = floorTen(percentage(health, periodFor(rates.care.periods, month)));
  const employment = floorTen(percentage(taxable, rates.employment));
  return { pension, health, care, employment };
}

export function compareInsurance({ taxable, month, year }) {
  if (year === rates.year) {
    const { pension, health, care, employment } = monthlyContributions(taxable, month);
    return { pension, health, care, employment };
  }
  const { pension, health, care } = insurance2027;
  const base = Math.floor(taxable / 1_000) * 1_000;
  const healthBeforeLimits = floorTen(percentage(taxable, health));
  return {
    pension: month <= pension.throughMonth ? floorTen(percentage(clamp(base, pension), pension)) : undefined,
    healthBeforeLimits,
    careBeforeLimits: floorTen(percentage(healthBeforeLimits, care)),
    employment: floorTen(percentage(taxable, rates.employment)),
  };
}

function monthDeductions(taxable, dependents, children, month) {
  const contributions = monthlyContributions(taxable, month);
  const incomeTax = monthlyIncomeTax(taxable, dependents + 1, children, month);
  const localTax = floorTen(percentage(incomeTax, rates.localTax));
  return { ...contributions, incomeTax, localTax };
}

function validate(value, min, max, description) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new RangeError(`${description}: ${min.toLocaleString('ko-KR')}~${max.toLocaleString('ko-KR')} 범위의 정수를 입력해 주세요.`);
  }
}

export function calculate({ annualSalary, monthlyTaxFree = defaults.monthlyTaxFree,
  dependents = defaults.dependents, children = defaults.children }) {
  validate(annualSalary, 12, limits.annualSalary, '세전 연봉');
  const baseGross = Math.floor(annualSalary / 12);
  validate(monthlyTaxFree, 0, baseGross, '월 비과세액');
  validate(dependents, 0, limits.dependents, '부양가족 수');
  validate(children, 0, dependents, '만 8~20세 공제 대상 자녀 수');
  const annual = Object.fromEntries(deductionKeys.map((key) => [key, 0]));
  for (let month = 1; month <= 12; month++) {
    const gross = baseGross + Number(month <= annualSalary % 12);
    const breakdown = monthDeductions(gross - monthlyTaxFree, dependents, children, month);
    for (const key of deductionKeys) annual[key] += breakdown[key];
  }
  annual.gross = annualSalary;
  annual.deductions = deductionKeys.reduce((total, key) => total + annual[key], 0);
  annual.net = annual.gross - annual.deductions;
  const monthly = Object.fromEntries(Object.entries(annual).map(([key, value]) => [key, Math.round(value / 12)]));
  return { annual, monthly };
}
