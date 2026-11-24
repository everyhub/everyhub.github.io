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

function groupLinks(root, { items }, path) {
  return items.map(({ path: child, name }) => `<li>${link(root, child, name, path)}</li>`).join('');
}

export function siteTree(root, path) {
  const example = [...examplePages, ...medianPages, ...housingExamples].find((item) => item.path === path);
  const utility = utilitySections.find((item) => item.path === path);
  const parent = example ? toolPath(example.id) : path.startsWith('salary/') ? salaryCalculatorPath
    : utility ? utilityGroups.find((group) => group.name === utility.group).path : path;
  const hub = path === 'tax/' ? 'pay/' : path === 'living/' ? 'info/' : path;
  return `<ul class="site-tree">${navigationGroups.map((group) => {
    const active = group.path === hub || group.items.some((item) => item.path === parent);
    return `<li><details${active ? ' open' : ''}><summary>${group.name}</summary><ul>
      <li>${link(root, group.path, `${group.name} 전체 보기`, path)}</li>${groupLinks(root, group, path)}</ul></details></li>`;
  }).join('')}</ul>`;
}

export function sitemapDirectory(root) {
  return `<div class="sitemap-grid">${navigationGroups.map((group) => `<section class="sitemap-card">
    <h2>${link(root, group.path, group.name, '')}</h2><ul>${groupLinks(root, group, '')}</ul></section>`).join('')}</div>`;
}
