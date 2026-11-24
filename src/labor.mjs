import { monthlyContributions } from './calculator.mjs';
import { laborRates as r } from './labor-rates.mjs';

const int = Math.round;
const total = (values) => values.reduce((sum, value) => sum + value, 0);
const within = (value, low, high) => Math.min(high, Math.max(low, value));
const truncateTen = (value) => Math.floor(value / 10) * 10;
const daysPerMonth = 365 / 12;
const weeksPerMonth = daysPerMonth / 7;

export function minimumWage({ year }) {
  const { hourly } = r.minimum.find((rate) => rate.year === year);
  return { hourly, daily: hourly * r.hours.daily, monthly: hourly * r.hours.monthlyFullTime, yearly: hourly * r.hours.monthlyFullTime * 12 };
}

export function weeklyHoliday({ hourly, hours, attendance }) {
  const paidHours = attendance === 'yes' && hours >= r.hours.eligibilityWeekly
    ? hours / r.hours.weekly * r.hours.daily : 0;
  return { paidHours, holidayPay: int(hourly * paidHours), weeklyPay: int(hourly * (hours + paidHours)) };
}

export function wageConversion({ amount, unit, hours, holiday }) {
  const { paidHours } = weeklyHoliday({ hourly: 0, hours, attendance: holiday });
  const monthlyHours = hours === r.hours.weekly && paidHours === r.hours.daily
    ? r.hours.monthlyFullTime : (hours + paidHours) * weeksPerMonth;
  const hourly = unit === 'hour' ? amount : amount / (monthlyHours * (unit === 'year' ? 12 : 1));
  return { hourly: int(hourly), monthly: int(hourly * monthlyHours), yearly: int(hourly * monthlyHours * 12), monthlyHours };
}

export function overtimePay({ hourly, extended, holiday, holidayExtra, night }) {
  const rate = r.overtime;
  const extendedPremium = int(hourly * extended * rate.extended);
  const holidayPremium = int(hourly * (holiday * rate.holiday + holidayExtra * rate.holidayExtra));
  const nightPremium = int(hourly * night * rate.night);
  const extraBase = int(hourly * (extended + holiday + holidayExtra));
  return { extraBase, extendedPremium, holidayPremium, nightPremium, extraPay: extraBase + extendedPremium + holidayPremium + nightPremium };
}

export function severancePay({ wageTotal, periodDays, annualBonus, annualLeavePay, ordinaryDaily, serviceDays, eligible }) {
  const dailyAverage = (wageTotal + (annualBonus + annualLeavePay) / 4) / periodDays;
  const dailyBasis = Math.max(dailyAverage, ordinaryDaily);
  const severance = eligible === 'yes' ? int(dailyBasis * r.severance.dailyMultiple * serviceDays / r.severance.daysPerYear) : 0;
  return { dailyAverage, dailyBasis, severance };
}

export function unemploymentPay({ dailyWage, hours, insuranceMonths, age, disability }) {
  const rule = r.unemployment;
  const cap = int(rule.baseMaximum * rule.share);
  const floor = int(Math.min(cap, minimumWage({ year: 2026 }).hourly * rule.minimumShare * hours));
  const daily = within(int(dailyWage * rule.share), floor, cap);
  const row = rule.days.findLast(([months]) => insuranceMonths >= months);
  const days = row[age >= rule.seniorAge || disability === 'yes' ? 2 : 1];
  return { floor, cap, daily, days, expected: daily * days };
}

export function parentalPay({ monthlyWage, months, type, sharedMonths }) {
  const rule = r.parental;
  const amounts = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    const [, share, generalCap] = rule.general.findLast(([from]) => month >= from);
    const cap = type === 'shared' && month <= sharedMonths ? rule.shared[i]
      : type === 'single' && month <= rule.singleParentMonths ? rule.singleParent : generalCap;
    return within(int(monthlyWage * share), rule.minimum, cap);
  });
  return { first: amounts[0], second: amounts[3], third: amounts[6], expected: total(amounts), amounts };
}

export function maternityPay({ monthlyWage, type, company }) {
  const rule = r.maternity;
  const { total: leaveDays, employerDays, cap, postBirth } = rule.types[type];
  const supported = company === 'preferred' ? leaveDays : leaveDays - employerDays;
  const monthly = within(monthlyWage, minimumWage({ year: 2026 }).monthly, rule.monthlyCap);
  const benefitFor = (days) => truncateTen(monthly * days / rule.monthDays);
  const benefit = Math.min(cap, benefitFor(supported));
  const employer = Math.max(0, int(monthlyWage * employerDays / rule.monthDays) - (company === 'preferred' ? benefitFor(employerDays) : 0));
  return { leaveDays, postBirth, supported, benefit, employer, expected: benefit + employer };
}

export function annualLeave({ years, attendance, fullMonths, eligible }) {
  if (eligible !== 'yes') return { days: 0 };
  const rule = r.annualLeave;
  if (years === 0) return { days: Math.min(fullMonths, rule.firstYearMax) };
  if (attendance < rule.attendance) return { days: fullMonths };
  return { days: Math.min(rule.ceiling, rule.normal + Math.floor((years - 1) / rule.extraEveryYears)) };
}

export function insuranceContributions({ taxable, month, business, industry }) {
  const worker = monthlyContributions(taxable, month);
  const { employmentAdditions, employmentDenominator, accidentDenominator, industries, commute } = r.employer;
  const development = truncateTen(taxable * employmentAdditions[business][1] / employmentDenominator);
  const accident = truncateTen(taxable * (industries[industry][1] + commute) / accidentDenominator);
  const workerTotal = total(Object.values(worker));
  return { ...worker, development, accident, workerTotal, employerTotal: workerTotal + development + accident };
}
