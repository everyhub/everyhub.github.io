import { holidayCalendar } from './information.mjs';
import { dateRange, difference } from './utility.mjs';

const lines = (text) => text.split(/\r\n?|\n/);

export function cleanText(text, { spaces, blank, unique, casing }) {
  let items = lines(text);
  if (spaces) items = items.map((line) => line.trim().replace(/[^\S\r\n]+/gu, ' '));
  if (blank) items = items.filter((line) => line.trim());
  if (casing === 'upper') items = items.map((line) => line.toUpperCase());
  if (casing === 'lower') items = items.map((line) => line.toLowerCase());
  return (unique ? [...new Set(items)] : items).join('\n');
}

export function compareLines(first, second) {
  const a = lines(first);
  const b = lines(second);
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [i + 1, a[i], b[i]])
    .filter(([, left, right]) => left !== right);
}

export function workdays(start, end) {
  const length = difference(start, end) + 1;
  if (length < 1) throw new Error('종료일이 시작일보다 빠릅니다.');
  if (start < '2026-01-01' || end > '2027-12-31') throw new Error('공식 달력 자료가 있는 2026~2027년만 계산합니다.');
  const dates = new Set([2026, 2027].flatMap((year) => holidayCalendar(year).holidays.map(({ date }) => date)));
  let weekends = 0;
  let holidays = 0;
  const current = new Date(start + 'T00:00:00Z');
  for (let i = 0; i < length; i++, current.setUTCDate(current.getUTCDate() + 1)) {
    const weekday = current.getUTCDay();
    if (weekday === 0 || weekday === 6) weekends++;
    else if (dates.has(current.toISOString().slice(0, 10))) holidays++;
  }
  return { work: length - weekends - holidays, weekends, holidays, length };
}

export const worldCities = [
  ['서울', 'Asia/Seoul'], ['도쿄', 'Asia/Tokyo'], ['싱가포르', 'Asia/Singapore'], ['런던', 'Europe/London'],
  ['파리', 'Europe/Paris'], ['뉴욕', 'America/New_York'], ['로스앤젤레스', 'America/Los_Angeles'], ['시드니', 'Australia/Sydney'],
];

export const worldTimeRange = ['1989-01-01', dateRange[1]];

export function worldTime(date, time) {
  difference(date, date);
  if (date < worldTimeRange[0]) throw new Error('서울 시각에 UTC+9를 적용하는 1989년 이후 날짜만 계산합니다.');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('시각을 정확히 입력해 주세요.');
  const instant = new Date(date + 'T' + time + ':00+09:00');
  return worldCities.map(([city, timeZone]) => [city, new Intl.DateTimeFormat('ko-KR', {
    timeZone, dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23',
  }).format(instant)]);
}

export function bmi(cm, kg) {
  if (!(cm > 0 && kg > 0) || !Number.isFinite(cm + kg)) throw new Error('키와 체중을 각각 0보다 큰 수로 입력해 주세요.');
  const value = kg / (cm / 100) ** 2;
  return { value, category: [[18.5, '저체중'], [23, '정상'], [25, '비만 전단계'], [30, '1단계 비만'],
    [35, '2단계 비만'], [Infinity, '3단계 비만']].find(([limit]) => value < limit)[1] };
}

export const unitPairs = {
  'cm-in': ['인치', (n) => n / 2.54], 'in-cm': ['cm', (n) => n * 2.54],
  'kg-lb': ['lb', (n) => n / 0.45359237], 'lb-kg': ['kg', (n) => n * 0.45359237],
  'c-f': ['°F', (n) => n * 9 / 5 + 32], 'f-c': ['°C', (n) => (n - 32) * 5 / 9],
};

export function convertUnit(value, pair) {
  const [unit, convert] = unitPairs[pair];
  return { value: convert(value), unit };
}

export function percentage(first, second, mode) {
  if (mode === 'discount') {
    if (second > 100) throw new Error('할인율은 100% 이하여야 합니다.');
    return first * (100 - second) / 100;
  }
  if (!first) throw new Error('기준값은 0보다 커야 합니다.');
  return (mode === 'change' ? second - first : second) * 100 / first;
}

