import { execFileSync } from 'node:child_process';
import { readdir, stat, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PDFDocument } from './src/utility-vendor/pdf-lib-1.17.1.mjs';

const dist = fileURLToPath(new URL('./dist', import.meta.url));
execFileSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url))], {
  stdio: 'inherit', env: { ...process.env, GITHUB_OUTPUT: '', NEWS_SKIP_UNCHANGED: '0', ADSENSE_CLIENT_ID: '', ADSENSE_SLOT_ID: '' },
});
const routes = (await readdir(dist, { recursive: true }))
  .filter((path) => /(^|\/)index\.html$/.test(path) && !/^(salary|hourly|severance|median-income)\/\d+\//.test(path))
  .map((path) => '/' + path.replace(/index\.html$/, ''))
  .sort();
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
let browser;
let route;
let width;
const issue = (message) => issues.push({ route, width, message });
const caseFailures = (failures) => failures.forEach(issue);

try {
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  const origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({ executablePath: process.env.AUDIT_CHROMIUM_PATH });
  const context = await browser.newContext({ serviceWorkers: 'block' });
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
  await page.clock.setFixedTime(new Date('2026-05-24T15:05:00Z'));
  page.on('pageerror', (error) => issue(error.message));
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

  for (width of [390, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    for (route of routes) {
      try {
        const response = await page.goto(origin + route, { waitUntil: 'load' });
        if (!response?.ok()) issue('Page did not return 200');
        const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (await overflow() > 1) issue('Page overflows horizontally');
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
            ['ㅇㅂ', 'salary-calculator'],
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
          cases += 3;
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
          if (calendar.months !== 12 || calendar.columns !== (width === 390 ? 1 : 3)) issue('Incorrect calendar layout');
          if (calendar.today !== (is2026 ? '2026-05-25' : null) || (is2026 && calendar.substitute !== '2026-05-25')) {
            issue('Incorrect Korean-time today or substitute holiday indicator');
          }
          if (await page.locator('.calendar-years a[aria-current="page"]').getAttribute('href') !== '../../..' + route) {
            issue('Incorrect active calendar year');
          }
          cases++;
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
        const form = page.locator('main form');
        if (!await form.count()) continue;
        forms++;
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
          const data = { first: '첫 줄', second: '다른 줄', pages: '1', text: form.dataset.utility === 'json-formatter' ? '{"audit":1}' : '테스트 한 줄\n두 번째 줄' };
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
              if (mustReject && field.type === 'date' && !/네 자리 연도/.test(field.validationMessage)) {
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
            if (field.disabled) continue;
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
            await page.waitForFunction(() => {
              const value = document.querySelector('.utility-result').value.trim();
              return value && value !== '처리 중입니다.';
            }, null, { timeout: 5000 });
            if (await download.isVisible()) issue('Invalid file produced a download');
            await file.setInputFiles(await file.getAttribute('multiple') !== null ? [fixture, fixture] : fixture);
            if (route === '/tools/passport-photo/') await form.locator('canvas').waitFor();
            cases++;
          }
          await submit();
          await download.waitFor({ timeout: 10000 });
          cases++;
        }
        if (await overflow() > 1) issue('Page overflows horizontally after input');
      } catch (error) {
        issue(error.message);
      }
    }
  }
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
  if (process.env.AUDIT_REPORT) await writeFile(process.env.AUDIT_REPORT, JSON.stringify({ requests, issues }, null, 2) + '\n');
}

console.log(`Browser audit: ${routes.length} pages × 2 viewports, ${forms} form runs, ${cases} cases, ${requests.length} HTTP requests, ${issues.length} issues.`);
for (const entry of issues) console.error(`${entry.width}px ${entry.route}: ${entry.message}`);
process.exitCode = Number(issues.length > 0);
