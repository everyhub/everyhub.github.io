import { faqHTML, layout, sourcesHTML } from './pages.mjs';
import { brand } from './tool-specs.mjs';
import { utilityGroups, utilitySections } from './utility-config.mjs';
import { dateInput, extraUtilityForms } from './utility-forms.mjs';
import { maxArea } from './utility.mjs';

const root = '../../';
const toolIntro = '글쓰기, 이미지·PDF, 날짜·시간, 생활 계산과 개발 도구를 브라우저에서 바로 사용하세요. 파일과 입력값은 서버로 보내지 않습니다.';
const forms = {
  'background-removal': {
    faq: [
      ['이미지를 업로드하나요?', '아니요. 사이트에서 모델 파일만 받아 브라우저가 이미지를 메모리에서 처리합니다. PNG 저장 버튼을 누를 때만 결과가 기기에 내려받아집니다.'],
      ['머리카락이나 털이 잘렸다면 어떻게 하나요?', '결과에서 직접 수정을 누르고 머리카락 도구로 원하는 곳에 선을 그은 뒤 선택한 곳 보기를 누르세요. 지우기·살리기 브러시로 마스크를 직접 고칠 수도 있습니다.'],
      ['처음 실행이 오래 걸리는 이유는 무엇인가요?', '선택한 모델과 실행 파일을 처음 받아야 합니다. 상반신 사진은 빠른 인물 모드를 써 보세요. 정밀 보정은 별도 모델을 사용합니다.'],
    ],
    html: `<section class="panel"><p>사진을 열면 브라우저 안에서 배경을 지웁니다. 배경은 투명·흰색·검정·사용자 지정 색으로 저장할 수 있습니다. 모델과 처리 시간이 부담되면 상반신 인물 모드에서 정밀 보정을 끄고 먼저 시도해 보세요.</p>
    <p><a href="${root}assets/background-removal/">편집기만 크게 열기</a> · <a href="${root}assets/background-removal/vendor/SOURCES.txt">모델 및 라이선스</a></p>
    <iframe class="utility-editor" title="이미지 배경 제거 편집기" src="${root}assets/background-removal/"></iframe></section>`,
  },
  'image-resize': {
    faq: [['사진을 확대할 수 있나요?', '이 도구는 비율을 유지한 채 긴 변을 지정한 길이 이하로 줄입니다. 작은 사진은 확대하지 않습니다.'],
      ['투명 배경을 보존하나요?', 'PNG와 WebP는 투명 배경을 유지합니다. JPG로 저장하면 투명 부분은 흰색으로 바뀝니다.']],
    html: `<div class="form-grid">
      <label>이미지 파일<input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif" required></label>
      <label>긴 변의 최대 길이(px)<input name="bound" type="number" min="1" max="4096" value="1600" required></label>
      <label>저장 형식<select name="format"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>
      <label>JPG·WebP 품질(%)<input name="quality" type="number" min="1" max="100" value="85" required></label>
    </div><p class="note">브라우저가 읽을 수 있는 정지 이미지를 사용하세요. 애니메이션은 한 프레임만 저장하며, PNG에는 품질 설정이 적용되지 않습니다.</p>
    <button type="submit">이미지 변환</button> <a class="button utility-download" hidden>이미지 저장</a>`,
  },
  'character-count': {
    sources: [{ name: 'Bluesky · 게시글 공식 규격', url: 'https://github.com/bluesky-social/bsky/blob/main/lexicons/app/bsky/feed/post.json' }],
    faq: [['이모지는 어떻게 세나요?', '눈으로 읽는 글자 단위로 셉니다. 예를 들어 가족 이모지처럼 여러 코드 포인트가 합쳐진 문자도 한 글자로 셉니다.'],
      ['바이트는 무엇을 기준으로 세나요?', '입력 전체를 UTF-8로 인코딩한 크기입니다. 공백과 줄바꿈도 포함하며 다른 인코딩을 쓰는 서비스와는 다를 수 있습니다.'],
      ['글자 수 제한을 어떻게 확인하나요?', '자기소개서나 게시글에 적힌 제한을 선택하거나 직접 입력하세요. 공백 포함 글자 수를 기준으로 하며 서비스별 계산 방식은 다를 수 있습니다.']],
    html: '<label>텍스트<textarea name="text" rows="7" placeholder="여기에 글을 입력하거나 붙여 넣으세요."></textarea></label><div class="form-grid"><label>목표 글자 수<select name="preset"><option value="">사용하지 않음</option><optgroup label="자기소개서 분량 예시"><option>500</option><option>1000</option><option>1500</option></optgroup><option value="bluesky">Bluesky 게시글 · 300자 / 3,000바이트</option><option value="custom">직접 입력</option></select></label><label>직접 입력 (자)<input type="number" name="target" min="1" max="1000000" disabled></label></div><p class="note">자기소개서 제한은 지원처마다 다릅니다. Bluesky는 글자 수와 UTF-8 바이트 제한을 모두 적용합니다. 다른 SNS는 직접 입력을 사용하세요.</p>',
  },
  age: {
    faq: [['만 나이는 언제 한 살 늘어나나요?', '출생일에 0세이며 생일마다 한 살 늘어납니다. 이 도구는 2월 29일생의 평년 기준에서는 3월 1일부터 한 살을 더합니다.'],
      ['모든 나이 제한에 만 나이를 적용하나요?', '민법과 행정기본법의 일반 원칙입니다. 개별 법령에 별도 기준이 있으면 해당 법령이 우선합니다.']],
    sources: [
      { name: '국가법령정보센터 · 민법 제158조 (나이의 계산과 표시)', url: 'https://www.law.go.kr/법령/민법/제158조', effective: '2023-06-28' },
      { name: '국가법령정보센터 · 민법 제160조 (역에 의한 계산)', url: 'https://www.law.go.kr/법령/민법/제160조' },
      { name: '국가법령정보센터 · 행정기본법 제7조의2', url: 'https://www.law.go.kr/법령/행정기본법/제7조의2', effective: '2023-06-28' },
    ],
    html: `<div class="form-grid">${dateInput('birth', '생년월일')}${dateInput('reference', '기준일')}</div><button type="submit">만 나이 계산</button>`,
  },
  'date-difference': {
    faq: [['디데이는 어떻게 표시하나요?', '기준일과 목표일이 같으면 D-day, 목표일이 남았으면 D-숫자, 지났으면 D+숫자로 표시합니다.'],
      ['시차나 영업일도 반영하나요?', '시간대·시각을 제외한 달력 날짜 차이입니다. 주말과 공휴일도 날짜 차이에 포함합니다.']],
    html: `<div class="form-grid">${dateInput('reference', '기준일')}${dateInput('target', '목표일')}</div><button type="submit">날짜 차이 계산</button>`,
  },
  'area-converter': {
    faq: [['1평은 몇 제곱미터인가요?', '1평은 400/121㎡, 약 3.3058㎡입니다. 계산에는 반올림하지 않은 비율을 사용합니다.'],
      ['전용면적과 공급면적을 바꾸나요?', '아니요. 같은 면적의 단위만 바꾸므로 공용면적을 더하거나 빼지 않습니다. 법정계량단위는 제곱미터입니다.']],
    sources: [{ name: '대한민국 정책브리핑 · 평의 환산과 법정계량단위', url: 'https://www.korea.kr/briefing/policyBriefingView.do?newsId=148628433' }],
    html: `<div class="form-grid"><label>면적<input name="area" type="number" min="0" max="${maxArea}" step="any" value="84" required></label><label>입력 단위<select name="unit"><option value="m2">제곱미터(㎡)</option><option value="pyeong">평</option></select></label></div><button type="submit">면적 환산</button>`,
  },
};

