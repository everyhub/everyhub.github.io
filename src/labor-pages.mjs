import { rates, sources as payrollSources } from './rates.mjs';
import { laborRates, verifiedOn } from './labor-rates.mjs';
import { brand, categories, defaultsFor, toolPath, tools } from './tool-specs.mjs';
import { ad, escape, faqHTML, layout, sourcesHTML } from './pages.mjs';
import { formatNumber, salaryName, won } from './display.mjs';
import { severancePay, wageConversion } from './labor.mjs';
import { medianIncome } from './guides.mjs';
import { examplePages, groupedTools, medianPages, moveInGuide, salaryCalculatorPath, sitemapDirectory } from './navigation.mjs';
import { housingExamples } from './housing-examples.mjs';
import { moveInPage } from './move-in-page.mjs';

const examples = [...examplePages, ...medianPages, ...housingExamples];
const toolLink = (root, id) => `<a href="${root}${toolPath(id)}">${tools[id].name}</a>`;
const exampleLink = (root, example) => `<a href="${root}${example.path}">${example.title}</a>`;
const review = `공식 자료 확인 <time datetime="${verifiedOn}">${verifiedOn}</time>`;

const featuredPaths = new Set(['hourly/10320/', 'hourly/10700/', 'hourly/12000/', 'severance/3000/', 'severance/4000/', 'severance/5000/',
  'median-income/2026/1/', 'median-income/2027/1/', 'median-income/2027/4/']);

function exampleLinks(root, id) {
  const matches = examples.filter((example) => example.id === id);
  if (!matches.length) return '';
  const list = (items) => `<ul class="tag-list">${items.map((example) => `<li>${exampleLink(root, example)}</li>`).join('')}</ul>`;
  const featured = matches.length <= 3 ? matches : matches.filter(({ path }) => featuredPaths.has(path));
  return `<section class="panel" aria-labelledby="examples"><h2 id="examples">${id === 'median-income' ? '가구원 수별 바로보기' : '금액별 바로보기'}</h2>
    ${list(featured)}${matches.length > featured.length ? `<details class="example-index"><summary>전체 계산 예시 (${matches.length}개)</summary>${list(matches)}</details>` : ''}</section>`;
}

function categoryPage(config, category) {
  const root = '../';
  const members = groupedTools(category.id);
  const faq = members.flatMap(([, tool]) => tool.faq.slice(0, 1));
  return layout({
    config, title: `${category.title} 계산기 | ${brand}`, description: category.description,
    path: `${category.id}/`, root, faq,
    main: `<p class="eyebrow">${rates.year}년 기준 · ${review}</p><h1>${category.title} 계산기</h1>
    <p class="intro">${category.description}</p>
    <section class="panel" aria-labelledby="category-tools"><h2 id="category-tools">계산기 고르기</h2>
    ${category.id === 'pay' ? `<h3><a href="${root}${salaryCalculatorPath}">연봉 실수령액 계산기</a></h3><p>공제항목별 월평균·연간 실수령액과 <a href="${root}${salaryCalculatorPath}#salary-index">연봉별 예시</a>를 비교하세요.</p>` : ''}
    ${members.map(([id, tool]) => `<h3>${toolLink(root, id)}</h3><p>${escape(tool.description)}</p>`).join('')}
    ${category.id === 'housing' ? `<h3><a href="${root}${moveInGuide.path}">${moveInGuide.name}</a></h3><p>이사 전에 신청 순서와 준비물, 공식 접수처를 확인하세요.</p>` : ''}
    ${category.id === 'pay' ? `<h3><a href="${root}tax/">프리랜서·세금 계산기</a></h3><p>원천징수, 종합소득세, 부가가치세와 증여재산공제를 확인하세요.</p>` : ''}</section>
    ${faqHTML(faq)}`,
  });
}

function formField({ key, label, value, min, max, step, options }) {
  const id = `field-${key}`;
  const field = options ? `<select id="${id}">${options.map(([option, title]) => `<option value="${escape(option)}"${option === value ? ' selected' : ''}>${escape(title)}</option>`).join('')}</select>`
    : `<input id="${id}" type="number" inputmode="${step === 1 ? 'numeric' : 'decimal'}" value="${value}" min="${min}" max="${max}" step="${step}" required>`;
  return `<label for="${id}">${escape(label)}${field}</label>`;
}

