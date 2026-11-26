import assert from 'node:assert/strict';
import test from 'node:test';
import { helixPoint, parseWishes, sampleWishes, savedWishLimit, validateWish, wishLevel, wishLimit } from '../src/wish-tree.mjs';

test('소원은 공백을 정리하고 이모지를 포함한 30글자까지 받는다', () => {
  assert.deepEqual(validateWish('  모두 행복하기 🎄  '), { text: '모두 행복하기 🎄' });
  assert.deepEqual(validateWish(' \t '), { error: '소원을 입력해 주세요.' });
  const emoji = '👩‍👩‍👦'.repeat(wishLimit);
  assert.deepEqual(validateWish(emoji), { text: emoji });
  assert.deepEqual(validateWish(emoji + '가'), { error: '소원은 30자 이내로 적어 주세요.' });
});

test('저장된 소원은 순서를 지키고 잘못된 값과 오래된 소원을 복구하지 않는다', () => {
  assert.deepEqual(parseWishes('not json'), []);
  assert.deepEqual(parseWishes('{"text":"하나"}'), []);
  assert.deepEqual(parseWishes(JSON.stringify([' ', ' 첫째 ', null, '🎄', '가'.repeat(31)])), ['첫째', '🎄']);
  const input = Array.from({ length: savedWishLimit + 1 }, (_, i) => `소원 ${i}`);
  assert.deepEqual(parseWishes(JSON.stringify(input)), input.slice(1));
});

test('예시 소원 40개는 모두 유효하며 회전하는 나선은 위쪽으로 좁아진다', () => {
  assert.equal(sampleWishes.length, 40);
  assert.ok(sampleWishes.every(text => validateWish(text).text === text));
  const bottom = helixPoint(0, 0);
  const middle = helixPoint(.5, 0);
  const top = helixPoint(1, 0);
  assert.ok(bottom.radius > middle.radius && middle.radius > top.radius && top.radius > 0);
  const front = helixPoint(0, Math.PI / 2);
  const back = helixPoint(0, Math.PI * 1.5);
  assert.equal(front.depth, 1);
  assert.equal(back.depth, -1);
  assert.equal(front.radius, bottom.radius);
  assert.ok(helixPoint(.75, 0).radius > .3);
  const revolutions = Array.from({ length: 91 }, (_, i) => helixPoint(i / 90, 0).depth)
    .filter((depth, index, samples) => index && depth > 0 && samples[index - 1] <= 0).length;
  assert.equal(revolutions, 9);
  assert.ok(wishLevel(40, 41, 0) < wishLevel(40, 41, .5));
  assert.ok(wishLevel(40, 41, .5) < wishLevel(40, 41, 1));
  assert.ok(wishLevel(40, 41, 1) > wishLevel(39, 41));
  assert.equal(wishLevel(39, 41, .5), wishLevel(39, 41));
});
