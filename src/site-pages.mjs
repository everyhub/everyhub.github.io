import { layout } from './pages.mjs';
import { brand } from './tool-specs.mjs';

export function sitePages(config) {
  return [
    {
      path: 'about/',
      title: '사이트 소개',
      description: '에브리허브가 제공하는 정보와 도구, 문의 방법을 안내합니다.',
      main: `<h1>사이트 소개</h1>
      <p class="intro">에브리허브는 급여·노동·주거·생활 정보를 한국어로 정리하고, 일상에서 필요한 계산기와 도구를 제공하는 사이트입니다.</p>
      <section class="panel"><h2>정보를 확인하는 방법</h2><p>계산 기준과 적용 시기는 관련 페이지에서 확인할 수 있습니다. 제도가 바뀌거나 개인 사정에 따라 결과가 달라질 수 있으니 중요한 결정은 함께 안내하는 기관 원문을 참고해 주세요.</p></section>
      <section class="panel"><h2>문의와 오류 제보</h2><p><a href="https://github.com/everyhub/everyhub.github.io/issues">GitHub 이슈</a>에 페이지 주소와 확인이 필요한 내용을 남겨 주세요. 공개 게시판이므로 급여 명세서, 연락처, 사진 같은 개인정보는 올리지 마세요.</p></section>`,
    },
    {
      path: 'privacy/',
      title: '개인정보 처리방침',
      description: '에브리허브에서 브라우저 저장, 광고, 외부 링크를 처리하는 방식을 안내합니다.',
      main: `<h1>개인정보 처리방침</h1>
      <section class="panel"><h2>브라우저에서 처리하는 정보</h2><p>계산기에 입력한 급여·가족 정보, 도구에서 선택한 파일, 소원 트리에 적은 내용은 에브리허브 서버로 전송되지 않습니다. 최근 사용한 도구, 일부 입력 설정, 소원 등은 해당 브라우저에 저장될 수 있습니다. 각 도구의 초기화 기능이나 브라우저의 사이트 데이터 삭제 기능으로 삭제할 수 있습니다.</p></section>
      <section class="panel"><h2>쿠키와 제3자 광고</h2><p>현재 에브리허브는 방문자 분석 도구와 광고를 운영하지 않습니다. Google AdSense 사이트 확인용 메타 태그와 공개 판매자 정보(ads.txt)만 게시하며, 두 항목은 광고 스크립트를 실행하지 않습니다.</p>
      <p>추후 광고가 도입되면 Google과 같은 제3자 광고 제공업체가 이 사이트 또는 다른 사이트에 방문한 기록을 바탕으로 광고를 표시하기 위해 쿠키를 사용할 수 있습니다. Google의 광고 쿠키를 사용하면 Google과 제휴사가 이 사이트 및 다른 인터넷 사이트의 방문을 바탕으로 광고를 표시할 수 있습니다.</p>
      <p>맞춤 광고는 <a href="https://myadcenter.google.com/">Google 내 광고 센터</a>에서 끌 수 있으며, 일부 제3자 업체의 맞춤 광고는 <a href="https://optout.aboutads.info/">YourAdChoices</a>에서 설정할 수 있습니다. <a href="https://policies.google.com/technologies/partner-sites?hl=ko">Google이 파트너 사이트의 데이터를 사용하는 방식</a>에서 자세히 확인할 수 있습니다.</p></section>
      <section class="panel"><h2>외부 링크와 문의</h2><p>기관 원문이나 GitHub 등 외부 링크로 이동하면 해당 서비스의 개인정보 보호정책이 적용됩니다. 개인정보 관련 문의는 <a href="https://github.com/everyhub/everyhub.github.io/issues">GitHub 이슈</a>를 이용해 주세요. 공개 게시판에 개인정보를 적지 마세요.</p></section>`,
    },
  ].map(({ path, title, description, main }) => ({
    path, html: layout({ config, path, root: '../', title: `${title} | ${brand}`, description, main, localOnly: true }),
  }));
}
