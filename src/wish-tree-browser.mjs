import { helixPoint, parseWishes, sampleWishes, savedWishLimit, validateWish, wishLevel, wishStorageKey } from './wish-tree.mjs';

const tree = document.querySelector('[data-wish-tree]');
const form = tree.querySelector('form');
const input = form.querySelector('input');
const reset = tree.querySelector('[data-wish-reset]');
const motion = tree.querySelector('[data-wish-motion]');
const error = tree.querySelector('#wish-error');
const status = tree.querySelector('[data-wish-status]');
const storageNotice = tree.querySelector('[data-wish-storage]');
const count = tree.querySelector('[data-wish-count]');
const list = tree.querySelector('[data-wish-list]');
const canvas = tree.querySelector('canvas');
const paint = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function showStorageNotice() {
  storageNotice.hidden = false;
  storageNotice.textContent = '브라우저의 저장 공간을 쓸 수 없어 변경 사항은 이 화면에만 남아요.';
}

let wishes = [];
try { wishes = parseWishes(localStorage.getItem(wishStorageKey)); } catch { showStorageNotice(); }
let paused = false;
let frame;
let lastTime = null;
let elapsed = 0;
let arrival = null;
let width = 420;
let height = 432;

const flurries = Array.from({ length: 48 }, (_, i) => ({
  x: ((i * 73 + 11) % 101) / 101,
  y: ((i * 41 + 17) % 103) / 103,
  radius: .55 + i % 4 * .32,
  speed: 3 + i % 7 * 1.7,
}));
const colors = ['#a0f9d0', '#e8fdf8', '#ffd79b', '#6de2b5', '#b1e7ff'];

function glow(x, y, radius, color) {
  const halo = paint.createRadialGradient(x, y, 0, x, y, radius);
  halo.addColorStop(0, color);
  halo.addColorStop(1, 'transparent');
  paint.fillStyle = halo;
  paint.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function draw() {
  paint.clearRect(0, 0, width, height);
  const seconds = elapsed / 1000;
  const rotation = seconds * .32 + .45;
  const center = width / 2;
  const base = height * .89;
  const top = height * .14;
  const span = base - top;
  const spread = Math.min(width * .35, height * .38);
  const project = (level) => {
    const { radius, x, depth } = helixPoint(level, rotation);
    return {
      x: center + spread * x * (1 + depth * .11),
      y: base - level * span + depth * radius * height * .047,
      depth,
    };
  };

  glow(center, height * .59, span * .64, '#16836532');
  paint.save();
  paint.translate(center, base + height * .035);
  paint.scale(1, .17);
  glow(0, 0, spread * 1.1, '#b8f4df53');
  paint.restore();

  for (const { x, y, radius, speed } of flurries) {
    const drift = Math.sin(seconds * .32 + x * 14) * 7;
    paint.fillStyle = radius > 1.1 ? '#ccf3eb9c' : '#caecf467';
    paint.beginPath();
    paint.arc(x * width + drift, (y * height + seconds * speed) % height, radius, 0, 2 * Math.PI);
    paint.fill();
  }

  const trunk = paint.createLinearGradient(center, top, center, base + 12);
  trunk.addColorStop(0, '#ffe7a38c');
  trunk.addColorStop(.88, '#80d3aa63');
  trunk.addColorStop(1, '#ffe7a374');
  paint.strokeStyle = trunk;
  paint.lineWidth = 2;
  paint.beginPath();
  paint.moveTo(center, top);
  paint.lineTo(center, base + 12);
  paint.stroke();

  for (let i = 0; i < 190; i++) {
    const a = project(i / 190);
    const b = project((i + 1) / 190);
    paint.strokeStyle = a.depth > 0 ? '#79e1bd68' : '#79e1bd27';
    paint.lineWidth = a.depth > 0 ? 1.75 : 1;
    paint.beginPath();
    paint.moveTo(a.x, a.y);
    paint.lineTo(b.x, b.y);
    paint.stroke();
  }

  const ascent = arrival === null || reduced.matches ? 1 : Math.min(1, (elapsed - arrival) / 2600);
  const ornaments = [...sampleWishes, ...wishes].map((text, i, all) => ({
    ...project(wishLevel(i, all.length, ascent)), text, i,
  })).sort((a, b) => a.depth - b.depth);
  for (const { x, y, depth, i, text } of ornaments) {
    const own = i >= sampleWishes.length;
    const size = (own ? 3.45 : 2.45) * (1 + depth * .26);
    const color = own ? '#ffdf9d' : colors[i % colors.length];
    const twinkle = .84 + .16 * Math.sin(seconds * 1.3 + i * 2.3);
    paint.globalAlpha = (.65 + depth * .25) * twinkle;
    glow(x, y, size * 3.3, color + '80');
    paint.fillStyle = color;
    paint.beginPath();
    paint.arc(x, y, size, 0, 2 * Math.PI);
    paint.fill();
    paint.globalAlpha = (own ? .29 : .2) + depth * .12;
    paint.font = '9px system-ui, sans-serif';
    paint.textAlign = 'center';
    paint.fillText(text, x, y - 7, Math.min(100, spread * .7));
  }
  paint.globalAlpha = 1;

  const starY = top - 13;
  glow(center, starY, 36 + 3 * Math.sin(seconds * 1.5), '#ffda796f');
  paint.fillStyle = '#ffe9a8';
  paint.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI / 5 - Math.PI / 2;
    const radius = i % 2 ? 6.5 : 15;
    const x = center + radius * Math.cos(angle);
    const y = starY + radius * Math.sin(angle);
    if (i === 0) paint.moveTo(x, y);
    else paint.lineTo(x, y);
  }
  paint.closePath();
  paint.fill();
}

