export function jpegWithGPS(jpeg, little = true) {
  const tiff = new ArrayBuffer(136);
  const view = new DataView(tiff);
  const short = (i, x) => view.setUint16(i, x, little);
  const long = (i, x) => view.setUint32(i, x, little);
  const entry = (at, tag, type, count, value) => {
    short(at, tag); short(at + 2, type); long(at + 4, count); long(at + 8, value);
  };
  short(0, little ? 0x4949 : 0x4d4d); short(2, 42); long(4, 8);
  short(8, 2);
  entry(10, 0x0112, 3, 1, 0); short(18, 6);
  entry(22, 0x8825, 4, 1, 38);
  short(38, 4);
  entry(40, 1, 2, 2, 0); view.setUint8(48, 83);
  entry(52, 2, 5, 3, 88);
  entry(64, 3, 2, 2, 0); view.setUint8(72, 69);
  entry(76, 4, 5, 3, 112);
  [37, 30, 0, 127, 15, 0].forEach((value, i) => { long(88 + 8 * i, value); long(92 + 8 * i, 1); });
  const header = Buffer.from([0xff, 0xe1, 0, 144, 69, 120, 105, 102, 0, 0]);
  return Buffer.concat([jpeg.subarray(0, 2), header, Buffer.from(tiff), jpeg.subarray(2)]);
}