export function utilityPages(config) {
  const cards = (items, prefix) => `<div class="sitemap-grid">${items.map(({ name, path, description }) =>
    `<article class="sitemap-card"><h2><a href="${prefix}${path}">${name}</a></h2><p>${description}</p></article>`).join('')}</div>`;
  const hub = layout({
    config, root: '../', path: 'tools/', title: `글쓰기·사진 편집·생활 도구 | ${brand}`, description: toolIntro, localOnly: true,
    main: `<h1>도구</h1><p class="intro">${toolIntro}</p>${cards(utilityGroups, '../')}`,
  });
  const groups = utilityGroups.map(({ name, path, description }) => ({ path, html: layout({
    config, root, path, title: `${name} 도구 모음 | ${brand}`, description, localOnly: true,
    main: `<p class="eyebrow"><a href="${root}tools/">도구</a></p><h1>${name}</h1><p class="intro">${description}</p>
    ${cards(utilitySections.filter(({ group }) => group === name), root)}`,
  }) }));
  return [{ path: 'tools/', html: hub }, ...groups, ...utilitySections.map(({ name, path, description, group }) => {
    const id = path.split('/')[1];
    const { html, faq, sources } = forms[id] ?? extraUtilityForms[id];
    const embedded = id === 'background-removal';
    const parent = utilityGroups.find((item) => item.name === group);
    const main = `<p class="eyebrow"><a href="${root}tools/">도구</a> · <a href="${root}${parent.path}">${group}</a></p><h1>${name}</h1><p class="intro">${description}</p>
    ${embedded ? html : `<section class="panel"><form data-utility="${id}">${html}
      <output class="utility-result" aria-live="polite"></output></form></section>`}
    ${sources ? `<section class="panel"><h2>공식 자료</h2>${sourcesHTML(sources)}</section>` : ''}
    ${faqHTML(faq)}`;
    return { path, html: layout({
      config, root, path, description, title: `${name} | ${brand}`, application: name, faq, localOnly: true,
      script: embedded ? undefined : 'utility-browser.mjs', main,
    }) };
  })];
}