function tick(time) {
  if (lastTime === null || time - lastTime >= 31) {
    elapsed += lastTime === null ? 0 : Math.min(time - lastTime, 60);
    lastTime = time;
    draw();
  }
  frame = requestAnimationFrame(tick);
}

function adjustAnimation() {
  cancelAnimationFrame(frame);
  lastTime = null;
  if (!paint) return;
  motion.hidden = reduced.matches;
  motion.textContent = paused ? '움직임 켜기' : '움직임 멈추기';
  if (!document.hidden && !reduced.matches && !paused) frame = requestAnimationFrame(tick);
  else if (!document.hidden) draw();
}

function refreshWishes() {
  count.textContent = wishes.length;
  reset.disabled = !wishes.length;
  list.replaceChildren(...wishes.toReversed().map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  if (paint) draw();
}

function showError(message) {
  error.hidden = !message;
  error.textContent = message ?? '';
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function save() {
  try {
    if (wishes.length) localStorage.setItem(wishStorageKey, JSON.stringify(wishes));
    else localStorage.removeItem(wishStorageKey);
    storageNotice.hidden = true;
  } catch { showStorageNotice(); }
  refreshWishes();
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const result = validateWish(input.value);
  showError(result.error);
  if (result.error) {
    input.focus();
    return;
  }
  wishes = [...wishes, result.text].slice(-savedWishLimit);
  arrival = !paused && !reduced.matches ? elapsed : null;
  save();
  status.textContent = `소원을 달았어요. 내 소원 ${wishes.length}개.`;
  input.value = '';
  input.focus();
});
input.addEventListener('input', () => showError());
reset.addEventListener('click', () => {
  wishes = [];
  arrival = null;
  save();
  showError();
  status.textContent = '내 소원을 모두 지웠어요. 예시 소원은 그대로예요.';
  input.value = '';
  input.focus();
});

if (paint) {
  new ResizeObserver(([{ contentRect }]) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = contentRect.width;
    height = contentRect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    paint.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }).observe(canvas);
  motion.addEventListener('click', () => {
    paused = !paused;
    adjustAnimation();
  });
  reduced.addEventListener('change', adjustAnimation);
  document.addEventListener('visibilitychange', adjustAnimation);
  adjustAnimation();
}
refreshWishes();
input.disabled = false;
form.querySelector('[type="submit"]').disabled = false;
