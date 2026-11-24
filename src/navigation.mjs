import { salaryName, won } from './display.mjs';
import { laborRates } from './labor-rates.mjs';
import { categories, toolPath, tools } from './tool-specs.mjs';
import { informationSections } from './information.mjs';
import { newsSections } from './news-config.mjs';
import { utilityGroups, utilitySections } from './utility-config.mjs';
import { housingExamples } from './housing-examples.mjs';

export const salaryCalculatorPath = 'tools/salary-calculator/';

export const examplePages = [
  ...[10_000, ...laborRates.minimum.map(({ hourly }) => hourly), 11_000, 12_000, 13_000, 14_000, 15_000, 16_000, 18_000, 20_000, 25_000, 30_000]
    .map((amount) => ({ id: 'wage-converter', path: `hourly/${amount}/`, amount, title: `시급 ${won(amount)} 월급·연봉` })),
  ...[2_400, 3_000, 3_500, 4_000, 4_500, 5_000, 6_000, 7_000, 8_000, 9_000, 10_000, 15_000]
    .map((amount) => ({ id: 'severance-pay', path: `severance/${amount}/`, amount, title: `연봉 ${salaryName(amount)} 퇴직금` })),
];

export const medianPages = [2026, 2027].flatMap((year) =>
  Array.from({ length: 7 }, (_, i) => ({
    id: 'median-income', path: `median-income/${year}/${i + 1}/`, year, size: i + 1,
    title: `${year}년 ${i + 1}인 가구 기준 중위소득`,
  })));

export const groupedTools = (category) => Object.entries(tools).filter(([, tool]) => tool.category === category);

const entries = (category) => groupedTools(category).map(([id, { name }]) => ({ path: toolPath(id), name }));
export const navigationGroups = [
  ...categories.filter(({ id }) => id !== 'tax' && id !== 'living').map(({ id, title }) => ({
    path: `${id}/`, name: title,
    items: id === 'pay'
      ? [{ path: salaryCalculatorPath, name: '연봉 실수령액 계산기' }, ...entries(id), ...entries('tax')]
      : entries(id),
  })),
  { path: 'tools/', name: '도구', items: utilityGroups },
  { path: 'news/', name: 'IT·AI 소식', items: newsSections },
  { path: 'info/', name: '생활 정보·복지', items: [...informationSections, ...entries('living')] },
];

function link(root, path, title, current) {
  return `<a href="${root}${path}"${path === current ? ' aria-current="page"' : ''}>${title}</a>`;
}

const iconPaths = {
  'pay/': 'M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5',
  'hours/': 'M12 5v7l4 3 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  'separation/': 'M4 7h16v12H4z M8 7V5h8v2',
  'leave/': 'M12 20S5 16 5 10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 10-7 10',
  'tools/': 'M14 6l4-4 4 4-4 4 M18 2l-8 8 M4 20h4l9-9-4-4-9 9v4',
  'news/': 'M4 5h16v14H4z M7 9h10 M7 13h7 M7 17h4',
  'info/': 'M12 3l9 5-9 5-9-5 9-5 M5 11v5l7 4 7-4v-5',
};

function icon(path) {
  return `<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${iconPaths[path] ?? 'M4 5h16v14H4z M8 9h8 M8 13h5'}"></path></svg>`;
}

function groupLinks(root, { items }, path, parent) {
  return items.map(({ path: child, name }) => `<li>${link(root, child, name, path === child ? path : parent)}</li>`).join('');
}

export function siteTree(root, path) {
  const example = [...examplePages, ...medianPages, ...housingExamples].find((item) => item.path === path);
  const utility = utilitySections.find((item) => item.path === path);
  const parent = example ? toolPath(example.id) : path.startsWith('salary/') ? salaryCalculatorPath
    : utility ? utilityGroups.find((group) => group.name === utility.group).path : path;
  const hub = path === 'tax/' ? 'pay/' : path === 'living/' ? 'info/' : path;
  return `<ul class="site-tree">${navigationGroups.map((group) => {
    const active = group.path === hub || group.items.some((item) => item.path === parent);
    return `<li class="nav-category${active ? ' nav-ancestor' : ''}"><details${active ? ' open' : ''}><summary><span class="nav-summary">${icon(group.path)}<span>${group.name}</span></span></summary><ul>
      <li>${link(root, group.path, `${group.name} 전체 보기`, path === group.path ? path : parent)}</li>${groupLinks(root, group, path, parent)}</ul></details></li>`;
  }).join('')}</ul><p class="sidebar-footer"><a href="${root}sitemap/">전체 사이트맵</a></p>`;
}

export function sitemapDirectory(root) {
  return `<div class="sitemap-grid">${navigationGroups.map((group) => `<section class="sitemap-card">
    <h2>${link(root, group.path, group.name, '')}</h2><ul>${groupLinks(root, group, '')}</ul></section>`).join('')}</div>`;
}
