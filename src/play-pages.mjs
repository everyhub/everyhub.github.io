import { layout, sourcesHTML } from './pages.mjs';
import { brand } from './tool-specs.mjs';
import { playItems, playPath, playTools } from './play-config.mjs';
import { lunarSources } from './lunar-calendar.mjs';
import { playLimits } from './play.mjs';
import { dateRange } from './utility.mjs';
import { fortuneCategories, fortunePromptCount } from './prompt-fortune.mjs';

const cardLayout = (html) => `${html}
  <div class="play-actions"><button type="submit">카드 만들기</button><button type="reset" class="play-secondary">지우기</button></div>
  <figure class="play-card-preview" hidden><canvas width="900" height="1080" role="img" aria-label="만든 카드 미리보기"></canvas></figure>
  <button type="button" data-play-save hidden>PNG 저장</button>`;
const text = (name, label, limit, placeholder, required = false) => `<label>${label}<textarea name="${name}" rows="2" maxlength="${limit}" placeholder="${placeholder}"${required ? ' required' : ''}></textarea></label>`;
const entries = (max, label, placeholder) => `<label>${label}<textarea name="entries" rows="5" maxlength="${max * (playLimits.name + 2)}" placeholder="${placeholder}" aria-describedby="play-entries-info" required></textarea></label>
  <p id="play-entries-info" class="note">한 줄에 하나씩 2~${max}개 · 항목당 ${playLimits.name}자 · 중복은 구분해 주세요.</p>`;
const actions = (label) => `<div class="play-actions"><button type="submit">${label}</button><button type="reset" class="play-secondary">지우기</button></div>`;
const form = (id, inner) => `<section class="panel play-form"><form data-play="${id}" data-custom-reset autocomplete="off">
  ${inner}<p class="error" data-play-error role="alert"></p><p class="play-result" data-play-result role="status"></p></form></section>`;
