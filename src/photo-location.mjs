export function jpegLocation(bytes) {
  const file = new DataView(bytes);
  if (file.byteLength < 4 || file.getUint16(0) !== 0xffd8) throw new Error('JPG 사진을 선택하세요.');
  let location = null;
  for (let offset = 2; offset + 1 < file.byteLength;) {
    if (file.getUint8(offset++) !== 0xff) break;
    const marker = file.getUint8(offset++);
    if (marker === 0xff) { offset--; continue; }
    if (marker === 0xda || marker === 0xd9) return location;
    if (offset + 2 > file.byteLength) break;
    const size = file.getUint16(offset);
    if (size < 2 || offset + size > file.byteLength) break;
    if (marker === 0xe1 && size >= 8 && file.getUint32(offset + 2) === 0x45786966 && file.getUint16(offset + 6) === 0) {
      const gps = readExifGPS(new DataView(bytes, offset + 8, size - 8));
      if (gps && (!location || gps.latitude !== undefined)) location = gps;
    }
    offset += size;
  }
  throw new Error('JPG 파일의 구조를 읽을 수 없습니다.');
}

function readExifGPS(tiff) {
  try {
    const order = tiff.getUint16(0);
    if (order !== 0x4949 && order !== 0x4d4d) throw new Error();
    const little = order === 0x4949;
    const u16 = (offset) => tiff.getUint16(offset, little);
    const u32 = (offset) => tiff.getUint32(offset, little);
    if (u16(2) !== 42) throw new Error();
    const directory = (start) => {
      const count = u16(start);
      if (start + 2 + count * 12 > tiff.byteLength) throw new Error();
      const tags = new Map();
      for (let i = start + 2; i < start + 2 + count * 12; i += 12) tags.set(u16(i), i);
      return tags;
    };
    const pointer = directory(u32(4)).get(0x8825);
    if (pointer === undefined) return null;
    if (u16(pointer + 2) !== 4 || u32(pointer + 4) !== 1) throw new Error();
    const tags = directory(u32(pointer + 8));
    const coordinate = (refTag, valueTag, positive, negative, max) => {
      const ref = tags.get(refTag), value = tags.get(valueTag);
      if (ref === undefined || value === undefined || u16(ref + 2) !== 2 || u32(ref + 4) !== 2 ||
          u16(value + 2) !== 5 || u32(value + 4) !== 3) throw new Error();
      const direction = String.fromCharCode(tiff.getUint8(ref + 8));
      const start = u32(value + 8);
      const [degrees, minutes, seconds] = [0, 8, 16].map((i) => u32(start + i) / u32(start + i + 4));
      const decimal = degrees + minutes / 60 + seconds / 3600;
      if (!Number.isFinite(decimal) || decimal > max || minutes >= 60 || seconds >= 60 ||
          (direction !== positive && direction !== negative)) throw new Error();
      return direction === negative ? -decimal : decimal;
    };
    return { latitude: coordinate(1, 2, 'N', 'S', 90), longitude: coordinate(3, 4, 'E', 'W', 180) };
  } catch {
    return {};
  }
}
