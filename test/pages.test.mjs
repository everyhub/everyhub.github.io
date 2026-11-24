import assert from 'node:assert/strict';
import test from 'node:test';
import { homePage, salaries, salaryCalculatorPage, salaryPage } from '../src/pages.mjs';
import { extraPages } from '../src/labor-pages.mjs';
import { informationPages } from '../src/information-pages.mjs';
import { holidayCalendar } from '../src/information.mjs';
import { brand, toolPath, tools } from '../src/tool-specs.mjs';
import { informationSections } from '../src/information.mjs';
import { newsSections } from '../src/news-config.mjs';
import { utilitySections } from '../src/utility-config.mjs';
import { examplePages, medianPages, navigationGroups } from '../src/navigation.mjs';

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
  const salaryIndex = salaryCalculatorPage(config).match(/<details class="example-index">([\s\S]+?)<\/details>/)[1];
  for (const salary of salaries) assert.ok(salaryIndex.includes(`href="../../salary/${salary}/"`));
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

test('개인 이름 없는 브랜드와 분류 탐색 패널', () => {
  const home = homePage(config);
  assert.ok(home.includes(`<meta property="og:site_name" content="${brand}">`));
  assert.equal(navigationGroups.length, 8);
  for (const { path } of navigationGroups) assert.ok(home.includes(`href="./${path}"`));
  const group = extraPages(config).find(({ path }) => path === 'leave/');
  assert.match(group.html, /href="\.\.\/leave\/" aria-current="page"/);
  assert.match(group.html, /href="\.\.\/tools\/annual-leave\/"/);
  assert.match(group.html, /aria-controls="site-navigation" aria-expanded="false"/);
  assert.match(group.html, /href="\.\.\/sitemap\/"/);
  const sidebar = (html) => html.match(/<nav class="sidebar"[\s\S]+?<\/nav>/)[0];
  assert.doesNotMatch(sidebar(home), /<details open>/);
  assert.deepEqual([...sidebar(group.html).matchAll(/<details open><summary>(.*?)<\/summary>/g)].map(([, name]) => name), ['육아·휴가']);
  const salary = sidebar(salaryPage(config, 4_000, salaries.indexOf(4_000)));
  assert.match(salary, /<details open><summary>급여·세금/);
  assert.doesNotMatch(salary, /href="[^"]*salary\/\d+\//);
});

test('새 브랜드와 한눈에 바로가기, 별도 연봉 계산기 및 기존 홈 앵커', () => {
  const home = homePage(config);
  assert.match(home, /<h1>에브리허브 \(EveryHub\)<\/h1>/);
  assert.match(home, /"@type":"WebSite","name":"에브리허브 \(EveryHub\)"/);
  assert.match(home, /id="shortcuts">한눈에 바로가기/);
  assert.match(home, /id="calculator"/);
  const buttons = [...home.matchAll(/class="dashboard-links">([\s\S]*?)<\/ul>/g)].map(([, list]) => list).join('');
  const paths = [...navigationGroups.map(({ path }) => path), ...Object.keys(tools).map(toolPath),
    ...[...informationSections, ...newsSections, ...utilitySections].map(({ path }) => path),
    'news/', 'info/', 'tools/', 'tools/salary-calculator/'];
  for (const path of paths) assert.ok(buttons.includes(`href="./${path}"`), path);
  const salary = salaryCalculatorPage(config);
  assert.match(salary, /<h1>연봉 실수령액 계산기<\/h1>/);
  assert.match(salary, /"@type":"FAQPage"/);
  assert.match(salary, /href="\.\.\/\.\.\/salary\/4000\/"/);
  assert.ok(salary.includes(`href="${config.baseURL}tools/salary-calculator/"`));
});

