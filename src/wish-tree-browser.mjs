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
const backdrop = document.createElement('canvas');
const background = backdrop.getContext('2d');
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
const colors = ['#ffd17b', '#ffc0b2', '#fff2ca', '#ffab98', '#bdf3d4'];
const baubles = [
  [.16, .77, '#a54852'], [.29, -.56, '#db9c50'], [.38, .32, '#be5265'],
  [.51, .59, '#d49e48'], [.65, -.36, '#b84b5a'], [.79, .25, '#d59c52'],
];

function glow(x, y, radius, color, ctx = paint) {
  const halo = ctx.createRadialGradient(x, y, 0, x, y, radius);
  halo.addColorStop(0, color);
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function geometry() {
  return { center: width / 2, base: height * .865, top: height * .15,
    spread: Math.min(width * .36, height * .39) };
}

function gift(ctx, x, y, size, color, ribbon) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.fillStyle = '#101e28';
  ctx.beginPath();
  ctx.ellipse(.06, .02, .66, .11, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(-.5, -.68, 1, .68);
  ctx.fillStyle = '#0d1e314f';
  ctx.fillRect(.28, -.67, .22, .67);
  ctx.fillStyle = color;
  ctx.fillRect(-.55, -.76, 1.1, .16);
  ctx.fillStyle = '#fff4d838';
  ctx.fillRect(-.55, -.76, 1.1, .05);
  ctx.fillStyle = ribbon;
  ctx.fillRect(-.08, -.76, .16, .76);
  ctx.strokeStyle = ribbon;
  ctx.lineWidth = .045;
  ctx.beginPath();
  ctx.moveTo(0, -.76);
  ctx.bezierCurveTo(-.51, -.83, -.34, -1.19, 0, -.76);
  ctx.bezierCurveTo(.34, -1.19, .51, -.83, 0, -.76);
  ctx.stroke();
  ctx.restore();
}

function foliage(ctx, x, tip, hem, radius, tier) {
  const rise = hem - tip;
  ctx.save();
  ctx.translate(x, tip);
  ctx.scale(radius, rise);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (const side of [1, -1]) {
    const points = [[.28, .34], [.42, .48], [.31, .47], [.55, .65], [.68, .71],
      [.55, .71], [.79, .86], [1, .96], [.85, 1], [.77, .97], [.66, 1.035],
      [.54, 1.01], [.41, 1.065], [.25, 1.04], [.12, 1.075], [0, 1.058]];
    if (side < 0) points.reverse();
    for (const [px, py] of points) ctx.lineTo(px * side, py);
  }
  ctx.closePath();
  const green = ctx.createLinearGradient(-.7, .13, .65, 1);
  green.addColorStop(0, tier % 2 ? '#488a63' : '#5d9c70');
  green.addColorStop(.52, '#205344');
  green.addColorStop(1, '#0e342e');
  ctx.fillStyle = green;
  ctx.fill();
  ctx.clip();

  for (let i = 0; i < 82; i++) {
    const px = (i * 37 % 83) / 42 - 1;
    const py = .16 + (i * 19 % 89) / 99;
    const reach = .055 + (i % 5) * .025;
    const direction = Math.sign(px) || 1;
    ctx.strokeStyle = i % 3 ? '#92bc903a' : '#d2dcb34d';
    ctx.lineWidth = .008 + (i % 3) * .003;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + direction * reach * .52, py + .056, px + direction * reach, py + .075);
    ctx.stroke();
  }
  ctx.restore();
}

function paintBackdrop(dpr) {
  if (!background || !width || !height) return;
  backdrop.width = canvas.width;
  backdrop.height = canvas.height;
  background.setTransform(dpr, 0, 0, dpr, 0, 0);
  const { center, base, top, spread } = geometry();
  const span = base - top;
  const ground = height * .935;
  glow(center, height * .52, span * .81, '#23776f5c', background);
  for (let i = 0; i < 24; i++) {
    const x = width * ((i * 67 + 18) % 101) / 101;
    const y = height * (.09 + ((i * 41 + 7) % 97) / 121);
    glow(x, y, 3 + i % 5 * 2, i % 3 ? '#aacdc42b' : '#e3bc8052', background);
  }
  background.save();
  background.translate(center, ground);
  background.scale(1, .15);
  glow(0, 0, Math.min(width * .48, spread * 1.43), '#b6ced5a8', background);
  glow(0, -14, spread * .88, '#d0e6e565', background);
  background.restore();
  const bark = background.createLinearGradient(center - 10, 0, center + 10, 0);
  bark.addColorStop(0, '#8e6146');
  bark.addColorStop(.5, '#624737');
  bark.addColorStop(1, '#352e29');
  background.fillStyle = bark;
  background.fillRect(center - 8, base - 18, 16, ground - base + 13);
  const tiers = [[.58, 1.0, 1], [.44, .84, .84], [.29, .69, .68], [.145, .53, .51], [0, .35, .35]];
  tiers.forEach(([tip, hem, reach], i) => foliage(background, center, top + tip * span, top + hem * span, spread * reach, i));
  for (const [tip, hem, reach] of tiers) {
    const y = top + span * (tip * .3 + hem * .7);
    const radius = spread * reach;
    background.strokeStyle = '#edc58391';
    background.lineWidth = 1.25;
    background.beginPath();
    background.moveTo(center - radius * .55, y - 4);
    background.bezierCurveTo(center - radius * .15, y + 12, center + radius * .28, y + 11, center + radius * .62, y);
    background.stroke();
  }
  gift(background, center - spread * .68, ground + 2, spread * .24, '#9b4151', '#f0c985');
  gift(background, center - spread * .4, ground + 5, spread * .16, '#c5834a', '#fae2ad');
  gift(background, center + spread * .65, ground + 3, spread * .2, '#3c6b7b', '#e9c49c');
}

