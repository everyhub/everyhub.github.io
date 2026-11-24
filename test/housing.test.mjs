import test from 'node:test';
import assert from 'node:assert/strict';
import { extraPages } from '../src/labor-pages.mjs';
import { homePage } from '../src/pages.mjs';
import { defaultsFor, tools } from '../src/tool-specs.mjs';
import { housingExamples } from '../src/housing-examples.mjs';

const config = { baseURL: 'https://example.com/salary-calc/' };
const run = (id, inputs = {}) => tools[id].calculate({ ...defaultsFor(tools[id]), ...inputs });

test('LH and SH calculate both conversion directions and refuse amounts over the applicable cap', () => {
  const id = 'public-rent-conversion';
  assert.deepEqual(run(id), { rate: 6, limit: 20_000_000, delta: 50_000, deposit: 50_000_000, monthly: 250_000 });
  assert.equal(run(id, { profile: 'lhHappy', direction: 'decrease' }).monthly, 329_167);
  assert.match(run(id, { noticeLimit: 0 }).note, /최대 보증금 차액/);
  assert.match(run(id, { change: 1_200_000 }).note, /100만 원/);
  assert.match(run(id, { change: 21_000_000 }).note, /초과/);
  assert.equal(run(id, { profile: 'shFamily', monthly: 670_000 }).limit, 72_000_000);
  assert.equal(run(id, { profile: 'shJeonse', monthly: 670_000 }).limit, 96_000_000);
  assert.equal(run(id, { profile: 'shYouth', direction: 'decrease' }).limit, 24_000_000);
  assert.equal(run(id, { profile: 'shYouth', direction: 'decrease' }).monthly, 320_833);
});

test('return guarantees distinguish HUG range, HF LTV and leap-year basis, and SGI quote', () => {
  const id = 'jeonse-guarantee-fee';
  assert.deepEqual(run(id), { minRate: 0.115, maxRate: 0.154, minFee: 230_000, maxFee: 308_000 });
  assert.equal(run(id, { provider: 'hf', ltv: 70, days: 366, yearDays: 366 }).minFee, 80_000);
  assert.equal(run(id, { provider: 'hf', ltv: 80 }).minRate, 0.11);
  assert.equal(run(id, { provider: 'hf', ltv: 90 }).minRate, 0.18);
  assert.match(run(id, { provider: 'hf', ltv: 90.1 }).note, /90%/);
  assert.match(run(id, { provider: 'sgi' }).note, /공식 견적/);
  assert.equal(run(id, { provider: 'sgi', quote: 0.25 }).minFee, 500_000);
});

test('jeonse programs apply their own caps and calculate interest on the entered principal', () => {
  const id = 'jeonse-loan-interest';
  assert.equal(run(id).interest, 233_333);
  assert.equal(run(id, { region: 'other' }).limit, 80_000_000);
  assert.equal(run(id, { product: 'youth', household: 'under25' }).limit, 120_000_000);
  assert.equal(run(id, { product: 'married', deposit: 300_000_000 }).limit, 240_000_000);
  assert.equal(run(id, { product: 'newborn', deposit: 400_000_000 }).limit, 240_000_000);
  assert.equal(run(id, { product: 'general', household: 'children', deposit: 200_000_000 }).limit, 160_000_000);
  assert.equal(run(id, { requested: 130_000_000 }).interest, undefined);
});

test('Didimdol payments support level and equal-principal repayment and enforce illustrative LTV', () => {
  const id = 'didimdol-payment';
  const inputs = { principal: 120_000_000, years: 10, rate: 12 };
  assert.equal(run(id, inputs).first, 1_721_651);
  const principal = run(id, { ...inputs, method: 'principal' });
  assert.equal(principal.first, 2_200_000);
  assert.equal(principal.last, 1_010_000);
  assert.equal(principal.interest, 72_600_000);
  assert.equal(run(id, { ...inputs, rate: 0 }).first, 1_000_000);
  assert.equal(run(id, { household: 'first', region: 'other', price: 250_000_000 }).limit, 200_000_000);
  assert.equal(run(id, { household: 'first', price: 250_000_000 }).first, undefined);
});