test('각 도구의 공식 출처, 캐노니컬·FAQ·계산기 구조화 데이터', () => {
  const pages = extraPages(config);
  assert.equal(pages.length, 81);
  assert.equal(new Set(pages.map(({ path }) => path)).size, pages.length);
  for (const [id, tool] of Object.entries(tools)) {
    const path = toolPath(id);
    const { html } = pages.find((page) => page.path === path);
    assert.ok(html.includes(`href="${config.baseURL}${path}"`));
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /"@type":"WebApplication"/);
    assert.match(html, /2026-11-24/);
    for (const { name, url } of tool.sources) {
      assert.ok(html.includes(name));
      assert.match(new URL(url).hostname, /(?:^|\.)(?:(?:law|moel|work24|minimumwage|mohw|lawmaking|korea|nts|molit|seoul|goheung|hf)\.go\.kr|(?:nhis|nps|bok|lh|khug)\.or\.kr|(?:i-sh|sgic|applyhome)\.co\.kr|korea\.kr)$/);
    }
  }
});

test('HTML 사이트맵에는 도구만 표시하며 상세 예시는 계산기에서 연결', () => {
  const pages = extraPages(config);
  const sitemap = pages.find(({ path }) => path === 'sitemap/').html;
  assert.equal((sitemap.match(/class="sitemap-card"/g) ?? []).length, navigationGroups.length);
  for (const salary of salaries) assert.ok(!sitemap.includes(`href="../salary/${salary}/"`));
  for (const { id, path } of [...examplePages, ...medianPages]) {
    assert.ok(!sitemap.includes(`href="../${path}"`));
    const calculator = pages.find((page) => page.path === toolPath(id)).html;
    assert.match(calculator, /<details class="example-index">/);
    assert.ok(calculator.includes(`href="../../${path}"`));
    assert.ok(pages.some((page) => page.path === path));
  }
  assert.match(sitemap, /href="\.\.\/news\/ai\/"/);
  assert.match(sitemap, /href="\.\.\/tools\/background-removal\/"/);
  assert.match(sitemap, /href="\.\.\/tools\/salary-calculator\/"/);
  assert.match(sitemap, /href="\.\.\/info\/holidays\/2027\/"/);
  const median = pages.find(({ path }) => path === 'median-income/2027/4/').html;
  assert.match(median, /6,929,885원/);
  assert.match(median, /href="\.\.\/\.\.\/\.\.\/median-income\/2026\/4\/"/);
  assert.match(median, /"@type":"FAQPage"/);
});

test('월력요항 및 개정 법령에 따른 공휴일과 주 5일제 연휴를 생성', () => {
  const previous = holidayCalendar(2026);
  const next = holidayCalendar(2027);
  assert.equal(previous.daysOff, 120);
  assert.equal(next.daysOff, 119);
  assert.equal(next.blocks.length, 10);
  assert.ok(previous.holidays.some(({ date, name }) => date === '2026-07-17' && name === '제헌절'));
  assert.ok(next.holidays.some(({ date, name }) => date === '2027-07-19' && name === '대체공휴일(제헌절)'));
  const pages = informationPages(config);
  assert.equal(pages.length, 5);
  for (const { path, html } of pages) {
    assert.ok(html.includes(`href="${config.baseURL}${path}"`));
    assert.match(html, /"@type":"CollectionPage"/);
  }
  const tax = pages.find(({ path }) => path === 'info/tax-calendar/').html;
  assert.match(tax, /국세청 · 2027년 세무일정/);
  const yearly = pages.find(({ path }) => path === 'info/yearly-rates/').html;
  assert.match(yearly, /2,236,300원/);
  assert.match(yearly, /13\.90%/);
});

test('예시 페이지는 2026년 시급 12,000원과 연봉 4,000만원 표를 제공', () => {
  const pages = extraPages(config);
  const hourly = pages.find(({ path }) => path === 'hourly/12000/').html;
  const severance = pages.find(({ path }) => path === 'severance/4000/').html;
  assert.match(hourly, /2,508,000원/);
  assert.match(hourly, /주 20시간·주휴 포함/);
  assert.match(severance, /href="\.\.\/\.\.\/salary\/4000\/"/);
  assert.match(severance, /5년 재직/);
});
