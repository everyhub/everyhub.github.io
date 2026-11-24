import { guideRates as r } from './guide-rates.mjs';

export function ordinaryWage({ monthly, monthlyHours, dailyHours }) {
  const hourly = monthly / monthlyHours;
  return { hourly: Math.round(hourly), daily: Math.round(hourly * dailyHours) };
}

export function averageWage({ wages, days, ordinary }) {
  const raw = wages / days;
  return { raw: Math.round(raw), applicable: Math.round(Math.max(raw, ordinary)) };
}

export function dismissalPay({ ordinary, applies }) {
  return { minimum: applies === 'yes' ? ordinary * r.dismissalDays : 0 };
}

export function shutdownPay({ average, ordinary, days }) {
  const daily = Math.min(average * r.shutdownShare / 100, ordinary);
  return { daily: Math.ceil(daily), total: Math.ceil(daily * days) };
}

export function weeklyHours({ regular, overtime }) {
  return {
    combined: regular + overtime,
    regularExcess: Math.max(0, regular - r.standardWeekly),
    overtimeExcess: Math.max(0, overtime - r.overtimeWeekly),
  };
}

export function freelanceWithholding({ amount }) {
  const income = Math.floor(amount * r.freelanceIncome / 1000) * 10;
  const local = Math.floor(income * r.freelanceLocalShare / 1000) * 10;
  return { income, local, total: income + local, net: amount - income - local };
}

export function incomeTax({ base }) {
  let lower = 0;
  let tax = 0;
  for (const [upper, rate] of r.incomeBands) {
    tax += (Math.min(base, upper) - lower) * rate;
    if (base <= upper) return { rate, tax: Math.floor(tax / 100) };
    lower = upper;
  }
}

export function vatSplit({ amount, unit }) {
  const supply = unit === 'gross' ? Math.round(amount * 100 / (100 + r.vat)) : amount;
  const vat = unit === 'gross' ? amount - supply : Math.round(supply * r.vat / 100);
  return { supply, vat, gross: supply + vat };
}

export function giftAllowance({ relation, used, gift }) {
  const limit = r.gift[relation];
  const left = Math.max(0, limit - used);
  return { limit, left, deducted: Math.min(gift, left), remainder: Math.max(0, gift - left) };
}

export function medianIncome({ year, size, ratio }) {
  const row = r.median[year];
  const median = row[size - 1];
  const threshold = (rate) => Math.round(median * rate / 100);
  return {
    median, selected: threshold(ratio),
    ...Object.fromEntries(Object.entries(r.welfare).map(([key, rate]) => [key, threshold(rate)])),
  };
}

export function rentConversion({ depositReduction, baseRate, existing }) {
  const rate = Math.min(r.rent.maximum, baseRate + r.rent.spread);
  const increase = Math.floor(depositReduction * Math.round(rate * 100) / 120_000);
  return { rate, increase, monthly: existing + increase };
}
