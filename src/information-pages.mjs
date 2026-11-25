import { holidayCalendar, informationSections, informationSources, supportApplications } from './information.mjs';
import { laborRates, laborSources } from './labor-rates.mjs';
import { escape, layout, sourcesHTML } from './pages.mjs';
import { insurance2027, insurance2027Sources, rates, sources } from './rates.mjs';
import { brand } from './tool-specs.mjs';

const infoIntro = '공휴일 달력, 정부 지원금 신청 기간, 세금 신고 일정과 연도별 임금·보험료 기준을 공식 자료와 함께 확인하세요.';
const refs = (items) => `<section class="panel"><h2>공식 자료</h2>${sourcesHTML(items)}</section>`;
const number = (value) => value.toLocaleString('ko-KR');
const percent = ({ numerator, denominator }) => `${number(100 * numerator / denominator)}%`;
const won = (value) => `${number(value)}원`;
const dateFormat = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'UTC' });
const date = (value) => `<time datetime="${value}">${dateFormat.format(new Date(value))}</time>`;

function detail(config, section, root, content, script) {
  return { path: section.path, html: layout({
    config, root, path: section.path, title: `${section.name} | ${brand}`, description: section.description, localOnly: true, script,
    main: `<p class="eyebrow"><a href="${root}info/">생활 정보</a></p>
    <h1>${section.name}</h1><p class="intro">${section.description}</p>${content}`,
  }) };
}

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const holidayType = (name) => name.startsWith('대체공휴일') ? 'substitute' : 'holiday';

function monthCalendar(year, month, holidays, blocks) {
  const start = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  const inMonth = holidays.filter(({ date }) => date.startsWith(prefix));
  const names = new Map(inMonth.map(({ date, name }) => [date, name]));
  const weeks = Array.from({ length: 6 }, (_, week) => '<tr>' + weekdays.map((_, weekday) => {
    const day = week * 7 + weekday - start + 1;
    if (day < 1 || day > days) return '<td></td>';
    const iso = prefix + String(day).padStart(2, '0');
    const name = names.get(iso);
    const classes = [weekday === 0 ? 'sunday' : weekday === 6 ? 'saturday' : '',
      blocks.some(({ first, last }) => first <= iso && iso <= last) ? 'long-break' : '', name ? holidayType(name) : '']
      .filter(Boolean).join(' ');
    return `<td${classes ? ` class="${classes}"` : ''}><time datetime="${iso}"${name ? ` title="${name}"` : ''}>${day}${name ? `<span class="calendar-sr"> ${name}</span>` : ''}</time></td>`;
  }).join('') + '</tr>').join('');
  return `<section class="calendar-month" id="month-${month}">
    <table><caption>${month}월</caption><thead><tr>${weekdays.map((day, index) =>
      `<th scope="col"${index === 0 ? ' class="sunday"' : index === 6 ? ' class="saturday"' : ''}>${day}</th>`).join('')}</tr></thead>
      <tbody>${weeks}</tbody></table>
    ${inMonth.length ? `<ul class="calendar-notes">${inMonth.map(({ date, name }) =>
      `<li class="${holidayType(name)}"><span>${Number(date.slice(-2))}일</span> ${name}</li>`).join('')}</ul>` : ''}
  </section>`;
}

