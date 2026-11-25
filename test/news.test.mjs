import assert from 'node:assert/strict';
import test from 'node:test';
import { newsPages } from '../src/news-pages.mjs';
import { parseFeed, readNewsSnapshot, refreshNews } from '../src/news.mjs';

const rss = `<rss><channel><item><title>IT &amp; AI</title>
  <link>https://example.com/post?a=1&amp;b=2</link><pubDate>Tue, 24 Nov 2026 01:00:00 GMT</pubDate>
  <description><![CDATA[<p>짧은 소개</p>]]></description><content:encoded>전문 제외</content:encoded>
  </item></channel></rss>`;
const feed = { id: 'test', url: 'https://example.com/rss' };
const item = { title: 'IT & AI', url: 'https://example.com/post?a=1&b=2', date: '2026-11-24T01:00:00.000Z', summary: '짧은 소개' };

test('RSS·Atom의 제목·링크·시각·소개만 읽고 잘못된 피드를 거부한다', () => {
  assert.deepEqual(parseFeed(rss), [item]);
  const atom = '<feed><entry><title>새 소식</title><link rel="self" href="https://example.com/feed"/><link rel="alternate" href="https://example.com/story"/><updated>2026-11-24T01:00:00Z</updated><summary>소개</summary></entry></feed>';
  assert.deepEqual(parseFeed(atom), [{ ...item, title: '새 소식', url: 'https://example.com/story', summary: '소개' }]);
  assert.throws(() => parseFeed('<html>feed unavailable</html>'));
  assert.throws(() => parseFeed(rss.replace('https://example.com/', 'javascript:')));
});

test('동일한 피드는 변경 없음, 실패한 피드는 캐시 유지, 바뀐 피드만 교체', async () => {
  const previous = { test: [item], outage: [item] };
  const feeds = [feed, { id: 'outage', url: 'https://example.com/down' }];
  const fetcher = (url) => url === feed.url ? new Response(rss) : new Response(null, { status: 503 });
  const unchanged = await refreshNews(previous, { feeds, fetcher });
  assert.equal(unchanged.changed, false);
  assert.deepEqual(unchanged.feeds, previous);
  assert.equal(unchanged.failures[0].id, 'outage');
  const changed = await refreshNews(previous, { feeds, fetcher: (url) =>
    url === feed.url ? new Response(rss.replace('IT &amp; AI', '업데이트')) : fetcher(url) });
  assert.equal(changed.changed, true);
  assert.equal(changed.feeds.test[0].title, '업데이트');
  assert.deepEqual(changed.feeds.outage, [item]);
});

test('과기정통부 보도자료는 원문에서 공공누리 1유형을 확인한 제목과 날짜만 제공한다', async () => {
  const msit = { ...feed, format: 'msit' };
  const article = 'https://www.msit.go.kr/bbs/view.do?bbsSeqNo=94&nttSeqNo=';
  const entry = (url) => rss.match(/<item>.*?<\/item>/s)[0]
    .replace(/<link>.*?<\/link>/, `<link>${url.replaceAll('&', '&amp;')}</link>`)
    .replace(/<pubDate>.*?<\/pubDate>/, '<pubDate>2026.11.24</pubDate>');
  const called = [];
  const result = await refreshNews({}, { feeds: [msit], fetcher: (url) => {
    called.push(String(url));
    if (url === msit.url) return new Response(`<rss><channel>${entry(article + 1)}${entry(article + 2)}${entry(item.url)}</channel></rss>`);
    return new Response(`<div class="open_mark"><img src='/images/user/nuri-img0${String(url).endsWith('1') ? '1' : '2'}.jpg'></div>`);
  } });
  assert.deepEqual(called, [msit.url, article + 1, article + 2]);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.feeds.test, [{ ...item, url: article + 1, date: '2026-11-23T15:00:00.000Z', summary: '' }]);
  const { html } = newsPages({ baseURL: 'https://example.com/' }, { msit: result.feeds.test }).find(({ path }) => path === 'news/korea/');
  assert.match(html, /과학기술정보통신부 · <time[^>]*>2026\. 11\. 24\.<\/time>/);
  assert.doesNotMatch(html, /짧은 소개|전문 제외/);
});

