import { layout, sourcesHTML } from './pages.mjs';
import { brand, toolPath } from './tool-specs.mjs';
import { moveInGuide } from './navigation.mjs';

const government = 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000016';
const registry = 'https://www.iros.go.kr/';
const reporting = 'https://rtms.molit.go.kr/';

export function moveInPage(config) {
  const root = '../../';
  const description = '이사할 때 전입신고, 확정일자, 주택 임대차 신고의 차이와 신청 기한·준비물을 확인하세요.';
  return layout({
    config, root, path: moveInGuide.path, description, title: `${moveInGuide.name} | ${brand}`,
    main: `<p class="eyebrow"><a href="${root}housing/">주거·전월세</a></p>
    <h1>${moveInGuide.name}</h1><p class="intro">${description}</p>
    <section class="panel"><h2>1. 계약 뒤: 임대차 신고 대상인지 확인하세요</h2>
    <p>대상 지역에서 보증금이 6,000만 원을 넘거나 월세가 30만 원을 넘으면 계약을 체결한 날부터 30일 이내에 신고합니다. 보증금과 월세가 바뀌지 않은 갱신 계약은 신고 대상에서 제외됩니다.</p>
    <p>임대인과 임차인이 공동 신고하는 것이 원칙입니다. 계약서를 제출하면 한 사람이 신고할 수 있습니다. 주택 소재지 관할 주민센터 또는 <a href="${reporting}">국토교통부 부동산거래관리시스템</a>을 이용하세요.</p>
    <p><a href="${root}${toolPath('tenancy-renewal-report')}">전월세 신고 대상 계산기</a></p></section>
    <section class="panel"><h2>2. 계약서의 확정일자를 확인하세요</h2>
    <p>임대차 신고 때 계약서를 제출하고 신고가 접수되면 확정일자가 부여된 것으로 봅니다. 신고 대상이 아니거나 계약서를 제출하지 않았다면 확정일자를 별도로 신청할 수 있습니다. 계약서와 신분증을 준비하고 주민센터 또는 <a href="${registry}">대법원 인터넷등기소</a>의 안내를 확인하세요.</p>
    <p class="note">확정일자만으로 보증금 반환을 보장하지 않습니다. 우선변제권에는 주택 인도와 주민등록 등 법에서 정한 요건이 따로 있습니다.</p></section>
    <section class="panel"><h2>3. 이사 뒤: 전입신고를 하세요</h2>
    <p>실제로 새 주소지에 전입한 날부터 14일 이내에 신고합니다. 주소와 함께 이동한 세대원 정보를 확인한 뒤 <a href="${government}">정부24 전입신고</a>에서 신청하거나 새 주소지의 주민센터를 방문하세요.</p>
    <p>방문 신청 전 신분증과 대리 신청·세대주 확인 등 상황별 준비물을 정부24에서 확인하세요. 전입신고만으로 임대차 신고나 확정일자 부여까지 끝났다고 보지 말고 각각 처리 결과를 확인하세요.</p></section>
    <section class="panel"><h2>공식 자료</h2>${sourcesHTML([
      { name: '정부24 · 전입신고 신청과 준비물', url: government },
      { name: '주민등록법 제16조 · 전입신고 기한', url: 'https://www.law.go.kr/법령/주민등록법/제16조' },
      { name: '대법원 인터넷등기소 · 온라인 확정일자', url: registry },
      { name: '주택임대차보호법 제3조 · 대항력', url: 'https://www.law.go.kr/법령/주택임대차보호법/제3조' },
      { name: '주택임대차보호법 제3조의2 · 우선변제', url: 'https://www.law.go.kr/법령/주택임대차보호법/제3조의2' },
      { name: '국토교통부 · 주택 임대차 신고', url: reporting },
      { name: '부동산 거래신고 등에 관한 법률 제6조의2 · 신고', url: 'https://www.law.go.kr/법령/부동산거래신고등에관한법률/제6조의2' },
      { name: '부동산 거래신고 등에 관한 법률 제6조의5 · 확정일자 특례', url: 'https://www.law.go.kr/법령/부동산거래신고등에관한법률/제6조의5' },
    ])}</section>`,
  });
}
