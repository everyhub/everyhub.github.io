import { layout } from './pages.mjs';
import { brand } from './tool-specs.mjs';
import { adminPending, adminTimeline, auditEvidenceLabel, initialDeployment, sortAdminTimeline } from './admin-log.mjs';
import { adminProposals, latestFeatureReview, sortAdminProposals } from './admin-proposals.mjs';
import { officialValueEvidence } from './official-value-evidence.mjs';
import activeWork from './admin-now.json' with { type: 'json' };

export const adminPath = 'ops-7f3a9c2d/';
export const adminProposalsPath = adminPath + 'recommendations/';

const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function adminTabs(root, current) {
  return `<nav aria-label="관리 페이지 탭"><ul class="tag-list admin-tabs">${[
    [adminPath, '작업 타임라인'], [adminProposalsPath, '추천'],
  ].map(([path, name]) => `<li><a href="${root}${path}"${path === current ? ' aria-current="page"' : ''}>${name}</a></li>`).join('')}</ul></nav>`;
}

const kst = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short',
});
const kstTime = (value) => `<time datetime="${escape(value)}">${kst.format(new Date(value))} KST</time>`;

function activeWorkPanel(items) {
  const recent = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return `<section class="panel admin-now" aria-labelledby="admin-now-title"><h2 id="admin-now-title">지금 작업 중</h2>
    ${recent.length ? `<ul class="admin-now-items">${recent.map(({ title, step, startedAt, updatedAt }) => `<li>
      <h3>${escape(title)}</h3><p>현재 단계: ${escape(step)}</p>
      <p class="note">시작: ${kstTime(startedAt)} · 마지막 갱신: ${kstTime(updatedAt)}</p>
    </li>`).join('')}</ul>` : '<p>현재 진행 중인 작업 없음</p>'}
    <p class="note">배포에 반영된 작업 기록입니다. 실시간 상태는 아닙니다.</p>
  </section>`;
}

const timelineFilters = ['전체', '진행중', '부분', '미확인', '완료', '제외'];

function officialEvidencePanel() {
  const groups = Object.entries(officialValueEvidence).map(([group, entries]) =>
    `<details><summary>${escape(group)} (${entries.length})</summary><ul>${entries.map(({ label, url, applies, excerpt }) =>
      `<li><strong>${escape(label)}</strong> · 적용: ${escape(applies)}<p>${escape(excerpt)} · <a href="${escape(url)}">기관 원문</a></p></li>`).join('')}</ul></details>`).join('');
  return `<section class="panel" id="official-value-evidence"><h2>공식 수치 원문 대조</h2>
    <p>확인한 항목별 적용 기간과 기관 원문 인용 또는 표의 위치입니다. 아직 이 목록에 없는 수치는 전수 대조가 끝난 것이 아닙니다.</p>
    ${groups}</section>`;
}

export function adminTimelinePage(config, items = activeWork) {
  const linkList = (links) => links.length ? `<ul class="foot-list admin-evidence-links">${links.map((link) =>
    `<li><a href="${escape(link)}" title="${escape(link)}">${escape(auditEvidenceLabel(link))}</a></li>`).join('')}</ul>` : '—';
  const rows = sortAdminTimeline(adminTimeline).map(({ id, time, request, reflection, status, reason, links, items }) => `<tr role="row" id="${escape(id)}" data-timeline-status="${escape(status)}">
    <th role="rowheader" scope="row"><time datetime="${escape(time.replace(' ', 'T') + '+09:00')}">${escape(time)}</time></th>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">요청</span>${escape(request)}</td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">반영 내용</span>${escape(reflection)}</td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">상태</span><strong>${escape(status)}</strong></td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">사유</span>${escape(reason ?? '—')}</td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">근거 URL</span>${linkList(links)}</td>
  </tr><tr role="row" class="admin-audit-detail" data-request-id="${escape(id)}">
    <td role="cell" colspan="6"><details><summary>세부 상태 보기 (${items.length})</summary>
      <ul class="admin-audit-items">${items.map((item) => `<li data-audit-status="${escape(item.status)}"><strong>${escape(item.status)}</strong> — ${escape(item.requirement)}
        <p>${escape(item.evidence ?? item.reason)}</p>${item.links.length ? linkList(item.links) : ''}</li>`).join('')}</ul></details></td>
  </tr>`).join('');
  const pending = adminPending.map((item) => `<li>${escape(item)}</li>`).join('');
  const latestTime = adminTimeline.reduce((latest, { time }) => time > latest ? time : latest, '');
  return layout({
    config, path: adminPath, root: '../', title: `작업 요청 타임라인 | ${brand}`,
    description: '에브리허브 작업 요청과 반영 상태를 기록한 내부 운영 문서입니다.',
    localOnly: true, robots: 'noindex,nofollow', script: 'admin-browser.mjs',
    main: `<p class="eyebrow">내부 운영 문서 · 마지막 기록 ${escape(latestTime)} KST</p>
      <h1>작업 요청 타임라인</h1>
      ${adminTabs('../', adminPath)}
      ${activeWorkPanel(items)}
      <p class="intro">진행 중인 작업을 먼저 표시하고, 각 그룹은 최신순으로 정렬합니다. 모든 세부 항목의 운영 증거가 있어야 요청을 완료로 표시합니다. 요청 시각이 없으면 관련 작업 시각을 한국시간으로 표시합니다. 이 페이지는 로그인으로 보호되지 않으며, 사이트맵과 메뉴에서 연결하지 않습니다. 새 요청은 <code>src/admin-log.mjs</code>에 기록합니다.</p>
      <div class="admin-status-filters" role="group" aria-label="타임라인 상태 필터" hidden>${timelineFilters.map((status, i) => `<button type="button" data-timeline-filter="${status}" aria-pressed="${i === 0}" aria-controls="admin-timeline">${status}</button>`).join('')}</div>
      <p data-timeline-empty role="status" hidden>선택한 상태의 요청이 없습니다.</p>
      <div class="admin-table-wrap"><table id="admin-timeline" class="admin-timeline" role="table"><thead role="rowgroup"><tr role="row">${['시각(KST)', '요청', '반영 내용', '상태', '사유', '근거 URL'].map((label) => `<th role="columnheader" scope="col">${label}</th>`).join('')}</tr></thead><tbody role="rowgroup">${rows}</tbody></table></div>
      ${officialEvidencePanel()}
      <section class="panel"><h2>과거 운영 기록</h2><p>${escape(initialDeployment.request)} · <strong>${escape(initialDeployment.status)}</strong> — ${escape(initialDeployment.reason)} ${escape(initialDeployment.reflection)}</p></section>
      <section class="panel"><h2>보류·다음 확인</h2><ul>${pending}</ul></section>`,
  });
}

