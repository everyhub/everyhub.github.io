import { execFileSync, spawnSync } from 'node:child_process';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices, firefox, webkit } from 'playwright';
import { adminTimeline, sortAdminTimeline } from './src/admin-log.mjs';
import activeWork from './src/admin-now.json' with { type: 'json' };
import { newsFeeds } from './src/news-config.mjs';
import { PDFDocument } from './src/utility-vendor/pdf-lib-1.17.1.mjs';
import { jpegLocation } from './src/photo-location.mjs';
import { jpegWithGPS } from './test/photo-location-fixture.mjs';

const dist = fileURLToPath(new URL('./dist', import.meta.url));
const live = process.env.AUDIT_LIVE_URL && new URL(process.env.AUDIT_LIVE_URL);
const profiles = {
  chromium: { engine: chromium },
  firefox: { engine: firefox },
  webkit: { engine: webkit },
  iphone: { engine: webkit, device: devices['iPhone 15'] },
  pixel: { engine: chromium, device: devices['Pixel 7'] },
};
const profile = process.env.AUDIT_PROFILE;
if (profile && !Object.hasOwn(profiles, profile)) throw new Error('Unknown AUDIT_PROFILE: ' + profile);
if (!live && !process.env.AUDIT_REUSE_BUILD) {
  execFileSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url))], {
    stdio: 'inherit', env: { ...process.env, GITHUB_OUTPUT: '', NEWS_SKIP_UNCHANGED: '0', ADSENSE_CLIENT_ID: '', ADSENSE_SLOT_ID: '' },
  });
}
if (!profile) {
  let failed = false;
  for (const name of Object.keys(profiles)) {
    const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], {
      stdio: 'inherit', env: {
        ...process.env, AUDIT_PROFILE: name, AUDIT_REUSE_BUILD: '1',
        AUDIT_REPORT: process.env.AUDIT_REPORT ? `${process.env.AUDIT_REPORT}.${name}.json` : '',
      },
    });
    if (result.error) throw result.error;
    if (result.status !== 0) failed = true;
  }
  process.exit(Number(failed));
}
const { engine, device } = profiles[profile];
const widths = device ? [device.viewport.width] : [390, 768, 1024, 1440];
const publicRoutes = live ? await liveInventory(live) : [];
const inventory = live ? [...publicRoutes, '/ops-7f3a9c2d/', '/ops-7f3a9c2d/recommendations/', '/assets/background-removal/']
  : (await readdir(dist, { recursive: true })).filter((path) => /(^|\/)index\.html$/.test(path))
    .map((path) => '/' + path.replace(/index\.html$/, ''));
const routes = inventory.filter((path) => !/^\/(salary|hourly|severance|median-income)\/\d+\//.test(path)).sort();
const detailTemplates = ['/salary/2000/', '/salary/4000/', '/salary/20000/', '/hourly/10320/', '/hourly/12000/', '/hourly/30000/',
  '/severance/2400/', '/severance/4000/', '/severance/15000/', '/median-income/2026/1/', '/median-income/2026/4/', '/median-income/2027/7/'];
const screenshotDir = process.env.AUDIT_SCREENSHOTS;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname;
    const file = resolve(dist, '.' + decodeURIComponent(path), ...(path.endsWith('/') ? ['index.html'] : []));
    if (!file.startsWith(dist + '/') || !['GET', 'HEAD'].includes(request.method)) throw new Error();
    const info = await stat(file);
    if (!info.isFile()) throw new Error();
    const { size } = info;
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Content-Length': size });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end(); }
});
const pdf = await PDFDocument.create();
pdf.addPage();
const pdfBytes = Buffer.from(await pdf.save());
const pdfFixture = { name: 'audit.pdf', mimeType: 'application/pdf', buffer: pdfBytes };
const invalidFile = { name: 'audit-invalid', mimeType: 'application/octet-stream', buffer: Buffer.from('Not a PDF or image') };
const issues = [];
const requests = [];
let cases = 0;
let forms = 0;
let layouts = 0;
let browser;
let route;
let width;
const issue = (message) => issues.push({ route, width, message });
const caseFailures = (failures) => failures.forEach(issue);

async function liveInventory(site) {
  const response = await fetch(new URL('/sitemap.xml', site));
  if (!response.ok) throw new Error('Live sitemap returned ' + response.status);
  const locations = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url));
  if (!locations.length || locations.some((url) => url.origin !== site.origin || url.search || url.hash)
    || new Set(locations.map(({ href }) => href)).size !== locations.length) {
    throw new Error('Invalid or duplicate URL in live sitemap');
  }
  return locations.map(({ pathname }) => pathname);
}

