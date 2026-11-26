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
import { ladderPath, playItems } from './src/play-config.mjs';
import { fortuneCategories } from './src/prompt-fortune.mjs';
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
const detailTemplates = ['/salary/2000/', '/salary/4000/', '/salary/20000/', '/hourly/10000/', '/hourly/10320/', '/hourly/12000/', '/hourly/30000/',
  '/severance/2400/', '/severance/4000/', '/severance/15000/', '/median-income/2026/1/', '/median-income/2026/4/', '/median-income/2026/7/',
  '/median-income/2027/1/', '/median-income/2027/7/'];
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
  const removed = /^\/(?:about|privacy|contact|report-error)(?:\/|$)/;
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
        hasRemovedCopy: /사이트\s*소개|개인정보\s*처리\s*방침|개인정보 및 광고|오류\s*제보|(?:^|\s)문의(?:\s|$)/.test(doc.body.textContent),
        links: [...new Set([...doc.querySelectorAll('a[href]')].map((node) => node.getAttribute('href')))],
      }];
    }), batch.filter(Boolean));
    for (const [path, data] of parsed) pages.set(path, { ...data, fragments: new Set(data.fragments) });
  }
  const canonical = pages.get('/')?.canonical && new URL(pages.get('/').canonical);
  for (const [path, { hasRemovedCopy }] of pages) if (removed.test(path) || hasRemovedCopy) {
    issues.push({ route: path, width: 'HTML', message: 'Includes removed contact, report, privacy or about content' });
  }
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
    if (removed.test(target)) {
      issues.push({ route: path, width: 'HTML', message: 'Links to removed page: ' + href });
      continue;
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

async function auditPlayTool(page, context) {
  const start = requests.length;
  const tool = page.locator('[data-play]');
  const result = tool.locator('[data-play-result]');
  const error = tool.locator('[data-play-error]');
  const submit = () => tool.locator('button[type="submit"]').click();
  await context.setOffline(true);
  try {
    if (route === '/play/new-year-countdown/') {
      const digits = tool.locator('[data-play-time]');
      const date = '2026-12-31T15:00:00Z';
      if (!(await digits.allTextContents()).some((digit) => Number(digit) > 0)) issue('Countdown does not show remaining time');
      await page.clock.setFixedTime(new Date(date));
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      if ((await digits.allTextContents()).some((value) => value !== '00') || !/새해가 밝았습니다/.test(await result.textContent()) ||
          !await tool.locator('.play-fireworks i').first().isVisible()) issue('KST countdown did not celebrate at midnight');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      if (await tool.locator('.play-fireworks i').first().isVisible()) issue('Countdown firework ignores reduced motion');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      if (await tool.locator('.play-fireworks i').first().evaluate((node) => getComputedStyle(node).animationPlayState) !== 'paused') issue('Countdown did not pause while hidden');
      await page.evaluate(() => {
        delete document.hidden;
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.clock.setFixedTime(new Date('2026-05-24T15:05:00Z'));
      cases += 4;
    } else if (route === '/play/resolution-card/' || route === '/play/year-in-review/') {
      const field = tool.locator('textarea').first();
      const example = '기억하고 싶은 우리 가족 여행 🐏';
      await field.fill(example);
      await submit();
      const save = tool.getByRole('button', { name: 'PNG 저장' });
      if (!await save.isVisible() || !await tool.locator('canvas').isVisible()) issue('PNG preview missing');
      const [download] = await Promise.all([page.waitForEvent('download', { timeout: 7000 }), save.click()]);
      const bytes = await readFile(await download.path());
      if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.length < 5000) issue('Downloaded card is not a rendered PNG');
      await tool.getByRole('button', { name: '지우기' }).click();
      if (await save.isVisible() || await field.inputValue() || await result.textContent()) issue('Card reset failed');
      cases += 3;
    } else if (route === '/play/prompt-fortune-cookie/') {
      const draw = tool.locator('[data-fortune-draw]');
      const slip = tool.locator('[data-fortune-slip]');
      const topic = tool.locator('[data-fortune-topic]');
      const prompt = tool.locator('[data-fortune-prompt]');
      const category = tool.locator('[data-fortune-category]');
      const copy = tool.locator('[data-fortune-copy]');
      const copyStatus = tool.locator('[data-fortune-copy-status]');
      if (await slip.isVisible()) issue('Fortune cookie result appears before opening');
      await draw.press('Enter');
      await slip.waitFor({ state: 'visible' });
      const first = await prompt.textContent();
      const firstTopic = await topic.textContent();
      if (!Object.values(fortuneCategories).some(({ label, prompts }) => prompts.includes(first) && label === firstTopic) ||
          await draw.locator('.fortune-half').first().evaluate((node) => getComputedStyle(node).animationName) !== 'fortune-crack') {
        issue('Fortune cookie did not animate and reveal a prompt');
      }
      await draw.press('Space');
      await slip.waitFor({ state: 'visible' });
      if (await prompt.textContent() === first) issue('Fortune cookie repeated the previous prompt');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      try {
        await category.selectOption('creative');
        if (await slip.isVisible()) issue('Fortune cookie kept the old result after a category change');
        await draw.click();
        await slip.waitFor({ state: 'visible' });
        const text = await prompt.textContent();
        if (await topic.textContent() !== fortuneCategories.creative.label || !fortuneCategories.creative.prompts.includes(text) ||
            await draw.locator('.fortune-half').first().evaluate((node) => getComputedStyle(node).animationName) !== 'none') {
          issue('Fortune cookie did not honor the selected category or reduced motion');
        }
        if (engine === chromium) {
          await copy.click();
          await copyStatus.waitFor({ state: 'visible' });
          if (await page.evaluate(() => navigator.clipboard.readText()) !== text) issue('Fortune cookie did not copy the displayed prompt');
        }
        const links = await tool.locator('.fortune-links a').evaluateAll(nodes => nodes.map(node => [node.href, node.target, node.rel]));
        if (JSON.stringify(links) !== JSON.stringify(['https://chatgpt.com/', 'https://gemini.google.com/', 'https://claude.ai/']
          .map(url => [url, '_blank', 'noopener noreferrer']))) issue('Fortune cookie AI links do not open clean service URLs in separate tabs');
      } finally {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
      cases += engine === chromium ? 6 : 5;
    } else if (route === '/play/zodiac-age/') {
      const birth = tool.locator('[name="birthday"]');
      const year = tool.locator('[name="year"]');
      await year.fill('2027');
      await year.press('Enter');
      if (!/정미년\(양띠\)/.test(await result.textContent())) issue('Year-mode zodiac missing 2027');
      await year.fill('');
      await birth.fill('2026-02-16');
      await submit();
      if (!/만 0세.*을사년\(뱀띠\)/.test(await result.textContent())) issue('Before-Seollal age or zodiac incorrect');
      await birth.fill('2026-02-17');
      await submit();
      if (!/만 0세.*병오년\(말띠\)/.test(await result.textContent())) issue('Seollal boundary incorrect');
      await birth.fill('2000-02-05');
      await submit();
      if (!/만 26세.*경진년\(용띠\)/.test(await result.textContent())) issue('Browser lunar calendar result incorrect');
      await birth.fill('2028-02-17');
      await submit();
      if (!/빠를 수 없습니다/.test(await error.textContent()) || await result.textContent()) issue('Future birthday did not clear prior result');
      cases += 5;
    } else {
      const count = tool.locator('[data-entry-count]');
      const entries = tool.locator('[data-entry-group]').first().locator('[data-entry-input]:enabled');
      await submit();
      if (!/1 칸을 채워/.test(await error.textContent())) issue('Blank entry field was not rejected');
      await entries.nth(0).fill('하늘');
      await entries.nth(0).press('Enter');
      if (!await entries.nth(1).evaluate((node) => node === document.activeElement)) issue('Enter did not focus the next entry');
      await entries.nth(1).fill('하늘');
      await submit();
      if (!/겹치는/.test(await error.textContent())) issue('Duplicate entries were not rejected');
      await count.selectOption('3');
      await entries.nth(1).fill('나무');
      await entries.nth(2).fill('바다');
      await count.selectOption('2');
      if (await entries.count() !== 2) issue('Entry count did not shrink');
      await count.selectOption('3');
      if (await entries.count() !== 3 || await entries.nth(2).inputValue() !== '바다') issue('Entry count did not grow or preserve input');
      if (route === '/' + ladderPath) {
        const choices = tool.locator('[data-entry-group="choices"] [data-entry-input]:enabled');
        for (const [index, label] of ['당첨', '꽝', '꽝'].entries()) await choices.nth(index).fill(label);
      }
      await submit();
      cases += 4;
      if (route === '/play/secret-santa/') {
        const secret = tool.locator('[data-play-secret]');
        const used = new Set();
        for (const name of ['하늘', '나무', '바다']) {
          if (await secret.textContent() || !(await tool.locator('[data-play-person]').textContent()).includes(name)) issue('Pair shown before reveal or wrong turn');
          await tool.getByRole('button', { name: '내 짝 보기' }).click();
          const value = (await secret.textContent()).replace('내 짝: ', '');
          if (!['하늘', '나무', '바다'].includes(value) || value === name || used.has(value)) issue('Invalid secret pairing');
          used.add(value);
          await tool.locator('[data-play-next]').click();
          cases++;
        }
        if (await secret.textContent() || await tool.locator('[data-play-pair]').isVisible()) issue('Secret draw did not clear after last person');
      } else if (route === '/play/roulette/') {
        await page.waitForFunction(() => /뽑힌 항목: (하늘|나무|바다)/.test(document.querySelector('[data-play-result]').textContent), null, { timeout: 4500 });
        if (await tool.locator('.play-legend li').count() !== 3 || await tool.locator('.play-legend .play-winner').count() !== 1) issue('Roulette choices or winner styling are missing');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await submit();
        if (!/뽑힌 항목:/.test(await result.textContent()) ||
            await tool.locator('.play-wheel').evaluate((node) => node.getAnimations().length)) issue('Roulette ignores reduced motion');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        cases += 2;
      } else if (route === '/' + ladderPath) {
        const diagram = tool.locator('[data-play-ladder] svg');
        const buttons = tool.locator('.play-ladder-matches button');
        const trace = diagram.locator('polyline');
        const before = await trace.getAttribute('points');
        if (!await diagram.isVisible() || await diagram.locator('line').count() < 3 ||
            await buttons.count() !== 3 || !/^1\. 하늘→ [1-3]\. /.test(await buttons.first().textContent())) issue('Missing ladder diagram or participant results');
        await buttons.nth(1).click();
        if (await buttons.nth(1).getAttribute('aria-pressed') !== 'true' || await trace.getAttribute('points') === before) issue('Ladder trace did not follow the participant selection');
        cases += 2;
      } else {
        const teams = tool.locator('[data-play-teams] ul');
        if (await teams.count() !== 2 || await teams.nth(0).locator('li').count() !== 2 || await teams.nth(1).locator('li').count() !== 1 ||
            (await teams.locator('li').allTextContents()).sort().join() !== ['하늘', '나무', '바다'].sort().join()) issue('Teams are not balanced or members changed');
        cases++;
      }
      const copy = tool.locator('[data-play-copy]');
      if (await copy.count()) {
        if (!await copy.isVisible()) issue('Result copy button missing');
        if (engine === chromium) {
          await copy.click();
          await tool.locator('[data-play-copy-status]').waitFor({ state: 'visible' });
          const copied = await page.evaluate(() => navigator.clipboard.readText());
          const expected = route === '/play/roulette/' ? await result.textContent() : '하늘';
          if (!copied.includes(expected)) issue('Game copy is missing the displayed result');
          cases++;
        }
      }
      await tool.getByRole('button', { name: '지우기' }).click();
      if (await count.inputValue() !== '2' || await entries.count() !== 2 || await result.textContent() ||
          (await copy.count() && await copy.isVisible())) issue('Entry reset did not restore the default count and clear results');
      await count.selectOption('3');
      if (await tool.locator('[data-entry-input]').evaluateAll((inputs) => inputs.some((input) => input.value))) issue('Entry reset did not clear saved fields');
      cases++;
    }
  } finally {
    await context.setOffline(false);
    if (requests.length !== start) issue('Play interaction made a network request');
  }
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
    const versionedAsset = /^\/assets\/[^?]+\.(?:css|m?js|json|svg|png|jpe?g|webp|gif|avif|ico|webmanifest)$/i.test(url.pathname) &&
      /^\?v=[a-f0-9]{16}$/.test(url.search);
    if (url.origin !== origin || !['GET', 'HEAD'].includes(request.method()) || (url.search && !versionedAsset)) {
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
            '.site-head :is(button, .home-link, .play-head-link), main :is(button, .button, select, input:not([type=checkbox], [type=radio], [type=range]))');
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
          for (const query of ['트리', '크리스마스', '소원']) {
            await search.fill(query);
            if (await matches.first().getAttribute('href') !== './info/christmas-wish-tree/') issue('Wish tree shortcut missing for ' + query);
            cases++;
          }
          for (const query of ['포츈쿠키', '프롬프트']) {
            await search.fill(query);
            if (await matches.first().getAttribute('href') !== './play/prompt-fortune-cookie/') issue('Fortune cookie shortcut missing for ' + query);
            cases++;
          }
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
          const brokenLinks = await page.locator('.admin-evidence-links a:visible').evaluateAll((links) => links.some((link) => {
            const range = document.createRange();
            range.selectNodeContents(link);
            return range.getClientRects().length !== 1 || link.textContent.includes('/');
          }));
          if (brokenLinks) issue('Admin evidence is not displayed as short, single-line labels');
          const filters = page.getByRole('group', { name: '타임라인 상태 필터' });
          for (const status of ['진행중', '대기', '부분', '미확인', '완료', '제외', '전체']) {
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
          if (!await page.getByText(/한 번에 최대 1건/).isVisible() ||
              !await page.getByRole('heading', { name: /^최근 점검:/ }).isVisible()) issue('Automatic feature selection criteria or review outcome missing');
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
        if (route.startsWith('/play/') || route === '/' + ladderPath) {
          if (await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content').then((policy) => !policy?.includes("connect-src 'none'"))) {
            issue('Play page does not block connections');
          }
          cases++;
          if (route === '/play/') {
            for (const { path } of playItems) if (await page.locator(`main a[href="../${path}"]`).count() !== 1) issue('Play hub link missing: ' + path);
          } else {
            await auditPlayTool(page, context);
            if (await overflow() > 1) issue('Play page overflows after interaction');
          }
          continue;
        }
        const form = page.locator('main form');
        if (!await form.count()) continue;
        forms++;
        if (route === '/info/christmas-wish-tree/') {
          const input = form.getByLabel('소원', { exact: true });
          const count = page.locator('[data-wish-count]');
          const wishes = page.locator('[data-wish-list] li');
          const canvas = page.locator('.wish-canvas');
          const motion = page.getByRole('button', { name: '움직임 멈추기' });
          const start = requests.length;
          const frame = () => canvas.evaluate(node => node.toDataURL());
          await context.setOffline(true);
          try {
            if (await count.textContent() !== '0' || !await page.getByText(/예시 소원 40개/).isVisible() ||
                await form.getByRole('button', { name: /초기화/ }).count() !== 1) issue('Wish tree starts without its personal counter, sample disclosure, or single reset');
            await motion.waitFor({ state: 'visible' });
            const initial = await frame();
            await page.waitForFunction(previous => document.querySelector('.wish-canvas').toDataURL() !== previous, initial);
            await input.press('Enter');
            await form.getByText('소원을 입력해 주세요.', { exact: true }).waitFor();
            await input.fill('가'.repeat(31));
            await input.press('Enter');
            await form.getByText('소원은 30자 이내로 적어 주세요.', { exact: true }).waitFor();
            const text = '<b>행복</b> 🎄';
            await input.fill('  ' + text + '  ');
            await input.press('Enter');
            if (await count.textContent() !== '1' || await wishes.first().textContent() !== text ||
                await wishes.locator('b').count() || await input.inputValue()) issue('Wish submission did not trim, escape, or update the accessible list');
            const moving = await frame();
            await page.waitForFunction(previous => document.querySelector('.wish-canvas').toDataURL() !== previous, moving);
            await motion.click();
            const still = await frame();
            await page.waitForTimeout(150);
            if (await frame() !== still) issue('Wish tree kept moving after pause');
            await page.getByRole('button', { name: '움직임 켜기' }).click();
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await motion.waitFor({ state: 'hidden' });
            const reduced = await frame();
            await page.waitForTimeout(150);
            if (await frame() !== reduced) issue('Wish tree ignored reduced-motion preference');
            if (requests.length !== start) issue('Wish submission or animation controls made a network request');
            cases += 6;
          } finally {
            await context.setOffline(false);
            await page.emulateMedia({ reducedMotion: null });
          }
          await page.reload();
          if (await wishes.count() !== 1 || await count.textContent() !== '1') issue('Wish did not persist on reload');
          const resetStart = requests.length;
          await form.getByRole('button', { name: '초기화', exact: true }).click();
          if (await count.textContent() !== '0' || await wishes.count() ||
              !await page.getByText(/예시 소원 40개/).isVisible() || requests.length !== resetStart) issue('Wish reset did not preserve samples or made a request');
          await page.reload();
          if (await count.textContent() !== '0') issue('Wish reset did not persist on reload');
          await page.emulateMedia({ reducedMotion: 'reduce' });
          try {
            await page.reload();
            await input.waitFor();
            await canvas.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const initial = await frame();
            await page.waitForTimeout(150);
            if (await page.locator('[data-wish-motion]').isVisible() || await frame() !== initial) issue('Wish tree did not start still with reduced motion');
            const trunkAlpha = await canvas.evaluate(node => node.getContext('2d')
              .getImageData(Math.floor(node.width / 2), Math.floor(node.height * .91), 1, 1).data[3]);
            if (trunkAlpha !== 255) issue('Wish tree backdrop was not painted at its measured size');
          } finally {
            await page.emulateMedia({ reducedMotion: null });
          }
          cases += 6;
          continue;
        }
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