function draw() {
  paint.clearRect(0, 0, width, height);
  if (backdrop.width === canvas.width && backdrop.height === canvas.height && width && height) {
    paint.drawImage(backdrop, 0, 0, width, height);
  }
  const seconds = elapsed / 1000;
  const rotation = seconds * .32 + .45;
  const { center, base, top, spread } = geometry();
  const span = base - top;
  const project = (level) => {
    const { radius, x, depth } = helixPoint(level, rotation);
    return {
      x: center + spread * x * (1 + depth * .06),
      y: base - level * span + depth * radius * height * .035,
      depth,
    };
  };

  for (const { x, y, radius, speed } of flurries) {
    const drift = Math.sin(seconds * .32 + x * 14) * 7;
    paint.fillStyle = radius > 1.1 ? '#ccf3eb9c' : '#caecf467';
    paint.beginPath();
    paint.arc(x * width + drift, (y * height + seconds * speed) % height, radius, 0, 2 * Math.PI);
    paint.fill();
  }

  for (const [level, placement, color] of baubles) {
    const x = center + spread * placement * (1 - level);
    const y = base - level * span;
    const radius = Math.max(4, spread * (.057 - level * .02));
    const glass = paint.createRadialGradient(x - radius * .35, y - radius * .45, .4, x, y, radius);
    glass.addColorStop(0, '#fff0cf');
    glass.addColorStop(.31, color);
    glass.addColorStop(1, '#482a37');
    paint.fillStyle = '#daae73';
    paint.fillRect(x - 1.5, y - radius - 2, 3, 3);
    paint.fillStyle = glass;
    paint.beginPath();
    paint.arc(x, y, radius, 0, 2 * Math.PI);
    paint.fill();
  }

  const ascent = arrival === null || reduced.matches ? 1 : Math.min(1, (elapsed - arrival) / 2600);
  const ornaments = [...sampleWishes, ...wishes].map((text, i, all) => ({
    ...project(wishLevel(i, all.length, ascent)), text, i,
  })).sort((a, b) => a.depth - b.depth);
  for (const { x, y, depth, i, text } of ornaments) {
    const own = i >= sampleWishes.length;
    const size = (own ? 3.45 : 2.15) * (1 + depth * .34);
    const color = own ? '#ffdf9d' : colors[i % colors.length];
    const twinkle = .78 + .22 * Math.sin(seconds * (1.1 + i % 5 * .37) + i * 2.3);
    paint.globalAlpha = (.65 + depth * .27) * twinkle;
    glow(x, y, size * 5, color + '92');
    paint.fillStyle = color;
    paint.beginPath();
    paint.arc(x, y, size, 0, 2 * Math.PI);
    paint.fill();
    paint.globalAlpha = (own ? .23 : .14) + depth * .08;
    paint.fillStyle = '#fff5db';
    paint.font = '9px system-ui, sans-serif';
    paint.textAlign = 'center';
    paint.fillText(text, x, y - 7, Math.min(100, spread * .7));
  }
  paint.globalAlpha = 1;

  if (arrival !== null && !reduced.matches && ascent > .68 && ascent < 1) {
    const { x, y } = project(wishLevel(ornaments.length - 1, ornaments.length, ascent));
    const burst = (ascent - .68) / .32;
    paint.globalAlpha = 1 - burst;
    paint.fillStyle = '#ffedb0';
    for (let i = 0; i < 10; i++) {
      const angle = i * 2.39996;
      const reach = (6 + 24 * burst) * (1 - i % 3 * .18);
      paint.beginPath();
      paint.arc(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach, 1.45, 0, 2 * Math.PI);
      paint.fill();
    }
    paint.globalAlpha = 1;
  }

  const starY = top - 12;
  const pulse = Math.sin(seconds * 1.5);
  glow(center, starY, 39 + 5 * pulse, '#ffce6c92');
  paint.strokeStyle = '#ffdf9769';
  paint.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const reach = (i % 2 ? 22 : 27) + pulse * 2;
    paint.beginPath();
    paint.moveTo(center + 13 * Math.cos(angle), starY + 13 * Math.sin(angle));
    paint.lineTo(center + reach * Math.cos(angle), starY + reach * Math.sin(angle));
    paint.stroke();
  }
  const gold = paint.createLinearGradient(center - 10, starY - 12, center + 10, starY + 14);
  gold.addColorStop(0, '#fff9d2');
  gold.addColorStop(.53, '#ffe7a0');
  gold.addColorStop(1, '#e5a84c');
  paint.fillStyle = gold;
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
    paintBackdrop(dpr);
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
