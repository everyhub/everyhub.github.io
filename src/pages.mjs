import { calculate, defaults, limits } from './calculator.mjs';
import { breakdown, salaryName, won } from './display.mjs';
import { rates, sources } from './rates.mjs';
import { verifiedOn } from './labor-rates.mjs';
import { brand } from './tool-specs.mjs';
import { navigationGroups, salaryCalculatorPath, siteTree } from './navigation.mjs';

const { year } = rates;
const taxFree = won(defaults.monthlyTaxFree);
export const salaries = [
  ...Array.from({ length: 81 }, (_, i) => 2_000 + i * 100),
  ...Array.from({ length: 20 }, (_, i) => 10_500 + i * 500),
];

export const salaryPath = (salary) => `salary/${salary}/`;
const label = (salary) => `연봉 ${salaryName(salary)}`;
const pageLink = (salary, root = './') => `<a href="${root}${salaryPath(salary)}">${salaryName(salary)}</a>`;
const estimate = (salary, inputs) => calculate({ annualSalary: salary * 10_000, ...inputs });
const modeled = new Map(salaries.map((salary) => [salary, estimate(salary)]));
const assumptions = `퇴직금과 별도 상여금은 제외했습니다. 월 비과세 식대는 ${taxFree}, 공제 대상은 본인만으로 가정했습니다.`;
const disclaimer = '매달 급여를 받는 국내 직장가입자를 기준으로 한 추정치입니다. 회사가 신고한 기준소득월액·보수월액, 공제·감면, 상여금 및 연말정산에 따라 실제 금액은 달라질 수 있습니다.';

export function escape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function cell(amounts, key, period) {
  return `<td data-period="${period}" data-amount="${key}">${won(amounts[period][key])}</td>`;
}

function deductionTable(amounts, interactive = false) {
  const row = ([key, name]) =>
    `<tr><th scope="row">${name}</th>${cell(amounts, key, 'monthly')}${cell(amounts, key, 'annual')}</tr>`;
  return `<table${interactive ? ' id="calculation-table"' : ''}>
    <caption>월평균 및 연간 금액 (단위: 원)</caption>
    <thead><tr><th scope="col">항목</th><th scope="col">월평균</th><th scope="col">연간</th></tr></thead>
    <tbody>${breakdown.slice(0, -1).map(row).join('')}</tbody>
    <tfoot>${row(breakdown.at(-1))}</tfoot>
  </table>`;
}

function highlight({ monthly, annual }, interactive = false) {
  return `<div class="net">
    <div>월평균 실수령액${interactive ? `<output id="calc-status" form="salary-form" for="annualSalary monthlyTaxFree dependents children">${won(monthly.net)}</output>` : `<strong>${won(monthly.net)}</strong>`}</div>
    <div>연간 실수령액<strong${interactive ? ' id="annual-net"' : ''}>${won(annual.net)}</strong></div>
  </div>`;
}

export function faqHTML(faq) {
  return `<section class="panel" aria-labelledby="faq"><h2 id="faq">자주 묻는 질문</h2>
  ${faq.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}
  </section>`;
}

export function sourcesHTML(references) {
  return `<ul class="foot-list">${references.map(({ name, url, effective }) =>
    `<li><a href="${escape(url)}">${escape(name)}</a>${effective ? ` <small>(적용 <time datetime="${effective}">${effective}</time>)</small>` : ''}</li>`).join('')}</ul>`;
}

function footer(config, payroll, root) {
  const percent = ({ numerator, denominator }) => (100 * numerator / denominator).toLocaleString('ko-KR');
  const contributionLimits = rates.pension.periods.map(({ from, min, max }, i) => {
    const until = (rates.pension.periods[i + 1]?.from ?? 13) - 1;
    return `${from}~${until}월 ${won(min)}~${won(max)}`;
  }).join(', ');
  const creditChange = rates.incomeTax.childCredits.at(-1).from;
  return `<footer class="site-foot"><div class="wrap">
    <p class="footer-nav"><a href="${root}sitemap/">전체 사이트맵</a></p>
    <p>공식 자료 확인일 <time datetime="${verifiedOn}">${verifiedOn}</time> · 개인별 결과는 참고용입니다.</p>
    ${payroll ? `<p>${disclaimer}</p>
    <details id="sources"><summary>${year}년 연봉 실수령액 공식 계산 기준</summary>
      <p>근로자 부담 요율은 국민연금 ${percent(rates.pension)}%, 건강보험 ${percent(rates.health)}%, 장기요양보험은 건강보험료의 ${percent(rates.care)}%, 고용보험 ${percent(rates.employment)}%입니다. 국민연금 기준소득월액은 ${contributionLimits}입니다. 월 원천징수 소득세는 간이세액표 100% 기준입니다.${creditChange > 1 ? ` ${creditChange}월부터 변경된 자녀 공제를 적용합니다.` : ''} 지방소득세는 소득세의 ${percent(rates.localTax)}%입니다.</p>
      <p>월평균은 연간 예상 금액을 12로 나눠 원 단위로 반올림한 값입니다. 적용 시기별 제도 변경과 반올림 때문에 실제 월별 금액과 일치하지 않을 수 있습니다.</p>
      ${sourcesHTML(sources.map(([name, url, effective]) => ({ name, url, effective })))}
    </details>` : ''}
    <details><summary>개인정보 및 광고</summary><p>계산에 입력한 급여·가족 정보는 브라우저에서만 처리되며 사이트 운영 서버로 전송하지 않습니다.</p>
    ${config.adsenseClient ? '<p>이 사이트는 Google AdSense 광고를 표시합니다. Google은 광고 제공을 위해 쿠키를 사용할 수 있습니다. <a href="https://policies.google.com/technologies/partner-sites?hl=ko">Google의 광고 데이터 처리 방식</a>을 확인하세요.</p>' : ''}
    </details>
  </div></footer>`;
}