function holidayPage(config, section, year) {
  const root = '../../../';
  const { holidays, blocks, daysOff } = holidayCalendar(year);
  const other = year === 2026 ? 2027 : 2026;
  const calendarSources = year === 2026
    ? [informationSources.calendar2026, informationSources.holidayLaw, informationSources.calendar2027]
    : [informationSources.calendar2027, informationSources.holidayLaw];
  return detail(config, section, root, `<nav class="calendar-years" aria-label="공휴일 달력 연도">${[2026, 2027].map((tab) =>
    `<a href="${root}info/holidays/${tab}/"${tab === year ? ' aria-current="page"' : ''}>${tab}년</a>`).join('')}</nav>
    <p class="note">토·일요일에 쉬는 주 5일제를 기준으로, 토·일요일과 공휴일의 중복을 빼면 총 <strong>${daysOff}일</strong>입니다. 근무 일정은 사업장에 따라 다를 수 있습니다.</p>
    ${year === 2026 ? '<p>최초 발표된 2026년 월력요항 이후 공휴일로 지정된 노동절(5월 1일)과 제헌절(7월 17일)을 반영했습니다.</p>' : ''}
    <section class="calendar-section" id="holiday-calendar" aria-labelledby="calendar-title"><h2 id="calendar-title">${year}년 달력</h2>
    <ul class="calendar-legend" aria-label="달력 표시 안내">
      <li class="holiday">공휴일</li><li class="substitute">대체공휴일</li><li class="long-break">3일 이상 연휴</li>
      <li class="saturday">토요일</li><li class="sunday">일요일</li><li class="calendar-current">오늘 (한국시간)</li>
    </ul>
    <p class="calendar-jumps"><a href="#holiday-list">공휴일 목록 보기</a> <a href="#today" data-calendar-today hidden>오늘로 가기</a></p>
    <div class="calendar-grid">${Array.from({ length: 12 }, (_, index) => monthCalendar(year, index + 1, holidays, blocks)).join('')}</div></section>
    <section class="panel"><h2>3일 이상 연휴 ${blocks.length}번</h2>
    <ul>${blocks.map(({ first, last, days }) => `<li>${date(first)} ~ ${date(last)} (${days}일)</li>`).join('')}</ul></section>
    <section class="panel" id="holiday-list"><h2>날짜별 공휴일·대체공휴일</h2><p>매주 일요일은 아래 표에 따로 나열하지 않았습니다.</p>
    <table class="holiday-table"><thead><tr><th scope="col">날짜</th><th scope="col">공휴일</th></tr></thead><tbody>
    ${holidays.map(({ date: day, name }) => `<tr><td>${date(day)}</td><td>${name}</td></tr>`).join('')}</tbody></table></section>
    <p><a href="${root}info/holidays/${other}/">${other}년 공휴일·연휴 보기</a></p>${refs(calendarSources)}`, 'information-browser.mjs');
}

function taxPage(config, section) {
  const schedule = [
    ['1월', [['1일~25일', '부가가치세', '일반과세자 2기 확정·간이과세자 정기 신고 (과세기간의 다음 해)']]],
    ['5월', [['1일~31일', '종합소득세', '소득이 발생한 해의 다음 해'],
      ['5월 1일~6월 30일', '종합소득세', '성실신고확인서 제출 대상 (소득이 발생한 해의 다음 해)']]],
    ['7월', [['1일~25일', '부가가치세', '일반과세자 1기 확정']]],
  ];
  return detail(config, section, '../../', `<section class="panel"><h2>정기 신고·납부 기간</h2>
    <p class="note">매년 적용되는 일반적인 기간입니다. 아래 월은 신고를 시작하는 달입니다.</p>
    <ol class="tax-timeline">${schedule.map(([month, entries]) => `<li><h3>${month}</h3><ul>${entries.map(([range, name, note]) =>
      `<li><span class="tax-range">${range}</span> <strong>${name}</strong><small>${note}</small></li>`).join('')}</ul></li>`).join('')}</ol>
    <p>휴일이나 별도 연장 공고로 실제 기한이 달라질 수 있습니다. 예정신고, 과세 유형 전환 등 예외와 실제 기한은 아래 국세청 안내에서 확인하세요.</p></section>
    ${refs([informationSources.tax2026, informationSources.tax2027, informationSources.incomeTax, informationSources.vat])}`);
}

