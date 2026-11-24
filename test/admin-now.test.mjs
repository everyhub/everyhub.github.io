import assert from 'node:assert/strict';
import test from 'node:test';
import { updateActiveWork } from '../admin-now.mjs';
import { adminTimelinePage } from '../src/admin-pages.mjs';

test('active work preserves its start time, updates the step, and removes only the completed work', () => {
  const start = new Date('2026-11-24T17:02:00Z');
  const update = new Date('2026-11-24T17:12:00Z');
  const work = updateActiveWork([], 'start', '작업 A', '조사', start);
  const twoItems = updateActiveWork(work, 'start', '작업 B', '작성', start);
  assert.throws(() => updateActiveWork(twoItems, 'start', '작업 A', '조사'), /이미 진행 중/);
  assert.throws(() => updateActiveWork(twoItems, 'step', '작업 C', '조사'), /찾지 못했습니다/);
  assert.throws(() => updateActiveWork(twoItems, 'step', '작업 A', ' '), /Usage/);
  const updated = updateActiveWork(twoItems, 'step', '작업 A', '검증', update);
  assert.deepEqual(updated[1], { title: '작업 A', step: '검증', startedAt: start.toISOString(), updatedAt: update.toISOString() });
  assert.deepEqual(updateActiveWork(updated, 'done', '작업 A'), [twoItems[0]]);
});

test('admin active work renders KST, escapes text, and handles an empty list', () => {
  const config = { baseURL: 'https://example.com/' };
  const items = [{ title: '<작업>', step: '<검증>', startedAt: '2026-11-24T17:02:00Z', updatedAt: '2026-11-24T17:12:00Z' }];
  const html = adminTimelinePage(config, items);
  assert.match(html, /&lt;작업&gt;/);
  assert.match(html, /현재 단계: &lt;검증&gt;/);
  assert.match(html, /2026-11-25 02:02 KST/);
  assert.match(html, /2026-11-25 02:12 KST/);
  assert.doesNotMatch(html, /현재 진행 중인 작업 없음/);
  assert.match(adminTimelinePage(config, []), /현재 진행 중인 작업 없음/);
});
