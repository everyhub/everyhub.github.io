import { newsFeeds } from './news-config.mjs';

const knownEntities = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: ' ' };
const decode = (value) => value.replace(/&(#x[\da-f]+|#\d+|amp|apos|quot|lt|gt|nbsp);/gi, (entity, name) => {
  if (name[0] !== '#') return knownEntities[name.toLowerCase()];
  const point = name[1].toLowerCase() === 'x' ? Number.parseInt(name.slice(2), 16) : Number(name.slice(1));
  return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
});
const unwrap = (value) => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
const plain = (value) => decode(unwrap(value)).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const excerpt = (value) => {
  const characters = Array.from(value);
  return characters.length > 150 ? `${characters.slice(0, 150).join('').trimEnd()}…` : value;
};
const field = (entry, name) => entry.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] ?? '';

function normalize(item) {
  if (!item || typeof item !== 'object') return null;
  const { title, url, date, summary = '' } = item;
  if (typeof title !== 'string' || typeof url !== 'string' || typeof date !== 'string') return null;
  try {
    const href = new URL(url);
    if (!title || href.protocol !== 'https:' || href.username || href.password) return null;
    return { title, url: href.href, date: new Date(date).toISOString(), summary: typeof summary === 'string' ? summary : '' };
  } catch {
    return null;
  }
}

export function parseFeed(xml) {
  if (!/<(?:rss|feed)\b/i.test(xml)) throw new Error('지원하는 RSS/Atom 문서가 아닙니다.');
  const items = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].slice(0, 30);
  const results = items.map(([, type, entry]) => {
    const atom = type.toLowerCase() === 'entry';
    const anchor = atom ? [...entry.matchAll(/<link\b[^>]*>/gi)].find(([tag]) => !/\brel\s*=/.test(tag) || /\brel\s*=\s*["']alternate["']/i.test(tag))?.[0] : null;
    const href = atom ? anchor?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] ?? '' : field(entry, 'link');
    return normalize({
      title: plain(field(entry, 'title')),
      url: decode(unwrap(href)).trim(),
      date: plain(atom ? field(entry, 'published') || field(entry, 'updated') : field(entry, 'pubDate') || field(entry, 'dc:date')),
      summary: excerpt(plain(field(entry, atom ? 'summary' : 'description'))),
    });
  }).filter(Boolean);
  if (!results.length) throw new Error('사용 가능한 게시물이 없습니다.');
  return [...new Map(results.map((item) => [item.url, item])).values()].slice(0, 8);
}

async function request(url, fetcher) {
  return fetcher(url, { signal: AbortSignal.timeout(10_000), headers: { 'User-Agent': 'Everyhub-Public-Feed-Reader/1.0' } });
}

async function fetchFeed(feed, fetcher) {
  const response = await request(feed.url, fetcher);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (feed.format !== 'hn') {
    const body = await response.text();
    if (body.length > 2_000_000) throw new Error('RSS 응답이 너무 큽니다.');
    return parseFeed(body);
  }
  const ids = (await response.json()).filter(Number.isSafeInteger).slice(0, 12);
  const results = await Promise.all(ids.map(async (id) => {
    const result = await request(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, fetcher);
    if (!result.ok) throw new Error(`HTTP ${result.status}`);
    const item = await result.json();
    if (!item || item.type !== 'story' || item.dead || item.deleted || !Number.isFinite(item.time)) return null;
    return normalize({
      title: plain(item.title ?? ''),
      url: `https://news.ycombinator.com/item?id=${id}`,
      date: new Date(item.time * 1_000).toISOString(),
    });
  }));
  const items = results.filter(Boolean).slice(0, 8);
  if (!items.length) throw new Error('사용 가능한 게시물이 없습니다.');
  return items;
}

export async function readNewsSnapshot(base, fetcher = fetch) {
  const response = await request(new URL('news-data.json', base), fetcher);
  if (response.status === 404) return { feeds: {} };
  if (!response.ok) throw new Error(`이전 소식 스냅샷을 읽을 수 없습니다: HTTP ${response.status}`);
  const data = await response.json();
  if (!data || data.version !== 1 || !data.feeds || Array.isArray(data.feeds) || typeof data.feeds !== 'object') {
    throw new Error('이전 소식 스냅샷 형식이 올바르지 않습니다.');
  }
  return data;
}

export async function refreshNews(previous, { feeds = newsFeeds, fetcher = fetch } = {}) {
  const results = await Promise.all(feeds.map(async (feed) => {
    const cached = (Array.isArray(previous[feed.id]) ? previous[feed.id] : []).map(normalize).filter(Boolean);
    try {
      return { id: feed.id, items: await fetchFeed(feed, fetcher), cached };
    } catch (error) {
      return { id: feed.id, items: cached, cached, error: error.message };
    }
  }));
  return {
    feeds: Object.fromEntries(results.map(({ id, items }) => [id, items])),
    changed: results.some(({ items, cached }) => JSON.stringify(items) !== JSON.stringify(cached)),
    failures: results.filter(({ error }) => error),
  };
}