function proposalSources(sources) {
  const items = sources.filter(({ url }) => /^https?:\/\/[^\s]+$/i.test(url))
    .map(({ label, url }) => `<li><a href="${escape(url)}">${escape(label)}</a></li>`);
  return items.length ? `<ul>${items.join('')}</ul>` : '';
}

export function adminProposalsPage(config, proposals = adminProposals, review = latestFeatureReview) {
  const cards = sortAdminProposals(proposals).map(({ id, createdAt, title, what, why, officialSources, scope, risks, status, issueUrl, decision, result }) => {
    const issue = /^https:\/\/github\.com\/everyhub\/everyhub\.github\.io\/issues\/[1-9]\d*$/.test(issueUrl);
    return `<article class="panel proposal-card" id="proposal-${escape(id)}">
      <p class="eyebrow">${escape(status)} · <time datetime="${escape(createdAt.replace(' ', 'T') + '+09:00')}">${escape(createdAt)} KST</time></p>
      <h2>${escape(title)}</h2>
      <dl class="proposal-details">
        <dt>무엇을 추가하나요?</dt><dd>${escape(what)}</dd>
        <dt>왜 필요하나요?</dt><dd>${escape(why.text)}${proposalSources(why.sources)}</dd>
        <dt>공식 자료</dt><dd>${proposalSources(officialSources) || '해당 없음'}</dd>
        <dt>작업 범위·예상 페이지</dt><dd>${escape(scope)}</dd>
        <dt>위험·제외 조건</dt><dd>${escape(risks)}</dd>
        ${decision ? `<dt>선정·제외 사유</dt><dd>${escape(decision)}</dd>` : ''}
        ${result?.url?.startsWith('https://everyhub.github.io/') ? `<dt>반영 결과</dt><dd><a href="${escape(result.url)}">${escape(result.label)}</a></dd>` : ''}
      </dl>
      ${issue ? `<p><a href="${escape(issueUrl)}">이전 GitHub 기록</a></p>` : ''}
    </article>`;
  }).join('');
  return layout({
    config, path: adminProposalsPath, root: '../../', title: `페이지 추가 추천 | ${brand}`,
    description: '에브리허브 페이지 추가 제안과 검토 상태를 확인합니다.',
    localOnly: true, robots: 'noindex,nofollow',
    main: `<h1>페이지 추가 추천</h1>
      ${adminTabs('../../', adminProposalsPath)}
      <p class="intro">여러 사람에게 필요한 기능인지, 최근 검색 수요가 있는지, 공식 자료로 구현할 수 있는지 확인합니다. 세 조건을 모두 충족해야 별도 승인 없이 한 번에 최대 1건을 추가합니다.</p>
      <p class="note">등록된 점검 시각은 매일 09:13·14:13·19:13 KST입니다. 적합한 후보가 없으면 버그 수정, 공식 수치 갱신, 사용성 개선을 우선합니다.</p>
      <section class="panel" id="latest-feature-review"><h2>최근 점검: ${escape(review.outcome)}</h2>
        <p><time datetime="${escape(review.reviewedAt.replace(' ', 'T') + '+09:00')}">${escape(review.reviewedAt)} KST</time> · ${escape(review.reason)}</p></section>
      ${cards || '<p class="panel">등록된 제안이 없습니다. 조사 결과가 등록되면 이곳에 표시됩니다.</p>'}`,
  });
}