test('피드 요청 시간이 초과되면 한 번 다시 시도한다', async () => {
  let calls = 0;
  const result = await refreshNews({}, { feeds: [feed], fetcher: () => {
    if (!calls++) throw new DOMException('time limit', 'TimeoutError');
    return new Response(rss);
  } });
  assert.equal(calls, 2);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.feeds.test, [item]);
});

test('Hacker News 공식 API 인기순과 글 링크를 사용하고 본문을 제외한다', async () => {
  const hn = { id: 'hn', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', format: 'hn' };
  const bodies = {
    [hn.url]: [8, 2, 4],
    'https://hacker-news.firebaseio.com/v0/item/8.json': { type: 'story', title: '첫 번째', time: 1, text: '본문' },
    'https://hacker-news.firebaseio.com/v0/item/2.json': { type: 'story', title: '삭제됨', time: 2, deleted: true },
    'https://hacker-news.firebaseio.com/v0/item/4.json': { type: 'story', title: '두 번째', time: 3 },
  };
  const result = await refreshNews({}, { feeds: [hn], fetcher: (url) => Response.json(bodies[url]) });
  assert.equal(result.changed, true);
  assert.deepEqual(result.feeds.hn.map(({ url, summary }) => [url, summary]), [
    ['https://news.ycombinator.com/item?id=8', ''], ['https://news.ycombinator.com/item?id=4', ''],
  ]);
});

test('배포된 스냅샷은 하위 경로를 지원하고 초기 404 외 오류로 덮어쓰지 않는다', async () => {
  const base = 'https://example.com/subpath/';
  const snapshot = { version: 1, revision: 'release', feeds: { test: [item] } };
  assert.deepEqual(await readNewsSnapshot(base, (url) => {
    assert.equal(url.href, `${base}news-data.json`);
    return Response.json(snapshot);
  }), snapshot);
  assert.deepEqual(await readNewsSnapshot(base, () => new Response(null, { status: 404 })), { feeds: {} });
  await assert.rejects(readNewsSnapshot(base, () => new Response(null, { status: 503 })), /HTTP 503/);
  await assert.rejects(readNewsSnapshot(base, () => Response.json({ version: 1, feeds: null })), /형식/);
});

test('소식 페이지는 출처와 한국시간을 표시하고 제목을 이스케이프한다', () => {
  const pages = newsPages({ baseURL: 'https://example.com/subpath/' }, {
    naver: [{ ...item, title: '<script>NEWS</script>' }],
  });
  assert.equal(pages.length, 5);
  const { html } = pages.find(({ path }) => path === 'news/korea/');
  assert.match(html, /&lt;script&gt;NEWS&lt;\/script&gt;/);
  assert.match(html, /네이버 D2 · <time datetime="2026-11-24T01:00:00.000Z"/);
  assert.match(html, /한국시간/);
  assert.match(html, /30분마다 확인하는 것을 목표로 합니다\. 예약 실행이 지연되거나 누락될 수 있으며/);
  assert.match(html, /rel="canonical" href="https:\/\/example.com\/subpath\/news\/korea\/"/);
});

test('국내 IT는 긱뉴스를 먼저 표시하고 게시물이 있는 출처만 필터링할 수 있다', () => {
  const { html } = newsPages({ baseURL: 'https://example.com/' }, {
    geeknews: [{ ...item, title: '긱뉴스 추천 글', date: '2026-11-23T01:00:00.000Z' }],
    naver: [item],
  }).find(({ path }) => path === 'news/korea/');
  assert.match(html, /news-browser\.mjs/);
  assert.match(html, /data-news-filter="" aria-pressed="true"/);
  assert.match(html, /data-news-filter="geeknews"/);
  assert.match(html, /data-news-filter="naver"/);
  assert.doesNotMatch(html, /data-news-filter="toss"/);
  assert.deepEqual([...html.matchAll(/data-news-source="([^"]+)"/g)].map(([, id]) => id), ['geeknews', 'naver']);
});
