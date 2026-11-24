import { layout } from './pages.mjs';
import { brand } from './tool-specs.mjs';
import { adminPending, adminTimeline } from './admin-log.mjs';

export const adminPath = 'ops-7f3a9c2d/';

const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function linkLabel(url) {
  const run = url.match(/\/actions\/runs\/(\d+)$/);
  return run ? `Actions #${run[1]}` : new URL(url).pathname;
}

export function adminTimelinePage(config) {
  const rows = adminTimeline.map(({ time, request, reflection, status, reason, links }) => `<tr>
    <th scope="row"><time datetime="${escape(time.replace(' ', 'T') + '+09:00')}">${escape(time)}</time></th>
    <td>${escape(request)}</td><td>${escape(reflection)}${reason ? `<p class="note">사유: ${escape(reason)}</p>` : ''}</td>
    <td><strong>${escape(status)}</strong>${links?.length ? `<ul class="foot-list">${links.map((link) => `<li>${/^https?:\/\//.test(link) ? `<a href="${escape(link)}">${escape(linkLabel(link))}</a>` : escape(link)}</li>`).join('')}</ul>` : ''}</td>
  </tr>`).join('');
  const pending = adminPending.map((item) => `<li>${escape(item)}</li>`).join('');
  return layout({
    config, path: adminPath, root: '../', title: `작업 요청 타임라인 | ${brand}`,
    description: '에브리허브 작업 요청과 반영 상태를 기록한 내부 운영 문서입니다.',
    localOnly: true, robots: 'noindex,nofollow',
    main: `<p class="eyebrow">내부 운영 문서 · 마지막 기록 ${escape(adminTimeline.at(-1).time)} KST</p>
      <h1>작업 요청 타임라인</h1>
      <p class="intro">요청과 반영 결과를 기록합니다. 요청 시각이 없으면 관련 작업 시각을 한국시간으로 표시합니다. 이 페이지는 로그인으로 보호되지 않으며, 사이트맵과 메뉴에서 연결하지 않습니다. 새 요청은 <code>src/admin-log.mjs</code>에 기록합니다.</p>
      <div class="admin-table-wrap"><table class="admin-timeline"><thead><tr><th scope="col">시각(KST)</th><th scope="col">요청</th><th scope="col">반영 내용</th><th scope="col">상태·기록</th></tr></thead><tbody>${rows}</tbody></table></div>
      <section class="panel"><h2>보류·다음 확인</h2><ul>${pending}</ul></section>`,
  });
}
