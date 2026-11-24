import assert from 'node:assert/strict';
import test from 'node:test';
import { homePage, salaries, salaryPage } from '../src/pages.mjs';

const config = { baseURL: 'https://example.com/salary-calc/' };

test('연봉 구간의 범위, 간격, 인덱스 링크', () => {
  assert.equal(salaries[0], 2_000);
  assert.equal(salaries.at(-1), 20_000);
  assert.equal(salaries.length, 101);
  for (let i = 1; i < salaries.length; i++) {
    assert.equal(salaries[i] - salaries[i - 1], salaries[i] <= 10_000 ? 100 : 500);
  }
  const home = homePage(config);
  for (const salary of salaries) assert.ok(home.includes(`href="./salary/${salary}/"`));
  assert.match(home, /"@type":"WebApplication"/);
  assert.doesNotMatch(home, /pagead2\.googlesyndication/);
});

test('연봉 상세의 공제 내역, 인접 연봉 링크, canonical과 FAQ', () => {
  const page = salaryPage(config, 4_000, salaries.indexOf(4_000));
  assert.match(page, /<h1>연봉 4,000만 원 실수령액<\/h1>/);
  assert.match(page, /href="https:\/\/example\.com\/salary-calc\/salary\/4000\/"[^\n]*\n/);
  assert.match(page, /href="\.\.\/\.\.\/salary\/3900\/"/);
  assert.match(page, /href="\.\.\/\.\.\/salary\/4100\/"/);
  assert.match(page, /href="\.\.\/\.\.\/\?salary=4000#calculator"/);
  assert.match(page, /data-amount="localTax"/);
  assert.match(page, /"@type":"FAQPage"/);
});

test('설정한 검색 소유권 태그와 광고 슬롯을 렌더링', () => {
  const home = homePage({
    ...config, googleVerification: 'google-code', naverVerification: 'naver-code',
    adsenseClient: 'ca-pub-12345', adsenseSlot: '6789',
  });
  assert.match(home, /name="google-site-verification" content="google-code"/);
  assert.match(home, /name="naver-site-verification" content="naver-code"/);
  assert.match(home, /adsbygoogle\.js\?client=ca-pub-12345/);
  assert.match(home, /data-ad-slot="6789"/);
});
