import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ageAt, characterLimit, convertArea, countText, difference, fitImage } from '../src/utility.mjs';
import { lunarToSolar, solarToLunar } from '../src/lunar-calendar.mjs';
import { utilityPages } from '../src/utility-pages.mjs';
import { utilityGroups, utilitySections } from '../src/utility-config.mjs';
import { bmi, carTax, cleanText, colorCode, compareLines, convertUnit, depositInterest, drawNames, encodeText, formatJSON, ladderDraw, loanInterest, percentage, randomPassword, secureIndex, splitBill, workdays, worldTime } from '../src/utility-extra.mjs';
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
  assert.equal(difference('1900-01-01', '1900-01-02'), 1);
  assert.equal(difference('2100-12-30', '2100-12-31'), 1);
  for (const date of ['', '123456-01-01', '1899-12-31', '2101-01-01']) {
    assert.throws(() => ageAt(date, '2026-03-01'), /네 자리 연도/);
    assert.throws(() => worldTime(date, '12:00'), /네 자리 연도/);
  }
});

test('면적 환산과 이미지 크기 조절', () => {
  assert.equal(convertArea(121, 'pyeong'), 400);
  assert.equal(convertArea(400, 'm2'), 121);
  assert.throws(() => convertArea(-1, 'm2'));
  assert.throws(() => convertArea(1e308, 'pyeong'), /면적/);
  assert.deepEqual(fitImage(480, 640, 320), { width: 240, height: 320 });
  assert.deepEqual(fitImage(10, 20, 100), { width: 10, height: 20 });
  assert.deepEqual(fitImage(10_000, 1, 100), { width: 100, height: 1 });
});

test('공개 도구는 광고 없이 렌더링하고 편집기와 Worker를 같은 출처로 제한한다', async () => {
  const pages = utilityPages({ baseURL: 'https://example.com/subpath/', adsenseClient: 'ca-pub-1' });
  assert.equal(pages.length, 36);
  const hubs = new Set(['tools/', ...utilityGroups.map(({ path }) => path)]);
  for (const { path, html } of pages) {
    assert.ok(html.includes(`rel="canonical" href="https://example.com/subpath/${path}"`));
    const noConnection = ['tools/photo-location/', 'tools/csv-json-converter/', 'tools/deposit-interest/', 'tools/loan-interest/', 'tools/car-tax/'].includes(path);
    assert.ok(html.includes(noConnection ? "connect-src 'none'" : "connect-src 'self'"), path);
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
  assert.match(app, /new Worker\(new URL\('worker\.js', assetBase\)\)/);
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
      assert.match(sidebar, /class="sidebar-footer"><a href="\.\.\/\.\.\/#shortcut-search">바로가기 검색<\/a>/);
      assert.match(sidebar, /<a href="\.\.\/\.\.\/sitemap\/">전체 사이트맵<\/a>/);
    }
  }
  const char = pages.get('tools/character-count/');
  assert.match(char, /<option>500<\/option><option>1000<\/option><option>1500<\/option>/);
  assert.match(char, /Bluesky · 300자 \/ 3,000바이트/);
  assert.match(char, /X 일반 게시글 · 가중 280자/);
});

test('글자 수 목표는 자소서 예시, 사용자 지정 및 SNS 바이트 제한을 구분한다', () => {
  assert.deepEqual(characterLimit('500'), { characters: 500 });
  assert.deepEqual(characterLimit('custom', 42), { characters: 42 });
  assert.deepEqual(characterLimit('bluesky'), { characters: 300, bytes: 3000 });
  assert.deepEqual(characterLimit('x', undefined, '가 👨‍👩‍👧‍👦 https://example.com/very/long/path'), { characters: 280, weighted: 29 });
  assert.deepEqual(characterLimit('custom', -1), {});
});

test('공식 음양력 범위, 윤달과 29일 월의 경계를 올바르게 변환한다', () => {
  assert.deepEqual(solarToLunar('2026-02-17'), { year: 2026, month: 1, day: 1, leap: false });
  assert.deepEqual(solarToLunar('2028-06-23'), { year: 2028, month: 5, day: 1, leap: true });
  assert.equal(lunarToSolar(2028, 5, 29, true), '2028-07-21');
  assert.equal(lunarToSolar(2028, 12, 29), '2029-02-12');
  assert.throws(() => lunarToSolar(2028, 5, 30, true), /없는 날짜/);
  assert.throws(() => lunarToSolar(2027, 5, 1, true), /윤달이 없습니다/);
  assert.throws(() => solarToLunar('2029-02-13'), /자료 범위/);
});