function toolPage(config, id, tool) {
  const root = '../../';
  const result = tool.calculate(defaultsFor(tool));
  const category = categories.find(({ id }) => id === tool.category);
  const references = [...tool.sources];
  if (tool.payrollSources) references.push(...payrollSources.filter(([name]) => /연금|건강보험|장기요양/.test(name))
    .map(([name, url, effective]) => ({ name, url, effective })));
  return layout({
    config, title: `${tool.name.includes('2026') ? tool.name : `${rates.year}년 ${tool.name}`} | ${brand}`, description: tool.description,
    path: toolPath(id), root, faq: tool.faq, application: tool.name, script: 'labor-browser.mjs',
    main: `<p class="eyebrow"><a href="${root}${category.id}/">${category.title}</a> · ${review}</p>
      <h1>${tool.name}</h1><p class="intro">${escape(tool.description)}</p>
      ${tool.related?.length ? `<ul class="tag-list" aria-label="관련 계산기">${tool.related.map((related) => `<li>${toolLink(root, related)}</li>`).join('')}</ul>` : ''}
      ${id === 'tenancy-renewal-report' ? `<p><a href="${root}${moveInGuide.path}">${moveInGuide.name}</a></p>` : ''}
      <section class="panel" aria-labelledby="tool-calculate"><h2 id="tool-calculate">조건 입력</h2>
        <form id="tool-form" data-tool="${id}"><div class="form-grid">${tool.fields.map(formField).join('')}</div>
          <p><button type="submit">계산하기</button></p>
          <noscript><p>입력에 따른 계산은 자바스크립트가 필요합니다. 현재 기본 예시를 표시합니다.</p></noscript>
        </form>
        <div class="tool-result"><h3>계산 결과</h3><p id="tool-status" role="status">${result.note ? escape(result.note) : ''}</p>
          <dl class="tool-output">${tool.outputs.map(({ key, label, format }) => `<div><dt>${escape(label)}</dt><dd data-result="${key}">${result[key] === undefined ? '표시 대상 아님' : escape(format(result[key]))}</dd></div>`).join('')}</dl>
          ${tool.iterate ? `<ol id="tool-periods" aria-label="개월별 예상 지급액">${result[tool.iterate].map((amount, i) => `<li>${i + 1}개월째 ${won(amount)}</li>`).join('')}</ol>` : ''}
        </div>
        <p class="note">${escape(tool.scope)}</p>
      </section>
      <section class="panel" aria-labelledby="sources"><h2 id="sources">공식 계산 기준</h2>
        ${sourcesHTML(references)}
        <p><a href="${root}${category.id}/">${category.title} 계산기 모아보기</a></p>
      </section>
      ${exampleLinks(root, id)}${faqHTML(tool.faq)}`,
  });
}

function scenarioRows(rows, heading) {
  return `<table class="example-amounts"><caption>${heading}</caption><thead><tr><th scope="col">조건</th><th scope="col">기준</th><th scope="col">예상 금액</th></tr></thead>
    <tbody>${rows.map(([label, basis, amount]) => `<tr><th scope="row">${label}</th><td>${basis}</td><td class="amount">${won(amount)}</td></tr>`).join('')}</tbody></table>`;
}

function hourlyExample(amount) {
  const full = wageConversion({ amount, unit: 'hour', hours: 40, holiday: 'yes' });
  const part = wageConversion({ amount, unit: 'hour', hours: 20, holiday: 'yes' });
  const without = wageConversion({ amount, unit: 'hour', hours: 20, holiday: 'no' });
  const minimum = laborRates.minimum[0].hourly;
  const gap = amount - minimum;
  const status = gap < 0 ? `${won(-gap)} 낮습니다` : gap > 0 ? `${won(gap)} 높습니다` : '같습니다';
  return {
    metric: full.monthly, label: '주 40시간 기준 세전 월급',
    intro: `유급 주휴 8시간이 포함된 월 209시간 기준의 연봉은 ${won(full.yearly)}입니다. 시급만 비교하면 ${rates.year}년 최저시급 ${won(minimum)}${gap ? '보다' : '과'} ${status}.`,
    heading: '주간 근로시간과 주휴에 따른 월급 차이',
    rows: [['주 40시간·주휴 포함', '월 209시간', full.monthly], ['주 20시간·주휴 포함', `월 약 ${formatNumber(Math.round(part.monthlyHours * 10) / 10)}시간`, part.monthly], ['주 20시간·주휴 미포함 비교', `월 약 ${formatNumber(Math.round(without.monthlyHours * 10) / 10)}시간`, without.monthly]],
    note: '20시간 주휴 미포함은 차이 비교용입니다. 실제로 유급주휴 요건을 충족하면 누락하지 않아야 합니다. 월 환산 결과는 세금·보험료를 공제하기 전입니다.',
    faq: [
      [`시급 ${won(amount)}이면 주 40시간 월급은 얼마인가요?`, `유급주휴 포함 월 209시간을 적용하면 월 ${won(full.monthly)}, 연 ${won(full.yearly)}입니다.`],
      [`시급 ${won(amount)}으로 주 20시간을 일하면 얼마인가요?`, `개근 등 주휴 요건을 갖췄다면 월평균 세전 ${won(part.monthly)}이며, 주휴 미포함 금액보다 ${won(part.monthly - without.monthly)} 많습니다.`],
    ],
  };
}