export function splitBill(total, people) {
  if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(people) || people < 1) throw new Error('총액과 인원을 정수로 입력해 주세요.');
  return { base: Math.floor(total / people), extra: total % people };
}

export function depositInterest({ product, amount, months, rate, compounding, taxType }) {
  if (!['deposit', 'savings'].includes(product)) throw new Error('상품 유형을 선택해 주세요.');
  if (!['simple', 'monthly'].includes(compounding)) throw new Error('이자 계산 방식을 선택해 주세요.');
  if (!['normal', 'tax-free', 'coop-14', 'coop-5'].includes(taxType)) throw new Error('과세 구분을 선택해 주세요.');
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1_000_000_000_000) {
    throw new Error('원금 또는 월 납입액은 1원~1조 원 사이의 정수로 입력해 주세요.');
  }
  if (!Number.isSafeInteger(months) || months < 1 || months > 600) {
    throw new Error('기간은 1~600개월 사이의 정수로 입력해 주세요.');
  }
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error('연 이자율은 0~100% 사이의 숫자로 입력해 주세요.');
  }
  const principal = product === 'deposit' ? amount : amount * months;
  const annualRate = rate / 100;
  const monthlyRate = annualRate / 12;
  let rawGross = 0;
  if (product === 'deposit') {
    rawGross = compounding === 'simple'
      ? amount * annualRate * (months / 12)
      : amount * ((1 + monthlyRate) ** months - 1);
  } else {
    rawGross = compounding === 'simple'
      ? amount * annualRate * (months * (months + 1) / 24)
      : monthlyRate === 0 ? 0 : amount * (1 + monthlyRate) * (((1 + monthlyRate) ** months - 1) / monthlyRate) - principal;
  }
  const grossInterest = Math.floor(rawGross + 1e-9);
  const floor10 = (value) => Math.floor((value + 1e-9) / 10) * 10;
  let incomeTax = 0;
  let localTax = 0;
  let ruralTax = 0;
  let taxRate = 0;
  if (taxType === 'normal') {
    incomeTax = floor10(grossInterest * 0.14);
    localTax = floor10(incomeTax * 0.1);
    taxRate = 15.4;
  } else if (taxType === 'coop-14') {
    ruralTax = floor10(grossInterest * 0.014);
    taxRate = 1.4;
  } else if (taxType === 'coop-5') {
    incomeTax = floor10(grossInterest * 0.05);
    taxRate = 5;
  }
  const tax = incomeTax + localTax + ruralTax;
  const netInterest = grossInterest - tax;
  return { principal, grossInterest, incomeTax, localTax, ruralTax, tax, taxRate, netInterest, totalPayout: principal + netInterest };
}

function simulateLoan(principal, months, monthlyRate, method, graceMonths) {
  const graceMonthlyInterest = Math.round(principal * monthlyRate);
  if (method === 'bullet') {
    const totalInterest = graceMonthlyInterest * months;
    return {
      graceMonthlyInterest: 0,
      firstPayment: months === 1 ? principal + graceMonthlyInterest : graceMonthlyInterest,
      lastPayment: principal + graceMonthlyInterest,
      monthlyInterest: graceMonthlyInterest,
      totalInterest,
      totalPayment: principal + totalInterest,
    };
  }
  const repayMonths = months - graceMonths;
  let remaining = principal;
  let totalInterest = graceMonthlyInterest * graceMonths;
  let firstPayment = 0;
  let lastPayment = 0;
  if (method === 'equal-payment') {
    const basePayment = monthlyRate === 0
      ? principal / repayMonths
      : principal * (monthlyRate * (1 + monthlyRate) ** repayMonths) / ((1 + monthlyRate) ** repayMonths - 1);
    for (let i = 1; i <= repayMonths; i++) {
      const interest = Math.round(remaining * monthlyRate);
      let principalPart;
      let payment;
      if (i === repayMonths) {
        principalPart = remaining;
        payment = principalPart + interest;
      } else {
        payment = Math.round(basePayment);
        principalPart = Math.min(remaining, Math.max(0, payment - interest));
        payment = principalPart + interest;
      }
      remaining -= principalPart;
      totalInterest += interest;
      if (i === 1) firstPayment = payment;
      if (i === repayMonths) lastPayment = payment;
    }
    return {
      graceMonthlyInterest,
      monthlyPayment: Math.round(basePayment),
      firstPayment,
      lastPayment,
      totalInterest,
      totalPayment: principal + totalInterest,
    };
  }
  const basePrincipal = Math.floor(principal / repayMonths);
  for (let i = 1; i <= repayMonths; i++) {
    const interest = Math.round(remaining * monthlyRate);
    const principalPart = i === repayMonths ? remaining : basePrincipal;
    const payment = principalPart + interest;
    remaining -= principalPart;
    totalInterest += interest;
    if (i === 1) firstPayment = payment;
    if (i === repayMonths) lastPayment = payment;
  }
  return {
    graceMonthlyInterest,
    monthlyPrincipal: basePrincipal,
    firstPayment,
    lastPayment,
    totalInterest,
    totalPayment: principal + totalInterest,
  };
}

