import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from './site.config.mjs';
import { homePage, salaries, salaryPage, salaryPath } from './src/pages.mjs';
import { extraPages } from './src/labor-pages.mjs';

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

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'assets'), { recursive: true });
await Promise.all(['style.css', 'browser.mjs', 'calculator.mjs', 'display.mjs', 'rates.mjs', 'withholding-table.mjs',
  'labor-browser.mjs', 'labor.mjs', 'labor-rates.mjs', 'tool-specs.mjs']
  .map((name) => copyFile(join(source, name), join(dist, 'assets', name))));
await writeFile(join(dist, 'index.html'), homePage(config));
await Promise.all(salaries.map(async (salary, index) => {
  const folder = join(dist, salaryPath(salary));
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'index.html'), salaryPage(config, salary, index));
}));

const additional = extraPages(config);
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
await writeFile(join(dist, '.nojekyll'), '');
console.log(`Built ${paths.length} HTML pages (${salaries.length} salary pages) in dist/`);