export function ad(config) {
  if (!config.adsenseClient || !config.adsenseSlot) return '<aside class="ad-slot" hidden></aside>';
  return `<aside class="ad-slot" aria-label="광고"><ins class="adsbygoogle" style="display:block" data-ad-client="${escape(config.adsenseClient)}" data-ad-slot="${escape(config.adsenseSlot)}" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(window.adsbygoogle = window.adsbygoogle || []).push({});</script></aside>`;
}

export function layout({ config, title, description, path, root, main, faq, calculator = false, application, script, payroll = false, localOnly = false }) {
  const canonical = new URL(path, config.baseURL).href;
  const graph = [];
  if (calculator || application) graph.push({
    '@type': 'WebApplication', name: application ?? '연봉 실수령액 계산기', url: canonical,
    description, applicationCategory: localOnly ? 'UtilitiesApplication' : 'FinanceApplication', operatingSystem: 'Any', inLanguage: 'ko-KR',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'KRW' },
  });
  if (faq?.length) graph.push({
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  });
  if (path === '') graph.push({ '@type': 'WebSite', name: brand, alternateName: ['에브리허브', 'EveryHub'], url: canonical, inLanguage: 'ko-KR' });
  if (!graph.length) graph.push({ '@type': 'CollectionPage', name: title, description, url: canonical, inLanguage: 'ko-KR' });
  const verification = [
    ['google-site-verification', config.googleVerification], ['naver-site-verification', config.naverVerification],
  ].filter(([, value]) => value).map(([name, value]) => `<meta name="${name}" content="${escape(value)}">`).join('\n');
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  ${localOnly ? `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self'; img-src 'self' blob: data:; object-src 'none'; base-uri 'none'; form-action 'none'">` : ''}
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  <link rel="canonical" href="${escape(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:site_name" content="${brand}">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${escape(canonical)}">
  ${verification}
  <link rel="stylesheet" href="${root}assets/style.css">
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>
  <script type="module" src="${root}assets/navigation-browser.mjs"></script>
  ${script || calculator ? `<script type="module" src="${root}assets/${script ?? 'browser.mjs'}"></script>` : ''}
  ${!localOnly && config.adsenseClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.adsenseClient)}" crossorigin="anonymous"></script>` : ''}
</head>
<body>
  <header class="site-head"><div class="wrap"><a class="brand" href="${root}">${brand}</a>
    <button type="button" class="nav-toggle" hidden aria-controls="site-navigation" aria-expanded="false">전체 메뉴</button>
    <a class="home-link" href="${root}">홈</a></div></header>
  <div class="page-grid wrap">
    <nav class="sidebar" id="site-navigation" aria-label="사이트 탐색"><p class="sidebar-title">분야별 찾아보기</p>${siteTree(root, path)}</nav>
    <main>${main}</main>
  </div>
  ${footer(localOnly ? { ...config, adsenseClient: '' } : config, payroll, root)}