test('사다리 연결이 실제 무작위 배정과 같고 참가자와 결과 수를 검증한다', () => {
  assert.deepEqual(ladderDraw('가\n나', '당첨\n꽝', () => 0), {
    rungs: [0],
    matches: [{ index: 0, end: 1, player: '가', result: '꽝' }, { index: 1, end: 0, player: '나', result: '당첨' }],
  });
  assert.deepEqual(ladderDraw('가\n나', '당첨\n당첨', () => 1).rungs, []);
  assert.throws(() => ladderDraw('가\n가', '당첨\n꽝'), /서로 다른 참가자/);
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
  assert.throws(() => worldTime('1988-07-01', '12:00'), /1989년 이후/);
  assert.match(worldTime('1989-01-01', '12:00')[0][1], /12:00/);
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

test('예금·적금 이자 계산기는 단리·월복리와 법정 과세 기준을 정확히 반영한다', () => {
  assert.deepEqual(
    depositInterest({ product: 'deposit', amount: 10_000_000, months: 12, rate: 3.5, compounding: 'simple', taxType: 'normal' }),
    { principal: 10_000_000, grossInterest: 350_000, incomeTax: 49_000, localTax: 4_900, ruralTax: 0, tax: 53_900, taxRate: 15.4, netInterest: 296_100, totalPayout: 10_296_100 },
  );
  assert.deepEqual(
    depositInterest({ product: 'savings', amount: 500_000, months: 12, rate: 3.5, compounding: 'simple', taxType: 'normal' }),
    { principal: 6_000_000, grossInterest: 113_750, incomeTax: 15_920, localTax: 1_590, ruralTax: 0, tax: 17_510, taxRate: 15.4, netInterest: 96_240, totalPayout: 6_096_240 },
  );
  assert.deepEqual(
    depositInterest({ product: 'deposit', amount: 10_000_000, months: 12, rate: 3.5, compounding: 'monthly', taxType: 'normal' }),
    { principal: 10_000_000, grossInterest: 355_669, incomeTax: 49_790, localTax: 4_970, ruralTax: 0, tax: 54_760, taxRate: 15.4, netInterest: 300_909, totalPayout: 10_300_909 },
  );
  assert.deepEqual(
    depositInterest({ product: 'savings', amount: 500_000, months: 12, rate: 0, compounding: 'monthly', taxType: 'tax-free' }),
    { principal: 6_000_000, grossInterest: 0, incomeTax: 0, localTax: 0, ruralTax: 0, tax: 0, taxRate: 0, netInterest: 0, totalPayout: 6_000_000 },
  );
  assert.deepEqual(
    depositInterest({ product: 'deposit', amount: 10_000_000, months: 12, rate: 4, compounding: 'simple', taxType: 'coop-14' }),
    { principal: 10_000_000, grossInterest: 400_000, incomeTax: 0, localTax: 0, ruralTax: 5_600, tax: 5_600, taxRate: 1.4, netInterest: 394_400, totalPayout: 10_394_400 },
  );
  assert.deepEqual(
    depositInterest({ product: 'deposit', amount: 10_000_000, months: 12, rate: 4, compounding: 'simple', taxType: 'coop-5' }),
    { principal: 10_000_000, grossInterest: 400_000, incomeTax: 20_000, localTax: 0, ruralTax: 0, tax: 20_000, taxRate: 5, netInterest: 380_000, totalPayout: 10_380_000 },
  );
  assert.throws(() => depositInterest({ product: 'deposit', amount: 0, months: 12, rate: 3.5, compounding: 'simple', taxType: 'normal' }), /정수로/);
  assert.throws(() => depositInterest({ product: 'deposit', amount: 1_000_000, months: 601, rate: 3.5, compounding: 'simple', taxType: 'normal' }), /600개월/);
  assert.throws(() => depositInterest({ product: 'deposit', amount: 1_000_000, months: 12, rate: 101, compounding: 'simple', taxType: 'normal' }), /100%/);
});

test('대출 이자 계산기는 원리금균등·원금균등·만기일시상환과 거치 기간을 정확히 계산한다', () => {
  const ep = loanInterest({ principal: 100_000_000, months: 120, rate: 4.5, method: 'equal-payment' });
  assert.equal(ep.firstPayment, 1_036_384);
  assert.equal(ep.totalInterest, 24_366_093);
  assert.equal(ep.totalPayment, 124_366_093);
  const eq = loanInterest({ principal: 100_000_000, months: 120, rate: 4.5, method: 'equal-principal' });
  assert.equal(eq.firstPayment, 1_208_333);
  assert.equal(eq.lastPayment, 836_498);
  assert.equal(eq.totalInterest, 22_687_500);
  const bl = loanInterest({ principal: 100_000_000, months: 120, rate: 4.5, method: 'bullet' });
  assert.equal(bl.monthlyInterest, 375_000);
  assert.equal(bl.lastPayment, 100_375_000);
  assert.equal(bl.totalInterest, 45_000_000);
  assert.ok(eq.totalInterest < ep.totalInterest && ep.totalInterest < bl.totalInterest);
  const graced = loanInterest({ principal: 12_000_000, months: 12, rate: 6, method: 'equal-principal', graceMonths: 2 });
  assert.equal(graced.graceMonthlyInterest, 60_000);
  assert.equal(graced.totalInterest, 450_000);
  const zero = loanInterest({ principal: 12_000_000, months: 12, rate: 0, method: 'equal-payment' });
  assert.equal(zero.firstPayment, 1_000_000);
  assert.equal(zero.totalInterest, 0);
  assert.throws(() => loanInterest({ principal: 0, months: 12, rate: 4.5, method: 'equal-payment' }), /정수로/);
  assert.throws(() => loanInterest({ principal: 10_000_000, months: 601, rate: 4.5, method: 'equal-payment' }), /600개월/);
  assert.throws(() => loanInterest({ principal: 10_000_000, months: 12, rate: 101, method: 'equal-payment' }), /100%/);
  assert.throws(() => loanInterest({ principal: 10_000_000, months: 12, rate: 4.5, method: 'equal-payment', graceMonths: 12 }), /거치 기간/);
  assert.throws(() => loanInterest({ principal: 10_000_000, months: 12, rate: 4.5, method: 'bullet', graceMonths: 1 }), /만기일시상환/);
});

test('자동차세 계산기는 배기량·전기차·차령 경감·지방교육세·연납 공제를 정확히 계산한다', () => {
  const new2000 = carTax({ vehicleType: 'engine', usage: 'private', displacement: 2000, regYear: 2026, regHalf: 'first', taxYear: 2026, prepayment: 'jan' });
  assert.equal(new2000.unitRate, 200);
  assert.equal(new2000.annualBase, 400_000);
  assert.equal(new2000.annualEdu, 120_000);
  assert.equal(new2000.annualTotal, 520_000);
  assert.equal(new2000.firstReductionPercent, 0);
  assert.equal(new2000.selectedPrepayment.base, 381_690);
  assert.equal(new2000.selectedPrepayment.edu, 114_500);
  assert.equal(new2000.selectedPrepayment.due, 496_190);
  assert.equal(new2000.selectedPrepayment.savings, 23_810);

  const splitAge = carTax({ vehicleType: 'engine', usage: 'private', displacement: 1600, regYear: 2024, regHalf: 'second', taxYear: 2026, prepayment: 'sep' });
  assert.equal(splitAge.unitRate, 140);
  assert.equal(splitAge.firstAge, 2);
  assert.equal(splitAge.secondAge, 3);
  assert.equal(splitAge.firstReductionPercent, 0);
  assert.equal(splitAge.secondReductionPercent, 5);
  assert.equal(splitAge.firstHalfBase, 112_000);
  assert.equal(splitAge.secondHalfBase, 106_400);
  assert.equal(splitAge.prepayments.sep.base, 103_740);

  const oldCar = carTax({ vehicleType: 'engine', usage: 'private', displacement: 1000, regYear: 2010, regHalf: 'first', taxYear: 2026, prepayment: 'none' });
  assert.equal(oldCar.unitRate, 80);
  assert.equal(oldCar.firstReductionPercent, 50);
  assert.equal(oldCar.annualBase, 40_000);
  assert.equal(oldCar.annualEdu, 12_000);
  assert.equal(oldCar.smallTaxLumpSum, true);

  const ev = carTax({ vehicleType: 'electric', usage: 'private', regYear: 2020, regHalf: 'first', taxYear: 2026, prepayment: 'jan' });
  assert.equal(ev.annualBase, 100_000);
  assert.equal(ev.annualEdu, 30_000);
  assert.equal(ev.annualTotal, 130_000);
  assert.equal(ev.firstReductionPercent, 0);
  assert.equal(ev.selectedPrepayment.due, 124_040);
  assert.equal(ev.smallTaxLumpSum, true);

  const taxi = carTax({ vehicleType: 'engine', usage: 'commercial', displacement: 2000, regYear: 2020, regHalf: 'first', taxYear: 2026, prepayment: 'none' });
  assert.equal(taxi.unitRate, 19);
  assert.equal(taxi.annualBase, 38_000);
  assert.equal(taxi.annualEdu, 0);
  assert.equal(taxi.annualTotal, 38_000);
  assert.equal(taxi.firstReductionPercent, 0);

  assert.throws(() => carTax({ vehicleType: 'engine', usage: 'private', displacement: 0, regYear: 2025, regHalf: 'first', taxYear: 2026 }), /배기량/);
  assert.throws(() => carTax({ vehicleType: 'engine', usage: 'private', displacement: 2000, regYear: 2027, regHalf: 'first', taxYear: 2026 }), /최초 등록 연도/);
  assert.throws(() => carTax({ vehicleType: 'engine', usage: 'private', displacement: 2000, regYear: 2025, regHalf: 'first', taxYear: 2028 }), /과세 연도/);
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
