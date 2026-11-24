import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ageAt, convertArea, countText, difference, fitImage } from '../src/utility.mjs';
import { utilityPages } from '../src/utility-pages.mjs';
import { utilityGroups, utilitySections } from '../src/utility-config.mjs';
import { bmi, cleanText, colorCode, compareLines, convertUnit, drawNames, encodeText, formatJSON, percentage, randomPassword, secureIndex, splitBill, workdays, worldTime } from '../src/utility-extra.mjs';
import { cropWindow, drawQR, makePDF, pdfPageSelection } from '../src/utility-files.mjs';
import { PDFDocument } from '../src/utility-vendor/pdf-lib-1.17.1.mjs';

test('글자 단위, 공백 제외 및 UTF-8 바이트를 구분한다', () => {
  const value = '한 👨‍👩‍👧\ne\u0301';
  assert.deepEqual(countText(value), { total: 5, noSpace: 3, bytes: 26 });
  assert.deepEqual(countText(''), { total: 0, noSpace: 0, bytes: 0 });
});

test('만 나이는 생일 및 윤일을 달력 기준으로 계산한다', () => {
  assert.equal(ageAt('2000-08-10', '2026-08-09'), 25);
  assert.equal(ageAt('2000-08-10', '2026-08-10'), 26);
  assert.equal(ageAt('2000-02-29', '2026-02-28'), 25);
  assert.equal(ageAt('2000-02-29', '2026-03-01'), 26);
  assert.equal(ageAt('2026-01-01', '2026-01-01'), 0);
  assert.throws(() => ageAt('2027-01-01', '2026-01-01'), /빠를 수 없습니다/);
});

test('날짜 차이는 윤일과 역방향을 반영하며 존재하지 않는 날짜를 막는다', () => {
  assert.equal(difference('2024-02-28', '2024-03-01'), 2);
  assert.equal(difference('2026-03-09', '2026-03-07'), -2);
  assert.equal(difference('2026-03-09', '2026-03-09'), 0);
  assert.throws(() => difference('2026-02-29', '2026-03-01'), /존재하지 않는/);
});

test('면적 환산과 이미지 크기 조절', () => {
  assert.equal(convertArea(121, 'pyeong'), 400);
  assert.equal(convertArea(400, 'm2'), 121);
  assert.throws(() => convertArea(-1, 'm2'));
  assert.deepEqual(fitImage(480, 640, 320), { width: 240, height: 320 });
  assert.deepEqual(fitImage(10, 20, 100), { width: 10, height: 20 });
  assert.deepEqual(fitImage(10_000, 1, 100), { width: 100, height: 1 });
});

