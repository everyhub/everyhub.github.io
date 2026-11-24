import { newsFeeds, newsSections } from './news-config.mjs';
import { escape, layout } from './pages.mjs';
import { brand } from './tool-specs.mjs';

const stamp = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' });
const newsIntro = '국내외 IT와 AI 소식, 커뮤니티 인기 글을 분야별로 모았습니다. 제목과 출처가 제공한 짧은 소개만 표시하며, 글 전문은 원문에서 읽을 수 있습니다.';

function cards(root, active) {
  return `<ul class="tag-list">${newsSections.map(({ path, name }) =>
    `<li><a href="${root}${path}"${active === path ? ' aria-current="page"' : ''}>${name}</a></li>`).join('')}</ul>`;
}

function topicPage(config, section, news) {
  const root = '../../';
  const sources = newsFeeds.filter(({ section: path }) => path === section.path);
  const items = sources.flatMap(({ id, name, featured }) => (news[id] ?? []).map((item) => ({ ...item, id, name, featured })));
  if (section.path !== 'news/trending/') items.sort((first, second) => second.date.localeCompare(first.date));
  const featuredIndex = items.findIndex(({ featured }) => featured);
  if (featuredIndex > 0) items.unshift(...items.splice(featuredIndex, 1));
  const available = sources.filter(({ id }) => items.some((item) => item.id === id));
  const filters = available.length > 1 ? `<div class="news-filters" role="group" aria-label="출처 필터" hidden>
    <button type="button" data-news-filter="" aria-pressed="true">전체 출처</button>${available.map(({ id, name }) =>
      `<button type="button" data-news-filter="${escape(id)}" aria-pressed="false">${escape(name)}</button>`).join('')}</div>` : '';
  const list = items.map(({ id, title, url, name, date, summary }) => `<article class="panel" data-news-source="${escape(id)}">
    <span class="eyebrow">${escape(name)} · <time datetime="${escape(date)}">${escape(stamp.format(new Date(date)))}</time> (한국시간)</span>
    <h2><a href="${escape(url)}">${escape(title)}</a></h2>
    ${summary ? `<p>${escape(summary)}</p>` : ''}
  </article>`).join('');
  return layout({
    config, root, path: section.path, title: `${section.name} 소식 | ${brand}`, description: section.description,
    script: filters ? 'news-browser.mjs' : undefined,
    main: `<p class="eyebrow"><a href="${root}news/">IT·AI 소식</a></p><h1>${section.name} 소식</h1>
    <p class="intro">${section.description}</p>${cards(root, section.path)}
    <p class="note">30분 간격으로 원본 피드를 확인합니다. 예약 실행이 지연될 수 있으며, 수집에 실패하면 마지막으로 확보한 목록을 유지합니다.</p>
    ${filters}${list || '<p class="panel">아직 수집한 글이 없습니다. 아래 출처에서 최신 소식을 직접 확인할 수 있습니다.</p>'}
    <section class="panel"><h2>출처</h2><ul>${sources.map(({ name, url }) => `<li><a href="${escape(url)}">${escape(name)} 공식 피드</a></li>`).join('')}</ul></section>`,
  });
}

export function newsPages(config, news = {}) {
  const root = '../';
  return [
    { path: 'news/', html: layout({
      config, root, path: 'news/', title: `국내외 IT·AI 소식과 핫이슈 | ${brand}`, description: newsIntro,
      main: `<h1>IT·AI 소식</h1><p class="intro">${newsIntro}</p>
      <section class="panel"><h2>분야별 소식</h2>${newsSections.map(({ path, name, description }) =>
        `<h3><a href="${root}${path}">${name}</a></h3><p>${description}</p>`).join('')}</section>
      <section class="panel"><h2>수집 방식</h2><p>발행처 공식 RSS·Atom 또는 공식 API만 사용합니다. 예약 빌드는 30분 간격으로 변경 여부를 확인하며, 글이 바뀌었을 때만 소식 배포를 진행합니다.</p></section>`,
    }) },
    ...newsSections.map((section) => ({ path: section.path, html: topicPage(config, section, news) })),
  ];
}