function severanceExample(amount) {
  const monthly = amount * 10_000 / 12;
  const ordinary = monthly / laborRates.hours.monthlyFullTime * laborRates.hours.daily;
  const modeled = (years) => severancePay({
    wageTotal: monthly * 3, periodDays: 90, annualBonus: 0, annualLeavePay: 0, ordinaryDaily: ordinary,
    serviceDays: years * 365, eligible: 'yes',
  }).severance;
  return {
    metric: modeled(3), label: '3년 재직 시 세전 예상 퇴직금',
    intro: `매월 같은 급여를 받는다면 월 세전 급여는 약 ${won(Math.round(monthly))}입니다. 마지막 3개월 급여가 같고 퇴직금 지급 요건을 충족한 예시입니다.`,
    heading: '계속근로기간에 따른 세전 퇴직금',
    rows: [1, 3, 5, 10].map((years) => [`${years}년 재직`, `${formatNumber(years * 365)}일`, modeled(years)]),
    note: '3개월 90일, 별도 상여·연차수당 없음, 월 209시간·일 8시간 및 월급 전액이 통상임금인 경우를 가정합니다. 실제 달력 일수와 통상임금 구성은 다를 수 있습니다.',
    faq: [
      [`연봉 ${salaryName(amount)}에 3년 근무하면 퇴직금이 얼마인가요?`, `예시 조건에서는 세전 약 ${won(modeled(3))}입니다. 실제로는 퇴직 전 임금과 재직일수로 계산합니다.`],
      [`같은 연봉 ${salaryName(amount)}이라도 퇴직금이 달라지나요?`, '네. 재직일수, 상여와 연차수당, 평균임금 산정에 포함되는 일수, 통상임금에 따라 결과가 달라집니다.'],
    ],
  };
}

function examplePage(config, example) {
  const root = '../../';
  const { id, path, title, amount } = example;
  const tool = tools[id];
  const data = id === 'wage-converter' ? hourlyExample(amount) : severanceExample(amount);
  const group = examples.filter((other) => other.id === id);
  const index = group.indexOf(example);
  const neighbors = group.slice(Math.max(0, index - 1), index + 2).filter((other) => other !== example);
  return layout({
    config, title: `${rates.year} ${title} · ${won(data.metric)} | ${brand}`,
    description: `${title} 계산 예시: ${data.label} ${won(data.metric)}. ${data.heading}를 비교하고 공식 계산 기준을 확인하세요.`,
    root, path, faq: data.faq,
    main: `<p class="eyebrow"><a href="${root}${tool.category}/">${categories.find(({ id }) => id === tool.category).title}</a> · ${review}</p>
      <h1>${title}</h1><p class="intro">${data.intro}</p>
      <div class="net"><div>${data.label}<strong>${won(data.metric)}</strong></div></div>
      <p><a class="button" href="${root}${toolPath(id)}">${tool.name} 열기</a></p>
      <section class="panel" aria-labelledby="comparison"><h2 id="comparison">${data.heading}</h2>
        ${scenarioRows(data.rows, data.heading)}<p class="note">${data.note}</p>
        <ul class="tag-list">${neighbors.map((other) => `<li>${exampleLink(root, other)}</li>`).join('')}</ul>
        ${id === 'severance-pay' && amount >= 2_000 && (amount <= 10_000 ? amount % 100 === 0 : amount % 500 === 0) ? `<p><a href="${root}salary/${amount}/">같은 연봉의 실수령액 알아보기</a></p>` : ''}
      </section>
      <section class="panel" aria-labelledby="sources"><h2 id="sources">공식 계산 기준</h2>${sourcesHTML(tool.sources)}</section>
      ${faqHTML(data.faq)}`,
  });
}