test('공개 도구는 광고 없이 렌더링하고 편집기와 Worker를 같은 출처로 제한한다', async () => {
  const pages = utilityPages({ baseURL: 'https://example.com/subpath/', adsenseClient: 'ca-pub-1' });
  assert.equal(pages.length, 30);
  const hubs = new Set(['tools/', ...utilityGroups.map(({ path }) => path)]);
  for (const { path, html } of pages) {
    assert.ok(html.includes(`rel="canonical" href="https://example.com/subpath/${path}"`));
    assert.match(html, /connect-src 'self'/);
    assert.doesNotMatch(html, /googlesyndication|Google AdSense/);
    if (!hubs.has(path)) {
      assert.match(html, /"applicationCategory":"UtilitiesApplication"/);
      assert.match(html, /"@type":"FAQPage"/);
    }
  }
  const entry = new URL('../src/background-removal/', import.meta.url);
  const [editor, app, worker] = await Promise.all(['index.html', 'app.js', 'worker.js'].map((path) => readFile(new URL(path, entry), 'utf8')));
  assert.match(editor, /connect-src 'self'/);
  assert.match(editor, /name="robots" content="noindex"/);
  assert.match(app, /new Blob\(/);
  assert.doesNotMatch(app, /serviceWorker|localStorage|sessionStorage|indexedDB|fetch\(/);
  assert.match(worker, /new URL\(MODELS\[name\].url, assetBase\)/);
});

test('tool groups keep the sidebar compact and link to all utility URLs', () => {
  const pages = new Map(utilityPages({ baseURL: 'https://example.com/' }).map(({ path, html }) => [path, html]));
  for (const { path, name } of utilityGroups) {
    assert.ok(pages.get('tools/').includes(`href="../${path}"`));
    for (const tool of utilitySections.filter(({ group }) => group === name)) {
      assert.ok(pages.get(path).includes(`href="../../${tool.path}"`));
      const sidebar = pages.get(tool.path).match(/<nav class="sidebar"[\s\S]+?<\/nav>/)[0];
      assert.match(sidebar, /<details open><summary>[\s\S]*?<span>도구<\/span>/);
      assert.ok(sidebar.includes(`href="../../${path}"`));
      assert.ok(!sidebar.includes(`href="../../${tool.path}"`));
      assert.match(sidebar, /class="nav-icon"/);
      assert.match(sidebar, /class="sidebar-footer"><a href="\.\.\/\.\.\/sitemap\/">전체 사이트맵<\/a>/);
    }
  }
  const char = pages.get('tools/character-count/');
  assert.match(char, /<option>500<\/option><option>1000<\/option><option>1500<\/option>/);
});

test('text cleanup and comparison respect order, Unicode, and line boundaries', () => {
  assert.equal(cleanText('  A  한\r\n\r\na 한\n  b', { spaces: true, unique: true, blank: true, casing: 'lower' }), 'a 한\nb');
  assert.deepEqual(compareLines('가\r\n나', '가\n다\n라'), [[2, '나', '다'], [3, undefined, '라']]);
});

test('workdays count both ends; time zone conversion observes summer time', () => {
  assert.deepEqual(workdays('2027-05-01', '2027-05-05'), { work: 1, weekends: 2, holidays: 2, length: 5 });
  assert.equal(workdays('2026-01-01', '2026-12-31').work, 245);
  assert.throws(() => workdays('2025-12-31', '2026-01-01'), /2026/);
  const city = (date) => worldTime(date, '12:00').find(([name]) => name === '런던')[1];
  assert.match(city('2026-01-01'), /03:00/);
  assert.match(city('2026-07-01'), /04:00/);
});

test('everyday calculators handle exact thresholds and remainders', () => {
  assert.equal(bmi(200, 100).category, '1단계 비만');
  assert.equal(bmi(200, 92).category, '비만 전단계');
  assert.deepEqual(convertUnit(2.54, 'cm-in'), { unit: '인치', value: 1 });
  assert.equal(convertUnit(-40, 'c-f').value, -40);
  assert.equal(percentage(100, 25, 'discount'), 75);
  assert.equal(percentage(100, 75, 'change'), -25);
  assert.equal(percentage(100, 75, 'part'), 75);
  assert.deepEqual(splitBill(100, 3), { base: 33, extra: 1 });
  assert.deepEqual(drawNames('가\n가\n나\n다', 2, () => 0), ['가', '나']);
  assert.throws(() => drawNames('가\n가', 2));
});

test('developer tools round-trip UTF-8 and reject invalid input', () => {
  const text = '\uFEFF한😀';
  for (const kind of ['base64', 'url']) assert.equal(encodeText(encodeText(text, kind + '-encode'), kind + '-decode'), text);
  assert.throws(() => encodeText('/w==', 'base64-decode'));
  assert.equal(formatJSON(' { "x" :1 } ', false), '{"x":1}');
  assert.equal(formatJSON('{"x":1}', true), '{\n  "x": 1\n}');
  assert.throws(() => formatJSON('{', true));
  assert.deepEqual(colorCode('#abc'), { rgb: [170, 187, 204], hex: '#AABBCC' });
  assert.equal(colorCode('rgb(255, 0, 128)').hex, '#FF0080');
  assert.throws(() => colorCode('rgb(256, 0, 0)'));
  const rng = [4294967295, 7];
  assert.equal(secureIndex(10, { getRandomValues(slot) { slot[0] = rng.shift(); } }), 7);
  assert.equal(randomPassword(8, true, (size) => size - 1), '========');
});

test('local PDF assets merge, reorder extracted pages and place PNGs on A4', async () => {
  const first = await PDFDocument.create();
  first.addPage([100, 200]);
  first.addPage([200, 100]);
  const other = await PDFDocument.create();
  other.addPage([300, 400]);
  const pdfs = [new Blob([await first.save()]), new Blob([await other.save()])];
  const merged = await makePDF('pdf-merge', pdfs);
  const replaced = await makePDF('pdf-split', [merged.blob], '3, 1–2, 1');
  const doc = await PDFDocument.load(await replaced.blob.arrayBuffer());
  assert.deepEqual(doc.getPages().map((page) => page.getWidth()), [300, 100, 200]);
  assert.throws(() => pdfPageSelection('4, 2', 3));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jH0cAAAAASUVORK5CYII=', 'base64');
  assert.equal((await makePDF('images-to-pdf', [new Blob([png])])).pages, 1);
});

test('passport crop covers the required aspect ratio and QR draws modules locally', async () => {
  const crop = cropWindow(1000, 1000, 2, 0.5, 1);
  assert.ok(Math.abs(crop.w / crop.h - 413 / 531) < 1e-12);
  assert.equal(crop.y + crop.h, 1000);
  const rects = [];
  const canvas = { getContext: () => ({ fillRect: (...args) => rects.push(args) }) };
  await drawQR(canvas, '한글 😀 https://example.com');
  assert.equal(canvas.height, canvas.width);
  assert.deepEqual(rects[0], [0, 0, canvas.width, canvas.height]);
  assert.ok(rects.length > 100);
});
