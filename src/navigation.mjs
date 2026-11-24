import { salaryName, won } from './display.mjs';
import { laborRates } from './labor-rates.mjs';
import { categories, toolPath, tools } from './tool-specs.mjs';
import { informationSections } from './information.mjs';
import { newsSections } from './news-config.mjs';
import { utilitySections } from './utility-config.mjs';
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

const keyPaths = ['hourly/10320/', 'hourly/10700/', 'hourly/12000/', 'severance/4000/', 'severance/5000/',
  'median-income/2026/1/', 'median-income/2027/1/', 'median-income/2027/4/',
  ...housingExamples.map(({ path }) => path)];

function link(root, path, title, current) {
  return `<a href="${root}${path}"${path === current ? ' aria-current="page"' : ''}>${title}</a>`;
}

export function siteTree(root, path, { full = false, salaries = [] } = {}) {
  const examples = [...examplePages, ...medianPages, ...housingExamples];
  const directory = (group, name, pages) => `<li>${link(root, group, name, path)}<ul>
    ${pages.map(({ path: childPath, name: childName }) => `<li>${link(root, childPath, childName, path)}</li>`).join('')}</ul></li>`;
  return `<ul class="site-tree">${categories.map(({ id, title }) => `<li>
    ${link(root, `${id}/`, title, path)}<ul>
    ${id === 'pay' ? `<li>${link(root, salaryCalculatorPath, '연봉 실수령액 계산기', path)}<ul>
      ${(full ? salaries : [3_000, 4_000, 5_000]).map((salary) => `<li>${link(root, `salary/${salary}/`, `연봉 ${salaryName(salary)} 실수령액`, path)}</li>`).join('')}
    </ul></li>` : ''}
    ${groupedTools(id).map(([toolId, tool]) => {
      const related = examples.filter((example) => example.id === toolId && (full || keyPaths.includes(example.path) || path === example.path));
      return `<li>${link(root, toolPath(toolId), tool.name, path)}${related.length
        ? `<ul>${related.map((example) => `<li>${link(root, example.path, example.title, path)}</li>`).join('')}</ul>` : ''}</li>`;
    }).join('')}
    </ul></li>`).join('')}
    ${directory('news/', 'IT·AI 소식', newsSections)}${directory('info/', '생활 정보', informationSections)}
    ${directory('tools/', '도구', utilitySections)}</ul>`;
}
