import { layout } from './pages.mjs';
import { brand } from './tool-specs.mjs';
import { adminPending, adminTimeline, auditEvidenceLabel, initialDeployment, sortAdminTimeline } from './admin-log.mjs';
import { adminProposals, sortAdminProposals } from './admin-proposals.mjs';

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

export function adminTimelinePage(config) {
  const linkList = (links) => links.length ? `<ul class="foot-list">${links.map((link) => `<li><a href="${escape(link)}">${escape(auditEvidenceLabel(link))}</a></li>`).join('')}</ul>` : '—';
  const rows = sortAdminTimeline(adminTimeline).map(({ id, time, request, reflection, status, reason, links, items }) => `<tr role="row" id="${escape(id)}">
    <th role="rowheader" scope="row"><time datetime="${escape(time.replace(' ', 'T') + '+09:00')}">${escape(time)}</time></th>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">요청</span>${escape(request)}</td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">반영 내용</span>${escape(reflection)}</td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">상태</span><strong>${escape(status)}</strong></td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">사유</span>${escape(reason ?? '—')}</td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">근거 URL</span>${linkList(links)}</td>
    <td role="cell"><span class="admin-cell-label" aria-hidden="true">세부 항목</span><details><summary>세부 상태 보기 (${items.length})</summary>
      <ul class="admin-audit-items">${items.map((item) => `<li data-audit-status="${escape(item.status)}"><strong>${escape(item.status)}</strong> — ${escape(item.requirement)}
        <p>${escape(item.evidence ?? item.reason)}</p>${item.links.length ? linkList(item.links) : ''}</li>`).join('')}</ul></details></td>
  </tr>`).join('');
  const pending = adminPending.map((item) => `<li>${escape(item)}</li>`).join('');
  const latestTime = adminTimeline.reduce((latest, { time }) => time > latest ? time : latest, '');
  return layout({
    config, path: adminPath, root: '../', title: `작업 요청 타임라인 | ${brand}`,
    description: '에브리허브 작업 요청과 반영 상태를 기록한 내부 운영 문서입니다.',
    localOnly: true, robots: 'noindex,nofollow',
    main: `<p class="eyebrow">내부 운영 문서 · 마지막 기록 ${escape(latestTime)} KST</p>
      <h1>작업 요청 타임라인</h1>
      ${adminTabs('../', adminPath)}
      <p class="intro">진행 중인 작업을 먼저 표시하고, 각 그룹은 최신순으로 정렬합니다. 모든 세부 항목의 운영 증거가 있어야 요청을 완료로 표시합니다. 요청 시각이 없으면 관련 작업 시각을 한국시간으로 표시합니다. 이 페이지는 로그인으로 보호되지 않으며, 사이트맵과 메뉴에서 연결하지 않습니다. 새 요청은 <code>src/admin-log.mjs</code>에 기록합니다.</p>
      <div class="admin-table-wrap"><table class="admin-timeline" role="table"><thead role="rowgroup"><tr role="row">${['시각(KST)', '요청', '반영 내용', '상태', '사유', '근거 URL', '세부 항목'].map((label) => `<th role="columnheader" scope="col">${label}</th>`).join('')}</tr></thead><tbody role="rowgroup">${rows}</tbody></table></div>
      <section class="panel"><h2>과거 운영 기록</h2><p>${escape(initialDeployment.request)} · <strong>${escape(initialDeployment.status)}</strong> — ${escape(initialDeployment.reason)} ${escape(initialDeployment.reflection)}</p></section>
      <section class="panel"><h2>보류·다음 확인</h2><ul>${pending}</ul></section>`,
  });
}

function proposalSources(sources) {
  const items = sources.filter(({ url }) => /^https?:\/\/[^\s]+$/i.test(url))
    .map(({ label, url }) => `<li><a href="${escape(url)}">${escape(label)}</a></li>`);
  return items.length ? `<ul>${items.join('')}</ul>` : '';
}

export function adminProposalsPage(config, proposals = adminProposals) {
  const cards = sortAdminProposals(proposals).map(({ id, createdAt, title, what, why, officialSources, scope, risks, status, issueUrl }) => {
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
      </dl>
      ${issue && status === '제안' ? `<p><a class="button" href="${escape(issueUrl)}" aria-label="${escape(title)} 승인 검토 (GitHub)">승인 <span aria-hidden="true">↗</span></a></p>
      <p class="note">권한이 있는 GitHub 계정으로 이슈에 <strong>승인</strong> 라벨을 달거나 <strong>승인</strong> 댓글을 남겨 주세요. 일일 자동 실행에서 승인된 항목을 검토하도록 등록했습니다. 거절하려면 <strong>거절</strong> 라벨을 달아 주세요.</p>` : issue ? `<p><a href="${escape(issueUrl)}">GitHub 이슈 보기</a></p>` : ''}
    </article>`;
  }).join('');
  return layout({
    config, path: adminProposalsPath, root: '../../', title: `페이지 추가 추천 | ${brand}`,
    description: '에브리허브 페이지 추가 제안과 검토 상태를 확인합니다.',
    localOnly: true, robots: 'noindex,nofollow',
    main: `<h1>페이지 추가 추천</h1>
      ${adminTabs('../../', adminProposalsPath)}
      <p class="intro">검색 동향과 공식 자료를 바탕으로 어떤 페이지를 추가할지 제안합니다. 승인이나 거절은 권한이 있는 GitHub 계정에서 처리합니다.</p>
      <p class="note"><strong>등록됨 · 첫 실행 확인 대기</strong> — 매일 09:13 KST, 첫 예정 실행 2026-11-25 09:13 KST.</p>
      ${cards || '<p class="panel">등록된 제안이 없습니다. 조사 결과가 등록되면 이곳에 표시됩니다.</p>'}`,
  });
}