function ratesPage(config, section) {
  const root = '../../';
  const dateSources = sources.filter(([, , date]) => date).slice(0, 8).map(([name, url, effective]) => ({ name, url, effective }));
  const [prior, next] = laborRates.minimum;
  const monthly = laborRates.hours.monthlyFullTime;
  return detail(config, section, root, `<section class="panel"><h2>최저임금과 근로자 부담 보험료율</h2>
    <table class="rate-comparison"><thead><tr><th scope="col">구분</th><th scope="col">2026년</th><th scope="col">2027년</th></tr></thead><tbody>
    <tr><th scope="row">시간당 최저임금</th><td>${won(prior.hourly)}</td><td>${won(next.hourly)}</td></tr>
    <tr><th scope="row">최저 월 환산액<small>${monthly}시간</small></th><td>${won(prior.hourly * monthly)}</td><td>${won(next.hourly * monthly)}</td></tr>
    <tr><th scope="row">국민연금<small>근로자 부담</small></th><td>${percent(rates.pension)}</td><td>${percent(insurance2027.pension)}</td></tr>
    <tr><th scope="row">건강보험<small>근로자 부담</small></th><td>${percent(rates.health)}</td><td>${percent(insurance2027.health)}</td></tr>
    <tr><th scope="row">장기요양<small>건강보험료 대비</small></th><td>약 ${percent(rates.care)}</td><td>${(100 * insurance2027.care.numerator / insurance2027.care.denominator).toFixed(2)}%</td></tr>
    <tr><th scope="row">고용보험<small>일반 근로자 실업급여 부담</small></th><td>${percent(rates.employment)}</td><td>${percent(rates.employment)}<small>현행 시행령 기준</small></td></tr>
    <tr><th scope="row">산재보험<small>사업주 부담</small></th><td>사업 종류별 고시</td><td>공식 고시 확인 전</td></tr>
    </tbody></table>
    <p>2027년 국민연금 하반기와 건강보험의 보험료 상·하한은 확인한 공식 자료에 포함되지 않아 이 표에 싣지 않았습니다.</p>
    <p><a href="${root}tools/insurance-rates/">보험료율 비교 계산기</a> · <a href="${root}tools/minimum-wage/">최저임금 계산기</a></p></section>
    ${refs([prior.source, next.source, ...dateSources, ...insurance2027Sources, laborSources.employment, laborSources.accident])}`);
}

function supportPage(config, section) {
  const fullDate = (iso) => `<time datetime="${iso}">${iso.slice(0, 4)}년 ${dateFormat.format(new Date(iso))}</time>`;
  return detail(config, section, '../../', `<section class="panel"><h2>공식 신청 일정</h2>
    <p class="note">2026년 11월 25일 기준입니다. 공고에서 확인한 주요 전국 제도만 모았으며 지역별·개인별 지원을 모두 포함하지 않습니다. 접수 중단·마감 시각과 자격 요건은 신청 전 공고에서 다시 확인하세요.</p>
    <ol class="support-schedule">${supportApplications.map(({ name, deadline, start, details, agency, notice, apply }) => `<li><h3>${name}</h3><p>
      ${start ? `${fullDate(start)} ~ ${fullDate(deadline)}` : deadline ? `${fullDate(deadline)}까지` : '접수 일정은 신청처에서 확인'}</p>
      <p>${details}</p><p><a href="${escape(notice)}">${agency}</a> · <a href="${escape(apply)}">${name} 접수처</a></p></li>`).join('')}</ol>
    <p>다른 지원 제도는 <a href="https://www.gov.kr/portal/rcvfvrSvc/main">정부24 혜택알리미·보조금 안내</a>에서 확인하세요.</p></section>`);
}

export function informationPages(config) {
  const root = '../';
  const [holidays26, holidays27, tax, yearly, support] = informationSections;
  return [
    { path: 'info/', html: layout({
      config, root, path: 'info/', title: `생활 정보: 공휴일·신청 일정·임금 기준 | ${brand}`, description: infoIntro, localOnly: true,
      main: `<h1>생활 정보</h1><p class="intro">${infoIntro}</p><section class="panel"><h2>분야별 안내</h2>
      ${informationSections.map(({ path, name, description }) => `<h3><a href="${root}${path}">${name}</a></h3><p>${description}</p>`).join('')}
      <h3><a href="${root}living/">복지·소득 계산기</a></h3><p>가구원 수별 기준 중위소득과 복지 급여 선정 기준을 확인하세요.</p></section>`,
    }) },
    holidayPage(config, holidays26, 2026),
    holidayPage(config, holidays27, 2027),
    taxPage(config, tax),
    ratesPage(config, yearly),
    supportPage(config, support),
  ];
}
