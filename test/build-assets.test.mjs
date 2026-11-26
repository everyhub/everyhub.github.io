import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fingerprintAssets } from '../build-assets.mjs';

const base = 'https://example.com/everyhub/';
const version = (content) => createHash('sha256').update(content).digest('hex').slice(0, 16);

test('배포 HTML의 로컬 자산에만 내용 기반 버전을 붙인다', () => {
  const files = new Map([
    ['assets/style.css', Buffer.from('body { color: green; }')],
    ['assets/brand/tree.svg', Buffer.from('<svg/>')],
    ['assets/background-removal/app.js', Buffer.from('console.log(1)')],
    ['assets/brand/site.webmanifest', Buffer.from('{"icons":[{"src":"tree.svg"}]}')],
  ]);
  const { contents, html } = fingerprintAssets(files, base);
  const markup = '<link href="../../assets/style.css"><img src="../../assets/brand/tree.svg?size=2#tree">' +
    '<meta property="og:image" content="https://example.com/everyhub/assets/brand/tree.svg">' +
    '<link href="../../assets/brand/site.webmanifest"><a href="../../tools/">도구</a>' +
    '<a href="../../assets/brand/tree.svg">이미지 근거</a>' +
    '<script src="https://cdn.example.com/assets/style.css"></script>';
  const css = version(files.get('assets/style.css'));
  const image = version(files.get('assets/brand/tree.svg'));
  const manifest = contents.get('assets/brand/site.webmanifest');
  assert.equal(JSON.parse(manifest).icons[0].src, 'tree.svg?v=' + image);
  assert.equal(html(markup, 'info/tree/'),
    `<link href="../../assets/style.css?v=${css}"><img src="../../assets/brand/tree.svg?size=2&amp;v=${image}#tree">` +
    `<meta property="og:image" content="${base}assets/brand/tree.svg?v=${image}">` +
    `<link href="../../assets/brand/site.webmanifest?v=${version(manifest)}"><a href="../../tools/">도구</a>` +
    '<a href="../../assets/brand/tree.svg">이미지 근거</a>' +
    '<script src="https://cdn.example.com/assets/style.css"></script>');
  assert.equal(html('<script src="app.js"></script>', 'assets/background-removal/'),
    `<script src="app.js?v=${version(files.get('assets/background-removal/app.js'))}"></script>`);
});

test('하위 로컬 모듈이 바뀌면 동적 가져오기와 상위 모듈 URL도 바뀐다', () => {
  const entry = 'assets/wish-tree-browser.mjs';
  const middle = 'assets/intermediate.mjs';
  const leaf = 'assets/nested/wish-tree.mjs';
  const files = new Map([
    [entry, "import { load } from './intermediate.mjs';"],
    [middle, "export const load = () => import('./nested/wish-tree.mjs');"],
    [leaf, 'export const wishes = 40;'],
  ]);
  const template = '<script src="./assets/wish-tree-browser.mjs"></script>';
  const before = fingerprintAssets(files, base);
  files.set(leaf, 'export const wishes = 41;');
  const after = fingerprintAssets(files, base);
  assert.equal(after.contents.get(middle), `export const load = () => import('./nested/wish-tree.mjs?v=${version(files.get(leaf))}');`);
  assert.equal(after.contents.get(entry), `import { load } from './intermediate.mjs?v=${version(after.contents.get(middle))}';`);
  assert.notEqual(before.html(template, ''), after.html(template, ''));
  assert.equal(after.html(template, ''), `<script src="./assets/wish-tree-browser.mjs?v=${version(after.contents.get(entry))}"></script>`);
});
