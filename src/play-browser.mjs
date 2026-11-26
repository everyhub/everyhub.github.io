import { birthdayZodiac, countdown, newYear, playLimits, roulettePick, secretPairs, splitTeams, wheelColors, wrapCardText, yearZodiac } from './play.mjs';
import { ladderDraw } from './utility-extra.mjs';
import { bindEntryBoxes } from './play-entry.mjs';

const surface = document.querySelector('[data-play]');
const mode = surface.dataset.play;
const result = surface.querySelector('[data-play-result]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function startCountdown() {
  const digits = [...surface.querySelectorAll('[data-play-time]')];
  const duration = 60_000;
  let timer;
  function update() {
    clearTimeout(timer);
    if (document.hidden) return;
    const now = Date.now();
    const { done, values } = countdown(now);
    digits.forEach((digit, index) => { digit.textContent = String(values[index]).padStart(2, '0'); });
    surface.classList.toggle('play-celebrating', done && now < newYear + duration);
    if (done) {
      if (!surface.dataset.arrived) {
        result.textContent = '2027년 새해가 밝았습니다. 새해 복 많이 받으세요!';
        surface.dataset.arrived = 'true';
      }
      if (now < newYear + duration) timer = setTimeout(update, newYear + duration - now);
    } else {
      timer = setTimeout(update, 1000 - (now % 1000));
    }
  }
  document.addEventListener('visibilitychange', () => {
    surface.classList.toggle('play-paused', document.hidden);
    update();
  });
  update();
}

function cardHandler(form) {
  const preview = form.querySelector('figure');
  const canvas = preview.querySelector('canvas');
  const save = form.querySelector('[data-play-save]');
  const review = mode === 'year-in-review';
  const inputs = review ? ['moment', 'progress', 'message'] : ['resolution'];
  const labels = ['기억에 남는 순간', '내가 해낸 일', '나에게 남기는 말'];
  const title = review ? '올해 돌아보기' : '새해 다짐';
  const colors = review ? ['#251942', '#543021', '#ffddaa'] : ['#0a373c', '#103453', '#a9f1c8'];
  let version = 0;
  function clear() {
    version++;
    preview.hidden = true;
    save.hidden = true;
  }
  function run() {
    const answers = inputs.map((name) => form.elements[name].value.trim());
    if (!answers.some(Boolean)) throw new Error('카드에 담을 내용을 입력해 주세요.');
    const context = canvas.getContext('2d');
    const x = 76;
    const width = canvas.width - x * 2;
    const size = review ? 36 : 50;
    const font = (fontSize, weight = 600) => { context.font = `${weight} ${fontSize}px system-ui, sans-serif`; };
    font(size);
    const blocks = answers.map((answer) => answer ? wrapCardText(answer, (line) => context.measureText(line).width <= width) : []);
    if (blocks.some((lines) => lines.length > (review ? 5 : 10))) throw new Error('카드에 담기에는 줄이 너무 많습니다. 줄바꿈을 줄여 주세요.');
    const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    background.addColorStop(0, colors[0]); background.addColorStop(1, colors[1]);
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = colors[2];
    context.lineWidth = 2;
    context.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);
    context.save();
    context.globalAlpha = .45;
    for (const [starX, starY, radius] of [[744, 118, 30], [810, 171, 12], [681, 92, 8], [789, 978, 23], [735, 1002, 8]]) {
      context.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const arm = radius * (i % 2 ? .27 : 1);
        context.lineTo(starX + Math.cos(angle) * arm, starY + Math.sin(angle) * arm);
      }
      context.closePath();
      context.stroke();
    }
    context.restore();
    context.fillStyle = colors[2];
    font(24, 700);
    context.fillText(review ? 'A MOMENT TO REMEMBER' : 'HELLO, NEW YEAR', x, 115);
    context.fillStyle = '#fffdf8';
    font(62, 800);
    context.fillText(title, x, 204);
    const sectionCount = blocks.filter((lines) => lines.length).length;
    let section = 0;
    blocks.forEach((lines, index) => {
      if (!lines.length) return;
      let y = review ? 276 + section++ * Math.min(230, 675 / sectionCount) : 580 - (lines.length - 1) * 29.5;
      if (review) {
        context.globalAlpha = .35;
        context.beginPath();
        context.moveTo(x, y - 26);
        context.lineTo(x + width, y - 26);
        context.stroke();
        context.globalAlpha = 1;
        context.fillStyle = colors[2]; font(27, 750);
        context.fillText(labels[index], x, y);
        y += 46;
      }
      context.fillStyle = '#fffdf8'; font(size);
      for (const line of lines) {
        context.fillText(line, x, y);
        y += review ? 40 : 59;
      }
    });
    context.fillStyle = colors[2]; font(25, 750);
    context.fillText('EveryHub', x, 1000);
    preview.hidden = false;
    save.hidden = false;
    result.textContent = '카드를 만들었습니다. PNG로 저장할 수 있어요.';
  }
  save.addEventListener('click', () => {
    const current = version;
    canvas.toBlob((blob) => {
      if (current !== version) return;
      if (!blob) {
        result.textContent = '이미지를 저장하지 못했습니다. 다시 시도해 주세요.';
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: `${title}.png` });
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  });
  return { clear, run };
}