function medianPage(config, { path, title, year, size }) {
  const root = '../../../';
  const tool = tools['median-income'];
  const data = medianIncome({ year, size, ratio: 100 });
  const otherYear = year === 2026 ? 2027 : 2026;
  const other = medianIncome({ year: otherYear, size, ratio: 100 });
  const faq = [
    [`${title}은 얼마인가요?`, `월 ${won(data.median)}입니다. ${year}년 ${size}인 가구의 기초생활보장 급여별 선정 기준은 아래 표에서 확인할 수 있습니다.`],
    [`${year}년 ${size}인 가구 생계급여 소득 기준은 얼마인가요?`, `월 소득인정액 ${won(data.livelihood)} 이하가 기준입니다. 실제 수급 여부는 다른 자격 요건도 충족해야 합니다.`],
  ];
  return layout({
    config, path, root, title: `${title} ${won(data.median)} | ${brand}`,
    description: `${title}은 월 ${won(data.median)}입니다. 생계급여 ${won(data.livelihood)} 등 급여별 가구 소득 기준을 확인하세요.`, faq,
    main: `<p class="eyebrow"><a href="${root}living/">복지·소득</a> · ${year}년 1월 1일 기준</p>
      <h1>${title}</h1>
      <div class="net"><div>월 기준 중위소득<strong>${won(data.median)}</strong></div></div>
      <p class="intro">같은 가구원 수로 <a href="${root}median-income/${otherYear}/${size}/">${otherYear}년 기준</a>을 보면 월 ${won(other.median)}입니다.</p>
      <section class="panel"><h2>급여별 소득인정액 선정 기준</h2>
        ${scenarioRows([['생계급여', '32%', data.livelihood], ['의료급여', '40%', data.medical], ['주거급여', '48%', data.housing], ['교육급여', '50%', data.education]], '가구 전체 월 소득인정액 기준')}
        <p class="note">${tool.scope}</p><p><a href="${root}${toolPath('median-income')}#examples">다른 가구원 수의 예시 보기</a> · ${toolLink(root, 'median-income')}</p>
      </section>
      ${ad(config)}
      <section class="panel"><h2>공식 계산 기준</h2>${sourcesHTML(tool.sources.filter(({ effective }) => effective.startsWith(String(year))))}</section>
      ${faqHTML(faq)}`,
  });
}

function sitemapPage(config) {
  return layout({
    config, path: 'sitemap/', root: '../', title: `사이트맵 | ${brand}`,
    description: `${brand}의 분야별 계산기, 사진·생활 도구, IT·AI 소식을 한눈에 찾아보세요.`,
    main: `<h1>사이트맵</h1><p class="intro">계산기와 도구를 분야별로 모았습니다. 금액·가구원 수별 예시는 해당 계산기에서 볼 수 있습니다.</p>
      <nav aria-label="분야별 사이트맵">${sitemapDirectory('../')}</nav>`,
  });
}

function housingExample(config, { id, path, title, description, rowKeys, cases }) {
  const root = '../../';
  const tool = tools[id];
  const related = housingExamples.filter((example) => example.id === id && example.path !== path);
  const columns = tool.outputs.filter(({ key }) => rowKeys.includes(key));
  const rows = cases.map(([name, inputs]) => {
    const result = tool.calculate({ ...defaultsFor(tool), ...inputs });
    const values = columns.map(({ key, format }) => result[key] === undefined ? '해당 없음' : format(result[key]));
    return { name, values };
  });
  const faq = rows.map(({ name, values }) => [
    `${name} 조건의 계산 결과는 어떻게 되나요?`,
    columns.map(({ label }, i) => `${label}: ${values[i]}`).join(', ') + '.',
  ]);
  return layout({
    config, path, root, title: `${title} | ${brand}`, description, faq,
    main: `<p class="eyebrow"><a href="${root}housing/">주거·전월세</a> · ${review}</p>
    <h1>${title}</h1><p class="intro">${description}</p>
    <section class="panel"><h2>조건별 예상 금액</h2><table class="example-amounts housing-example-amounts"><thead><tr><th scope="col">조건</th>
    ${columns.map(({ label }) => `<th scope="col">${escape(label)}</th>`).join('')}</tr></thead><tbody>
    ${rows.map(({ name, values }) => `<tr><th scope="row">${name}</th>${values.map((value, i) => `<td><span class="housing-mobile-label" aria-hidden="true">${escape(columns[i].label)}</span><span class="amount">${escape(value)}</span></td>`).join('')}</tr>`).join('')}
    </tbody></table><p class="note">${escape(tool.scope)}</p><p>${toolLink(root, id)}</p>
    ${related.map((example) => `<p>${exampleLink(root, example)}</p>`).join('')}</section>
    <section class="panel"><h2>공식 계산 기준</h2>${sourcesHTML(tool.sources)}</section>${faqHTML(faq)}`,
  });
}

export function extraPages(config) {
  return [
    ...categories.map((category) => ({ path: `${category.id}/`, html: categoryPage(config, category) })),
    ...Object.entries(tools).map(([id, tool]) => ({ path: toolPath(id), html: toolPage(config, id, tool) })),
    ...examplePages.map((example) => ({ path: example.path, html: examplePage(config, example) })),
    ...medianPages.map((example) => ({ path: example.path, html: medianPage(config, example) })),
    ...housingExamples.map((example) => ({ path: example.path, html: housingExample(config, example) })),
    { path: moveInGuide.path, html: moveInPage(config) },
    { path: 'sitemap/', html: sitemapPage(config) },
  ];
}
