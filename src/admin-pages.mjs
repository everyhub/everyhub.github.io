import { layout } from './pages.mjs';
import { brand } from './tool-specs.mjs';
import { adminPending, adminTimeline } from './admin-log.mjs';

export const adminPath = 'ops-7f3a9c2d/';

const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function adminTimelinePage(config) {
  const rows = adminTimeline.map(({ time, request, reflection, status, reason, links }) => `<tr>
    <th scope="row"><time datetime="${escape(time.replace(' ', 'T') + '+09:00')}">${escape(time)}</time></th>
    <td>${escape(request)}</td><td>${escape(reflection)}${reason ? `<p class="note">사유: ${escape(reason)}</p>` : ''}</td>
    <td><strong>${escape(status)}</strong>${links?.length ? `<ul class="foot-list">${links.map((link) => `<li>${/^https?:/.test(link) ? `<a href="${escape(link)}">${escape(link)}</a>` : escape(link)}</li>`).join('')}</ul>` : ''}</td>
  </tr>`).join('');
  const pending = adminPending.map((item) => `<li>${escape(item)}</li>`).join('');
  return layout({
    config, path: adminPath, root: '../', title: `작업 요청 타임라인 | ${brand}`,
    description: '에브리허브 작업 요청과 반영 상태를 기록한 내부 운영 문서입니다.',
    localOnly: true, robots: 'noindex,nofollow',
    main: `<p class="eyebrow">내부 운영 문서 · 마지막 기록 ${escape(adminTimeline.at(-1).time)} KST</p>
      <h1>작업 요청 타임라인</h1>
      <p class="intro">사용자 요청을 받은 순서와 반영 결과를 기록합니다. 이 문서는 검색·사이트맵·메뉴에서 제외되어 있으며, 다음 작업자는 새 요청을 <code>src/admin-log.mjs</code>에 이어서 기록합니다.</p>
      <div class="admin-table-wrap"><table class="admin-timeline"><thead><tr><th scope="col">시각(KST)</th><th scope="col">요청</th><th scope="col">반영 내용</th><th scope="col">상태·기록</th></tr></thead><tbody>${rows}</tbody></table></div>
      <section class="panel"><h2>보류·다음 확인</h2><ul>${pending}</ul></section>`,
  });
}
