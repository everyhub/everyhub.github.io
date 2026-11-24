import { brokerageRules, guaranteeRates, jeonseLoanRules, mortgageRules, publicRentalProfiles, reportRules } from './housing-rates.mjs';

const monthlyInterest = (principal, annualRate) => principal * annualRate / 1_200;
const won = (amount) => Math.round(amount);

export function publicRent({ profile, direction, deposit, monthly, change, noticeLimit }) {
  const rule = publicRentalProfiles[profile];
  const moreDeposit = direction === 'increase';
  const rate = rule[direction];
  const cap = rule.shares
    ? Math.floor(moreDeposit ? monthly * rule.shares[0] * 12 / rate : deposit * rule.shares[1] / 100)
    : Math.floor(noticeLimit / rule.step) * rule.step;
  const limit = moreDeposit ? Math.min(cap, Math.floor(monthly * 1_200 / rate)) : Math.min(cap, deposit);
  if (!rule.shares && !noticeLimit) return { rate, note: 'LH 공고 또는 계약서의 방향별 최대 보증금 차액을 입력해 주세요.' };
  if (rule.step && change % rule.step) return { rate, limit, note: '이 LH 공고의 전환 단위는 보증금 100만 원입니다.' };
  if (change > limit) return { rate, limit, note: '입력한 보증금 차액이 전환 한도를 초과합니다.' };
  const delta = won(monthlyInterest(change, rate));
  return { rate, limit, delta, deposit: deposit + (moreDeposit ? change : -change), monthly: monthly + (moreDeposit ? -delta : delta) };
}

export function guaranteeFee({ provider, amount, ltv, days, yearDays, quote }) {
  if (provider === 'hf') {
    const band = guaranteeRates.hf.find(([limit]) => ltv <= limit);
    if (!band) return { note: 'HF 일반전세지킴보증 요율표는 담보인정비율 90%까지입니다.' };
    const rate = band[1];
    return { minRate: rate, maxRate: rate, minFee: won(amount * rate * days / (100 * yearDays)), maxFee: won(amount * rate * days / (100 * yearDays)) };
  }
  if (provider === 'sgi' && !quote) return { note: 'SGI 공식 견적에서 확인한 적용 연 보험료율을 입력해 주세요.' };
  const [minRate, maxRate] = provider === 'sgi' ? [quote, quote] : guaranteeRates.hug;
  return { minRate, maxRate, minFee: won(amount * minRate * days / 36_500), maxFee: won(amount * maxRate * days / 36_500) };
}

export function jeonseLoan({ product, region, household, deposit, requested, rate }) {
  const rule = jeonseLoanRules[product];
  const regionIndex = region === 'metro' ? 0 : 1;
  const family = product === 'general' && household === 'children';
  const small = product === 'youth' && household === 'under25';
  const productLimit = family ? rule.family[regionIndex] : small ? rule.small : rule.regional[regionIndex];
  const share = rule.ratios[Number(family)];
  const limit = Math.min(productLimit, Math.floor(deposit * share / 100));
  return {
    minRate: rule.rates[0], maxRate: rule.rates[1], share, limit,
    interest: requested <= limit ? won(monthlyInterest(requested, rate)) : undefined,
    note: requested > limit ? '희망 대출액이 호당 한도 또는 보증금 비율 한도를 넘습니다.' : undefined,
  };
}

export function mortgage({ household, region, price, principal, rate, years, method }) {
  const ltv = household === 'first' && region === 'other' ? mortgageRules.firstLtv : mortgageRules.ltv;
  const limit = Math.min(mortgageRules.caps[household], Math.floor(price * ltv / 100));
  const base = { minRate: mortgageRules.rates[0], maxRate: mortgageRules.rates[1], ltv, limit };
  if (principal > limit) return { ...base, note: '입력한 대출금이 호당 한도 또는 담보인정비율 한도를 넘습니다.' };
  const n = years * 12;
  const r = rate / 1_200;
  if (method === 'principal') {
    const principalPerMonth = principal / n;
    return { ...base, first: won(principalPerMonth + principal * r), last: won(principalPerMonth * (1 + r)),
      interest: won(principal * r * (n + 1) / 2) };
  }
  const payment = r ? principal * r / -Math.expm1(-n * Math.log1p(r)) : principal / n;
  return { ...base, first: won(payment), last: won(payment), interest: won(payment * n - principal) };
}

export function brokerage({ type, amount, monthly }) {
  let value = amount + (type === 'monthly' ? monthly * 100 : 0);
  if (type === 'monthly' && value < 50_000_000) value = amount + monthly * 70;
  const [ , perMille, cap = Infinity] = brokerageRules[type === 'sale' ? 'sale' : 'lease'].find(([upper]) => value < upper);
  return { value, rate: perMille / 10, fee: Math.min(cap, Math.floor(value * perMille / 1_000)) };
}

export function acquisitionTax({ price, count, location, overArea }) {
  const tier = count - (location === 'regulated' ? 1 : 2);
  const rate = tier >= 2 ? 12 : tier === 1 ? 8 : price <= 600_000_000 ? 1 : price > 900_000_000 ? 3
    : Math.round((price * 2 - 900_000_000) / 3_000_000) / 100;
  const educationRate = tier >= 1 ? 0.4 : rate / 10;
  const ruralRate = overArea === 'yes' ? (tier >= 2 ? 1 : tier === 1 ? 0.6 : 0.2) : 0;
  const value = (percent) => Math.floor(price * Math.round(percent * 100_000) / 10_000_000);
  const base = value(rate);
  const education = value(educationRate);
  const rural = value(ruralRate);
  return { rate, base, education, rural, total: base + education + rural };
}

export function subscriptionScore({ homeFree, dependents, account, spouse }) {
  const noHome = homeFree < 0 ? 0 : Math.min(homeFree + 1, 16) * 2;
  const family = Math.min(dependents + 1, 7) * 5;
  const own = account < 6 ? 1 : account < 12 ? 2 : Math.min(Math.floor(account / 12) + 2, 17);
  const spousePoints = spouse < 0 ? 0 : spouse < 12 ? 1 : spouse < 24 ? 2 : 3;
  const accounts = Math.min(own + spousePoints, 17);
  return { noHome, family, own, spousePoints, accounts, total: noHome + family + accounts };
}

export function tenancy({ type, region, elapsed, deposit, monthly, newDeposit, newMonthly, localCap }) {
  const changed = deposit !== newDeposit || monthly !== newMonthly;
  const report = region === 'yes' && (type === 'new' || changed) &&
    (newDeposit > reportRules.deposit || newMonthly > reportRules.monthly);
  const result = { report: report ? '신고 대상 조건 충족' : '입력 기준 신고 대상 아님', days: report ? reportRules.days : undefined };
  if (type !== 'renewal') return result;
  const cap = elapsed === 'yes' ? Math.min(localCap, reportRules.renewalCap) : 0;
  return { ...result, cap,
    depositLimit: newMonthly === monthly ? deposit + Math.floor(deposit * cap / 100) : undefined,
    monthlyLimit: newDeposit === deposit ? monthly + Math.floor(monthly * cap / 100) : undefined,
    note: newDeposit !== deposit && newMonthly !== monthly ? '보증금과 월세를 동시에 변경하는 경우 이 계산 결과로 증액 적법성을 판단할 수 없습니다.' : undefined,
  };
}