function privateDraw(form, entries) {
  const panel = form.querySelector('[data-play-pair]');
  const person = panel.querySelector('[data-play-person]');
  const secret = panel.querySelector('[data-play-secret]');
  const reveal = panel.querySelector('[data-play-reveal]');
  const next = panel.querySelector('[data-play-next]');
  let queue;
  let pairs;
  let index;
  function clear() {
    panel.hidden = true;
    person.textContent = secret.textContent = '';
    queue = pairs = null;
  }
  function showPerson() {
    person.textContent = `${index + 1}/${queue.length} · ${queue[index]} 님 차례`;
    secret.textContent = '';
    reveal.textContent = '내 짝 보기';
    reveal.setAttribute('aria-expanded', 'false');
    next.disabled = true;
    next.textContent = index === queue.length - 1 ? '가리고 마치기' : '가리고 다음 사람';
    reveal.focus();
  }
  reveal.addEventListener('click', () => {
    const show = !secret.textContent;
    secret.textContent = show ? `내 짝: ${pairs.get(queue[index])}` : '';
    reveal.textContent = show ? '다시 가리기' : '내 짝 보기';
    reveal.setAttribute('aria-expanded', String(show));
    next.disabled = false;
  });
  next.addEventListener('click', () => {
    index++;
    if (index === queue.length) {
      clear();
      result.textContent = '모두 확인했습니다. 배정을 지웠습니다.';
      form.querySelector('[type="submit"]').focus();
    } else showPerson();
  });
  return { clear, run() {
    queue = entries('people');
    pairs = secretPairs(queue);
    index = 0;
    panel.hidden = false;
    result.textContent = '짝을 배정했습니다.';
    showPerson();
  } };
}

function roulette(form, entries, share) {
  const panel = form.querySelector('.play-roulette');
  const wheel = panel.querySelector('.play-wheel');
  const legend = panel.querySelector('.play-legend');
  const submit = form.querySelector('[type="submit"]');
  let animation;
  let current = 0;
  function clear() {
    animation?.cancel();
    animation = undefined;
    submit.disabled = false;
    panel.hidden = true;
    current = 0;
  }
  function run() {
    const items = entries('choices');
    const { winner, angle } = roulettePick(items);
    const color = (i) => wheelColors[(i === items.length - 1 && i % wheelColors.length === 0 ? i - 2 : i) % wheelColors.length];
    const sectors = items.map((_, i) => `${color(i)} ${i / items.length * 360}deg ${(i + 1) / items.length * 360}deg`);
    wheel.style.background = `conic-gradient(${sectors.join(',')})`;
    legend.replaceChildren(...items.map((item, index) => {
      const li = document.createElement('li');
      li.style.setProperty('--entry-color', color(index));
      li.textContent = item;
      return li;
    }));
    panel.hidden = false;
    const last = current;
    current += 1440 + ((angle - current % 360 + 360) % 360);
    const rotate = (degrees) => `rotate(${degrees}deg)`;
    wheel.style.transform = rotate(current);
    const show = () => {
      animation = undefined;
      submit.disabled = false;
      result.textContent = `뽑힌 항목: ${winner}`;
      legend.children[items.indexOf(winner)].classList.add('play-winner');
      share(result.textContent);
    };
    if (reduceMotion.matches) return show();
    result.textContent = '룰렛이 돌아가는 중입니다.';
    submit.disabled = true;
    animation = wheel.animate([{ transform: rotate(last) }, { transform: rotate(current) }],
      { duration: 1500, easing: 'cubic-bezier(.15,.68,.15,1)' });
    animation.onfinish = show;
  }
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) animation?.finish(); });
  return { clear, run, keepOnSubmit: true };
}

function zodiac(form) {
  const format = ({ year, cycle, animal }) => `${year}년 ${cycle}년(${animal}띠)`;
  const both = ({ before, after }) => `설 이전: ${format(before)} · 설날부터: ${format(after)}`;
  const birth = form.elements.birthday.value;
  const year = form.elements.year.value.trim();
  if (birth && year) throw new Error('생년월일 또는 출생연도 중 하나만 입력해 주세요.');
  if (year) return both(yearZodiac(year)) + ' · 만 나이는 생년월일이 필요합니다.';
  if (!birth) throw new Error('양력 생년월일 또는 출생연도를 입력해 주세요.');
  const data = birthdayZodiac(birth);
  const note = data.source === 'official' ? `(설날: ${data.seollal})` : '(브라우저의 한국 음력 기준)';
  return `만 ${data.age}세 · ${data.sign ? format(data.sign) + ' ' + note : both(data) + ' · 브라우저에서 설 날짜를 확인할 수 없습니다.'}`;
}

