import { appendFile, copyFile, cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from './site.config.mjs';
import { homePage, salaries, salaryCalculatorPage, salaryPage, salaryPath } from './src/pages.mjs';
import { salaryCalculatorPath } from './src/navigation.mjs';
import { extraPages } from './src/labor-pages.mjs';
import { readNewsSnapshot, refreshNews } from './src/news.mjs';
import { newsPages } from './src/news-pages.mjs';
import { informationPages } from './src/information-pages.mjs';
import { utilityPages } from './src/utility-pages.mjs';
import { adminPath, adminTimelinePage } from './src/admin-pages.mjs';

const dist = fileURLToPath(new URL('./dist/', import.meta.url));
const source = fileURLToPath(new URL('./src/', import.meta.url));
const baseURL = new URL(site.baseURL);
if (!['http:', 'https:'].includes(baseURL.protocol) || baseURL.username || baseURL.password || baseURL.search || baseURL.hash) {
  throw new Error('SITE_URL은 쿼리·해시 없는 HTTP(S) 사이트 URL이어야 합니다.');
}
if (!baseURL.pathname.endsWith('/')) baseURL.pathname += '/';
const config = { ...site, baseURL: baseURL.href };
const sitemapURL = new URL('sitemap.xml', baseURL);
const xmlEscape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const signalBuild = async (value) => {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `publish=${value}\n`);
};
let news = {};
const revision = process.env.GITHUB_SHA;
if (process.env.NEWS_REFRESH === '1') {
  const previous = await readNewsSnapshot(baseURL);
  const result = await refreshNews(previous.feeds);
  news = result.feeds;
  for (const { id, error, cached } of result.failures) console.warn(`News feed ${id}: ${error}; retaining ${cached.length} cached items`);
  const items = Object.values(news).reduce((count, feed) => count + feed.length, 0);
  console.log(`News: ${items} items, ${result.failures.length} feed failures, changed=${result.changed}`);
  if (process.env.NEWS_SKIP_UNCHANGED === '1' && !result.changed && revision === previous.revision) {
    await signalBuild(false);
    console.log('News unchanged; skipping Pages artifact and deployment.');
    process.exit(0);
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'assets'), { recursive: true });
await Promise.all(['style.css', 'browser.mjs', 'calculator.mjs', 'display.mjs', 'rates.mjs', 'withholding-table.mjs',
  'labor-browser.mjs', 'labor.mjs', 'labor-rates.mjs', 'tool-specs.mjs',
  'guide-specs.mjs', 'guides.mjs', 'guide-rates.mjs', 'housing-specs.mjs', 'housing.mjs', 'housing-rates.mjs',
  'navigation-browser.mjs', 'convenience-browser.mjs', 'information.mjs', 'utility.mjs', 'utility-extra.mjs', 'utility-browser.mjs', 'utility-files.mjs']
  .map((name) => copyFile(join(source, name), join(dist, 'assets', name))));
await cp(join(source, 'background-removal'), join(dist, 'assets', 'background-removal'), { recursive: true });
await cp(join(source, 'utility-vendor'), join(dist, 'assets', 'utility-vendor'), { recursive: true });
await writeFile(join(dist, 'index.html'), homePage(config));
{
  const folder = join(dist, adminPath);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'index.html'), adminTimelinePage(config));
}
await Promise.all(salaries.map(async (salary, index) => {
  const folder = join(dist, salaryPath(salary));
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'index.html'), salaryPage(config, salary, index));
}));

const additional = [{ path: salaryCalculatorPath, html: salaryCalculatorPage(config) },
  ...extraPages(config), ...newsPages(config, news), ...informationPages(config), ...utilityPages(config)];
await Promise.all(additional.map(async ({ path, html }) => {
  const folder = join(dist, path);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'index.html'), html);
}));

const paths = ['', ...salaries.map(salaryPath), ...additional.map(({ path }) => path)];
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${xmlEscape(new URL(path, baseURL).href)}</loc></url>`).join('\n')}
</urlset>
`);
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: ${baseURL.pathname}\nSitemap: ${sitemapURL.href}\n`);
await writeFile(join(dist, 'news-data.json'), JSON.stringify({ version: 1, revision, feeds: news }));
await writeFile(join(dist, '.nojekyll'), '');
await signalBuild(true);
console.log(`Built ${paths.length} HTML pages (${salaries.length} salary pages) in dist/`);