async function checkLinks(page, origin) {
  const pages = new Map();
  for (let i = 0; i < inventory.length; i += 12) {
    const batch = await Promise.all(inventory.slice(i, i + 12).map(async (path) => {
      try {
        if (!live) return [path, await readFile(resolve(dist, '.' + decodeURIComponent(path), 'index.html'), 'utf8')];
        const response = await fetch(new URL(path, origin), { redirect: 'error', signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return [path, await response.text()];
      } catch (error) { issues.push({ route: path, width: 'HTML', message: 'Page inventory: ' + error.message }); }
    }));
    const parsed = await page.evaluate((batch) => batch.map(([path, html]) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fragments = [...doc.querySelectorAll('[id], a[name]')].map((node) => node.id || node.name);
      if (doc.querySelector('[data-calendar-today]') && doc.querySelector('#holiday-calendar time[datetime]')) fragments.push('today');
      for (const button of doc.querySelectorAll('[data-news-filter]')) fragments.push('source-' + button.dataset.newsFilter);
      return [path, {
        fragments, canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        links: [...new Set([...doc.querySelectorAll('a[href]')].map((node) => node.getAttribute('href')))],
      }];
    }), batch.filter(Boolean));
    for (const [path, data] of parsed) pages.set(path, { ...data, fragments: new Set(data.fragments) });
  }
  const canonical = pages.get('/')?.canonical && new URL(pages.get('/').canonical);
  const checked = new Set();
  for (const [path, { links }] of pages) for (const href of links) {
    let url;
    try { url = new URL(href, origin + path); } catch {
      issues.push({ route: path, width: 'HTML', message: 'Invalid link: ' + href });
      continue;
    }
    let target = url.pathname;
    if (url.origin !== origin) {
      if (live || url.origin !== canonical?.origin || !target.startsWith(canonical.pathname)) continue;
      target = '/' + target.slice(canonical.pathname.length);
    }
    if (target.endsWith('/index.html')) target = target.slice(0, -'index.html'.length);
    if (pages.has(target + '/')) target += '/';
    let hash;
    try { hash = decodeURIComponent(url.hash.slice(1)).split(':~:text=')[0]; } catch { hash = url.hash.slice(1); }
    if (target === '/' && url.searchParams.has('salary')) { target = '/tools/salary-calculator/'; hash ||= 'calculator'; }
    const key = target + '#' + hash;
    if (checked.has(key)) continue;
    checked.add(key);
    const entry = pages.get(target);
    const found = entry ? (!hash || hash.toLowerCase() === 'top' || entry.fragments.has(hash) ||
      (!live && hash.startsWith('source-') && newsFeeds.some(({ id, section }) => '/' + section === target && hash === 'source-' + id)))
      : !hash && !target.endsWith('/') && await (live
        ? fetch(new URL(target, origin), { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(15000) }).then((res) => res.ok)
        : stat(resolve(dist, '.' + decodeURIComponent(target))).then((info) => info.isFile())).catch(() => false);
    if (!found) issues.push({ route: path, width: 'HTML', message: 'Broken internal link: ' + href });
  }
  console.log(`Internal links: ${checked.size} targets from ${pages.size} HTML pages.`);
}

async function auditViewport(origin) {
  const context = await browser.newContext({ viewport: { width, height: 850 }, ...device, serviceWorkers: 'block' });
  if (engine === chromium) await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  else await context.addInitScript(() => {
    let value = '';
    Object.defineProperty(navigator.clipboard, 'readText', { value: async () => value });
    Object.defineProperty(navigator.clipboard, 'writeText', { value: async (text) => { value = text; } });
  });
  await context.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      console.error('CSP blocked ' + event.violatedDirective);
    });
  });
  await context.route('**/*', async (requestRoute) => {
    const request = requestRoute.request();
    const url = new URL(request.url());
    if (url.origin !== origin || !['GET', 'HEAD'].includes(request.method()) || url.search) {
      issue(`Blocked request: ${request.method()} ${url.origin}${url.pathname}`);
      await requestRoute.abort();
    } else await requestRoute.continue();
  });
  await context.routeWebSocket(/.*/, (socket) => {
    issue('Blocked WebSocket: ' + new URL(socket.url()).origin);
    socket.close();
  });
  context.on('request', (request) => {
    const url = new URL(request.url());
    requests.push({ route, width, method: request.method(), url: url.origin + url.pathname, hasQuery: Boolean(url.search) });
  });
  context.on('response', (response) => {
    if (response.status() >= 400) issue(`HTTP ${response.status()}: ${new URL(response.url()).pathname}`);
  });
  const page = await context.newPage();
  if (width === widths[0]) await checkLinks(page, origin);
  await page.clock.setFixedTime(new Date('2026-05-24T15:05:00Z'));
  page.on('pageerror', (error) => issue('Page error: ' + (error.stack || error.message)));
  page.on('console', (message) => {
    if (message.type() === 'error') issue('Console: ' + message.text());
  });
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#075'; ctx.fillRect(14, 10, 36, 48);
    return canvas.toDataURL().split(',')[1];
  });
  const imageFixture = { name: 'audit.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') };
  const jpeg = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 16;
    return canvas.toDataURL('image/jpeg').split(',')[1];
  });
  const jpegFixture = { name: 'audit.jpg', mimeType: 'image/jpeg', buffer: jpegWithGPS(Buffer.from(jpeg, 'base64')) };
  const heicFixture = { name: 'audit.heic', mimeType: 'image/heic', buffer: await readFile(new URL('./test/sample.heic', import.meta.url)) };

  try {
    for (route of [...routes, ...detailTemplates]) {
      try {
        const response = await page.goto(origin + route, { waitUntil: 'load' });
        if (!response?.ok()) issue('Page did not return 200');
        const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (await overflow() > 1) issue('Page overflows horizontally');
        const layoutIssues = await page.evaluate(() => {
          const found = [];
          const standalone = location.pathname === '/assets/background-removal/';
          if (document.querySelectorAll('h1').length !== 1 || (!standalone && !document.querySelector('.site-foot a'))) found.push('Missing or duplicate heading/footer');
          const controls = document.querySelectorAll(standalone ? '#refineNum, #bgColor' :
            '.site-head :is(button, .home-link), main :is(button, .button, select, input:not([type=checkbox], [type=radio], [type=range]))');
          for (const control of controls) {
            const { width, height } = control.getBoundingClientRect();
            if (width > 0 && height > 0 && height < 43.75) found.push('Control under 44px: ' + (control.id || control.name || control.textContent.trim()));
          }
          const images = [...document.querySelectorAll('img[src]')].filter((img) => img.complete && !img.naturalWidth);
          if (images.length) found.push('Broken image: ' + images.map((img) => img.getAttribute('src')).join(', '));
          return found;
        });
        caseFailures(layoutIssues);
        const aligned = route === '/assets/background-removal/' || await page.evaluate(() => {
          const edge = (selector) => document.querySelector(selector).getBoundingClientRect();
          const frame = edge('.page-grid');
          const sidebar = document.querySelector('.sidebar');
          const main = edge('.page-grid main');
          const near = (a, b) => Math.abs(a - b) <= 1;
          return near(edge('.brand').left, frame.left)
            && near(edge('.home-link').right, main.right)
            && (sidebar.hidden ? near(main.left, frame.left) : near(edge('.sidebar').left, frame.left) && near(edge('.sidebar').top, main.top));
        });
        if (!aligned) issue('Header, sidebar and content edges do not align');
        if (route === '/') {
          const sidebar = page.locator('.sidebar');
          const toggle = page.locator('.nav-toggle');
          if (await toggle.isVisible()) await toggle.click();
          const categories = sidebar.locator('.nav-category > details');
          for (const category of await categories.all()) {
            const summary = category.locator('summary');
            await summary.press('Enter');
            if (await category.getAttribute('open') === null) issue('Navigation category failed to expand');
            const undersized = await category.locator('summary, a').evaluateAll(nodes => nodes.some(node => node.getBoundingClientRect().height < 44));
            if (undersized) issue('Navigation category has a target under 44px');
            await summary.press('Enter');
            if (await category.getAttribute('open') !== null) issue('Navigation category failed to collapse');
          }
          if (!await toggle.isVisible() && !await sidebar.evaluate(node => getComputedStyle(node).position === 'sticky' && getComputedStyle(node).overflowY === 'auto')) {
            issue('Desktop navigation is not sticky and independently scrollable');
          }
          await sidebar.getByRole('link', { name: '바로가기 검색' }).click();
          if (!await page.locator('#shortcut-search').evaluate(input => input === document.activeElement) ||
              (await toggle.isVisible() && await sidebar.isVisible())) issue('Sidebar shortcut did not focus search');
          cases++;
          const home = await page.evaluate(() => {
            const heading = document.querySelector('#shortcuts').getBoundingClientRect();
            const input = document.querySelector('[data-dashboard-search]').getBoundingClientRect();
            const card = document.querySelector('.dashboard-card-head h2 a');
            const intro = document.querySelector('.home-hero .intro');
            return {
              desktopAlignment: Math.abs(heading.top + heading.height / 2 - input.top - input.height / 2),
              mobileStack: heading.bottom < input.top,
              plainCategory: getComputedStyle(card).textDecorationLine === 'none',
              heroWrap: getComputedStyle(intro).wordBreak === 'keep-all' && intro.textContent.includes('기능을\u00a0바로'),
            };
          });
          if ((width === 1440 && home.desktopAlignment > 3) || (width < 768 && !home.mobileStack)) issue('Shortcut heading and search placement are misaligned');
          if (!home.plainCategory || !home.heroWrap) issue('Home card title or hero wrapping styles are incorrect');
        }
        if (screenshotDir) await page.screenshot({ path: join(screenshotDir, `${profile}-${width}-${route.split('/').filter(Boolean).join('_') || 'home'}.png`) });
        layouts++;
        if (detailTemplates.includes(route)) continue;
        if (route === '/') {
          const branding = await page.evaluate(() => ['.brand img', '.home-hero-art'].every((selector) => document.querySelector(selector)?.naturalWidth > 0));
          if (!branding) issue('Home branding image failed to load');
          const sameHeaderRow = await page.evaluate(() => {
            const midpoint = (selector) => {
              const { top, height } = document.querySelector(selector).getBoundingClientRect();
              return top + height / 2;
            };
            return Math.abs(midpoint('.brand') - midpoint('.home-link')) < 2;
          });
          if (!sameHeaderRow) issue('Branded header wraps the home link onto another row');
          cases++;
          const search = page.locator('[data-dashboard-search]');
          const matches = page.locator('[data-dashboard-results] li:not([hidden]) > a');
          await page.keyboard.press('/');
          if (!await search.evaluate((input) => document.activeElement === input)) issue('Shortcut search hotkey did not focus the input');
          for (const [query, first, related] of [
            ['나이', 'age', 'date-difference'],
            ['집', 'rent-conversion', 'subscription-score'],
            ['방', 'rent-conversion', 'subscription-score'],
            ['주거', 'rent-conversion', 'subscription-score'],
            ['ㅇㅂ', 'salary-calculator'],
            ['디데히', 'date-difference'],
            ['퇴사', 'severance-pay', 'unemployment-pay'],
            ['pdf', 'pdf-merge', 'pdf-split'],
          ]) {
            await search.fill(query);
            const paths = await matches.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
            if (paths[0] !== `./tools/${first}/` || (related && !paths.includes(`./tools/${related}/`))) issue('Incorrect shortcut matches for ' + query);
            if (await overflow() > 1) issue('Shortcut results overflow horizontally');
            cases++;
          }
          await search.press('ArrowDown');
          await page.keyboard.press('ArrowDown');
          if (await matches.nth(1).evaluate((link) => document.activeElement !== link)) issue('Shortcut result keyboard navigation failed');
          await page.keyboard.press('Escape');
          if (!await search.evaluate((input) => document.activeElement === input)) issue('Shortcut search Escape did not return focus');
          await search.fill('없는결과확인');
          const suggestions = page.locator('[data-dashboard-empty]');
          if (!await suggestions.isVisible()) issue('No shortcut suggestions for an unmatched query');
          await suggestions.getByRole('button', { name: '집', exact: true }).click();
          if (await search.inputValue() !== '집' || await matches.count() < 6) issue('Shortcut suggestion did not run the related search');
          await search.fill('');
          if (!await page.locator('[data-dashboard-card]').first().isVisible()) issue('Clearing search did not restore shortcut cards');
          if (await page.getByText('연봉 실수령액 계산기와 공식 계산 기준 보기', { exact: true }).count() ||
              await page.locator('main form[id="calculator"]').count()) issue('Standalone salary content remains on the home page');
          if (await page.locator('.nav-toggle').isVisible()) {
            const toggle = page.locator('.nav-toggle');
            if (device) await toggle.tap();
            else await toggle.click();
            if (await toggle.getAttribute('aria-expanded') !== 'true' || !await page.locator('.sidebar').isVisible()) issue('Mobile navigation did not open');
            await page.keyboard.press('Escape');
            if (await toggle.getAttribute('aria-expanded') !== 'false') issue('Mobile navigation did not close on Escape');
          }
          cases += 3;
        }
        if (route === '/info/support-calendar/') {
          const main = page.locator('main');
          const schedules = await main.locator('time').evaluateAll((nodes) => nodes.map((time) => time.dateTime));
          if (schedules.join() !== '2026-12-01,2026-06-15,2026-12-31,2026-08-07,2026-12-31' ||
              await main.locator('.support-schedule > li').count() !== 4 ||
              !await main.getByRole('link', { name: '국가법령정보센터 · 취업지원 신청 근거' }).isVisible() ||
              !await main.getByRole('link', { name: '국민취업지원제도 접수처' }).isVisible() ||
              !await main.getByText('접수 일정은 신청처에서 확인', { exact: true }).isVisible()) issue('Missing official support application dates or notice');
          cases++;
        }
        if (route === '/news/korea/' && !await page.getByRole('link', { name: '우아한형제들 기술블로그 원문' }).isVisible()) {
          issue('Missing Woowahan official source link');
        }
        if (route.startsWith('/info/holidays/')) {
          const calendar = await page.locator('.calendar-grid').evaluate((grid) => {
            const current = grid.querySelector('[aria-current="date"]');
            return {
              months: grid.children.length,
              columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
              today: current?.dateTime ?? null,
              substitute: grid.querySelector('.long-break.substitute time[datetime$="-05-25"]')?.dateTime ?? null,
            };
          });
          const is2026 = route.endsWith('/2026/');
          const columns = width <= 544 ? 1 : width <= 1056 ? 2 : 3;
          if (calendar.months !== 12 || calendar.columns !== columns) issue('Incorrect calendar layout');
          if (calendar.today !== (is2026 ? '2026-05-25' : null) || (is2026 && calendar.substitute !== '2026-05-25')) {
            issue('Incorrect Korean-time today or substitute holiday indicator');
          }
          if (await page.locator('.calendar-years a[aria-current="page"]').getAttribute('href') !== '../../..' + route) {
            issue('Incorrect active calendar year');
          }
          cases++;
        }
        if (route === '/ops-7f3a9c2d/') {
          const evidence = page.locator('#official-value-evidence');
          const group = evidence.locator('details').first();
          await group.locator('summary').click();
          if (!await group.getByRole('link', { name: '기관 원문' }).first().isVisible() ||
              !/2026-01-01/.test(await group.textContent()) || await overflow() > 1) {
            issue('Official value evidence is missing or overflows');
          }
          cases++;
          const activePanel = page.locator('section[aria-labelledby="admin-now-title"]');
          const titles = await activePanel.getByRole('heading', { level: 3 }).allTextContents();
          const activeTitles = [...activeWork].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(({ title }) => title);
          if (!await activePanel.locator('#admin-now-title').isVisible() || JSON.stringify(titles) !== JSON.stringify(activeTitles) ||
              (!activeWork.length && !await activePanel.getByText('현재 진행 중인 작업 없음', { exact: true }).isVisible())) {
            issue('Incorrect admin active work');
          }
          const expected = sortAdminTimeline(adminTimeline);
          const rows = page.locator('.admin-timeline tbody > tr[id]');
          const actual = await rows.evaluateAll((nodes) => nodes.map((row) => ({
            id: row.id,
            text: Array.from(row.cells).slice(0, 5).map((cell) => {
              const node = cell.cloneNode(true);
              node.querySelector('.admin-cell-label')?.remove();
              return node.textContent.trim();
            }),
            links: Array.from(row.cells[5].querySelectorAll('a'), (link) => link.href),
            items: Array.from(row.nextElementSibling.querySelectorAll('.admin-audit-items > li'), (item) => ({
              status: item.dataset.auditStatus,
              requirement: item.firstChild.nextSibling.textContent.trim().replace(/^—\s*/, ''),
              note: item.querySelector('p').textContent.trim(),
              links: Array.from(item.querySelectorAll('a'), (link) => link.href),
            })),
          })));
          const reference = expected.map(({ id, time, request, reflection, status, reason, links, items }) => ({
            id, text: [time, request, reflection, status, reason ?? '—'], links: links.map((link) => new URL(link).href),
            items: items.map(({ status, requirement, evidence, reason, links }) => ({
              status, requirement, note: evidence ?? reason, links: links.map((link) => new URL(link).href),
            })),
          }));
          if (JSON.stringify(actual) !== JSON.stringify(reference)) issue('Live audit timeline differs from exported audit data');
          const details = page.locator('[data-request-id="writing-tools"]');
          await details.locator('summary').click();
          const list = details.locator('.admin-audit-items');
          if (!await list.isVisible() || await overflow() > 1 || (width === 1440 && (await list.boundingBox()).width < 360)) {
            issue('Admin audit details are hidden, cramped or overflow');
          }
          const filters = page.getByRole('group', { name: '타임라인 상태 필터' });
          for (const status of ['진행중', '부분', '미확인', '완료', '제외', '전체']) {
            const button = filters.getByRole('button', { name: status, exact: true });
            await button.click();
            const visible = await rows.evaluateAll((nodes) => nodes.filter((row) => !row.hidden).map((row) => row.id));
            const referenceIds = expected.filter((row) => status === '전체' || row.status === status).map(({ id }) => id);
            if (JSON.stringify(visible) !== JSON.stringify(referenceIds) ||
                await rows.evaluateAll((nodes) => nodes.some((row) => row.hidden !== row.nextElementSibling.hidden ||
                  row.hidden !== (getComputedStyle(row).display === 'none') ||
                  row.hidden !== (getComputedStyle(row.nextElementSibling).display === 'none'))) ||
                await button.getAttribute('aria-pressed') !== 'true' ||
                await filters.getByRole('button', { pressed: true }).count() !== 1 ||
                await overflow() > 1) issue('Admin timeline filter mismatch: ' + status);
            cases++;
          }
          cases += 3;
        }
        if (route === '/ops-7f3a9c2d/recommendations/') {
          if (!await page.getByText('등록됨 · 첫 실행 확인', { exact: true }).isVisible()) issue('Daily Devin status missing');
          const cards = page.locator('.proposal-card');
          if (await cards.count() < 3 || !await cards.first().getByText('왜 필요하나요?', { exact: true }).isVisible()) issue('Missing proposal detail');
          cases += 2;
        }
        if (route === '/news/korea/' || route === '/news/world/') {
          const articles = page.locator('[data-news-source]');
          if (await articles.count()) {
            if (route === '/news/korea/' && await articles.first().getAttribute('data-news-source') !== 'geeknews') issue('GeekNews is not first');
            for (const source of route === '/news/korea/' ? ['geeknews', 'daangn'] : ['meta']) {
              const filter = page.locator(`[data-news-filter="${source}"]`);
              await filter.click({ timeout: 5000 });
              if (new URL(page.url()).hash !== '#source-' + source) issue('Missing shareable source tab URL: ' + source);
              await page.reload();
              const filtered = await page.locator('[data-news-source]:visible').evaluateAll((nodes) => nodes.map(({ dataset }) => dataset.newsSource));
              if (!filtered.length || !filtered.every((id) => id === source)) issue('Incorrect source filter: ' + source);
              await page.locator('[data-news-filter=""]').click();
              cases++;
            }
          }
        }
        if (route === '/tools/background-removal/') {
          const embedded = page.frameLocator('iframe');
          await embedded.locator('input[value="portrait"]').check();
          await embedded.locator('#precise').uncheck();
          await embedded.locator('#file').setInputFiles(imageFixture);
          await embedded.locator('.save:enabled').first().waitFor({ timeout: 60_000 });
          cases++;
          continue;
        }
        if (route === '/housing/move-in-checklist/') {
          const sections = page.locator('main section');
          if (!/30일 이내/.test(await sections.nth(0).textContent()) ||
              !/확정일자가 부여된/.test(await sections.nth(1).textContent()) ||
              !/14일 이내/.test(await sections.nth(2).textContent())) issue('Move-in steps are missing the official deadlines or deemed date rule');
          const links = await page.locator('main a[href^="https:"]').evaluateAll(nodes => nodes.map(node => new URL(node.href).hostname));
          if (!['www.gov.kr', 'www.iros.go.kr', 'rtms.molit.go.kr', 'www.law.go.kr'].every(host => links.includes(host))) {
            issue('Move-in checklist is missing an official link');
          }
          cases++;
        }
        const form = page.locator('main form');
        if (!await form.count()) continue;
        forms++;
        if (route === '/tools/csv-json-converter/') {
          const start = requests.length;
          const text = form.locator('[name="text"]');
          const mode = form.locator('[name="direction"]');
          const delimiter = form.locator('[name="delimiter"]');
          const output = form.locator('output');
          const submit = form.locator('[type="submit"]');
          const save = form.locator('.utility-download');
          const copy = form.locator('.convenience-copy');
          await context.setOffline(true);
          try {
            await page.evaluate(() => navigator.clipboard.writeText('이름;번호\n하나;001'));
            await form.getByRole('button', { name: '붙여 넣기' }).click();
            await page.waitForFunction(() => document.querySelector('[name="text"]').value.includes('001'));
            await delimiter.selectOption('semicolon');
            await submit.click();
            if (JSON.parse(await output.textContent())[0].번호 !== '001') issue('CSV paste did not preserve string cells');

            const fixture = '\uFEFF이름,메모\r\n하나,"첫 줄, ""인용""\r\n둘째 줄"\r\n';
            await delimiter.selectOption('comma');
            await form.locator('[name="file"]').setInputFiles({ name: 'audit.csv', mimeType: 'text/csv', buffer: Buffer.from(fixture) });
            await form.getByText('파일을 읽었습니다.', { exact: false }).waitFor();
            await submit.click();
            const json = await output.textContent();
            if (JSON.parse(json)[0].메모 !== '첫 줄, "인용"\r\n둘째 줄') issue('CSV file lost escaping or embedded CRLF');
            const downloaded = page.waitForEvent('download');
            await save.click();
            const file = await downloaded;
            if (file.suggestedFilename() !== 'converted.json' || await readFile(await file.path(), 'utf8') !== json) issue('JSON download did not match result');
            await copy.click();
            if (await page.evaluate(() => navigator.clipboard.readText()) !== json) issue('Copy did not preserve the JSON result');

            await mode.selectOption('json-to-csv');
            await delimiter.selectOption('tab');
            await text.fill('[{"명":"=1+1","번호":"007"}]');
            await submit.click();
            const tsv = "명\t번호\r\n'=1+1\t007\r\n";
            if (await output.textContent() !== tsv) issue('JSON export lost tab separator, formula protection, or final line break');
            const waiting = page.waitForEvent('download');
            await save.click();
            const exported = await waiting;
            if (exported.suggestedFilename() !== 'converted.tsv' || await readFile(await exported.path(), 'utf8') !== tsv) issue('TSV download did not match result');
            await form.locator('[name="protect"]').uncheck();
            await submit.click();
            if (!(await output.textContent()).includes('\t007\r\n') || (await output.textContent()).includes("'=1+1")) issue('Disabling protection did not preserve the original string');

            await text.fill('[{"한글":[]}]');
            await submit.click();
            await form.getByText('중첩 객체나 배열은 변환할 수 없습니다.', { exact: true }).waitFor();
            if (await save.isVisible() || !await copy.isDisabled()) issue('Invalid input left a copyable or downloadable result');
            await form.locator('[name="file"]').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from([0xff, 0xff]) });
            await form.getByText('UTF-8 파일을 읽을 수 없습니다.', { exact: false }).waitFor();
            await form.getByRole('button', { name: '입력 초기화', exact: true }).click();
            if (await text.inputValue() || await output.textContent() || await save.isVisible() || await mode.inputValue() !== 'csv-to-json') issue('Converter did not reset cleanly');
            if (requests.length !== start) issue('CSV/JSON paste, file read, conversion, copy, or download made a network request');
            cases += 9;
          } finally { await context.setOffline(false); }
          continue;
        }
        if (route === '/tools/photo-location/') {
          const start = requests.length;
          await context.setOffline(true);
          try {
            const input = form.locator('[name="file"]');
            const save = form.locator('.utility-download');
            const submit = form.locator('[type="submit"]');
            await input.setInputFiles(jpegFixture);
            await submit.click();
            await save.waitFor();
            if (!/위도 -37\.500000, 경도 127\.250000/.test(await form.locator('output').textContent())) issue('GPS coordinates not read');
            const downloaded = page.waitForEvent('download');
            await save.click();
            const file = await downloaded;
            const bytes = await readFile(await file.path());
            if (jpegLocation(Uint8Array.from(bytes).buffer) !== null || bytes.includes(Buffer.from('Exif'))) issue('Downloaded JPEG retains original EXIF');
            if (!await page.evaluate(async (base64) => {
              const image = new Image();
              image.src = 'data:image/jpeg;base64,' + base64;
              await image.decode();
              return image.naturalWidth === 16 && image.naturalHeight === 32;
            }, bytes.toString('base64'))) issue('EXIF orientation was not applied to the downloaded JPEG');
            await input.setInputFiles(invalidFile);
            await submit.click();
            await page.getByText('JPG 사진을 선택하세요.', { exact: true }).waitFor();
            if (await save.isVisible()) issue('Invalid JPEG produced a download');
            if (requests.length !== start) issue('Photo inspection, removal or download made a network request');
            cases += 4;
          } finally { await context.setOffline(false); }
          continue;
        }
        const fixture = route.includes('/pdf-') ? pdfFixture : imageFixture;
        const file = form.locator('input[type="file"]');
        const hasFile = await file.count();
        if (hasFile) await file.setInputFiles(await file.getAttribute('multiple') !== null ? [fixture, fixture] : fixture);
        const report = await form.evaluate((form) => {
          const failures = [];
          let cases = 0;
          const output = form.querySelector('output') ?? form.parentElement.querySelector('.tool-result, .net');
          const result = () => (output?.value ?? output?.textContent ?? '').trim();
          const badNumber = /(?:\b(?:NaN|Infinity)\b|∞)/;
          const fields = [...form.elements];
          const data = { first: '첫 줄', second: '다른 줄', pages: '1', people: '가\n나', choices: '당첨\n꽝',
            text: form.dataset.utility === 'json-formatter' ? '{"audit":1}' : '테스트 한 줄\n두 번째 줄' };
          if (fields.some((field) => field.name === 'preset')) {
            form.elements.preset.value = 'custom';
            form.elements.preset.dispatchEvent(new Event('input', { bubbles: true }));
          }
          for (const field of fields) {
            if (field.type === 'date' && !field.value) field.value = '2000-01-01';
            if ((field.type === 'textarea' || field.type === 'text') && !field.value) field.value = data[field.name] ?? '테스트';
            if (field.name === 'target' && field.type === 'number') field.value = '500';
          }
          if (!form.checkValidity()) failures.push('Valid fixture rejected');
          else if (!form.querySelector('.utility-download')) {
            form.requestSubmit();
            cases++;
            if (!result() || badNumber.test(result())) failures.push('Missing or nonfinite result for valid fixture');
          }
          const fuzz = (field, values) => {
            const original = field.value;
            for (const [value, mustReject] of values) {
              field.value = value;
              field.dispatchEvent(new Event('input', { bubbles: true }));
              const accepted = form.checkValidity();
              cases++;
              if (mustReject && accepted) failures.push(`${field.name || field.id} accepts invalid value ${JSON.stringify(value)}`);
              if (mustReject && field.type === 'date' && !/날짜를 입력해 주세요/.test(field.validationMessage)) {
                failures.push(`${field.name} missing friendly date validation`);
              }
              if (accepted && !form.querySelector('.utility-download')) {
                form.requestSubmit();
                if (badNumber.test(result())) failures.push(`${field.name || field.id} displays NaN/Infinity for ${value}`);
              }
            }
            field.value = original;
            field.dispatchEvent(new Event('input', { bubbles: true }));
          };
          for (const field of fields) {
            if (field.matches(':disabled')) continue;
            if (field.type === 'number') {
              fuzz(field, [['', field.required], ['abc', field.required], ['-1', Number(field.min) >= 0],
                ['0', Number(field.min) > 0], ['1e308', !!field.max], ...[field.min, field.max].filter(Boolean).map((value) => [value, false])]);
            } else if (field.type === 'date') {
              if (!field.min || !field.max) failures.push('Date field missing min/max');
              fuzz(field, [['', field.required], ['2026-02-29', true], ['123456-01-01', true], ['1899-12-31', true],
                ['2101-01-01', true], [field.min, false], [field.max, false]]);
            }
          }
          return { failures, cases };
        });
        caseFailures(report.failures);
        cases += report.cases;
        const download = form.locator('.utility-download');
        if (await download.count()) {
          const submit = () => form.locator('[type="submit"]').first().click();
          if (hasFile) {
            await file.setInputFiles(await file.getAttribute('multiple') !== null ? [invalidFile, invalidFile] : invalidFile);
            await submit();
            await form.locator('.utility-error:not(:empty)').waitFor({ timeout: 5000 });
            if (await download.isVisible()) issue('Invalid file produced a download');
            await file.setInputFiles(await file.getAttribute('multiple') !== null ? [fixture, fixture] : fixture);
            if (route === '/tools/passport-photo/') await form.locator('canvas').waitFor();
            cases++;
          }
          await submit();
          await download.waitFor({ timeout: 10000 });
          cases++;
          if (route === '/tools/image-resize/') {
            await file.setInputFiles(heicFixture);
            await submit();
            await download.waitFor({ timeout: 10000 });
            if (await download.getAttribute('download') !== 'image-12x8.jpg' ||
                !(await download.evaluate(async (link) => {
                  const image = new Image();
                  image.src = link.href;
                  await image.decode();
                  return image.naturalWidth === 12 && image.naturalHeight === 8;
                }))) {
              issue('HEIC did not produce a 12×8 JPEG');
            }
            cases++;
          }
          if (route === '/tools/passport-photo/') {
            await form.locator('[name="format"]').selectOption('custom');
            await form.locator('[name="width"]').fill('320');
            await form.locator('[name="height"]').fill('400');
            await submit();
            await download.waitFor({ timeout: 10000 });
            if (await download.getAttribute('download') !== 'id-photo-320x400.jpg') issue('Wrong custom ID photo output');
            cases++;
          }
        }
        if (route === '/tools/lunar-calendar/') {
          await form.locator('[name="solar"]').fill('2028-06-23');
          await form.locator('[type="submit"]').click();
          if (!/2028년 윤5월 1일/.test(await form.locator('output').textContent())) issue('Wrong solar to leap lunar result');
          await form.locator('[name="mode"]').selectOption('lunar');
          await form.locator('[name="leap"]').check();
          await form.locator('[type="submit"]').click();
          if (!/2028-06-23/.test(await form.locator('output').textContent())) issue('Wrong leap lunar to solar result');
          cases += 2;
        }
        if (route === '/tools/json-formatter/') {
          const text = form.locator('[name="text"]');
          const submit = form.locator('[type="submit"]');
          const copy = page.locator('.convenience-copy');
          const reset = form.getByRole('button', { name: '입력 초기화', exact: true });
          const output = form.locator('output');
          await text.fill('{invalid}');
          await submit.click();
          if (!/올바른 JSON을 입력하세요/.test(await form.locator('.utility-error').textContent()) ||
              await output.textContent() || !await copy.isDisabled()) issue('Invalid JSON must show guidance without a copyable result');
          await reset.click();
          await page.waitForFunction(() => document.querySelector('.convenience-copy').disabled);
          if (await text.inputValue() || await output.textContent()) issue('Reset did not clear input and output');
          await text.fill('{"copy":1}');
          await submit.click();
          await copy.click();
          if (await page.evaluate(() => navigator.clipboard.readText()) !== (await output.textContent()).trim()) issue('Copy did not write the actual result');
          await page.goto(origin + '/');
          const recent = page.locator('[data-recent-tools] li > a').first();
          if (await recent.getAttribute('href') !== route) issue('Recently used tool did not appear first');
          cases += 4;
        }
        if (route === '/tools/salary-calculator/') {
          const children = form.locator('#children');
          const summary = page.locator('.net');
          const copy = page.locator('.convenience-copy');
          await children.fill('1');
          await children.press('Enter');
          if (!/부양가족 수보다 많을 수 없습니다/.test(await form.locator('#calc-error').textContent()) ||
              await summary.isVisible() || await page.locator('#calculation-table').isVisible() ||
              !await copy.isDisabled()) issue('Invalid family inputs must not display or copy old amounts');
          await children.fill('0');
          await children.press('Enter');
          if (await form.locator('#calc-error').textContent() || !await summary.isVisible() ||
              await copy.isDisabled()) issue('Valid Enter submission did not restore salary results');
          cases += 2;
        }
        if (route === '/tools/character-count/') {
          await form.locator('[name="preset"]').selectOption('bluesky');
          await form.locator('[name="text"]').fill('가'.repeat(301));
          if (!/1자 초과[\s\S]*2,097바이트 남음/.test(await form.locator('output').textContent())) issue('Wrong Bluesky character and byte limits');
          await form.locator('[name="preset"]').selectOption('x');
          await form.locator('[name="text"]').fill('가 👨‍👩‍👧‍👦 https://example.com/very/long/path');
          if (!/X 가중 글자 수 29자\n목표 280자 · 251자 남음/.test(await form.locator('output').textContent())) issue('Wrong X weighted character limit');
          cases += 2;
        }
        if (route === '/tools/ladder-draw/') {
          const result = await form.locator('output').textContent();
          if (!await form.locator('svg').isVisible() || await form.locator('svg line').count() < 2 ||
              !/^1\. 가 → .*\n2\. 나 → /m.test(result)) issue('Missing ladder diagram or participant results');
          cases++;
        }
        const preferences = {
          '/tools/character-count/': { preset: 'x' },
          '/tools/unit-converter/': { pair: 'in-cm' },
          '/tools/area-converter/': { unit: 'pyeong' },
          '/tools/password-generator/': { length: '24', symbols: false },
        }[route];
        if (preferences) {
          for (const [name, value] of Object.entries(preferences)) {
            const field = form.locator(`[name="${name}"]`);
            if (typeof value === 'boolean') await field.setChecked(value);
            else if (await field.evaluate(node => node.tagName === 'SELECT')) await field.selectOption(value);
            else { await field.fill(value); await field.press('Tab'); }
          }
          await page.reload();
          for (const [name, value] of Object.entries(preferences)) {
            const field = form.locator(`[name="${name}"]`);
            const actual = typeof value === 'boolean' ? await field.isChecked() : await field.inputValue();
            if (actual !== value) issue('Non-sensitive preference did not restore: ' + name);
          }
          await form.getByRole('button', { name: '입력 초기화', exact: true }).click();
          const stored = await page.evaluate(() => localStorage.getItem(`everyhub:preferences:${location.pathname}:${document.querySelector('main form').dataset.utility}`));
          if (stored !== null) issue('Reset did not clear saved preference');
          cases++;
        }
        if (await overflow() > 1) issue('Page overflows horizontally after input');
      } catch (error) {
        if (page.isClosed() || /(?:Target|Page) crashed/.test(error.message)) {
          throw new Error(`${profile} at ${width}px ${route}: ${error.message}`, { cause: error });
        }
        issue(error.message);
      }
    }
  } finally { await context.close(); }
}

try {
  if (!live) await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  const origin = live ? live.origin : 'http://127.0.0.1:' + server.address().port;
  browser = await engine.launch({ executablePath: engine === chromium ? process.env.AUDIT_CHROMIUM_PATH : undefined });
  for (width of widths) await auditViewport(origin);
} finally {
  await browser?.close();
  if (server.listening) await new Promise((done) => server.close(done));
  if (process.env.AUDIT_REPORT) await writeFile(process.env.AUDIT_REPORT, JSON.stringify({ requests, issues }, null, 2) + '\n');
}

console.log(`Browser audit [${profile}]: ${layouts} layouts at ${widths.join('/')}px; ${routes.length} pages × ${widths.length} functional viewports, ${forms} form runs, ${cases} cases, ${requests.length} HTTP requests, ${issues.length} issues.`);
for (const entry of issues) console.error(`${entry.width}px ${entry.route}: ${entry.message}`);
process.exitCode = Number(issues.length > 0);
