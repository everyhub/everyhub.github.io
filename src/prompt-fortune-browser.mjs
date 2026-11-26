import { fortuneCategories, pickFortune } from './prompt-fortune.mjs';

const surface = document.querySelector('[data-play="prompt-fortune-cookie"]');
const find = (part) => surface.querySelector(`[data-fortune-${part}]`);
const category = find('category');
const draw = find('draw');
const label = find('label');
const slip = find('slip');
const promptText = find('prompt');
const status = find('status');
const copyStatus = find('copy-status');
const recent = [];
let busy = false;
let generation = 0;

draw.addEventListener('click', async () => {
  if (busy) return;
  busy = true;
  const current = ++generation;
  const picked = pickFortune(category.value, recent);
  slip.hidden = true;
  status.textContent = copyStatus.textContent = '';
  draw.classList.remove('fortune-cracked');
  draw.getAnimations({ subtree: true });
  draw.classList.add('fortune-cracked');
  await Promise.allSettled(draw.getAnimations({ subtree: true }).map(({ finished }) => finished));
  if (current !== generation) return;
  recent.push(picked.text);
  if (recent.length > 12) recent.shift();
  const topic = fortuneCategories[picked.category].label;
  find('topic').textContent = topic;
  promptText.textContent = picked.text;
  label.textContent = '다시 뽑기';
  slip.hidden = false;
  status.textContent = `${topic}: ${picked.text}`;
  busy = false;
});

category.addEventListener('change', () => {
  generation++;
  busy = false;
  draw.classList.remove('fortune-cracked');
  label.textContent = '쿠키 깨기';
  slip.hidden = true;
  status.textContent = copyStatus.textContent = '';
});

find('copy').addEventListener('click', async () => {
  const current = generation;
  try {
    await navigator.clipboard.writeText(promptText.textContent);
    if (current === generation) copyStatus.textContent = '프롬프트를 복사했습니다.';
  } catch {
    if (current !== generation) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(promptText);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = '자동으로 복사하지 못했습니다. 선택된 질문을 직접 복사해 주세요.';
  }
});
