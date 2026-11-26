import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { homePage, homeShortcuts, salaries, salaryCalculatorPage, salaryPage } from '../src/pages.mjs';
import { extraPages } from '../src/labor-pages.mjs';
import { informationPages } from '../src/information-pages.mjs';
import { sitePages } from '../src/site-pages.mjs';
import { site } from '../site.config.mjs';
import { holidayCalendar } from '../src/information.mjs';
import { brand, toolPath, tools } from '../src/tool-specs.mjs';
import { informationSections, wishTreeSection } from '../src/information.mjs';
import { newsSections } from '../src/news-config.mjs';
import { utilityGroups } from '../src/utility-config.mjs';
import { examplePages, medianPages, navigationGroups } from '../src/navigation.mjs';
import { adminPath, adminTimelinePage, adminProposalsPath, adminProposalsPage } from '../src/admin-pages.mjs';
import { officialValueEvidence } from '../src/official-value-evidence.mjs';
import { adminTimeline, auditEvidenceLabel, auditRequest, hasCompletionEvidence, renderRequirementsAudit, sortAdminTimeline } from '../src/admin-log.mjs';
import { adminProposals, sortAdminProposals } from '../src/admin-proposals.mjs';

const config = { baseURL: 'https://example.com/salary-calc/' };

test('연봉 구간의 범위, 간격, 인덱스 링크', () => {
  assert.equal(salaries[0], 2_000);
  assert.equal(salaries.at(-1), 20_000);
  assert.equal(salaries.length, 101);
  for (let i = 1; i < salaries.length; i++) {
    assert.equal(salaries[i] - salaries[i - 1], salaries[i] <= 10_000 ? 100 : 500);
  }
  const salaryPage = salaryCalculatorPage(config);
  const salaryIndex = salaryPage.match(/<details class="example-index">([\s\S]+?)<\/details>/)[1];
  for (const salary of salaries) assert.ok(salaryIndex.includes(`href="../../salary/${salary}/"`));
  assert.match(salaryPage, /"@type":"WebApplication"/);
  assert.doesNotMatch(salaryPage, /pagead2\.googlesyndication/);
});

test('연봉 상세의 공제 내역, 인접 연봉 링크, canonical과 FAQ', () => {
  const page = salaryPage(config, 4_000, salaries.indexOf(4_000));
  assert.match(page, /<h1>연봉 4,000만 원 실수령액<\/h1>/);
  assert.match(page, /href="https:\/\/example\.com\/salary-calc\/salary\/4000\/"[^\n]*\n/);
  assert.match(page, /href="\.\.\/\.\.\/salary\/3900\/"/);
  assert.match(page, /href="\.\.\/\.\.\/salary\/4100\/"/);
  assert.match(page, /href="\.\.\/\.\.\/\?salary=4000#calculator"/);
  assert.match(page, /data-amount="localTax"/);
  assert.match(page, /<section[^>]+aria-labelledby="compare">[\s\S]+?<table class="example-amounts">[\s\S]+?<td class="amount">[\d,]+원<\/td>/);
  assert.match(page, /"@type":"FAQPage"/);
});

test('설정한 검색 소유권 태그와 광고 슬롯을 렌더링', () => {
  const configured = {
    ...config, googleVerification: 'google-code', naverVerification: 'naver-code',
    adsenseClient: 'ca-pub-12345', adsenseSlot: '6789',
  };
  const page = salaryPage(configured, 4000, 20);
  assert.match(page, /name="google-site-verification" content="google-code"/);
  assert.match(page, /name="naver-site-verification" content="naver-code"/);
  assert.match(page, /adsbygoogle\.js\?client=ca-pub-12345/);
  assert.match(page, /data-ad-slot="6789"/);
  for (const tool of [salaryCalculatorPage(configured),
    ...extraPages(configured).filter(({ path }) => path.startsWith('tools/')).map(({ html }) => html)]) {
    assert.match(tool, /connect-src 'self'/);
    assert.doesNotMatch(tool, /adsbygoogle|data-ad-slot/);
  }
});

