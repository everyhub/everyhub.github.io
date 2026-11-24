import test from 'node:test';
import assert from 'node:assert/strict';
import { jpegLocation } from '../src/photo-location.mjs';
import { jpegWithGPS } from './photo-location-fixture.mjs';

const bare = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
const read = (buffer) => jpegLocation(Uint8Array.from(buffer).buffer);

test('JPEG EXIF parses both byte orders with signed coordinates', () => {
  assert.equal(read(bare), null);
  for (const little of [true, false]) {
    assert.deepEqual(read(jpegWithGPS(bare, little)), { latitude: -37.5, longitude: 127.25 });
  }
});

test('JPEG EXIF handles malformed GPS and rejects non-JPEG and truncated segments', () => {
  const invalidGPS = jpegWithGPS(bare);
  invalidGPS.fill(0, 12 + 92, 12 + 96);
  assert.deepEqual(read(invalidGPS), {});
  assert.throws(() => read(invalidGPS.subarray(0, 30)), /구조/);
  assert.throws(() => read(Buffer.from('not JPEG')), /JPG/);
});
