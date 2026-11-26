import assert from 'node:assert/strict';
import test from 'node:test';
import { birthdayZodiac, countdown, kstToday, listEntries, newYear, roulettePick, secretPairs, splitTeams, wrapCardText, yearZodiac } from '../src/play.mjs';

test('2027년 타이머는 한국 자정에 0으로 고정되고 이후 음수가 되지 않는다', () => {
  assert.equal(newYear, Date.parse('2026-12-31T15:00:00Z'));
  assert.deepEqual(countdown(newYear - 90_061_000), { done: false, values: [1, 1, 1, 1] });
  assert.deepEqual(countdown(newYear - 1).values, [0, 0, 0, 1]);
  for (const offset of [0, 1, 60_000]) assert.deepEqual(countdown(newYear + offset), { done: true, values: [0, 0, 0, 0] });
  assert.equal(kstToday(newYear), '2027-01-01');
});

test('명단은 공백·빈 줄·중복·상한을 처리한다', () => {
  assert.deepEqual(listEntries(' 하늘\r\n\r나무\n바다 '), ['하늘', '나무', '바다']);
  assert.throws(() => listEntries('가\n가'), /겹치는/);
  assert.throws(() => listEntries('한 명'), /2~40/);
  assert.throws(() => listEntries('가\n나\n다', 2), /2~2/);
  assert.throws(() => listEntries('가\n' + '🐏'.repeat(41)), /40자/);
});

test('마니또는 일대일로 배정하고 팀 나누기의 인원 차이는 한 명 이하다', () => {
  const two = secretPairs(['하늘', '나무'], () => 0);
  assert.deepEqual([...two].sort(), [['나무', '하늘'], ['하늘', '나무']]);
  const names = Array.from({ length: 40 }, (_, i) => `참가자 ${i}`);
  for (const size of [2, 3, 7, 40]) {
    const items = names.slice(0, size);
    const pairs = secretPairs(items, () => 0);
    assert.deepEqual([...pairs.values()].sort(), [...items].sort());
    for (const [sender, receiver] of pairs) assert.notEqual(sender, receiver);
  }
  const teams = splitTeams(names.slice(0, 7), 3, (size) => size - 1);
  assert.deepEqual(teams.map((team) => team.length), [3, 2, 2]);
  assert.deepEqual(teams.flat().sort(), names.slice(0, 7));
  assert.throws(() => splitTeams(names.slice(0, 2), 3), /팀 수/);
});

test('룰렛 정지 각도는 당첨 칸 중앙을 가리킨다', () => {
  const items = ['가', '나', '다', '라'];
  assert.deepEqual(roulettePick(items, () => 0), { index: 0, winner: '가', angle: 315 });
  assert.deepEqual(roulettePick(items, () => 3), { index: 3, winner: '라', angle: 45 });
});

test('띠는 설 이후에 바뀌고 만 나이는 생일에 바뀐다', () => {
  assert.deepEqual(yearZodiac('2027').after, { year: 2027, cycle: '정미', animal: '양' });
  assert.throws(() => yearZodiac('27'), /출생연도/);
  const before = birthdayZodiac('2027-02-06', '2028-02-05');
  const after = birthdayZodiac('2027-02-07', '2028-02-07');
  assert.deepEqual([before.sign.animal, before.age, before.seollal, before.source], ['말', 0, '2027-02-07', 'official']);
  assert.deepEqual([after.sign.animal, after.age], ['양', 1]);
  assert.deepEqual(birthdayZodiac('2000-02-05', '2026-02-05').sign, { year: 2000, cycle: '경진', animal: '용' });
  assert.throws(() => birthdayZodiac('2027-02-07', '2027-02-06'), /생년월일보다/);
});

test('이미지 카드 줄바꿈은 결합 이모지와 문단을 보존한다', () => {
  assert.deepEqual(wrapCardText('👩‍👩‍👧‍👦가\n나', (line) => !line.endsWith('가') || line === '가'), ['👩‍👩‍👧‍👦', '가', '나']);
});