test('Seoul brokerage uses the 70x fallback only below 50 million and respects fee caps', () => {
  const id = 'brokerage-fee';
  assert.deepEqual(run(id, { amount: 10_000_000, monthly: 400_000 }), { value: 50_000_000, rate: 0.4, fee: 200_000 });
  assert.equal(run(id, { amount: 10_000_000, monthly: 399_999 }).value, 37_999_930);
  assert.equal(run(id, { type: 'sale', amount: 199_000_000 }).fee, 800_000);
  assert.equal(run(id, { type: 'lease', amount: 600_000_000 }).rate, 0.4);
});

test('home acquisition tax separates all three taxes and handles brackets and property counts', () => {
  const id = 'home-acquisition-tax';
  assert.deepEqual(run(id), { rate: 2, base: 15_000_000, education: 1_500_000, rural: 0, total: 16_500_000 });
  assert.equal(run(id, { price: 600_000_000 }).rate, 1);
  assert.equal(run(id, { price: 700_000_000 }).rate, 1.67);
  assert.equal(run(id, { price: 900_000_000 }).rate, 3);
  assert.equal(run(id, { count: 2 }).rate, 2);
  assert.equal(run(id, { count: 2, location: 'regulated', overArea: 'yes' }).total, 67_500_000);
  assert.equal(run(id, { count: 4, overArea: 'yes' }).total, 100_500_000);
});

test('subscription score handles own and spouse account periods, dependents, and 84-point cap', () => {
  const id = 'subscription-score';
  assert.equal(run(id, { homeFree: -1, dependents: 0, account: 5 }).total, 6);
  assert.equal(run(id, { homeFree: 0, account: 6, spouse: 11 }).accounts, 3);
  assert.equal(run(id, { account: 12, spouse: 12 }).accounts, 5);
  assert.equal(run(id, { homeFree: 15, dependents: 6, account: 178, spouse: 24 }).total, 84);
});

test('tenancy separates renewal cap from strict reporting thresholds and unchanged renewals', () => {
  const id = 'tenancy-renewal-report';
  assert.equal(run(id).monthlyLimit, 420_000);
  assert.equal(run(id, { elapsed: 'no' }).monthlyLimit, 400_000);
  assert.equal(run(id, { localCap: 3 }).monthlyLimit, 412_000);
  assert.equal(run(id, { newDeposit: 110_000_000 }).monthlyLimit, undefined);
  assert.equal(run(id, { newMonthly: 400_000 }).days, undefined);
  assert.equal(run(id, { type: 'new', newDeposit: 60_000_000, newMonthly: 300_000 }).days, undefined);
  assert.equal(run(id, { type: 'new', newDeposit: 60_000_001, newMonthly: 0 }).days, 30);
  assert.equal(run(id, { type: 'new', region: 'no' }).days, undefined);
});

test('housing pages are linked from the home and sitemap and include canonical and FAQ data', () => {
  const pages = new Map(extraPages(config).map(({ path, html }) => [path, html]));
  assert.match(homePage(config), /href="\.\/housing\/"[^>]*>주거·전월세/);
  assert.match(pages.get('tools/rent-conversion/'), /href="\.\.\/\.\.\/tools\/public-rent-conversion\//);
  assert.match(pages.get('tools/public-rent-conversion/'), /"@type":"WebApplication"/);
  for (const { id, path } of housingExamples) {
    assert.ok(pages.get('sitemap/').includes(`href="../tools/${id}/"`));
    assert.ok(!pages.get('sitemap/').includes(`href="../${path}"`));
    assert.ok(pages.get(`tools/${id}/`).includes(`href="../../${path}"`));
    assert.ok(pages.get(path).includes(`href="${new URL(path, config.baseURL)}"`));
    assert.match(pages.get(path), /"@type":"FAQPage"/);
  }
});
