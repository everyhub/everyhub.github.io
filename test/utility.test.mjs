import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ageAt, convertArea, countText, difference, fitImage } from '../src/utility.mjs';
import { utilityPages } from '../src/utility-pages.mjs';

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
  assert.equal(pages.length, 7);
  for (const { path, html } of pages) {
    assert.ok(html.includes(`rel="canonical" href="https://example.com/subpath/${path}"`));
    assert.match(html, /connect-src 'self'/);
    assert.doesNotMatch(html, /googlesyndication|Google AdSense/);
    if (path !== 'tools/') {
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