function teams(form, entries, share) {
  const list = form.querySelector('[data-play-teams]');
  return {
    clear: () => list.replaceChildren(),
    run() {
      const names = entries('people');
      const groups = splitTeams(names, form.elements.teams.valueAsNumber);
      for (const [index, team] of groups.entries()) {
        const card = document.createElement('section');
        const title = document.createElement('h2');
        title.textContent = `${index + 1}팀 · ${team.length}명`;
        const members = document.createElement('ul');
        members.replaceChildren(...team.map((name) => {
          const li = document.createElement('li'); li.textContent = name; return li;
        }));
        card.append(title, members);
        list.append(card);
      }
      result.textContent = `${names.length}명을 ${groups.length}개 팀으로 나눴습니다.`;
      share(groups.map((team, i) => `${i + 1}팀: ${team.join(', ')}`).join('\n'));
    },
  };
}

function ladder(form, entries, share) {
  const panel = form.querySelector('[data-play-ladder]');
  const diagram = panel.querySelector('svg');
  const cards = panel.querySelector('.play-ladder-matches');
  const makeSVG = (tag, attrs, content = '') => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    node.textContent = content;
    return node;
  };
  return {
    clear: () => { panel.hidden = true; cards.replaceChildren(); diagram.replaceChildren(); },
    run() {
      const { matches, rungs } = ladderDraw(entries('people').join('\n'), entries('choices').join('\n'));
      const x = (i) => 16 + i * 32;
      const y = (i) => 27 + i * 10;
      const bottom = Math.max(57, y(rungs.length) + 8);
      const line = (x1, y1, x2, y2) => makeSVG('line', { x1, y1, x2, y2 });
      diagram.setAttribute('viewBox', `0 0 ${32 * matches.length} ${bottom + 20}`);
      const labels = matches.flatMap(({ index }) => [14, bottom + 15].map((y) =>
        makeSVG('text', { x: x(index), y, 'text-anchor': 'middle' }, index + 1)));
      const trace = makeSVG('polyline', { class: 'play-ladder-trace' });
      diagram.replaceChildren(...matches.map(({ index }) => line(x(index), 18, x(index), bottom)),
        ...rungs.map((left, index) => line(x(left), y(index), x(left + 1), y(index))), ...labels, trace);
      function select(start) {
        let column = start;
        const points = [[x(column), 18]];
        rungs.forEach((left, index) => {
          if (column !== left && column !== left + 1) return;
          points.push([x(column), y(index)]);
          column = column === left ? left + 1 : left;
          points.push([x(column), y(index)]);
        });
        points.push([x(column), bottom]);
        trace.setAttribute('points', points.join(' '));
        [...cards.children].forEach((card, index) => card.setAttribute('aria-pressed', String(index === start)));
      }
      for (const { index, end, player, result: landing } of matches) {
        const card = document.createElement('button');
        const name = document.createElement('strong');
        const destination = document.createElement('span');
        card.type = 'button';
        name.textContent = `${index + 1}. ${player}`;
        destination.textContent = `→ ${end + 1}. ${landing}`;
        card.append(name, destination);
        card.addEventListener('click', () => select(index));
        cards.append(card);
      }
      select(0);
      panel.hidden = false;
      result.textContent = `${matches.length}명의 도착 칸을 정했습니다.`;
      share(matches.map(({ player, result: landing }) => `${player} → ${landing}`).join('\n'));
    },
  };
}

function bindForm(form) {
  const error = form.querySelector('[data-play-error]');
  const entries = form.querySelector('[data-entry-count]') ? bindEntryBoxes(form) : null;
  const copy = form.querySelector('[data-play-copy]');
  const copyStatus = form.querySelector('[data-play-copy-status]');
  let shareText = '';
  function share(text) {
    shareText = text;
    copy.hidden = !text;
    copyStatus.textContent = '';
  }
  copy?.addEventListener('click', async () => {
    const text = shareText;
    try {
      await navigator.clipboard.writeText(text);
      if (shareText === text) copyStatus.textContent = '결과를 복사했습니다.';
    } catch {
      if (shareText === text) copyStatus.textContent = '자동으로 복사하지 못했습니다. 화면의 결과를 직접 복사해 주세요.';
    }
  });
  const handler = mode === 'secret-santa' ? privateDraw(form, entries)
    : mode === 'roulette' ? roulette(form, entries, share)
      : mode === 'zodiac-age' ? { run: () => { result.textContent = zodiac(form); } }
        : mode === 'team-draw' ? teams(form, entries, share)
          : mode === 'ladder-draw' ? ladder(form, entries, share) : cardHandler(form);
  function clear(clearPreview = true) {
    if (clearPreview) handler.clear?.();
    if (copy) share('');
    error.textContent = result.textContent = '';
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clear(!handler.keepOnSubmit);
    try { handler.run(); } catch (failure) { error.textContent = failure.message; }
  });
  form.addEventListener('reset', () => clear());
  form.addEventListener('input', () => clear());
}

if (mode === 'new-year-countdown') startCountdown();
else bindForm(surface);
