export const wishLimit = 30;
export const savedWishLimit = 30;
export const wishStorageKey = 'everyhub-christmas-wishes-v1';

export const sampleWishes = [
  '따뜻한 연말', '마음 편한 하루', '건강한 새해', '포근한 밤', '눈 오는 아침',
  '한 잔의 여유', '좋은 소식', '웃음 가득', '무사한 귀가', '다정한 인사',
  '행복한 산책', '깊은 잠', '즐거운 식탁', '평온한 겨울', '반가운 만남',
  '소소한 행복', '용기 한 스푼', '따뜻한 차', '새로운 시작', '맑은 하늘',
  '다정한 하루', '가벼운 마음', '한 걸음 앞으로', '하얀 크리스마스', '편안한 쉼',
  '좋은 꿈', '작은 기쁨', '환한 미소', '따뜻한 손', '함께 웃는 날',
  '포근한 이불', '고요한 저녁', '안부 한마디', '반가운 편지', '좋아하는 음악',
  '즐거운 여행', '평화로운 날들', '햇살 한 줌', '마음의 여유', '모두의 건강',
];

const characters = new Intl.Segmenter('ko', { granularity: 'grapheme' });

export function validateWish(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return { error: '소원을 입력해 주세요.' };
  let length = 0;
  for (const _ of characters.segment(text)) {
    if (++length > wishLimit) return { error: `소원은 ${wishLimit}자 이내로 적어 주세요.` };
  }
  return { text };
}

export function parseWishes(value) {
  try {
    const wishes = JSON.parse(value);
    if (Array.isArray(wishes)) return wishes.slice(-savedWishLimit).flatMap(entry => {
      const { text } = validateWish(entry);
      return text ? [text] : [];
    });
  } catch {}
  return [];
}

export function helixPoint(height, rotation) {
  const radius = 0.065 + 0.935 * (1 - height) ** 1.04;
  const angle = height * 10 * Math.PI + rotation;
  return { radius, x: radius * Math.cos(angle), depth: Math.sin(angle) };
}

export function wishLevel(index, total, progress = 1) {
  const target = .025 + .93 * index / (total - 1);
  return index === total - 1 && progress < 1
    ? .08 + (target - .08) * (1 - (1 - progress) ** 2)
    : target;
}
