// Append a row for each new user request. Times are KST; when a message time
// was unavailable, the nearest implementation commit time is used.
export const adminTimeline = [
  { time: '2026-11-24 13:04', request: 'GitHub Pages를 기준으로 검색 유입을 받을 자동화 수익형 사이트를 시작해 달라.', reflection: '정적 GitHub Pages 구조와 Actions 배포를 만들고 연봉 계산기·금액별 페이지를 공개했습니다. 초기 배포 실행은 Pages 설정 전 단계에서 중단됐습니다.', status: '완료', links: ['5a7a573', 'https://github.com/everyhub/everyhub.github.io/actions/runs/45399740749'] },
  { time: '2026-11-24 13:29', request: '공식자료 기준으로 급여·노동·세금·복지 계산기를 확장하고 소유권 확인을 적용해 달라.', reflection: '고용노동부·국세청·4대보험 기관 등 공식 자료를 기준으로 도구와 출처를 추가하고 Google·Naver 확인 태그를 반영했습니다.', status: '완료', links: ['f267244', 'c7cdc39'] },
  { time: '2026-11-24 13:51', request: '2027년 공식 수치를 포함하고 어색한 문구를 정리해 달라.', reflection: '공식 발표가 확인된 2027년 최저임금·보험료율·기준 중위소득 등을 반영했습니다. 아직 고시되지 않은 값은 계산에 임의로 넣지 않고 미확정으로 안내했습니다.', status: '부분', reason: '2027년 구직급여 상한, 일부 보험 상·하한, 산재 요율과 간이세액표는 공식 원문 확인 전이라 보류했습니다.', links: ['8aa2e18', 'https://github.com/everyhub/everyhub.github.io/actions/runs/45407795524'] },
  { time: '2026-11-24 13:59', request: '국내·해외 IT, AI 모델·이슈, 핫이슈 뉴스와 생활 정보 탭을 추가하고 README를 이어받기 문서로 유지해 달라.', reflection: '7개 공식 RSS·API 기반 뉴스 피드, 공휴일·세금 일정·연도별 요율 생활 정보, 실패 시 이전 스냅샷 유지와 30분 갱신 workflow를 추가했습니다.', status: '완료', links: ['8cef35e', 'https://github.com/everyhub/everyhub.github.io/actions/runs/45413563090'] },
  { time: '2026-11-24 14:06', request: '사이트 이름을 에브리허브로 바꾸고 메인을 한눈에 바로가기 버튼형 화면으로 바꿔 달라.', reflection: '브랜드·OG·구조화 데이터·README를 에브리허브로 통일하고 분야별 대시보드를 만들었습니다. 연봉 계산기는 전용 주소도 유지했습니다.', status: '완료', links: ['d5c63b9', 'https://github.com/everyhub/everyhub.github.io/actions/runs/45410448660'] },
  { time: '2026-11-24 14:06', request: '누끼 편집기를 별도 도구 탭으로 옮기고 브라우저 전용 유입 도구를 추가해 달라.', reflection: '기기 내 배경 제거·머리카락 보정과 이미지 변환, 글자 수, 만 나이, D-day, 면적 환산을 추가했습니다. 사진은 서버로 전송하지 않습니다.', status: '완료', links: ['d5c63b9', 'https://everyhub.github.io/tools/background-removal/'] },
  { time: '2026-11-24 14:17', request: '전세·월세 전환 한도에 LH·SH 전환보증금 등 주거 유입 도구를 넣어 달라.', reflection: '민간 전월세 전환, LH·SH 전환보증금, 전세보증·대출, 취득세, 중개보수, 청약 가점, 임대차 갱신 도구와 공식 출처를 추가했습니다.', status: '완료', links: ['9628e60', 'https://github.com/everyhub/everyhub.github.io/actions/runs/45412452358'] },
  { time: '2026-11-24 14:21', request: '사이드바와 사이트맵에서 금액별 상세 링크를 줄여 보기 쉽게 해 달라.', reflection: '8개 분야와 도구 중심으로 메뉴·HTML 사이트맵을 축약하고 금액별 상세는 계산기 내부 바로보기와 XML 사이트맵에 유지했습니다.', status: '완료', links: ['e791b9a', 'https://github.com/everyhub/everyhub.github.io/actions/runs/45413190432'] },
  { time: '2026-11-24 14:24', request: '뉴스 예약 실행 원인을 확인하고 수동 refresh 경로를 검증해 달라.', reflection: 'cron 배치·기본 브랜치·job 조건을 확인하고 workflow_dispatch로 56개 뉴스·0개 피드 오류·변경 없음·전체 배포를 검증했습니다.', status: '부분', reason: '확인 시점의 GitHub schedule API에는 예약 실행이 없었습니다. 수동 실행은 예약 실행으로 간주하지 않았습니다.', links: ['https://github.com/everyhub/everyhub.github.io/actions/runs/45413563090'] },
  { time: '2026-11-24 14:30', request: '글자 수 계산기를 보강하고 유입 가능한 브라우저 전용 도구를 더 고민해 달라.', reflection: '글자 수 제한, 텍스트 정리·비교, PDF, 여권 사진, 근무일, 세계 시간, BMI, 단위·할인·더치페이, JSON·인코딩·QR·비밀번호·색상 도구를 추가했습니다.', status: '완료', links: ['c727b12', 'https://github.com/everyhub/everyhub.github.io/actions/runs/45414944822'] },
  { time: '2026-11-24 14:35', request: '좌측 메뉴를 읽기 쉽게 하고 상단 오른쪽에는 사이트맵 대신 메인으로 가는 링크를 보여 달라.', reflection: '분야별 SVG 아이콘, 넓은 터치 영역, 구분선, 활성 분야·항목 강조, 접힘 화살표, 자체 스크롤을 적용했습니다. 사이트맵은 메뉴 하단과 푸터로 옮겼고 상단에는 홈을 표시합니다.', status: '완료', links: ['9767ce9', 'https://github.com/everyhub/everyhub.github.io/actions/runs/45415782352'] },
  { time: '2026-11-24 14:36', request: '메인 페이지에는 바로가기만 남기고 기존 홈 연봉 계산 링크는 계속 작동하게 해 달라.', reflection: '홈의 입력형 연봉 계산 블록을 전용 /tools/salary-calculator/ 페이지로 이동하고, 기존 ?salary=금액#calculator 링크는 같은 query를 보존해 전용 페이지로 클라이언트 이동하게 했습니다.', status: '완료', links: ['작업 중'] },
  { time: '2026-11-24 14:37', request: '지금까지의 요청·반영·상태를 타임라인으로 볼 수 있는 연결되지 않은 관리 페이지를 남겨 달라.', reflection: '이 페이지입니다. 임의 경로의 noindex,nofollow 문서로 만들고 HTML/XML 사이트맵과 메뉴에는 넣지 않습니다.', status: '완료', links: ['작업 중'] },
];

export const adminPending = [
  '30분 뉴스 schedule 실행이 실제로 생성되는지 다음 예정 시각 이후 다시 확인',
  '공식 고시 전인 2027년 구직급여 상한·일부 보험 상·하한·산재 요율·간이세액표 확인',
  'Google Search Console·네이버 서치어드바이저 색인과 sitemap 처리 결과 확인',
  'AdSense 승인·광고 정책·상업 운영 조건 확인',
];
