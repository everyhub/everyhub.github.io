const site = 'https://everyhub.github.io';
const repo = 'https://github.com/everyhub/everyhub.github.io';
const open = (requirement, reason, status = '미확인', links = []) => ({ requirement, status, reason, links });
const verified = (requirement, path, evidence) => ({
  requirement, status: '완료', evidence, links: [path.startsWith('/') ? site + path : path],
});
const tool = (requirement, id, evidence) => verified(requirement, '/tools/' + id + '/', evidence);

export const auditItems = {
  'business-model': [
    verified('기존 프로젝트와 독립된 정적 정보 사이트', '/', '에브리허브 운영 주소·브랜드·도구 허브 확인'),
    open('광고 승인과 실제 자동 수익', '계정 내부 승인·실수익 기록은 미제공입니다. 운영 사이트 방문만으로 수익을 확인할 수 없습니다.'),
  ],
  'search-visibility': [
    verified('기술적 검색 노출 준비', '/sitemap.xml', '공개 URL 응답·canonical 및 소유 확인용 메타 태그 검사'),
    open('Google과 네이버 실제 색인·검색 유입', '소유자 콘솔의 색인·검색 성과 데이터가 필요합니다.'),
  ],
  'pages-start': [
    verified('GitHub Pages 배포', '/', '배포 Actions build/deploy 성공과 운영 주소 HTTP 200 대조'),
    verified('연봉 금액별 검색용 정적 페이지', '/salary/4000/', '연봉 상세 템플릿을 네 화면 너비에서 열고 canonical 확인'),
    tool('연봉 실수령액 계산기', 'salary-calculator', '유효 입력·공란·범위 검사를 브라우저에서 실행'),
  ],
  'anonymous-title': [
    verified('페이지 이름에 개인 이름 미사용', '/', '헤더 로고의 대체 텍스트와 문서 제목의 에브리허브 표기 확인'),
    verified('개인 이름 대신 지속적으로 서비스 브랜드 표시', '/', '공용 헤더와 대표 도구 템플릿의 브랜드 확인'),
  ],
  'organization-choice': [
    verified('선택한 무료 GitHub 조직 주소로 배포', '/', '운영 주소와 GitHub 저장소 소유자 일치'),
  ],
  'organization-url': [
    verified('지정한 조직을 저장소 소유자로 사용', repo, 'GitHub 저장소의 owner 및 공개 Pages 주소 확인'),
  ],
  'rename-request': [
    verified('조직 루트 사이트로 이름과 주소 반영', '/', 'GitHub Pages 운영 주소와 canonical 확인'),
  ],
  'rename-confirmed': [
    verified('사용자가 변경한 저장소 이름과 실제 주소 일치', repo, 'GitHub 저장소 및 사이트 루트 확인'),
  ],
  'github-instructions': [
    verified('GitHub 연결·저장소 설정 절차 안내', repo + '/blob/main/README.md', '사용자에게 절차를 안내하고 저장소 운영 방법을 문서화'),
  ],
  'integration-confirmed': [
    open('사용자가 완료했다고 알린 GitHub 앱 연동', '특정 사용자의 설치 화면에는 접근하지 않았고 이후에는 승인된 토큰 푸시가 확인되었습니다.'),
  ],
  'token-choice': [
    verified('선택한 토큰 방식의 쓰기·배포', repo + '/actions/runs/45436070005', '승인된 기존 토큰으로 푸시 및 Pages 성공 확인; 값은 기록하지 않음'),
  ],
  'official-materials': [
    ...[
      ['최저임금', 'minimum-wage'], ['주휴수당', 'weekly-holiday-pay'], ['퇴직금', 'severance-pay'],
      ['실업급여', 'unemployment-pay'], ['육아휴직급여', 'parental-leave-pay'], ['4대보험', 'insurance-rates'], ['연차', 'annual-leave'],
    ].map(([name, id]) => tool(name + ' 공식 기준 계산·안내', id, '운영 폼·공식 자료 영역과 범위 검사')),
    open('전 연도 전 항목 값 최신화', '공식 미발표 항목은 확정값으로 제공할 수 없고, 전 항목의 기관 원문 대조를 완료하지 않았습니다.', '부분'),
  ],
  'site-verification': [
    verified('Google 및 네이버 소유 확인 메타 적용', '/', '운영 HTML에서 소유 확인 태그 두 개 확인(값은 공개 기록에 복제하지 않음)'),
    open('Google 및 네이버 계정 내 소유 확인 성공', '관리자 전용 콘솔에는 접근하지 않았습니다.'),
  ],
  'after-verification': [
    verified('제출 대상 XML 사이트맵 제공', '/sitemap.xml', 'XML 목록을 읽고 동일 출처 URL의 응답과 canonical 확인'),
    open('두 포털에서 사이트맵 처리 완료', '소유자 콘솔이나 검색 사이트의 처리 상태 증거가 없습니다.'),
  ],
  'sitemap-submitted': [
    verified('사이트맵 공개 응답', '/sitemap.xml', 'XML 응답 및 공개 URL 목록 검사'),
    open('사용자가 알린 실제 제출 결과', '제출 완료 알림과 포털 내부의 성공 처리는 별개입니다.'),
  ],
  'year-2027': [
    verified('공개된 2026·2027 항목 구분', '/info/yearly-rates/', '연도별 비교표와 공식 근거 섹션을 확인'),
    open('미확정 2027 항목 자동 추정 없이 갱신', '구직급여 상한·일부 보험 상하한·산재 요율·간이세액표의 확정 출처를 기다립니다.', '부분'),
  ],
  'korean-wording': [
    verified('주요 메뉴와 홈 제목의 한국어 표기', '/', '홈·주요 허브 제목/메뉴를 확인'),
    open('전체 페이지의 한국어 편집 감수', '자동 레이아웃 검사가 모든 문장의 자연스러움을 검증하지는 않습니다.'),
  ],
  'panel-and-content': [
    verified('사이트맵형 좌측 패널', '/', '좌측 메뉴와 모바일 메뉴 그룹 렌더링 확인'),
    verified('주거·근로·정보·도구로 연봉 외 주제 분리', '/sitemap/', '해당 허브 링크와 운영 페이지 응답 확인'),
    open('주제 추가로 인한 실제 검색 유입 증가', '사용자 또는 검색 콘솔 지표가 없습니다.'),
  ],
  'maintain-readme': [
    verified('현재 구조·실행·배포·운영 설명', repo + '/blob/main/README.md', '운영 절차와 감사 명령을 공개 README에서 확인'),
    open('이후 변경에도 README 계속 최신 유지', '향후 변경마다 적용하는 지속적인 운영 규칙입니다.'),
  ],
  'news-categories': [
    ...[['korea', '국내 IT'], ['world', '해외 IT'], ['ai', 'AI 모델·이슈'], ['trending', '핫이슈']].map(([id, name]) =>
      verified(name + ' 별도 소식 페이지', '/news/' + id + '/', '운영 페이지의 제목·출처 링크·기사 목록 확인')),
  ],
  'news-cadence': [
    verified('별도 뉴스 작업 수동 실행 경로', repo + '/actions/runs/45426475348', 'workflow_dispatch의 build 및 deploy 성공'),
    open('권장 주기 30분 실제 예약 실행', '별도 워크플로 등록 후 45분 관찰에서 schedule 이벤트 0건이었습니다.'),
  ],
  'non-calculators': [
    verified('계산기 외 생활정보 허브', '/info/', '공휴일, 세무 일정, 연도별 기준 안내 링크 확인'),
    verified('공휴일과 주요 일정 캘린더', '/info/holidays/2026/', '월별 표, 오늘과 대체공휴일 표시 검사'),
    open('정부 지원금 일정', '복지 안내와 별개인 통합 지원금 일정은 추가하지 않았습니다. 기관별 확인된 신청 기간만 사용할 수 있습니다.', '부분'),
  ],
  'background-tool': [
    tool('도구 메뉴에서 누끼 실행 및 저장', 'background-removal', '합성 이미지 선택 후 모델 실행과 저장 활성화 확인'),
    tool('파일·사진 외부 전송 없음', 'background-removal', '모델·WASM를 포함한 브라우저 요청이 전부 동일 출처 GET인지 확인'),
    ...[
      ['글자 수', 'character-count'], ['만 나이', 'age'], ['D-day', 'date-difference'], ['평수 변환', 'area-converter'],
      ['이미지 크기 변경·압축', 'image-resize'], ['QR 생성', 'qr-generator'], ['비밀번호 생성', 'password-generator'],
    ].map(([name, id]) => tool(name, id, '운영 폼 실행, 결과 또는 다운로드 표시 검사')),
    open('HEIC → JPG 변환', '운영 이미지 변환기의 입력 형식에 없고, 주요 브라우저에서 검증된 동일 출처 HEIC 디코더가 아직 없습니다.', '부분', [site + '/tools/image-resize/']),
  ],
  'shortcut-home': [
    verified('홈에서 카드별 바로가기', '/#shortcuts', '카드와 바로가기 검색의 데스크톱·모바일 배치 확인'),
  ],
  'old-home-name': [
    verified('홈의 기존 ‘일과 급여’ 브랜드명 교체', '/', '문서 제목과 헤더의 에브리허브 확인'),
  ],
  'chosen-brand': [
    verified('에브리허브 (EveryHub) 브랜드·주소 일치', '/', '헤더, 문서 제목, everyhub.github.io canonical 확인'),
  ],
  'housing-tools': [
    tool('일반 전월세 전환 한도', 'rent-conversion', '운영 폼·입력 경계 검사'),
    tool('LH·SH 공공임대 보증금 전환', 'public-rent-conversion', '운영 폼의 LH·SH 안내, 공고별 입력 및 범위 검증'),
    verified('주거 허브에 전세대출·복비·취득세·청약 도구', '/housing/', '해당 링크와 도구 폼 운영 검사'),
  ],
  'compact-nav': [
    verified('HTML 메뉴·사이트맵 요약', '/sitemap/', '분야별 허브 중심 링크와 모바일 가로 넘침 검사'),
    verified('XML 목록 및 기존 주소 유지', '/sitemap.xml', 'XML URL 목록 응답·canonical 대조 및 대표 연봉 상세 검사'),
  ],
  'github-permission': [
    verified('변경된 권한으로 기본 브랜치 푸시', repo + '/actions/runs/45436070005', '푸시 이벤트와 빌드·배포 성공 확인'),
    verified('수동 워크플로 실행 권한', repo + '/actions/runs/45426475348', '수동 뉴스 워크플로 성공 확인'),
    open('저장소 내부 Actions 정책·세부 권한', 'Actions permissions 조회는 현재 자격 증명에서 403입니다. 가능한 작업만 검증했습니다.'),
  ],
  'writing-tools': [
    tool('공백 포함·제외 및 UTF-8 글자 수', 'character-count', '합성 한글 입력으로 운영 결과 검사'),
    tool('자기소개서 목표값·직접 입력', 'character-count', '500·1,000·1,500자 예시 및 직접 입력 결과'),
    tool('공식 Bluesky 글자 수·바이트 한도', 'character-count', '390·1440px에서 301자 입력 시 1자 초과 및 2,097바이트 남음 확인'),
    open('다른 SNS의 특수 계산 방식', '자소서 예시, 공식 Bluesky 규격, 직접 입력만 지원합니다. X 가중치·링크 계산을 동일한 규칙으로 단정하지 않습니다.', '부분'),
    tool('여권 사진 자르기', 'passport-photo', '390·1440px에서 합성 PNG로 413×531 JPG 생성과 다운로드 확인'),
    tool('증명사진 직접 지정 크기', 'passport-photo', '390·1440px에서 합성 PNG로 320×400 JPG 생성과 다운로드 확인'),
    tool('공식 범위의 음력↔양력 변환', 'lunar-calendar', 'KASI의 37개 월초·월 길이 대조 및 390·1440px에서 2028 윤5월 1일 왕복 변환'),
    tool('사다리 타기', 'ladder-draw', '390·1440px에서 두 참가자와 두 결과 입력 후 그림과 두 도착점 확인'),
    ...[
      ['텍스트 정리', 'text-cleanup'], ['텍스트 비교', 'text-compare'], ['PDF 합치기', 'pdf-merge'],
      ['PDF 추출', 'pdf-split'], ['이미지 → PDF', 'images-to-pdf'], ['근무일수·공휴일 제외', 'workdays'],
      ['세계 시간', 'world-time'], ['BMI', 'bmi'], ['길이·무게·온도 변환', 'unit-converter'],
      ['퍼센트·할인율', 'percentage'], ['더치페이', 'split-bill'], ['무작위 추첨', 'random-picker'],
      ['JSON', 'json-formatter'], ['Base64·URL 인코딩', 'text-encoding'], ['QR 코드', 'qr-generator'],
      ['비밀번호', 'password-generator'], ['색상 변환', 'color-converter'],
    ].map(([name, id]) => tool(name, id, '운영 폼 실행 및 결과 또는 다운로드 검사')),
  ],
  'sidebar-redesign': [
    verified('분야별 아이콘·대표 링크로 왼쪽 메뉴 간결화', '/', '사이드바 그룹 및 아이콘 표시 확인'),
    tool('현재 페이지·상위 그룹 강조', 'age', '운영 사이트에서 활성 도구 그룹 확인'),
    verified('모바일 메뉴 열고 닫기', '/', '좁은 화면 메뉴 토글과 Escape 확인'),
    open('터치 타깃 크기·고정 스크롤·접힘 전환 전체 검증', '반응형 넘침은 확인했으나 모든 상태의 타깃 크기와 스크롤을 개별 수치로 확인하지 않았습니다.'),
  ],
  'header-home': [
    tool('우측 상단 홈 링크', 'age', '헤더 홈 링크와 목적지 확인'),
    verified('사이트맵 링크 메뉴 하단·푸터 이동', '/sitemap/', '운영 사이트의 메뉴와 푸터 링크 확인'),
  ],
  'salary-removed': [
    verified('홈에서 독립 연봉 입력 폼 제거', '/', '홈의 급여 카드만 유지하며 계산기 입력 폼 없음'),
    verified('기존 salary 쿼리와 해시 유지', '/?salary=4000#calculator', 'Playwright로 전용 도구로 이동한 URL을 정확히 대조'),
  ],
  'standalone-admin': [
    verified('별도 관리 페이지와 두 탭', '/ops-7f3a9c2d/', '관리 타임라인 및 추천 탭 HTTP 200와 noindex 확인'),
    verified('공개 메뉴·XML/HTML 사이트맵·robots.txt에서 미노출', '/sitemap.xml', '공개 탐색 목록에 관리 경로가 없음을 확인'),
  ],
  'visitor-count': [
    open('방문자 집계 도입', '명시적 사용자 승인 전에는 분석·추적 도구를 추가하지 않습니다.', '제외', [repo + '/blob/main/README.md']),
  ],
  'all-chip': [
    verified('각 홈 카드 우측 상단의 전체 → 칩', '/#shortcuts', '1440px·390px에서 카드와 칩 수, 배치, 링크 확인'),
  ],
  'convenience': [
    tool('결과 복사', 'salary-calculator', '운영 버튼을 눌러 복사 결과 확인'),
    tool('입력 초기화', 'age', '입력 후 초기화하여 기준일·값 상태 확인'),
    tool('금액 옆 천 단위 쉼표', 'salary-calculator', '입력 숫자와 시각 표시를 구분하고 계산 결과 확인'),
    verified('맨 위로 버튼', '/', '스크롤 후 버튼을 눌러 최상단 이동 확인'),
    verified('최근 본 도구', '/#shortcuts', '도구에서 돌아왔을 때 홈 목록에 이전 도구 표시 확인'),
    verified('홈 바로가기 검색', '/#shortcuts', '검색 결과 및 비어 있는 상태의 추천어 확인'),
    open('모든 기기의 터치·포커스 및 비민감 설정 복원', '대표 화면과 일부 설정만 확인했고 모든 도구 조합에서 재방문·키보드·터치 동작을 검사하지 않았습니다.'),
  ],
  'geek-news': [
    verified('긱뉴스 국내 IT 상단', '/news/korea/', '운영 목록 첫 카드의 출처 확인'),
    verified('출처 필터 선택과 해제', '/news/korea/', '긱뉴스 버튼을 눌러 다른 출처 숨김과 전체 복원 확인'),
    verified('토스·GitHub Changelog·LY·DeepMind 피드', '/news/', '각 분야에서 해당 기사 출처 확인'),
    verified('NASA 제외, Hacker News 핫이슈 유지', '/news/trending/', '운영 핫이슈 기사 출처 확인'),
    verified('당근 테크 블로그', '/news/korea/', '390·1440px에서 해당 출처 버튼 선택 후 당근 기사만 표시됨을 확인'),
    verified('Engineering at Meta', '/news/world/', '390·1440px에서 해당 출처 버튼 선택 후 Meta 기사만 표시됨을 확인'),
    open('우아한형제들 기술 블로그', '로컬 Node에서 RSS를 읽었지만 운영 빌드 #45437481906에 기사가 없었고 별도 HTTP 확인은 403입니다. 신뢰할 수 있을 때까지 수집에서 제외했습니다.', '부분', [repo + '/actions/runs/45437481906', 'https://techblog.woowahan.com/feed/']),
    open('Anthropic News 및 Meta AI 직접 피드', '확인한 발행처 RSS 후보가 404였으며 공식 배포 중인 호환 피드를 확인하지 못했습니다. 비공식 피드로 대체하지 않습니다.', '제외'),
    open('출처별 별도 탭', '현재 분야별 탭 안에서 출처 필터를 제공합니다. 긱뉴스는 국내 IT 상단을 택했으며 독립 탭은 만들지 않았습니다.', '제외'),
  ],
  'date-four-digit': [
    tool('만 나이 여섯 자리 연도 입력 거부', 'age', '브라우저 유효성 검사·친절한 오류 메시지·기준일 재설정 확인'),
    tool('디데이·기타 날짜 도구의 경계 검사', 'date-difference', '빈 값·윤일·123456년·최솟값·최댓값에 대한 운영 브라우저 검사'),
  ],
  'quality-privacy': [
    verified('계산기·도구의 비정상 입력, 모바일 넘침, 콘솔 검사', '/tools/', '브라우저 감사에서 모든 일반 도구 폼과 대표 표시 너비를 검사'),
    verified('입력·파일은 기기 안에서 처리', '/tools/', '감사 중 네트워크를 가로채 동일 출처 GET/HEAD와 쿼리 없음 확인'),
    open('모든 기능·입력 조합 무결함', '자동 퍼징은 대표·경계 사례입니다. 모든 조합과 모든 브라우저에 대해 버그가 없음을 증명하지 못합니다.'),
  ],
  'holiday-calendar': [
    verified('2026·2027 각각 월별 12달 표와 기존 목록', '/info/holidays/2026/', '운영 두 페이지의 12개월 표와 법정공휴일·연휴 목록 확인'),
    verified('색상 범례·대체공휴일·오늘 KST 표시', '/info/holidays/2026/', '날짜를 2026-05-25 KST로 고정하여 today 및 substitute 표시 확인'),
    verified('연도 전환 링크', '/info/holidays/2027/', '2026·2027 상호 이동 링크와 반응형 레이아웃 확인'),
  ],
  'info-visuals': [
    verified('국세청 신고·납부 기간 타임라인', '/info/tax-calendar/', '월별 일정 섹션, 출처 및 모바일 가로 넘침 검사'),
    verified('연도별 요율 모바일 표', '/info/yearly-rates/', '운영 비교표를 390·768·1024·1440px에서 열어 넘침 검사'),
    open('정보 페이지가 늘 때 같은 시각 편의성 유지', '새 페이지마다 적용해야 하는 운영 기준입니다.'),
  ],
  'original-images': [
    verified('직접 제작한 헤더 마크·홈 일러스트', '/', '운영 홈에서 로고와 SVG 일러스트 로드 확인'),
    verified('파비콘·앱 아이콘·매니페스트', '/assets/brand/site.webmanifest', '운영 매니페스트 및 네 PNG 크기·SVG 자산 응답 확인'),
    verified('1200×630 공유 배너와 메타 태그', '/', '홈과 대표 도구의 OG/Twitter 이미지 메타 및 운영 이미지 응답 확인'),
    verified('원본 공개 라이선스', repo + '/blob/main/src/brand/LICENSE.txt', '원본 이미지 라이선스 파일은 CC0로 명시'),
  ],
  'fuzzy-search': [
    verified('나이·집/방/주거·퇴사·pdf 관련어', '/#shortcuts', '운영 검색에 예시값을 입력하고 기대 URL 및 순위 비교'),
    verified('오타와 초성', '/#shortcuts', '운영 검색에서 디데히와 ㅇㅂ의 기대 결과 비교'),
    verified('키보드·추천 빈 상태·분야와 일치어 표시', '/#shortcuts', '운영에서 /, 화살표, Enter, 결과가 없는 검색을 검사'),
    open('모바일·사이드바에 별도 검색 입력', '홈에는 양쪽 화면에서 같은 검색을 제공하므로 메뉴 안에 중복 입력은 추가하지 않았습니다.', '제외'),
  ],
  'search-release': [
    verified('검색 커밋·배포', repo + '/actions/runs/45422534123', 'build/deploy 성공과 운영 검색 결과 확인'),
  ],
  'previous-briefs': [
    verified('이전 작업의 커밋 및 배포 실행 링크 제공', repo + '/actions', '이전 회신에서 각 작업의 실행 링크 제시'),
    open('이전 각 작업의 모든 약속까지 완료', 'HEIC, 예약 실행 등의 미완료가 남아 있어 기존의 대표 검증을 완료 근거로 쓰지 않습니다.', '부분'),
  ],
  'schedule-recheck': [
    verified('수동 실행의 변경 없음 배포 건너뛰기', repo + '/actions/runs/45426026991', '수동 빌드에서 변경 없음 메시지와 deploy skipped 확인'),
    open('예약 실행 재조회', '최근 확인에서 event=schedule 실행이 0건입니다. 수동 실행으로 대체하지 않습니다.'),
  ],
  'admin-address': [
    verified('요청 타임라인 운영 주소', '/ops-7f3a9c2d/', '사용자에게 전달한 주소가 HTTP 200'),
  ],
  'leftover-link': [
    verified('홈에서 독립 연봉 공식 기준 링크 제거', '/', '홈 본문에서 해당 문구와 독립 블록 부재, 카드·검색 링크 유지 확인'),
  ],
  'truthful-status': [
    verified('초기 실패를 실제 성공 배포와 구분', '/ops-7f3a9c2d/', '관리 페이지 과거 운영 기록의 실패 및 사유 확인'),
    open('요청 세부 항목까지 확인하고서만 종료', '엄격한 감사 기준을 적용하되 아직 운영 확인이 부족한 항목은 완료하지 않습니다.', '진행중'),
  ],
  'site-layout': [
    verified('헤더와 페이지 그리드 양쪽 정렬', '/', '390·768·1024·1440px에서 헤더와 본문 좌우 경계를 비교'),
    verified('반응형 가로 스크롤 없음', '/sitemap/', '홈·허브·도구·뉴스·주거·정보·상세·관리 템플릿 브라우저 검사'),
    verified('한글 줄바꿈과 홈 제목/검색 정렬', '/#shortcuts', '390·1440px 홈에서 기능을 바로 줄바꿈과 제목·입력 위치 확인'),
    open('전 템플릿 전체 문구와 전체 글자 크기의 시각 감수', '자동화된 겹침 검사와 대표 화면 검토는 수행했으나 모든 텍스트의 시각적 적정성은 검증하지 않았습니다.'),
  ],
  'proposals-feature': [
    verified('관리 페이지 추천 탭과 초기 제안 3건', '/ops-7f3a9c2d/recommendations/', '운영 카드와 실제 GitHub 이슈 링크 검사'),
    open('검색 수요와 트렌드를 조사한 정기 후보 갱신', '자동화는 등록했으나 최초 일일 실행과 검색 추세 근거를 관찰하지 않았습니다.', '진행중'),
  ],
  'proposal-approval': [
    verified('각 제안의 무엇·왜·출처·범위·제외 조건', '/ops-7f3a9c2d/recommendations/', '세 카드에서 항목과 승인·거절 안내 확인'),
    verified('GitHub 이슈를 통한 승인 검토 링크', '/ops-7f3a9c2d/recommendations/', '승인 버튼이 실제 해당 이슈를 여는지 검증'),
    open('승인된 실제 제안의 다음 자동 실행 반영', '사용자가 승인한 이슈와 실행 결과가 필요합니다. 자체 승인은 하지 않습니다.', '진행중'),
  ],
  'timeline-order': [
    verified('진행중 먼저, 그룹 안에서 최신순', '/ops-7f3a9c2d/', '문서 로드 후 모든 행의 순서와 날짜 비교'),
  ],
  'daily-choice': [
    open('09:13 KST 매일 일일 자동화 등록', '사용자 정정으로 등록됨을 확인했습니다. 처음 실행 전에는 운영 완료 상태가 아닙니다.', '진행중',
      ['https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9']),
    open('첫 실제 실행 검증', '2026-11-25 09:13 KST 예정. 실행 결과는 아직 확인되지 않았습니다.', '진행중'),
  ],
  'issues-permissions': [
    verified('제안·승인·거절 라벨', repo + '/labels', 'GitHub API로 세 라벨 존재 확인'),
    verified('실제로 생성된 제안 이슈', repo + '/issues', '운영 추천 카드의 링크와 실제 이슈 세 건 대조'),
  ],
  'full-audit': [
    verified('보관 대화와 현재 세션 요청 목록 배포', '/ops-7f3a9c2d/', '이전 운영 배포의 요청 목록과 Markdown 61개 행 대조'),
    open('모든 원문 요구·이전 약속을 각각 운영 검사', '이전 감사는 일부 작업을 묶었거나 미검증 약속에 완료를 부여했습니다. 세부 항목을 분리하고 누락 검증을 계속합니다.', '진행중'),
  ],
  'audit-saved': [
    verified('관리 타임라인·Markdown 같은 순서와 내용', '/ops-7f3a9c2d/', '기존 운영 61개 행의 요청·상태·사유·URL 대조'),
    verified('상·하위 상태와 근거를 같은 원본에서 생성', '/ops-7f3a9c2d/', '운영 페이지의 개별 항목과 Markdown 원본의 상태·사유·근거 대조'),
  ],
  'schedule-experiment': [
    verified('기본 브랜치 별도 워크플로·7,37 * * * *', repo + '/actions/workflows/news.yml', '워크플로 active, main 파일의 cron, 성공한 수동 빌드/배포 확인'),
    verified('두 예정 시각 포함 최소 45분 관찰', repo + '/actions/workflows/news.yml', '00:31~01:16 KST 관찰 기록과 schedule 실행 0건 확인'),
    open('GitHub 내부 예약 등록과 미실행 원인', 'Actions 설정 API 403이고 내부 예약 등록 상태가 API에 공개되지 않습니다.'),
  ],
  'publish-audit': [
    verified('이전 감사 커밋 푸시·배포', repo + '/actions/runs/45435239660', 'push run 완료, build와 deploy 모두 성공'),
  ],
  'home-polish': [
    verified('한눈에 바로가기·검색 입력 수직 정렬', '/#shortcuts', '1440px의 중앙Y 비교 및 390px 세로 배치 검사'),
    verified('카테고리 링크 기본 밑줄 제거·호버만·전체 칩 유지', '/#shortcuts', '기본과 hover의 computed style, 칩 확인'),
    verified('기능을 바로가 분리되지 않음', '/', '390px·1440px에서 두 단어의 baseline 비교'),
  ],
  'automation-correction': [
    verified('관리 페이지의 등록됨 · 첫 실행 확인 대기 표기', '/ops-7f3a9c2d/recommendations/', 'f09b795 배포에서 추천 탭과 타임라인 한국어 문구 확인'),
    verified('09:13 KST 및 첫 실행 예정 운영 문서', repo + '/blob/main/docs/daily-proposals.md', 'f09b795 운영 문서와 예약 상태 동기화'),
  ],
  'strict-audit': [
    verified('이전 요청과 약속을 분리하고 확인된 누락 기능 수정', '/ops-7f3a9c2d/', '관리 화면의 세부 상태 및 음양력·증명사진·SNS·사다리·추가 뉴스 출처 운영 검사'),
    verified('모든 세부 항목에 운영 근거가 없으면 완료 금지', repo + '/blob/main/test/pages.test.mjs', '부모 상태의 회귀 테스트와 운영 타임라인 내용 비교'),
    open('모든 미완료 항목 해소 및 확인', 'HEIC, 지원금 일정, 예약 이벤트, 계정·공식 자료 등 추가 작업 또는 검증이 남았습니다.', '진행중'),
  ],
};

export const unconfirmed = (requirement, reason, links) => open(requirement, reason, '미확인', links);