export function loanInterest({ principal, months, rate, method, graceMonths = 0 }) {
  if (!['equal-payment', 'equal-principal', 'bullet'].includes(method)) throw new Error('상환 방식을 선택해 주세요.');
  if (!Number.isSafeInteger(principal) || principal < 1 || principal > 1_000_000_000_000) {
    throw new Error('대출 원금은 1원~1조 원 사이의 정수로 입력해 주세요.');
  }
  if (!Number.isSafeInteger(months) || months < 1 || months > 600) {
    throw new Error('대출 기간은 1~600개월 사이의 정수로 입력해 주세요.');
  }
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error('연 이자율은 0~100% 사이의 숫자로 입력해 주세요.');
  }
  if (!Number.isSafeInteger(graceMonths) || graceMonths < 0 || graceMonths >= months) {
    throw new Error('거치 기간은 0개월 이상, 대출 기간보다 작은 정수로 입력해 주세요.');
  }
  if (method === 'bullet' && graceMonths > 0) {
    throw new Error('만기일시상환은 전체 기간 이자만 납부하므로 거치 기간을 0개월로 입력해 주세요.');
  }
  const monthlyRate = (rate / 100) / 12;
  const result = simulateLoan(principal, months, monthlyRate, method, graceMonths);
  const comparison = {
    equalPaymentInterest: simulateLoan(principal, months, monthlyRate, 'equal-payment', method === 'bullet' ? 0 : graceMonths).totalInterest,
    equalPrincipalInterest: simulateLoan(principal, months, monthlyRate, 'equal-principal', method === 'bullet' ? 0 : graceMonths).totalInterest,
    bulletInterest: simulateLoan(principal, months, monthlyRate, 'bullet', 0).totalInterest,
  };
  return { method, principal, months, graceMonths, rate, ...result, comparison };
}