const zodiacSources = [
  { name: '한국천문연구원 · 음양력 변환', url: 'https://astro.kasi.re.kr/life/pageView/8' },
  ...lunarSources,
  { name: '국가법령정보센터 · 민법 제158조', url: 'https://www.law.go.kr/법령/민법/제158조' },
  { name: '국가법령정보센터 · 행정기본법 제7조의2', url: 'https://www.law.go.kr/법령/행정기본법/제7조의2' },
];
const fortuneCookie = `<section class="panel fortune-cookie play-form" data-play="prompt-fortune-cookie">
  <label>주제<select data-fortune-category>
    <option value="">모든 주제</option>${Object.entries(fortuneCategories).map(([key, { label, prompts }]) =>
      `<option value="${key}">${label} (${prompts.length}개)</option>`).join('')}
  </select></label>
  <div class="fortune-stage">
    <button type="button" class="fortune-draw" data-fortune-draw>
      <svg class="fortune-art" viewBox="0 0 240 160" width="240" height="160" aria-hidden="true">
        <defs><linearGradient id="fortune-crust" x2="30%" y2="100%"><stop stop-color="#ffe39f"/><stop offset=".52" stop-color="#eda14d"/><stop offset="1" stop-color="#ac5427"/></linearGradient></defs>
        <path d="M30 43v20m-10-10h20m164 52v24m-12-12h24m-15-84v14m-7-7h14" stroke="#ac653d" stroke-width="2" stroke-linecap="round" fill="none"/>
        <ellipse cx="120" cy="138" rx="69" ry="8" fill="#643823" opacity=".13"/>
        <g class="fortune-half">
          <path d="M124 42Q89 27 58 62Q43 79 52 96Q64 118 111 127L119 101 111 86 125 68Z" fill="url(#fortune-crust)" stroke="#964925" stroke-width="2.5"/>
          <path d="M54 92Q72 83 111 111L111 127Q65 119 54 97Z" fill="#a95729"/>
          <path d="M60 75Q82 50 111 52" fill="none" stroke="#ffe8aa" stroke-width="4" stroke-linecap="round"/>
        </g>
        <g class="fortune-half">
          <path d="M124 42Q156 26 182 61Q201 85 183 105Q163 126 111 127L119 101 111 86 125 68Z" fill="url(#fortune-crust)" stroke="#964925" stroke-width="2.5"/>
          <path d="M119 101Q155 80 187 93Q178 120 111 127Z" fill="#a95729"/>
          <path d="M136 52Q160 49 178 72" fill="none" stroke="#ffe8aa" stroke-width="4" stroke-linecap="round"/>
          <path d="M151 105l40 6-3 13-42-12z" fill="#fff7dc" stroke="#aa7846" stroke-width="1.5"/>
        </g>
      </svg>
      <span data-fortune-label>쿠키 깨기</span>
    </button>
    <p class="note">${fortunePromptCount}개의 질문이 들어 있어요.</p>
  </div>
  <div class="fortune-slip" data-fortune-slip hidden>
    <p class="fortune-topic" data-fortune-topic></p>
    <p class="fortune-prompt" data-fortune-prompt></p>
    <button type="button" data-fortune-copy>프롬프트 복사</button>
    <p class="note" data-fortune-copy-status role="status"></p>
    <p class="note">복사한 뒤 원하는 AI를 열어 붙여 넣으세요.</p>
    <ul class="fortune-links">
      <li><a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT 열기</a></li>
      <li><a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">Gemini 열기</a></li>
      <li><a href="https://claude.ai/" target="_blank" rel="noopener noreferrer">Claude 열기</a></li>
    </ul>
  </div>
  <p class="fortune-status" data-fortune-status role="status"></p>
</section>`;
const activities = {
  'prompt-fortune-cookie': fortuneCookie,
  'new-year-countdown': `<section class="play-countdown" data-play="new-year-countdown">
    <span class="play-clock-caption">대한민국 표준시 (KST)</span>
    <div class="play-timer" aria-label="남은 시간" role="timer">${['일', '시간', '분', '초'].map((unit) =>
      `<div><strong data-play-time>–</strong><span>${unit}</span></div>`).join('')}</div>
    <p data-play-result role="status">목표 시각 · <time datetime="2027-01-01T00:00:00+09:00">2027년 1월 1일 0시</time></p>
    <div class="play-fireworks" aria-hidden="true">${'<i></i>'.repeat(3)}</div>
  </section><p class="note">기기의 시계를 기준으로 표시합니다.</p>`,
  'resolution-card': form('resolution-card', cardLayout(text('resolution', '새해 다짐', playLimits.resolution, '예: 하루에 10분씩 걷기', true))),
  'year-in-review': form('year-in-review', cardLayout([
    text('moment', '가장 기억에 남는 순간은?', playLimits.memory, '예: 친구와 떠난 첫 여행'),
    text('progress', '올해 내가 해낸 일은?', playLimits.memory, '예: 미뤄 두던 운동을 시작했다'),
    text('message', '나에게 남기고 싶은 말은?', playLimits.memory, '예: 천천히 가도 괜찮아'),
    '<p class="note">한 가지 이상 답하면 카드에 담을 수 있어요.</p>',
  ].join(''))),
  'secret-santa': form('secret-santa', `${entries(playLimits.names, '참가자 이름', '하늘&#10;나무&#10;바다')}
    ${actions('짝 배정하기')}<section class="play-private" data-play-pair hidden>
      <h2 data-play-person></h2><p class="note">본인만 화면을 보고 확인하세요. 다음 사람에게는 이름을 가린 상태로 넘겨주세요.</p>
      <p class="play-result" data-play-secret></p>
      <div class="play-actions"><button type="button" data-play-reveal>내 짝 보기</button>
        <button type="button" class="play-secondary" data-play-next disabled>가리고 다음 사람</button></div>
    </section><p class="note">한 기기에서 차례대로 확인합니다. 새로고침하면 배정이 사라집니다.</p>`),
  roulette: form('roulette', `${entries(playLimits.choices, '후보 목록', '떡볶이&#10;김밥&#10;비빔밥')}
    ${actions('룰렛 돌리기')}
    <div class="play-roulette" hidden><div class="play-wheel-frame" aria-hidden="true"><div class="play-wheel"></div></div><ol class="play-legend"></ol></div>
    <p class="note">각 후보가 뽑힐 확률은 같습니다.</p>`),
  'zodiac-age': form('zodiac-age', `<div class="form-grid"><label>양력 생년월일<input name="birthday" type="date" min="${dateRange[0]}" max="${dateRange[1]}"></label>
    <label>출생연도만 알고 있다면<input name="year" type="text" inputmode="numeric" maxlength="4" placeholder="예: 2027"></label></div>
    <p class="note">둘 중 하나만 입력하세요. 출생연도만 입력하면 설 전후의 두 띠를 비교합니다.</p>${actions('띠·나이 확인')}`),
  'team-draw': form('team-draw', `${entries(playLimits.names, '참가자 이름', '하늘&#10;나무&#10;바다&#10;별')}
    <label>팀 수<input name="teams" type="number" min="2" max="10" value="2" required></label>${actions('팀 나누기')}<div class="play-team-grid" data-play-teams></div>`),
};

