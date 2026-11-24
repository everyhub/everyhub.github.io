import { jpegLocation } from './photo-location.mjs';

const form = document.querySelector('[data-utility="photo-location"]');
const input = form.elements.file;
const result = form.querySelector('output');
const download = form.querySelector('.utility-download');
let version = 0;

function clear() {
  version++;
  if (download.hasAttribute('href')) URL.revokeObjectURL(download.href);
  download.removeAttribute('href');
  download.hidden = true;
  result.value = '';
}

input.addEventListener('change', clear);
form.addEventListener('reset', clear);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clear();
  const run = version;
  const photo = input.files[0];
  result.value = '처리 중입니다.';
  let image;
  try {
    if (!photo.size || photo.size > 30 * 1024 * 1024) throw new Error('30MB 이하의 JPG 사진을 선택하세요.');
    const gps = jpegLocation(await photo.arrayBuffer());
    image = await createImageBitmap(photo, { imageOrientation: 'from-image' });
    if (image.width > 8192 || image.height > 8192 || image.width * image.height > 32_000_000) {
      throw new Error('가로·세로가 각각 8,192픽셀 이하이고 총 3,200만 픽셀 이하인 사진을 사용하세요.');
    }
    if (run !== version) return;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d').drawImage(image, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    if (!blob || jpegLocation(await blob.arrayBuffer()) !== null) throw new Error('위치정보 없는 사본을 만들지 못했습니다.');
    if (run !== version) return;
    download.href = URL.createObjectURL(blob);
    download.download = 'photo-without-location.jpg';
    download.hidden = false;
    result.value = gps === null ? 'EXIF GPS 태그를 찾지 못했습니다.' : gps.latitude === undefined
      ? 'EXIF 위치정보를 해석하지 못했습니다. 새 사본에서 원본 메타데이터는 제외됩니다.'
      : `EXIF GPS 좌표: 위도 ${gps.latitude.toFixed(6)}, 경도 ${gps.longitude.toFixed(6)}`;
  } catch (error) {
    if (run === version) result.value = error.name === 'Error' ? error.message : '사진을 열 수 없습니다. 정상적인 JPG 사진을 선택하세요.';
  } finally {
    image?.close();
  }
});