const floor10 = (value) => Math.floor((value + 1e-9) / 10) * 10;
const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export function carTax({ vehicleType, usage, displacement = 0, regYear, regHalf, taxYear = 2026, prepayment = 'none' }) {
  if (!['engine', 'electric'].includes(vehicleType)) throw new Error('차량 유형을 선택해 주세요.');
  if (!['private', 'commercial'].includes(usage)) throw new Error('용도 구분을 선택해 주세요.');
  if (!['first', 'second'].includes(regHalf)) throw new Error('최초 등록 반기를 선택해 주세요.');
  if (!['none', 'jan', 'mar', 'jun', 'sep'].includes(prepayment)) throw new Error('납부 방식을 선택해 주세요.');
  if (!Number.isSafeInteger(taxYear) || taxYear < 2026 || taxYear > 2027) {
    throw new Error('과세 연도는 2026~2027년 중에서 선택해 주세요.');
  }
  if (!Number.isSafeInteger(regYear) || regYear < 1980 || regYear > taxYear) {
    throw new Error(`최초 등록 연도는 1980~${taxYear}년 사이의 정수로 입력해 주세요.`);
  }
  if (vehicleType === 'engine' && (!Number.isSafeInteger(displacement) || displacement < 1 || displacement > 20_000)) {
    throw new Error('배기량은 1~20,000cc 사이의 정수로 입력해 주세요.');
  }

  let unitRate = 0;
  let standardAnnual;
  if (vehicleType === 'electric') {
    standardAnnual = usage === 'private' ? 100_000 : 20_000;
  } else if (usage === 'private') {
    unitRate = displacement <= 1000 ? 80 : displacement <= 1600 ? 140 : 200;
    standardAnnual = displacement * unitRate;
  } else {
    unitRate = displacement <= 1600 ? 18 : displacement <= 2500 ? 19 : 24;
    standardAnnual = displacement * unitRate;
  }

  const rawAge1 = regHalf === 'first' ? taxYear - regYear + 1 : taxYear - regYear;
  const rawAge2 = taxYear - regYear + 1;
  const applyAgeReduction = vehicleType === 'engine' && usage === 'private';
  const reductionFor = (age) => (applyAgeReduction ? (Math.min(12, Math.max(2, age)) - 2) * 0.05 : 0);
  const firstReduction = reductionFor(rawAge1);
  const secondReduction = reductionFor(rawAge2);

  const firstHalfBase = floor10((standardAnnual / 2) * (1 - firstReduction));
  const secondHalfBase = floor10((standardAnnual / 2) * (1 - secondReduction));
  const annualBase = firstHalfBase + secondHalfBase;

  const eduRate = usage === 'private' ? 0.3 : 0;
  const firstHalfEdu = floor10(firstHalfBase * eduRate);
  const secondHalfEdu = floor10(secondHalfBase * eduRate);
  const firstHalfTotal = firstHalfBase + firstHalfEdu;
  const secondHalfTotal = secondHalfBase + secondHalfEdu;
  const annualEdu = firstHalfEdu + secondHalfEdu;
  const annualTotal = annualBase + annualEdu;

  const prepayRate = 0.05;
  const daysInYear = isLeapYear(taxYear) ? 366 : 365;
  const janDays = isLeapYear(taxYear) ? 335 : 334;
  const marDays = 275;

  const calcPrepay = (mode) => {
    if (mode === 'jan') {
      const base = floor10(annualBase - annualBase * (janDays / daysInYear) * prepayRate);
      const edu = floor10(base * eduRate);
      const due = base + edu;
      return { due, annualSum: due, base, edu, savings: annualTotal - due };
    }
    if (mode === 'mar') {
      const base = floor10(annualBase - annualBase * (marDays / daysInYear) * prepayRate);
      const edu = floor10(base * eduRate);
      const due = base + edu;
      return { due, annualSum: due, base, edu, savings: annualTotal - due };
    }
    if (mode === 'jun') {
      const discountedSecondBase = floor10(secondHalfBase * (1 - prepayRate));
      const base = firstHalfBase + discountedSecondBase;
      const edu = floor10(base * eduRate);
      const due = base + edu;
      return { due, annualSum: due, base, edu, savings: annualTotal - due };
    }
    const discountedSecondBase = floor10(secondHalfBase * (1 - (92 / 184) * prepayRate));
    const discountedSecondEdu = floor10(discountedSecondBase * eduRate);
    const due = discountedSecondBase + discountedSecondEdu;
    const annualSum = firstHalfTotal + due;
    return { due, annualSum, base: discountedSecondBase, edu: discountedSecondEdu, savings: annualTotal - annualSum };
  };

  const prepayments = {
    jan: calcPrepay('jan'),
    mar: calcPrepay('mar'),
    jun: calcPrepay('jun'),
    sep: calcPrepay('sep'),
  };

  return {
    vehicleType,
    usage,
    displacement: vehicleType === 'engine' ? displacement : 0,
    unitRate,
    regYear,
    regHalf,
    taxYear,
    prepayment,
    firstAge: Math.max(0, rawAge1),
    secondAge: Math.max(1, rawAge2),
    firstReductionPercent: Math.round(firstReduction * 100),
    secondReductionPercent: Math.round(secondReduction * 100),
    firstHalfBase,
    firstHalfEdu,
    firstHalfTotal,
    secondHalfBase,
    secondHalfEdu,
    secondHalfTotal,
    annualBase,
    annualEdu,
    annualTotal,
    smallTaxLumpSum: annualBase <= 100_000,
    selectedPrepayment: prepayment === 'none' ? null : prepayments[prepayment],
    prepayments,
  };
}