test('광고를 실행하지 않고 사이트 확인 태그와 심사용 안내를 게시', async () => {
  const account = 'ca-pub-8870302275342469';
  const configured = { ...config, adsenseAccount: site.adsenseAccount };
  assert.equal(site.adsenseAccount, account);
  const seller = await readFile(new URL('../src/ads.txt', import.meta.url), 'utf8');
  assert.equal(seller.trimEnd(), `google.com, ${account.slice(3)}, DIRECT, f08c47fec0942fa0`);
  const pages = sitePages(configured);
  const privacy = pages.find(({ path }) => path === 'privacy/').html;
  assert.match(privacy, /Google과 같은 제3자 광고 제공업체/);
  assert.match(privacy, /https:\/\/myadcenter\.google\.com\//);
  for (const html of [homePage(configured), salaryCalculatorPage(configured), adminTimelinePage(configured),
    adminProposalsPage(configured), ...pages.map(({ html }) => html)]) {
    assert.ok(html.includes(`<meta name="google-adsense-account" content="${account}">`));
    assert.doesNotMatch(html, /adsbygoogle|data-ad-slot/);
    assert.match(html, /class="footer-nav"[^\n]*about\/[^\n]*privacy\/[^\n]*github\.com\/everyhub\/everyhub\.github\.io\/issues/);
  }
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
  assert.match(group.html, /<a class="home-link" href="\.\.\/">홈<\/a>/);
  assert.match(group.html, /class="footer-nav"><a href="\.\.\/sitemap\/">전체 사이트맵<\/a>/);
  assert.match(group.html, /href="\.\.\/sitemap\/"/);
  const sidebar = (html) => html.match(/<nav class="sidebar"[\s\S]+?<\/nav>/)[0];
  assert.doesNotMatch(sidebar(home), /<details open>/);
  assert.deepEqual([...sidebar(group.html).matchAll(/<details open><summary>[\s\S]*?<span>([^<]+)<\/span><\/span><\/summary>/g)].map(([, name]) => name), ['육아·휴가']);
  assert.match(sidebar(group.html), /class="nav-icon"/);
  assert.match(sidebar(group.html), /nav-ancestor/);
  const salary = sidebar(salaryPage(config, 4_000, salaries.indexOf(4_000)));
  assert.match(salary, /<details open><summary>[\s\S]*?<span>급여·세금<\/span>/);
  assert.doesNotMatch(salary, /href="[^"]*salary\/\d+\//);
});

test('브랜드 이미지와 공유 메타는 하위 경로 및 중첩 페이지에서도 작동한다', async () => {
  const configWithSubpath = { ...config, baseURL: 'https://example.com/everyhub/' };
  const detail = salaryCalculatorPage(configWithSubpath);
  const og = 'https://example.com/everyhub/assets/brand/og.png';
  assert.ok(detail.includes(`property="og:image" content="${og}"`));
  assert.ok(detail.includes(`name="twitter:image" content="${og}"`));
  assert.match(detail, /rel="manifest" href="\.\.\/\.\.\/assets\/brand\/site\.webmanifest"/);
  assert.match(detail, /alt=""><span>에브리허브/);
  const home = homePage(configWithSubpath);
  assert.match(home, /class="home-hero-art" src="\.\/assets\/brand\/hero\.svg"[^>]*alt=""/);
  assert.equal([...home.matchAll(/<h2><a href="[^"]+"><svg class="nav-icon"/g)].length, navigationGroups.length);

  const manifestURL = new URL('assets/brand/site.webmanifest', configWithSubpath.baseURL);
  const manifest = JSON.parse(await readFile(new URL('../src/brand/site.webmanifest', import.meta.url), 'utf8'));
  for (const key of ['start_url', 'scope']) assert.equal(new URL(manifest[key], manifestURL).href, configWithSubpath.baseURL);
  assert.deepEqual(manifest.icons.map(({ sizes }) => sizes), ['192x192', '512x512']);
  for (const [filename, width, height] of [32, 180, 192, 512].map((size) => [`icon-${size}.png`, size, size]).concat([['og.png', 1200, 630]])) {
    const png = await readFile(new URL(`../src/brand/${filename}`, import.meta.url));
    assert.equal(png.toString('ascii', 1, 4), 'PNG');
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [width, height]);
  }
});

test('새 브랜드와 한눈에 바로가기, 별도 연봉 계산기 및 기존 홈 앵커', () => {
  const home = homePage(config);
  assert.match(home, /<h1>에브리허브 \(EveryHub\)<\/h1>/);
  assert.match(home, /"@type":"WebSite","name":"에브리허브 \(EveryHub\)"/);
  assert.match(home, /id="shortcuts">한눈에 바로가기/);
  assert.match(home, /class="dashboard-more"[^>]*>전체 →/);
  assert.match(home, /data-dashboard-search/);
  assert.match(home, /data-recent-tools/);
  assert.doesNotMatch(home, /연봉 실수령액 계산기와 공식 계산 기준 보기/);
  assert.doesNotMatch(home, /id="salary-form"/);
  assert.doesNotMatch(home, /id="calculator"/);
  assert.match(home, /data-page-path=""/);
  const buttons = [...home.matchAll(/class="dashboard-links">([\s\S]*?)<\/ul>/g)].map(([, list]) => list).join('')
    + [...home.matchAll(/class="dashboard-more" href="([^"]+)"/g)].map(([, href]) => `href="${href}"`).join('');
  const paths = [...navigationGroups.map(({ path }) => path), ...Object.keys(tools).map(toolPath),
    ...[...informationSections, ...newsSections, ...utilityGroups].map(({ path }) => path),
    'news/', 'info/', 'tools/', 'tools/salary-calculator/'];
  for (const path of paths) assert.ok(buttons.includes(`href="./${path}"`), path);
  const salary = salaryCalculatorPage(config);
  assert.match(salary, /<h1>연봉 실수령액 계산기<\/h1>/);
  assert.match(salary, /"@type":"FAQPage"/);
  assert.match(salary, /href="\.\.\/\.\.\/salary\/4000\/"/);
  assert.ok(salary.includes(`href="${config.baseURL}tools/salary-calculator/"`));
});

test('브라우저 편의 기능 자산과 홈 카드 검색·전체보기', async () => {
  const convenience = await readFile(new URL('../src/convenience-browser.mjs', import.meta.url), 'utf8');
  const home = homePage(config);
  assert.match(home, /assets\/convenience-browser\.mjs/);
  assert.match(convenience, /결과 복사/);
  assert.match(convenience, /입력 초기화/);
  assert.match(convenience, /everyhub:recent-tools/);
  assert.match(convenience, /data-dashboard-search/);
  assert.match(convenience, /field\.valueAsNumber/);
  assert.match(home, /data-dashboard-results hidden>[\s\S]*href="\.\/tools\/pdf-merge\/"/);
  assert.match(salaryCalculatorPage(config), /id="annualSalary" type="number"/);
});

test('크리스마스 소원 트리는 검색·사이트맵에서 열리고 외부 전송을 차단한다', () => {
  const { path, name } = wishTreeSection;
  const { html } = informationPages({ ...config, adsenseClient: 'example' }).find(page => page.path === path);
  assert.ok(html.includes(`<h1>${name}</h1>`));
  assert.ok(html.includes(`rel="canonical" href="${config.baseURL}${path}"`));
  assert.match(html, /"@type":"WebApplication".*크리스마스 소원 트리/);
  assert.match(html, /connect-src 'none';.*form-action 'none'/);
  assert.doesNotMatch(html, /<script[^>]*src="https?:\/\//);
  assert.match(html, /<canvas[^>]+aria-hidden="true"/);
  assert.match(html, /내 브라우저에만 저장돼요.*다른 사람에게 보이지 않아요/);
  assert.match(html, /예시 소원 40개/);
  assert.match(html, /내 소원 목록<\/h3><ul data-wish-list>/);
  assert.ok(homePage(config).includes(`class="wish-home-link button" href="./${path}"`));
  const shortcut = homeShortcuts().find(item => item.path === path);
  assert.deepEqual(shortcut.keywords, ['트리', '크리스마스', '소원', '성탄절']);
  assert.ok(extraPages(config).find(page => page.path === 'sitemap/').html.includes(`href="../${path}"`));
});

test('전입신고 안내는 신고·확정일자·전입 절차를 구분하고 공식 접수처와 연결한다', () => {
  const pages = extraPages(config);
  const guide = pages.find(({ path }) => path === 'housing/move-in-checklist/').html;
  for (const text of ['30일 이내', '14일 이내', '확정일자가 부여된 것으로 봅니다', 'www.gov.kr', 'www.iros.go.kr', 'rtms.molit.go.kr']) {
    assert.ok(guide.includes(text), text);
  }
  for (const path of ['housing/', 'sitemap/', toolPath('tenancy-renewal-report')]) {
    assert.match(pages.find((page) => page.path === path).html, /href="[^"]*housing\/move-in-checklist\/"/);
  }
});

test('관리 추천은 승인된 두 건의 완료와 거절된 한 건의 종료를 구분한다', () => {
  const statuses = Object.fromEntries(adminProposals.map(({ id, status }) => [id, status]));
  assert.equal(statuses['photo-location-metadata'], '완료');
  assert.equal(statuses['move-in-checklist'], '완료');
  assert.equal(statuses['continued-health-insurance'], '거절');
});

test('11월 25일 추천의 상태와 범위는 해당 이슈에 연결된다', () => {
  const proposals = adminProposalsPage(config);
  for (const [id, number] of [
    ['csv-json-converter', 4], ['civil-service-fertility-leave', 5], ['rare-disease-support-checklist', 6],
  ]) {
    const card = proposals.match(new RegExp(`id="proposal-${id}"[^]*?</article>`))?.[0];
    assert.ok(card, id);
    assert.ok(card.includes(`${number === 4 ? '완료' : '제외'} · <time datetime="2026-11-25T09:16+09:00"`), id);
    assert.ok(card.includes(`href="https://github.com/everyhub/everyhub.github.io/issues/${number}"`), id);
    assert.ok(card.includes(`/${id}/`), id);
  }
  const converter = adminTimeline.find(({ id }) => id === 'csv-json-converter');
  assert.equal(converter.status, '완료');
  assert.equal(converter.items.length, 6);
  assert.ok(converter.items.every(hasCompletionEvidence));
});

test('새 선정 기준에서 추가하지 않은 후보는 해당 근거와 함께 남는다', () => {
  const html = adminProposalsPage(config);
  for (const [id, number, status] of [
    ['smishing-checklist', 7, '거절'], ['http-status-codes', 8, '보류'], ['unicode-normalize', 9, '거절'],
    ['supermoon-viewing', 10, '보류'], ['digital-tourism-card', 11, '보류'], ['uuid-v4', 12, '보류'],
  ]) {
    const proposal = adminProposals.find((entry) => entry.id === id);
    const card = html.match(new RegExp(`id="proposal-${id}"[^]*?</article>`))?.[0];
    assert.ok(card?.includes(`${status} · <time`), id);
    assert.ok(card.includes(`href="https://github.com/everyhub/everyhub.github.io/issues/${number}"`), id);
    assert.ok(proposal.decision && card.includes(proposal.decision), id);
  }
  assert.match(html, /최근 점검: 1건 추가 \(대출 이자 계산기\)/);
});

test('주거 사례 제목과 도입문은 금액과 원 단위를 함께 줄바꿈한다', () => {
  const pages = extraPages(config);
  const brokerage = pages.find(({ path }) => path === 'housing/jeonse-brokerage-3eok/').html;
  const renewal = pages.find(({ path }) => path === 'housing/renewal-5-percent/').html;
  assert.match(brokerage, /<h1>서울 전세 3억&nbsp;원과 월세 중개보수<\/h1>/);
  assert.match(brokerage, /보증금 3,000만&nbsp;원·월세 100만&nbsp;원/);
  assert.match(renewal, /60만&nbsp;원의 갱신 5% 계산/);
});

test('홈 레거시 연봉 링크와 연결되지 않은 작업 타임라인 페이지', async () => {
  const browser = await readFile(new URL('../src/navigation-browser.mjs', import.meta.url), 'utf8');
  const admin = adminTimelinePage(config);
  assert.match(browser, /dataset\.pagePath === ''/);
  assert.match(browser, /new URL\('tools\/salary-calculator\//);
  assert.match(browser, /target\.search = location\.search/);
  assert.match(admin, /name="robots" content="noindex,nofollow"/);
  assert.match(admin, /작업 요청 타임라인/);
  assert.match(admin, /<strong>미확인<\/strong>/);
  assert.match(admin, /<strong>실패<\/strong>/);
  assert.match(admin, /class="admin-cell-label" aria-hidden="true">반영 내용<\/span>/);
  assert.match(admin, /src\/admin-log\.mjs/);
  assert.equal(navigationGroups.some(({ path }) => path === adminPath), false);
});

test('관리 페이지는 수치마다 적용 기간과 원문 근거를 표시한다', () => {
  const html = adminTimelinePage(config);
  const panel = html.match(/<section class="panel" id="official-value-evidence">(.*?)<\/section>/s)[1];
  for (const entries of Object.values(officialValueEvidence)) for (const { label, url, applies, excerpt } of entries) {
    assert.equal(new URL(url).protocol, 'https:');
    assert.ok(label.trim() && applies.trim() && excerpt.trim());
    assert.ok(panel.includes(label));
    assert.ok(panel.includes(applies));
    assert.ok(panel.includes(excerpt.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')));
    assert.ok(panel.includes(url.replaceAll('&', '&amp;')));
  }
});

test('타임라인은 진행 중인 항목 먼저, 각 그룹에서는 최신순으로 표시한다', () => {
  const items = [
    { id: 'older-done', time: '2026-11-24 22:00', status: '완료' },
    { id: 'older-active', time: '2026-11-24 20:00', status: '진행중' },
    { id: 'new-done', time: '2026-11-25 00:00', status: '완료' },
    { id: 'new-active', time: '2026-11-24 23:00', status: '진행 중' },
    { id: 'same-minute-added-later', time: '2026-11-25 00:00', status: '보류' },
  ];
  const original = [...items];
  assert.deepEqual(sortAdminTimeline(items).map(({ id }) => id),
    ['new-active', 'older-active', 'same-minute-added-later', 'new-done', 'older-done']);
  assert.deepEqual(items, original);
});

test('관리 요청과 Markdown 감사 내보내기는 같은 순서·상태·근거를 보여 준다', () => {
  const rows = sortAdminTimeline(adminTimeline);
  const html = adminTimelinePage(config);
  const markdown = renderRequirementsAudit();
  const body = html.match(/class="admin-timeline"[^]*?<tbody[^>]*>([^]*?)<\/tbody>/)[1];
  assert.deepEqual([...body.matchAll(/<tr role="row" id="([^"]+)"[^>]*>/g)].map(([, id]) => id),
    rows.map(({ id }) => id));
  assert.equal(new Set(rows.map(({ id }) => id)).size, rows.length);
  assert.equal(markdown.match(/^\| \d{4}-/gm).length, rows.length);
  for (const { id, time, request, status, links } of rows) {
    assert.match(body.split(`id="${id}"`)[1].split('</tr>')[0], new RegExp(`<strong>${status}</strong>`));
    assert.ok(markdown.includes(`| ${time} | ${request} |`));
    for (const url of links) assert.ok(markdown.includes(`(<${url}>)`));
  }
  for (const { status, items } of rows) {
    assert.ok(items.length);
    assert.equal(status === '완료', items.every(hasCompletionEvidence));
    for (const item of items) {
      assert.ok(item.evidence ?? item.reason);
      assert.ok(markdown.includes(item.requirement));
      assert.match(html, new RegExp(`data-audit-status="${item.status}"`));
    }
  }
});

test('공유 트리는 대기로 표시하고 상위 요청은 완료하지 않는다', () => {
  const parent = adminTimeline.find(({ id }) => id === 'christmas-wish-tree');
  const shared = adminTimeline.find(({ id }) => id === 'shared-wish-tree');
  assert.equal(parent.status, '부분');
  assert.equal(shared.status, '대기');
  assert.equal(shared.reason, '사용자 결정: A 먼저, B는 나중에');
  assert.deepEqual(parent.items.filter(({ status }) => status === '대기'), shared.items);
  assert.match(adminTimelinePage(config), /data-timeline-filter="대기"/);
});

test('추천 예약 등록과 추가 슬롯의 첫 실행은 별도로 추적한다', () => {
  const rows = new Map(adminTimeline.map((entry) => [entry.id, entry]));
  assert.equal(rows.get('daily-choice').status, '완료');
  assert.equal(rows.get('site-proposal-news-review').status, '완료');
  const review = rows.get('remaining-work-review');
  assert.equal(review.status, '진행중');
  assert.deepEqual(review.items.filter(({ status }) => status === '진행중').map(({ requirement }) => requirement),
    ['첫 14:13 KST 실행 확인', '첫 19:13 KST 실행 확인']);
  assert.equal(rows.get('news-cadence').status, '부분');
});

test('관리 근거는 원본 링크를 유지하면서 짧은 이름을 표시한다', () => {
  const cases = [
    ['https://github.com/everyhub/everyhub.github.io/blob/main/README.md#checklist', 'GitHub 문서'],
    ['https://github.com/everyhub/everyhub.github.io/actions/runs/45533656953', 'Actions #45533656953'],
    ['https://everyhub.github.io/tools/salary-calculator/#salary-index', '운영 근거'],
    ['https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9', 'Devin 근거'],
  ];
  for (const [url, label] of cases) assert.equal(auditEvidenceLabel(url), label);
  const [url, label] = cases[1];
  assert.ok(adminTimelinePage(config).includes(`href="${url}" title="${url}">${label}</a>`));
  assert.ok(renderRequirementsAudit().includes(`[${label}](<${url}>)`));
});

test('운영 검사의 설명·근거가 빠지거나 세부 항목이 남아 있으면 완료로 표시하지 않는다', () => {
  const entry = { id: 'test', request: '예시', status: '완료', links: [] };
  const done = { status: '완료', requirement: '확인', evidence: '운영 폼 검사', links: ['https://example.com/'] };
  assert.equal(auditRequest(entry, [done]).status, '완료');
  for (const incomplete of [[], [{ ...done, evidence: '' }], [{ ...done, links: [] }],
    [{ ...done, status: '부분', reason: '한 경계만 확인' }], [done, { ...done, status: '미확인', reason: '운영 증거 없음' }]]) {
    assert.notEqual(auditRequest(entry, incomplete).status, '완료');
  }
});

test('추천 탭은 진행 중인 작업과 선정 결과를 표시하고 이슈는 과거 기록으로만 링크한다', () => {
  const template = {
    title: '예시', what: '안내 페이지', why: { text: '공식 신청 안내', sources: [] },
    officialSources: [], scope: '안내 1페이지', risks: '신청 대행 제외',
    issueUrl: 'https://github.com/everyhub/everyhub.github.io/issues/9',
  };
  const entries = [
    { ...template, id: 'done', createdAt: '2026-11-25 02:00', status: '완료' },
    { ...template, id: 'older', createdAt: '2026-11-24 20:00', status: '제안', issueUrl: 'https://github.com/everyhub/everyhub.github.io/issues/10' },
    { ...template, id: 'active', createdAt: '2026-11-25 00:00', status: '진행중' },
    { ...template, id: 'newer', createdAt: '2026-11-24 23:00', status: '제안', issueUrl: 'https://github.com/other/repo/issues/1' },
    { ...template, id: 'deferred', createdAt: '2026-11-25 01:00', status: '보류', decision: '최근 검색 수요 미확인' },
  ];
  assert.deepEqual(sortAdminProposals(entries).map(({ id }) => id),
    ['active', 'deferred', 'newer', 'older', 'done']);
  const html = adminProposalsPage(config, entries, {
    reviewedAt: '2026-11-25 02:00', outcome: '추가 없음', reason: '충족하는 후보 없음',
  });
  assert.deepEqual([...html.matchAll(/id="proposal-([^"]+)"/g)].map(([, id]) => id),
    ['active', 'deferred', 'newer', 'older', 'done']);
  assert.match(adminTimelinePage(config), new RegExp(`href="../${adminProposalsPath}">추천</a>`));
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /추천<\/a>/);
  assert.match(html, /무엇을 추가하나요\?[^]*왜 필요하나요\?[^]*공식 자료[^]*작업 범위·예상 페이지[^]*위험·제외 조건/);
  assert.match(html, /href="https:\/\/github\.com\/everyhub\/everyhub\.github\.io\/issues\/10">이전 GitHub 기록/);
  assert.match(html, /최근 점검: 추가 없음/);
  assert.match(html, /한 번에 최대 1건/);
  assert.match(html, /최근 검색 수요 미확인/);
  assert.doesNotMatch(html, /승인 검토|승인<\/strong> 라벨/);
  assert.doesNotMatch(html, /github\.com\/other\/repo/);
  assert.match(adminProposalsPage(config, []), /등록된 제안이 없습니다/);
});

test('각 도구의 공식 출처, 캐노니컬·FAQ·계산기 구조화 데이터', () => {
  const pages = extraPages(config);
  assert.equal(pages.length, 82);
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
  assert.match(sitemap, /href="\.\.\/tools\/image-pdf\/"/);
  assert.match(sitemap, /href="\.\.\/tools\/salary-calculator\/"/);
  assert.match(sitemap, /href="\.\.\/info\/holidays\/2027\/"/);
  const median = pages.find(({ path }) => path === 'median-income/2027/4/').html;
  assert.match(median, /6,929,885원/);
  assert.match(median, /href="\.\.\/\.\.\/\.\.\/median-income\/2026\/4\/"/);
  assert.match(median, /"@type":"FAQPage"/);
});

test('정부 지원금 일정에 접수 날짜와 개별 공식 공고를 표시', () => {
  const pages = informationPages(config);
  const html = pages.find(({ path }) => path === 'info/support-calendar/').html;
  assert.match(html, /datetime="2026-12-01"[\s\S]*https:\/\/www\.nts\.go\.kr\//);
  assert.match(html, /datetime="2026-06-15"[\s\S]*datetime="2026-12-31"[\s\S]*https:\/\/www\.bokjiro\.go\.kr\//);
  assert.match(html, /접수 일정은 신청처에서 확인[\s\S]*https:\/\/www\.law\.go\.kr\/[\s\S]*https:\/\/www\.work24\.go\.kr\//);
  assert.match(pages.find(({ path }) => path === 'info/').html, /href="\.\.\/info\/support-calendar\/"/);
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
  assert.equal(pages.length, 7);
  for (const { path, html } of pages) {
    assert.ok(html.includes(`href="${config.baseURL}${path}"`));
    if (path !== wishTreeSection.path) assert.match(html, /"@type":"CollectionPage"/);
  }
  const holiday = (year) => pages.find(({ path }) => path === `info/holidays/${year}/`).html;
  for (const year of [2026, 2027]) {
    const html = holiday(year);
    assert.equal([...html.matchAll(/class="calendar-month"/g)].length, 12);
    assert.equal([...html.matchAll(/<time datetime="\d{4}-\d{2}-\d{2}">\d+<\/time>|<time datetime="\d{4}-\d{2}-\d{2}" title="/g)].length, 365);
    assert.match(html, new RegExp(`href="\\.\\.\\/\\.\\.\\/\\.\\.\\/info/holidays/${year}/" aria-current="page"`));
    assert.match(html, /href="#holiday-list"/);
  }
  assert.match(holiday(2026), /<td class="long-break substitute"><time datetime="2026-05-25"/);
  assert.match(holiday(2027), /<time datetime="2027-07-19" title="대체공휴일\(제헌절\)"/);
  const tax = pages.find(({ path }) => path === 'info/tax-calendar/').html;
  assert.match(tax, /국세청 · 2027년 세무일정/);
  assert.match(tax, /class="tax-timeline"[\s\S]*<h3>1월<\/h3>[\s\S]*<h3>5월<\/h3>[\s\S]*<h3>7월<\/h3>/);
  const yearly = pages.find(({ path }) => path === 'info/yearly-rates/').html;
  assert.match(yearly, /2,236,300원/);
  assert.match(yearly, /13\.90%/);
  assert.match(yearly, /class="rate-comparison"[\s\S]*<th scope="row">국민연금/);
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
