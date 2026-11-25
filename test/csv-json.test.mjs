import assert from 'node:assert/strict';
import test from 'node:test';
import { csvToJson, jsonToCsv, maxTableBytes } from '../src/csv-json.mjs';
import { utilityPages } from '../src/utility-pages.mjs';

test('CSV의 BOM, CRLF, 여러 줄 셀, 큰따옴표, 빈 값과 앞자리 0을 처리한다', () => {
  const input = '\uFEFF이름,번호,메모,마지막\r\n한글,001,"쉼표, ""큰따옴표""\r\n다음 줄",\r\n';
  assert.deepEqual(JSON.parse(csvToJson(input, 'comma')), [
    { 이름: '한글', 번호: '001', 메모: '쉼표, "큰따옴표"\r\n다음 줄', 마지막: '' },
  ]);
  assert.deepEqual(JSON.parse(csvToJson('a;b\n"x;y";\nx;last', 'semicolon')), [{ a: 'x;y', b: '' }, { a: 'x', b: 'last' }]);
  assert.deepEqual(JSON.parse(csvToJson('a\tb\r1\t2', 'tab')), [{ a: '1', b: '2' }]);
  assert.equal(csvToJson('a,b\n', 'comma'), '[]');
  assert.deepEqual(JSON.parse(csvToJson('__proto__,constructor\na,b', 'comma')), JSON.parse('[{"__proto__":"a","constructor":"b"}]'));
});

test('CSV의 빈 또는 중복 헤더, 서로 다른 열 개수, 잘못된 따옴표를 거부한다', () => {
  for (const [csv, error] of [
    ['\uFEFF \n', /입력하거나/], ['a, \nx,y', /빈 열 이름/], ['a,a\nx,y', /중복/],
    ['a,b\nx', /2번째 레코드의 열 개수/], ['a,b\n"x","y', /2번째 레코드의 큰따옴표/],
    ['a,b\n"x"y,z', /2번째 레코드의 큰따옴표/], ['a,b\nx"y,z', /2번째 레코드의 큰따옴표/],
  ]) assert.throws(() => csvToJson(csv, 'comma'), error);
  assert.throws(() => csvToJson('a\nb', 'unknown'), /구분자/);
});

test('JSON의 열 순서와 스칼라 값, CSV 수식 보호 및 정확한 줄 끝을 확인한다', () => {
  const valid = JSON.stringify([
    { 이름: '가;나', 메모: ' \t=1', 값: -4, 여부: true },
    { 값: null, 이름: '"예시"', 메모: '첫째\n둘째', 여부: false },
  ]);
  assert.equal(jsonToCsv(valid, 'semicolon'), `이름;메모;값;여부\r\n"가;나";' \t=1;-4;true\r\n"""예시""";"첫째\n둘째";;false\r\n`);
  assert.equal(jsonToCsv('[{"=열":"@텍스트","코드":"+001"}]', 'tab'), "'=열\t코드\r\n'@텍스트\t'+001\r\n");
  assert.equal(jsonToCsv('[{"=열":"@텍스트"}]', 'comma', false), '=열\r\n@텍스트\r\n');
  assert.equal(jsonToCsv('[{"a":null}]', 'comma'), 'a\r\n\r\n');
});

test('키가 다른 행, 중첩 값, 과도한 숫자나 데이터 크기를 거부한다', () => {
  for (const [json, error] of [
    ['{invalid}', /올바른 JSON/], ['[]', /하나 이상/], ['[null]', /객체/], ['[{"a":1},{"b":2}]', /2번째 객체의 키/],
    ['[{"a":[]}]', /중첩/], ['[{"a":9007199254740993}]', /큰 정수/], ['[{"a":1e400}]', /안전하게/],
  ]) assert.throws(() => jsonToCsv(json, 'comma'), error);
  assert.throws(() => csvToJson('가'.repeat(Math.ceil(maxTableBytes / 3)), 'comma'), /2MB/);
  assert.throws(() => csvToJson('a\n' + 'a\n'.repeat(20_001), 'comma'), /20,000행/);
  assert.throws(() => csvToJson(Array.from({ length: 201 }, (_, i) => i).join(','), 'comma'), /200개/);
  assert.throws(() => csvToJson('a'.repeat(2000) + '\n' + 'a\n'.repeat(4100), 'comma'), /8MB/);
});

test('개발 도구 허브에서 변환기를 열고 동일 출처에서 입력 도구를 로드한다', () => {
  const pages = utilityPages({ baseURL: 'https://example.com/' });
  const html = pages.find(({ path }) => path === 'tools/csv-json-converter/').html;
  assert.match(pages.find(({ path }) => path === 'tools/developer/').html, /href="[^"]*tools\/csv-json-converter\//);
  assert.match(html, /csv-json-browser\.mjs/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /name="file" type="file"/);
  assert.match(html, /name="delimiter"/);
});