export function secureIndex(size, cryptoSource = globalThis.crypto) {
  if (!Number.isSafeInteger(size) || size < 1 || size > 2 ** 32) throw new RangeError('지원하지 않는 범위입니다.');
  const slot = new Uint32Array(1);
  const bound = 2 ** 32 - (2 ** 32 % size);
  do cryptoSource.getRandomValues(slot); while (slot[0] >= bound);
  return slot[0] % size;
}

export function drawNames(text, count, random = secureIndex) {
  const items = [...new Set(lines(text).map((line) => line.trim()).filter(Boolean))];
  if (!Number.isSafeInteger(count) || count < 1 || count > items.length) throw new Error('당첨 인원은 1명 이상, 중복을 뺀 후보 수 이하로 입력해 주세요.');
  for (let i = 0; i < count; i++) {
    const j = i + random(items.length - i);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items.slice(0, count);
}

export function randomPassword(length, symbols, random = secureIndex) {
  if (!Number.isSafeInteger(length) || length < 8 || length > 128) throw new Error('비밀번호 길이를 8~128자로 입력해 주세요.');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + (symbols ? '!@#$%^&*_-+=' : '');
  return Array.from({ length }, () => alphabet[random(alphabet.length)]).join('');
}

export function ladderDraw(people, choices, random = secureIndex) {
  const entries = (input) => lines(input).map((line) => line.trim()).filter(Boolean);
  const players = entries(people);
  const results = entries(choices);
  if (players.length < 2 || players.length > 8 || players.length !== results.length || new Set(players).size !== players.length) {
    throw new Error('서로 다른 참가자와 결과의 개수를 2~8개로 맞춰 주세요.');
  }
  const positions = players.map((_, index) => index);
  const target = positions.slice();
  for (let i = target.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [target[i], target[j]] = [target[j], target[i]];
  }
  const rungs = [];
  for (const [end, index] of target.entries()) {
    for (let from = positions.indexOf(index); from > end; from--) {
      [positions[from - 1], positions[from]] = [positions[from], positions[from - 1]];
      rungs.push(from - 1);
    }
  }
  const matches = positions.map((index, end) => ({ index, end, player: players[index], result: results[end] }))
    .sort((a, b) => a.index - b.index);
  return { rungs, matches };
}

export function encodeText(text, mode) {
  if (mode === 'url-encode') return encodeURIComponent(text);
  if (mode === 'url-decode') return decodeURIComponent(text);
  if (mode === 'base64-encode') return btoa(Array.from(new TextEncoder().encode(text), (byte) => String.fromCharCode(byte)).join(''));
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(Uint8Array.from(atob(text), (char) => char.charCodeAt(0)));
}

export const formatJSON = (text, pretty) => JSON.stringify(JSON.parse(text), null, pretty ? 2 : 0);

export function colorCode(input) {
  const value = input.trim();
  let rgb;
  if (/^#?([\da-f]{3}|[\da-f]{6})$/i.test(value)) {
    let hex = value.replace('#', '');
    if (hex.length === 3) hex = hex.replace(/./g, '$&$&');
    rgb = hex.match(/../g).map((part) => parseInt(part, 16));
  } else {
    const match = /^(?:rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)|(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3}))$/i.exec(value);
    if (match) rgb = (match[1] === undefined ? match.slice(4) : match.slice(1, 4)).map(Number);
  }
  if (!rgb || rgb.some((n) => n > 255)) throw new Error('예: #07764F 또는 rgb(7, 118, 79)');
  return { rgb, hex: '#' + rgb.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase() };
}