export function playPages(config) {
  const home = layout({
    config, root: '../', path: playPath, title: `놀이 | ${brand}`,
    description: '소원 트리, 새해 카드, 룰렛과 마니또 등 가볍게 즐기는 브라우저 놀이를 모았습니다.',
    localOnly: true, networkless: true,
    main: `<div class="play-hero"><p class="eyebrow">혼자서도, 여럿이서도</p><h1>놀이</h1>
      <p>겨울 소원을 달고, 새해를 기다리고, 친구들과 작은 내기를 즐겨 보세요.</p></div>
      <div class="play-grid">${playItems.map(({ path, name, description }, index) =>
        `<article class="play-tile"><span aria-hidden="true">${['✦', '◷', '✎', '✉', '◈', '◉', '◇', '✣', '✧', '⇋'][index]}</span>
        <h2><a href="../${path}">${name}</a></h2><p>${description}</p></article>`).join('')}</div>`,
  });
  const details = {
    'zodiac-age': `<section class="panel"><h2>띠와 나이를 세는 기준</h2>
      <p>이 도구에서 띠는 음력 1월 1일인 설날에 바뀝니다. 2027년은 설날인 2월 7일부터 정미년(양띠)으로 표시합니다. 2026~2028년은 한국천문연구원 달력자료를 사용하고, 그 밖의 연도는 브라우저의 한국 음력 달력을 사용합니다.</p>
      <p>만 나이는 한국 시간의 오늘을 기준으로, 생일이 지날 때마다 한 살을 더합니다. 개별 법령에 별도 기준이 있으면 그 기준이 우선합니다.</p>${sourcesHTML(zodiacSources)}</section>`,
  };
  return [{ path: playPath, html: home }, ...playTools.map(({ id, path, name, description }) => ({
    path, html: layout({ config, root: '../../', path, title: `${name} | ${brand}`, description, application: name,
      localOnly: true, networkless: true, script: id === 'prompt-fortune-cookie' ? 'prompt-fortune-browser.mjs' : 'play-browser.mjs',
      main: `<p class="eyebrow"><a href="../../play/">놀이</a></p><h1>${name}</h1><p class="intro">${description}</p>
      <noscript><p>이 놀이를 이용하려면 자바스크립트를 켜 주세요.</p></noscript>
      ${activities[id]}
      ${details[id] ?? ''}
      <p class="play-disclosure">${id === 'prompt-fortune-cookie'
        ? '에브리허브는 뽑은 질문을 저장하거나 AI 서비스로 보내지 않습니다. 링크를 누르면 해당 서비스가 새 탭에서 열립니다.'
        : '입력한 내용은 저장하거나 서버로 보내지 않습니다.'}</p>`,
    }),
  }))];
}
