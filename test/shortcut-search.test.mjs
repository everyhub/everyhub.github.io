import assert from 'node:assert/strict';
import test from 'node:test';
import { homeShortcuts } from '../src/pages.mjs';
import { indexShortcuts, searchShortcuts } from '../src/shortcut-search.mjs';

const catalog = homeShortcuts();
const index = indexShortcuts(catalog);
const paths = (query) => searchShortcuts(index, query).map(({ entry }) => entry.path);

test('일상 표현으로 관련 계산기와 도구를 찾는다', () => {
  assert.deepEqual(paths('나이').slice(0, 3), ['tools/age/', 'tools/date-difference/', 'tools/date-time/']);
  for (const query of ['집', '방', '주거']) {
    for (const tool of ['rent-conversion', 'subscription-score', 'home-acquisition-tax', 'brokerage-fee', 'public-rent-conversion', 'jeonse-loan-interest']) {
      assert.ok(paths(query).includes(`tools/${tool}/`), `${query} → ${tool}`);
    }
  }
  assert.equal(paths('집 세금')[0], 'tools/home-acquisition-tax/');
  assert.deepEqual(paths('퇴사').slice(0, 2), ['tools/severance-pay/', 'tools/unemployment-pay/']);
  assert.equal(paths('월급')[0], 'tools/salary-calculator/');
  assert.equal(paths('글자')[0], 'tools/character-count/');
});

test('제목 일치, 초성, 영문 대소문자와 한 글자 오타를 처리한다', () => {
  assert.equal(paths('만나이계산기')[0], 'tools/age/');
  assert.equal(paths('ㅇㅂ')[0], 'tools/salary-calculator/');
  assert.equal(paths('ᄋᄇ')[0], 'tools/salary-calculator/');
  assert.ok(paths('pdf').includes('tools/pdf-merge/'));
  assert.ok(paths('ＰＤＦ').includes('tools/pdf-split/'));
  assert.ok(paths('pdf 합치기').includes('tools/pdf-merge/'));
  assert.ok(paths('디데히').includes('tools/date-difference/'));
  assert.ok(paths('jxon').includes('tools/json-formatter/'));
  assert.deepEqual(paths('없는결과확인'), []);
  assert.deepEqual(paths(' | '), []);
  assert.equal(new Set(catalog.map(({ path }) => path)).size, catalog.length);
});

test('제목 전체 일치가 동의어보다, 동의어가 제목 부분 일치보다 앞선다', () => {
  const entries = [
    { title: '알바 계산기', keywords: [] },
    { title: '최저임금', keywords: ['알바'] },
    { title: '알바', keywords: [] },
  ];
  assert.deepEqual(searchShortcuts(indexShortcuts(entries), '알바').map(({ entry }) => entry.title),
    ['알바', '최저임금', '알바 계산기']);
});