</body>
</html>`;
}

function salaryForm() {
  const amounts = calculate(defaults);
  return `<section class="panel" aria-labelledby="calculator"><h2 id="calculator">내 연봉 계산하기</h2>
        <form id="salary-form">
          <div class="form-grid">
            <label>세전 연봉 (만 원)<input id="annualSalary" type="number" inputmode="numeric" required min="1000" max="${limits.annualSalary / 10_000}" value="${defaults.annualSalary / 10_000}"></label>
            <label>월 비과세액 (만 원)<input id="monthlyTaxFree" type="number" inputmode="numeric" required min="0" value="${defaults.monthlyTaxFree / 10_000}"><small>연봉에 포함된 비과세 식대 등</small></label>
            <label>부양가족 수 (명, 본인 제외)<input id="dependents" type="number" inputmode="numeric" required min="0" max="${limits.dependents}" value="0"></label>
            <label>만 8~20세 공제 대상 자녀 수 (명)<input id="children" type="number" inputmode="numeric" required min="0" max="${limits.dependents}" value="0"><small>부양가족 수에 포함한 자녀만 입력</small></label>
          </div>
          <p><button type="submit">실수령액 계산</button></p><p id="calc-error" class="error" role="alert"></p>
          <noscript><p>기본 예시만 표시됩니다. 입력에 따른 계산은 자바스크립트가 필요합니다.</p></noscript>
        </form>
        ${highlight(amounts, true)}
        ${deductionTable(amounts, true)}
      </section>`;
}

function salaryIndex(root) {
  const groups = [[2_000, 4_000], [4_000, 6_000], [6_000, 8_000], [8_000, 10_000], [10_000, 20_001]];
  const index = groups.map(([start, end]) => {
    const entries = salaries.filter((salary) => salary >= start && salary < end);
    return `<h3>${salaryName(entries[0])} ~ ${salaryName(entries.at(-1))}</h3>
      <ul class="tag-list">${entries.map((salary) => `<li>${pageLink(salary, root)}</li>`).join('')}</ul>`;
  }).join('');
  return `<section class="panel" aria-labelledby="salary-index"><h2 id="salary-index">연봉별 바로보기</h2>
      <ul class="tag-list">${[3_000, 4_000, 5_000].map((salary) => `<li>${pageLink(salary, root)}</li>`).join('')}</ul>
      <details class="example-index"><summary>전체 연봉 구간 (${salaries.length}개)</summary>${index}</details></section>`;
}

function dashboard() {
  const section = (title, hub, links, hubName = `${title} 전체 보기`) => `
    <section class="panel"><h2><a href="./${hub}">${title}</a></h2>
      <ul class="dashboard-links">${[...links, { path: hub, name: hubName }].map(({ path, name }) =>
        `<li><a href="./${path}">${name}</a></li>`).join('')}</ul></section>`;
  return navigationGroups.map(({ name, path, items }) => section(name, path, items)).join('');
}

export function homePage(config) {
  return layout({
    config, title: `${brand} | 계산기·생활 도구·IT 소식`,
    description: '연봉 실수령액과 퇴직금 계산기, 사진 배경 제거, 공휴일 달력, 국내외 IT·AI 소식을 한곳에서 찾아보세요.',
    path: '', root: './', calculator: true, payroll: true,
    main: `<h1>${brand}</h1><p class="intro">급여·근로 계산기부터 사진 편집, 생활 정보와 IT·AI 소식까지 원하는 기능을 바로 열어 보세요.</p>
      <section aria-labelledby="shortcuts"><h2 id="shortcuts">한눈에 바로가기</h2>${dashboard()}</section>
      <p><a href="./${salaryCalculatorPath}">연봉 실수령액 계산 기준과 자주 묻는 질문 보기</a></p>
      ${salaryForm()}${ad(config)}${salaryIndex('./')}`,
  });
}

export function salaryCalculatorPage(config) {
  const root = '../../';
  const faq = [
    [`${year}년 연봉 실수령액은 어떻게 계산하나요?`, '세전 연봉에서 국민연금, 건강보험·장기요양보험, 고용보험, 근로소득세와 지방소득세를 뺍니다. 월평균은 연간 예상 실수령액을 12개월로 나눈 값입니다.'],
    ['식대를 연봉에 더해야 하나요?', `입력한 연봉에 이미 포함된 비과세 식대만 월 비과세액에 적으세요. 기본값은 월 ${taxFree}이며, 비과세 식대가 없다면 0을 입력하세요.`],
    ['부양가족과 자녀 수는 어떻게 입력하나요?', '본인은 자동으로 포함됩니다. 부양가족 수에는 기본공제 대상인 배우자와 가족만 입력하세요. 그중 만 8~20세 공제 대상 자녀의 수를 별도로 입력하세요.'],
  ];
  return layout({
    config, title: `${year}년 연봉 실수령액 계산기 | ${brand}`,
    description: `${year}년 세전 연봉에서 보험료·소득세를 뺀 월평균 실수령액과 연간 실수령액을 계산하세요.`,
    path: salaryCalculatorPath, root, calculator: true, payroll: true, faq,
    main: `<p class="eyebrow">${year}년 기준 · 공식 자료 확인 <time datetime="${verifiedOn}">${verifiedOn}</time></p><h1>연봉 실수령액 계산기</h1>
      <p class="intro">세전 연봉과 비과세액을 입력하면 보험료와 세금을 뺀 월평균 실수령액을 확인할 수 있습니다.</p>
      <p class="note">실수령액은 ${year}년 기준입니다. 2027년 보험 상·하한 등의 추가 고시를 확인한 뒤 연간 계산을 업데이트합니다. 먼저 발표된 요율은 <a href="${root}tools/insurance-rates/">직장인 보험료 비교</a>에서 확인하세요.</p>
      ${salaryForm()}${ad(config)}${salaryIndex(root)}
      ${faqHTML(faq)}`,
  });
}

export function salaryPage(config, salary, index) {
  const root = '../../';
  const name = label(salary);
  const amounts = modeled.get(salary);
  const { monthly, annual } = amounts;
  const noMeal = estimate(salary, { monthlyTaxFree: 0 });
  const family = estimate(salary, { dependents: 2, children: 1 });
  const takeHomeRate = (100 * annual.net / annual.gross).toFixed(1);
  const neighbors = salaries.slice(Math.max(0, index - 1), index + 2);
  const other = salaries[index + 1] ?? salaries[index - 1];
  const difference = Math.abs(modeled.get(other).monthly.net - monthly.net);
  const faq = [
    [`${name}이면 한 달에 얼마를 받나요?`, `${year}년 기준 월평균 ${won(monthly.net)}, 연간 ${won(annual.net)}으로 예상됩니다. ${assumptions}`],
    [`${name}에 비과세 식대가 없다면 월급이 얼마나 달라지나요?`, `같은 세전 연봉에서 비과세액을 0원으로 두면 월평균 ${won(noMeal.monthly.net)}으로, 기본 조건보다 ${won(monthly.net - noMeal.monthly.net)} 적습니다.`],
    [`인접 연봉인 ${salaryName(other)}의 월 실수령액은 얼마나 다른가요?`, `같은 비과세·부양가족 조건에서 ${label(other)}의 월평균 실수령액은 ${won(modeled.get(other).monthly.net)}입니다. 월 차이는 ${won(difference)}입니다.`],
  ];
  const title = `${year} ${name} 실수령액 | 월 ${won(monthly.net)} 예상`;
  return layout({
    config, title,
    description: `${year}년 ${name}의 예상 실수령액은 월평균 ${won(monthly.net)}, 연간 ${won(annual.net)}입니다. 보험료·세금 공제 내역과 인접 연봉의 월 실수령액을 비교하세요.`,
    path: salaryPath(salary), root, faq, payroll: true,
    main: `<p class="eyebrow">${year}년 연봉별 급여</p><h1>${name} 실수령액</h1>
      <p class="intro">세전 월평균 ${won(monthly.gross)}에서 월평균 ${won(monthly.deductions)}이 공제됩니다. 세전 연봉의 약 ${takeHomeRate}%가 통장에 들어오는 셈입니다.</p>
      ${highlight(amounts)}
      <p class="note">${assumptions}</p>
      <p><a class="button" href="${root}?salary=${salary}#calculator">이 연봉으로 직접 계산</a></p>
      <section class="panel" aria-labelledby="deductions"><h2 id="deductions">${name} 보험료와 세금</h2>${deductionTable(amounts)}</section>
      ${ad(config)}
      <section class="panel" aria-labelledby="compare"><h2 id="compare">가까운 연봉과 비교</h2>
        <table><caption>동일한 조건의 월평균 실수령액 비교 (단위: 원)</caption>
          <thead><tr><th scope="col">세전 연봉</th><th scope="col">월평균</th><th scope="col">현재 대비</th></tr></thead>
          <tbody>${neighbors.map((neighbor) => {
            const net = modeled.get(neighbor).monthly.net;
            const delta = net - monthly.net;
            return `<tr><th scope="row">${neighbor === salary ? `<strong>${salaryName(neighbor)}</strong>` : pageLink(neighbor, root)}</th><td>${won(net)}</td><td>${delta ? `${delta > 0 ? '+' : '−'}${won(Math.abs(delta))}` : '—'}</td></tr>`;
          }).join('')}</tbody>
        </table><p><a href="${root}${salaryCalculatorPath}#salary-index">다른 연봉 구간 보기</a></p>
      </section>
      <section class="panel" aria-labelledby="scenario"><h2 id="scenario">부양가족이 있다면?</h2>
        <p>공제 대상 배우자와 만 8~20세 자녀 1명을 추가하면 월평균 실수령액은 ${won(family.monthly.net)}입니다. 본인만 공제받는 경우와 월평균 ${won(family.monthly.net - monthly.net)} 차이가 납니다.</p>
      </section>
      ${faqHTML(faq)}`,
  });
}
