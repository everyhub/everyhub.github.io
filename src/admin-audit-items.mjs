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
    open('전 연도 전 항목 값 최신화', '노동·세금·주거 법령과 공휴일 대조를 관리 페이지에 기록했습니다. SH 개별 모집공고의 전환이율·한도와 미발표 공식 수치는 별도 확인이 필요합니다.', '부분', [site + '/ops-7f3a9c2d/#official-value-evidence']),
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
    tool('확인 가능한 2027년 보험료율과 상반기 국민연금 기준소득월액', 'insurance-rates', '2026-11-25 보건복지부의 건강보험 총 7.19%, 건강보험료 대비 장기요양 13.90% 결정 및 고시 제2026-31호의 2027년 6월분까지 41만~659만 원을 운영 비교 페이지와 대조했습니다.'),
    open('미확정 2027 항목 자동 추정 없이 갱신', '고용노동부의 구직급여·출산휴가 상한과 업종별 산재 요율, 공단의 하반기 연금·건강보험 상하한, 국세청의 근로소득 간이세액표 확정 원문이 필요합니다. 행정예고는 적용하지 않습니다.', '부분', [site + '/info/yearly-rates/', repo + '/blob/main/README.md']),
  ],
  'korean-wording': [
    verified('주요 메뉴와 홈 제목의 한국어 표기', '/', '홈·주요 허브 제목/메뉴를 확인'),
    verified('페이지 템플릿의 한국어 본문·양식·오류 문구 감수', '/sitemap/', '페이지 템플릿과 입력 도움말·오류 문구를 검토하고 급여 FAQ, 주거 입력 안내, PDF 도움말과 JSON 오류 문구를 수정했습니다. 운영 브라우저에서 잘못된 JSON 입력의 한국어 안내를 확인했습니다.'),
  ],
  'panel-and-content': [
    verified('사이트맵형 좌측 패널', '/', '좌측 메뉴와 모바일 메뉴 그룹 렌더링 확인'),
    verified('주거·근로·정보·도구로 연봉 외 주제 분리', '/sitemap/', '해당 허브 링크와 운영 페이지 응답 확인'),
    open('주제 추가로 인한 실제 검색 유입 증가', '사용자 또는 검색 콘솔 지표가 없습니다.'),
  ],
  'maintain-readme': [
    verified('현재 구조·실행·배포·운영 설명', repo + '/blob/main/README.md', '운영 절차와 감사 명령을 공개 README에서 확인'),
    verified('변경 시 README 갱신 기준', repo + '/blob/main/README.md', '새 작업의 검증 및 README 갱신 규칙을 문서화하고 이번 변경 설명도 갱신'),
  ],
  'news-categories': [
    ...[['korea', '국내 IT'], ['world', '해외 IT'], ['ai', 'AI 모델·이슈'], ['trending', '핫이슈']].map(([id, name]) =>
      verified(name + ' 별도 소식 페이지', '/news/' + id + '/', '운영 페이지의 제목·출처 링크·기사 목록 확인')),
  ],
  'news-cadence': [
    verified('별도 뉴스 작업 수동 실행 경로', repo + '/actions/runs/45426475348', 'workflow_dispatch의 build 및 deploy 성공'),
    verified('실제 뉴스 예약 실행과 배포', repo + '/actions/runs/45515165966', '2026-11-25 09:04 KST 시작, event=schedule, refresh / build·refresh / deploy 모두 success'),
    verified('추천 실행에 연결한 뉴스 보완 갱신 절차', repo + '/actions/runs/45525260475', '2026-11-25 10:22 KST workflow_dispatch에서 112건을 수집했고 피드 실패 0건, 빌드·배포 성공을 확인했습니다. 같은 확인 절차를 추천 운영 문서에 기록했습니다.'),
    open('권장 주기 30분의 지속 실행', '2026-11-25 10:26 KST 재조회까지 09:04 KST 이후 예약 성공 1건만 확인했습니다. 보완 실행은 예약 건수에서 제외하며, 반복 실행 기록이 필요합니다.', '미확인', [repo + '/actions/workflows/news.yml']),
  ],
  'non-calculators': [
    verified('계산기 외 생활정보 허브', '/info/', '공휴일, 세무 일정, 연도별 기준 안내 링크 확인'),
    verified('공휴일과 주요 일정 캘린더', '/info/holidays/2026/', '월별 표, 오늘과 대체공휴일 표시 검사'),
    verified('정부 지원금·신청 일정', '/info/support-calendar/', '9216f93 운영 390·1440px에서 복지로 온라인 신청 기간과 국세청 마감일, 고용24 상시 접수 및 접수처 확인'),
  ],
  'background-tool': [
    tool('도구 메뉴에서 누끼 실행 및 저장', 'background-removal', '합성 이미지 선택 후 모델 실행과 저장 활성화 확인'),
    tool('파일·사진 외부 전송 없음', 'background-removal', '모델·WASM를 포함한 브라우저 요청이 전부 동일 출처 GET인지 확인'),
    ...[
      ['글자 수', 'character-count'], ['만 나이', 'age'], ['D-day', 'date-difference'], ['평수 변환', 'area-converter'],
      ['이미지 크기 변경·압축', 'image-resize'], ['QR 생성', 'qr-generator'], ['비밀번호 생성', 'password-generator'],
    ].map(([name, id]) => tool(name, id, '운영 폼 실행, 결과 또는 다운로드 표시 검사')),
    tool('HEIC → JPG 변환', 'image-resize', '9216f93 운영 Chromium 390·1440px에서 합성 HEIC가 12×8 JPG로 저장되며 WASM 포함 같은 출처 GET만 사용함을 확인'),
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
    open('저장소 내부 Actions 정책·세부 권한', 'Actions permissions 조회가 403입니다. 저장소·조직 관리자의 정책 화면 확인 또는 해당 권한으로 읽은 결과가 필요합니다.'),
  ],
  'writing-tools': [
    tool('공백 포함·제외 및 UTF-8 글자 수', 'character-count', '합성 한글 입력으로 운영 결과 검사'),
    tool('자기소개서 목표값·직접 입력', 'character-count', '500·1,000·1,500자 예시 및 직접 입력 결과'),
    tool('공식 Bluesky 글자 수·바이트 한도', 'character-count', '390·1440px에서 301자 입력 시 1자 초과 및 2,097바이트 남음 확인'),
    tool('X 일반 게시글 가중치·링크 규칙', 'character-count', '9216f93 운영 390·1440px에서 한글·가족 이모지·긴 URL 입력의 가중치 29, 280 중 251 남음 확인'),
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
    verified('터치 타깃 크기·고정 스크롤·접힘 전환', '/', '720e41b 운영 390·768·1024·1440px에서 전 메뉴 키보드 토글, 영역 높이 44px 이상과 데스크톱 sticky·독립 스크롤 검사'),
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
    verified('비민감 설정 복원과 초기화', '/tools/character-count/', '720e41b 운영 390·1440px에서 글자 수 방식, 길이 단위, 면적 단위, 비밀번호 설정 재방문 복원 및 초기화 후 로컬 저장 삭제 확인'),
    verified('키보드 포커스 및 터치 영역', '/', '720e41b 운영 네 너비의 메뉴 타깃 크기 및 키보드 동작과 바로가기 입력 포커스 확인'),
  ],
  'geek-news': [
    verified('긱뉴스 국내 IT 상단', '/news/korea/', '운영 목록 첫 카드의 출처 확인'),
    verified('출처 필터 선택과 해제', '/news/korea/', '긱뉴스 버튼을 눌러 다른 출처 숨김과 전체 복원 확인'),
    verified('토스·GitHub Changelog·LY·DeepMind 피드', '/news/', '각 분야에서 해당 기사 출처 확인'),
    verified('NASA 제외, Hacker News 핫이슈 유지', '/news/trending/', '운영 핫이슈 기사 출처 확인'),
    verified('당근 테크 블로그', '/news/korea/', '390·1440px에서 해당 출처 버튼 선택 후 당근 기사만 표시됨을 확인'),
    verified('Engineering at Meta', '/news/world/', '390·1440px에서 해당 출처 버튼 선택 후 Meta 기사만 표시됨을 확인'),
    verified('우아한형제들 기술블로그 직접 가기', '/news/korea/', '9216f93 운영 390·1440px에서 공식 기술블로그 링크 확인'),
    open('우아한형제들 기술블로그 자동 수집', '공식 RSS·REST 피드가 수집 환경에서 HTTP 403을 반환합니다. 발행처가 해당 환경에서 읽을 수 있는 공식 피드를 제공하거나 접근을 허용해야 합니다.', '부분', ['https://techblog.woowahan.com/feed/', site + '/news/korea/']),
    open('Anthropic News 및 Meta AI 직접 피드', '확인한 발행처 RSS 후보가 404였으며 공식 배포 중인 호환 피드를 확인하지 못했습니다. 비공식 피드로 대체하지 않습니다.', '제외'),
    verified('주소로 바로 열 수 있는 출처별 보기', '/news/korea/#source-geeknews', '720e41b 운영 390·768·1024·1440px에서 출처 주소로 들어가면 해당 기사만 표시'),
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
    verified('새 생활정보 페이지의 읽기 쉬운 타임라인', '/info/support-calendar/', '신청 날짜와 각 기관의 공고·접수처를 사업별 타임라인으로 제공'),
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
    verified('모바일·사이드바에서 같은 검색 사용', '/#shortcut-search', '720e41b 운영 네 너비에서 사이드바 검색 링크가 동일한 검색창으로 포커스를 이동'),
  ],
  'search-release': [
    verified('검색 커밋·배포', repo + '/actions/runs/45422534123', 'build/deploy 성공과 운영 검색 결과 확인'),
  ],
  'previous-briefs': [
    verified('이전 작업의 커밋 및 배포 실행 링크 제공', repo + '/actions', '이전 회신에서 각 작업의 실행 링크 제시'),
    open('이전 각 작업의 모든 약속까지 완료', '뉴스 예약 실행과 일부 계정 증거·공식 자료 등은 해당 개별 행에 남아 있습니다. 완료한 보완의 운영 증거는 각 행에 기록했습니다.', '부분'),
  ],
  'schedule-recheck': [
    verified('수동 실행의 변경 없음 배포 건너뛰기', repo + '/actions/runs/45426026991', '수동 빌드에서 변경 없음 메시지와 deploy skipped 확인'),
    verified('예약 실행 재조회', repo + '/actions/runs/45515165966', 'Actions API event=schedule과 jobs를 대조해 2026-11-25 09:04 KST 시작 및 빌드·배포 성공 확인'),
  ],
  'admin-address': [
    verified('요청 타임라인 운영 주소', '/ops-7f3a9c2d/', '사용자에게 전달한 주소가 HTTP 200'),
  ],
  'leftover-link': [
    verified('홈에서 독립 연봉 공식 기준 링크 제거', '/', '홈 본문에서 해당 문구와 독립 블록 부재, 카드·검색 링크 유지 확인'),
  ],
  'truthful-status': [
    verified('초기 실패를 실제 성공 배포와 구분', '/ops-7f3a9c2d/', '관리 페이지 과거 운영 기록의 실패 및 사유 확인'),
    verified('요청 세부 항목까지 확인하고서만 종료하는 기준', '/ops-7f3a9c2d/', '운영 타임라인과 회귀 테스트에서 상위 완료에 모든 세부 항목의 설명 및 HTTPS 근거 요구 확인'),
  ],
  'site-layout': [
    verified('헤더와 페이지 그리드 양쪽 정렬', '/', '390·768·1024·1440px에서 헤더와 본문 좌우 경계를 비교'),
    verified('반응형 가로 스크롤 없음', '/sitemap/', '홈·허브·도구·뉴스·주거·정보·상세·관리 템플릿 브라우저 검사'),
    verified('한글 줄바꿈과 홈 제목/검색 정렬', '/#shortcuts', '390·1440px 홈에서 기능을 바로 줄바꿈과 제목·입력 위치 확인'),
    verified('390·1440px 템플릿별 줄바꿈과 글자 크기 감수', '/info/support-calendar/', '96개 템플릿 경로를 두 너비에서 캡처해 확인하고 지원 일정의 세로 글줄과 금액·요율의 모바일 표 줄바꿈을 수정했습니다.'),
  ],
  'proposals-feature': [
    verified('관리 페이지 추천 탭과 초기 제안 3건', '/ops-7f3a9c2d/recommendations/', '운영 카드와 실제 GitHub 이슈 링크 검사'),
    verified('공개 검색 동향을 조사한 첫 정기 후보 갱신', repo + '/actions/runs/45517359629', '2026-11-25 09:13 KST 첫 조사에서 한국 Google Trends 공개 표본과 정책 공고를 검토했고 제안 #4~#6 운영 반영을 확인했습니다. 네이버 비교 수치는 별도 행에서 추적합니다.'),
  ],
  'proposal-approval': [
    verified('각 제안의 무엇·왜·출처·범위·제외 조건', '/ops-7f3a9c2d/recommendations/', '세 카드에서 항목과 승인·거절 안내 확인'),
    verified('GitHub 이슈를 통한 승인 검토 링크', '/ops-7f3a9c2d/recommendations/', '승인 버튼이 실제 해당 이슈를 여는지 검증'),
    verified('승인된 실제 제안 반영과 결과 기록', repo + '/issues/4#issuecomment-7149108445', '사용자가 승인한 #1·#2·#4를 운영 검사 후 댓글을 남겨 종료했습니다. 정기 승인 확인 실행은 별도 행에서 추적합니다.'),
  ],
  'timeline-order': [
    verified('진행중 먼저, 그룹 안에서 최신순', '/ops-7f3a9c2d/', '문서 로드 후 모든 행의 순서와 날짜 비교'),
  ],
  'daily-choice': [
    verified('09:13 KST 매일 일일 자동화 등록', 'https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9', '사용자가 등록과 실행 시각을 확인했으며 첫 실행 결과는 별도 항목에서 추적'),
    verified('첫 09:13 실행과 결과 검증', repo + '/actions/runs/45517359629', '2026-11-25 첫 추천 조사에서 제안 #4~#6 등록, 빌드·배포 성공 및 운영 추천 탭 반영 확인.'),
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
    verified('이후 실제 예약 실행 확인', repo + '/actions/runs/45515165966', '2026-11-25 09:04 KST 시작한 Refresh news 예약 빌드 및 배포 성공'),
    open('GitHub 내부 예약 등록과 미실행 원인', 'Actions 설정 API가 403이고 내부 예약 등록 상태가 API에 공개되지 않습니다. 조직·저장소 관리자의 정책 확인 후에도 이상이 없으면 GitHub 측 예약 등록 확인이 필요합니다.'),
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
    verified('첫 실행 결과의 운영 확인', repo + '/actions/runs/45517359629', '2026-11-25 일일 추천 첫 예약 실행의 제안 등록, Pages build·deploy와 운영 추천 탭 표시 확인'),
  ],
  'site-proposal-news-review': [
    verified('전체 화면과 주요 도구 재검수', '/sitemap/', '390·768·1024·1440px에서 104개 경로의 캡처 416장을 이전 검수 증거와 비교하고 차이 영역과 주요 화면을 육안 확인했습니다. 114회 양식 실행, 1,640개 검사, 동일 출처 요청 5,549건에서 문제 0건을 기록했습니다. 반복 상세는 표본입니다.'),
    verified('새 추천 후보 3건 검색 및 운영 등록', '/ops-7f3a9c2d/recommendations/', '기존 제안과 중복을 확인하고 스미싱 신고 안내, HTTP 상태 코드 찾기, NFC·NFD 비교 제안 #7~#9의 공식 출처와 범위를 기록했습니다. 390·768·1024·1440px에서 세 카드와 이슈 링크를 확인했습니다. 국내 검색량을 확인하지 못해 수치를 적지 않았습니다.'),
    verified('하루 여러 번 추천 조사와 승인 확인 예약 등록', 'https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9', '09:13·14:13·19:13 KST 등록을 확인했습니다. 09:13 첫 실행 검증과 14:13·19:13 실행 확인 대기는 별도로 기록합니다.'),
    verified('실제 뉴스 예약과 카카오 수집 복구 확인', repo + '/actions/runs/45515165966', '09:04 KST 예약 빌드·배포 성공. 해당 실행에서 카카오 요청이 시간 초과되어 캐시를 사용했고, 한 번 재시도하도록 고친 배포 #45520510235는 112건과 피드 실패 0건을 기록했습니다.'),
    verified('국내 공식 RSS와 사용 조건 확인 및 과기정통부 추가', '/news/korea/#source-msit', '원문 공공누리 제1유형 표기와 출처를 확인한 보도자료 제목·원문 8건이 네 너비에서 필터로 표시됩니다. 네이버·언론사·정책브리핑 검토 결과와 제외 사유는 README에 기록했습니다.'),
  ],
  'csv-json-converter': [
    tool('입력과 양방향 CSV·JSON 변환', 'csv-json-converter', '운영 브라우저에서 클립보드 붙여 넣기와 합성 UTF-8 파일, 쉼표·탭·세미콜론, 앞자리 0 보존, BOM·따옴표·셀 내부 줄바꿈을 확인했습니다.'),
    tool('결과 복사·다운로드·초기화', 'csv-json-converter', '운영 브라우저에서 클립보드와 JSON·TSV 내려받기 내용을 결과와 비교했고, 잘못된 입력과 초기화 후에는 이전 결과를 복사·다운로드할 수 없음을 확인했습니다.'),
    tool('브라우저 전용 및 외부 요청 없음', 'csv-json-converter', '페이지 로딩 후 네트워크를 끈 상태에서 붙여 넣기·파일 읽기·변환·복사·다운로드가 동작했고 상호작용 중 네트워크 요청은 0건, 전체 운영 감사 외부 요청은 0건입니다.'),
    verified('경계값·테스트·운영 감사와 Pages 배포', repo + '/actions/runs/45521833543', '단위 테스트 93건 통과. 중복 헤더·행 길이 불일치·잘못된 UTF-8·중첩 JSON·수식 보호를 검사했습니다. 운영 브라우저 감사는 네 너비 420개 레이아웃, 1,658개 검사, 문제 0건. 빌드와 배포 모두 성공했습니다.'),
    verified('승인 이슈에 결과 댓글을 남기고 완료 종료', repo + '/issues/4#issuecomment-7149108445', '운영 검증 후 검사 결과와 배포 링크를 댓글로 남기고 이슈를 완료로 닫았습니다.'),
    verified('09:04 KST 이후 news.yml 예약 실행 재조회', repo + '/actions/runs/45515165966', '2026-11-25 10:00 KST Actions API에서 event=schedule 및 09:04 KST 이후로 조회한 결과 1건입니다. #45515165966은 09:04:30 KST에 생성되어 성공했습니다. 수동 실행은 제외했고 30분 반복은 미확인입니다.'),
  ],
  'remaining-work-review': [
    verified('별도 승인 카드 알림을 추가하지 않고 기존 방식 유지', '/ops-7f3a9c2d/recommendations/', '추천 카드는 기존 관리 탭과 GitHub 이슈를 계속 사용합니다. 사이트와 계정 알림 설정은 변경하지 않았습니다.'),
    verified('세 시간대와 조사 도메인 허용 목록 기록', 'https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9', '09:13·14:13·19:13 KST 및 search.naver.com, ssl.pstatic.net, www.google.com, helpline.kdca.go.kr 등록을 운영 절차에 기록했습니다. 허용과 실제 조회 성공은 별개입니다.'),
    open('첫 14:13 KST 실행 확인', '예약은 등록됐으며 실행 로그, 중복 여부, 배포 결과 확인 대기입니다.', '진행중', ['https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9']),
    open('첫 19:13 KST 실행 확인', '예약은 등록됐으며 첫 실제 실행 확인 대기입니다.', '진행중', ['https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9']),
    verified('뉴스 예약 이력 재조회 및 보완 실행 검증', repo + '/actions/runs/45525260475', '10:26 KST 기준 실제 예약은 #45515165966 한 건입니다(09:04:30 KST 생성, success). 별도 workflow_dispatch는 기사 112건, 피드 실패 0건, 빌드·배포 성공입니다.'),
  ],
  'official-values-browser-matrix': [
    open('공개된 2026·2027년 공식 수치 전수 대조 및 불일치 수정', '노동·세금·주거 법령과 2026년 22일·2027년 24일 공휴일의 원문 근거를 추가했습니다. SH 청년창업인·신혼신생아Ⅱ 공고 본문과 첨부는 반복 리디렉션되고 서울주거포털과 일반 법령에서는 해당 공고의 전환이율·한도를 확인할 수 없었습니다.', '부분', [site + '/ops-7f3a9c2d/#official-value-evidence', 'https://housing.seoul.go.kr/site/main/home']),
    verified('운영 Chromium·Firefox·WebKit 4개 너비 기능·레이아웃', repo + '/actions/runs/45527730525', '1aa3344 배포의 운영 감사에서 각 엔진 390·768·1024·1440px, 420개 레이아웃·3,316개 검사, 문제 0건입니다. iPhone 15·Pixel 7 에뮬레이션은 각각 로컬 105개 레이아웃·826개 검사에서 문제 0건이었으며 실제 기기·OS 클립보드 검증은 아닙니다.'),
    verified('cf59d3a 운영 배포의 브라우저 재감사', repo + '/actions/runs/45528824434', '요청을 직렬 처리하고 HTTP 429 대기·재시도를 적용한 운영 감사에서 Chromium·Firefox·WebKit 각각 390·768·1024·1440px, 420개 레이아웃·3,316개 검사, 문제 0건입니다. 각 엔진에서 내부 링크 250개를 확인했습니다.'),
    open('국민취업지원제도 접수 기간', '고용24 원문은 연결 시간 초과였고 대체 출처인 구직자취업촉진법 제8조는 신청 근거만 규정합니다. 연중 접수 단정은 삭제하고 신청처에서 확인하도록 안내합니다.', '부분', [site + '/info/support-calendar/']),
  ],
  'daily-proposals-2026-11-25': [
    verified('미완료 승인 이슈 확인', repo + '/issues?q=is%3Aissue', '신규 제안 등록 전 저장소 이슈 API와 추천 데이터를 대조했습니다. #1·#2 완료, #3 거절로 모두 종료되어 구현 대상이 없습니다.'),
    verified('국내 검색 동향의 공개 표본과 정책 공고 조사', 'https://trends.google.com/trending?geo=KR', '2026-11-25 KST에 한국 Google Trends 최신 RSS 표본(07:40~08:10 KST)과 네이버 데이터랩 공개 화면, 대한민국 정책브리핑 공고를 확인했습니다. 표본을 국내 키워드별 검색량으로 해석하지 않았습니다.'),
    verified('네이버 데이터랩 후보 키워드 비교 수치 재조회', 'https://datalab.naver.com/keyword/trendResult.naver?hashKey=N_5811b2d66f4a46a789f67beafd635709', '첫 실행에서는 조회하지 못했으나 2026-11-25 공식 모바일 양식과 XLSX로 10-24~11-24 일간·전체 범위의 최고 상대 지수(CSV 변환 0, 난임휴직 100, 희귀질환 지원 1.8315)를 확인했습니다. 0은 절대 검색량이 0이라는 뜻이 아닙니다.'),
    ...[4, 5, 6].map((id) => verified(`신규 이슈 #${id}에 제안 등록`, repo + '/issues/' + id, 'GitHub API의 HTTP 201 응답, 실제 이슈 주소와 제안 라벨을 확인했습니다.')),
    verified('뉴스 실제 예약 실행·배포 확인', repo + '/actions/runs/45515165966', '2026-11-25 09:04 KST 시작, schedule 실행의 build와 deploy가 모두 성공했습니다.'),
    verified('GitHub Pages 배포 및 공개 대표 주소 확인', repo + '/actions/runs/45517359629', 'c321c2f의 build·deploy가 success. 운영 홈·연봉 계산기·뉴스·sitemap.xml HTTP 200 확인'),
    verified('추천 탭 운영 검증', '/ops-7f3a9c2d/recommendations/', '390·768·1024·1440px에서 카드 3건의 내용·출처와 실제 GitHub 이슈 연결, noindex,nofollow를 확인했습니다. 운영 공개 홈·XML 사이트맵·robots.txt에 관리 주소가 없음을 확인했습니다.'),
  ],
  'strict-audit': [
    verified('이전 요청과 약속을 분리하고 확인된 누락 기능 수정', '/ops-7f3a9c2d/', '관리 화면의 세부 상태 및 음양력·증명사진·SNS·사다리·추가 뉴스 출처 운영 검사'),
    verified('모든 세부 항목에 운영 근거가 없으면 완료 금지', repo + '/blob/main/test/pages.test.mjs', '부모 상태의 회귀 테스트와 운영 타임라인 내용 비교'),
    open('모든 미완료 항목 해소 및 확인', 'HEIC·지원금 일정·X 가중치 보완은 운영에서 확인했습니다. 계정 전용 증거·실제 예약 실행·미발표 공식 자료와 미완료 검증은 해당 행에 남습니다.', '진행중'),
  ],
  'close-audit-gaps': [
    tool('같은 출처 HEIC → JPG', 'image-resize', '9216f93 운영에서 합성 HEIC JPG 변환·WASM 요청 출처를 390·1440px에서 확인'),
    tool('공식 X 가중치 지원', 'character-count', '9216f93 운영에서 X 일반 게시글의 글자 수 결과를 390·1440px에서 확인'),
    verified('공식 기관 지원금·신청 일정', '/info/support-calendar/', '9216f93 운영에서 복지로·국세청 신청 날짜 및 고용24 상시 접수 확인'),
    verified('우아한형제들 접근 대안', '/news/korea/', '운영 국내 IT 출처 섹션에 공식 기술블로그 원문 연결 확인; 자동 피드는 발행처 접근 허용 필요'),
    open('나머지 검증과 외부 조건', '공식 뉴스 피드 접근, 추가 14:13·19:13 예약 첫 실행, 계정 권한, 미발표 공식 자료와 일부 원문 대조가 남았습니다. 각 사유는 개별 요청에서 확인할 수 있습니다.', '진행중', [site + '/ops-7f3a9c2d/']),
  ],
  'site-review-checklist': [
    verified('전체 개별 템플릿과 반복 상세 표본의 네 너비 화면 점검', '/sitemap/', '104개 경로의 390·768·1024·1440px 캡처 416장과 대표 푸터를 확인했습니다. 주거 금액 단위, 관리 표 상태, 홈·검색과 누끼 조작부 높이를 고쳤습니다.'),
    verified('정상·경계·오류 입력과 내부 링크·편의 기능 점검', repo + '/actions/runs/45446245464', 'b5b1139 운영 감사에서 232개 HTML의 내부 대상 247개, 입력 검사 114회와 1,640개 사례를 통과했으며 브라우저 오류와 외부 요청이 없었습니다. 빈 결과에서는 복사를 비활성화합니다.'),
    verified('앞으로의 배포 전 검수 규칙 문서화', repo + '/blob/b5b1139/README.md#배포-전-검수-체크리스트', 'README와 일일 추천 운영 절차에 네 화면 너비, 기본·경계·오류 입력, 운영 근거, 현재 작업 표시와 종료 절차를 기록했습니다.'),
  ],
  'qualitative-ux-review': [
    verified('390·1440px 템플릿과 도구의 전체 높이 감수', repo + '/actions/runs/45534867981', '135개 경로를 각 너비에서 첫 화면부터 푸터까지 검토했습니다. 반복 상세의 변형·최소·최대값과 기사가 표시된 운영 뉴스 4개 분류를 포함했습니다. 운영에서 연봉 최소·대표·최대 금액의 비교 표가 한 줄로 표시되는 것을 확인했습니다.'),
    verified('관리 표의 긴 근거 URL을 짧은 한 줄 이름으로 표시', '/ops-7f3a9c2d/#qualitative-ux-review', '운영 390·1440px에서 표와 검수 세부 항목에 표시된 근거 링크 183개가 각각 한 줄이고 원본 주소를 유지하는 것을 확인했습니다.'),
    verified('오류·복사·초기화·키보드 동작', repo + '/actions/runs/45533656953', '38f3c50 운영 390·1440px에서 Enter로 잘못된 자녀 수를 제출했을 때 이전 연봉 결과와 복사가 숨겨지고, 올바른 값으로 재계산되는 것을 확인했습니다. JSON 오류는 복사할 수 없으며 초기화하면 지워집니다.'),
    verified('이후 배포의 문구·사용성 검수 기준 기록', repo + '/blob/b68e3ed/README.md#배포-전-검수-체크리스트', '공개 README에 첫 화면부터 푸터까지의 템플릿·도구 감수, 반복 페이지의 변형과 값 범위, 문구·줄바꿈·키보드·오류 결과 복사 기준을 기록했습니다.'),
  ],
  'admin-active-work': [
    verified('운영 관리 페이지에 현재 작업·단계와 시작·갱신 시각 표시', '/ops-7f3a9c2d/', '0b3ec81 운영 390·1440px에서 실제 작업 제목, 배포 검증 단계 및 KST 시각 2개 확인'),
    verified('전체·진행중·부분·미확인·완료·제외로 타임라인 필터', '/ops-7f3a9c2d/', '0b3ec81 운영 390·1440px에서 필터 6개를 클릭해 요청과 세부 항목이 함께 표시·숨김 처리되는 것을 확인'),
  ],
  'proposal-decisions-review': [
    tool('사진 위치정보 확인·삭제: 업로드 없음', 'photo-location', 'a6d23d7 운영 390·1440px에서 페이지를 연 뒤 오프라인으로 합성 JPG의 EXIF GPS 좌표를 확인하고 EXIF 없는 사본을 저장; 처리 중 네트워크 요청 0건'),
    verified('전입신고·확정일자 체크리스트', '/housing/move-in-checklist/', 'a6d23d7 운영 390·1440px에서 14일·30일 기한과 확정일자 특례 및 정부24·등기소·국토부·법령 링크를 확인'),
    ...[1, 2, 3].map((id) => verified(`이슈 #${id} 결과 댓글과 종료`, repo + '/issues/' + id, id === 3 ? '거절 라벨에 따라 구현하지 않고 결과 댓글 후 종료' : '운영 확인 결과와 배포 링크를 댓글로 남겨 종료')),
    verified('한국어 표현과 390·1440px 템플릿 편집 감수', '/sitemap/', '템플릿 본문·양식 도움말·오류 문구와 96개 경로의 두 너비 스크린샷을 검토했습니다. 지원 일정·주거 표 줄바꿈과 JSON 오류 문구를 수정했습니다.'),
  ],
  'daily-proposals-2026-11-25-evening': [
    verified('19:13 KST 승인·거절 라벨 확인', repo + '/issues/8', '열린 제안의 라벨과 라벨 이벤트를 대조했습니다. 승인 #8 한 건과 거절 #5·#7·#9를 확인했습니다.'),
    ...[10, 11, 12].map((id) => verified(`신규 제안 #${id} 등록`, repo + '/issues/' + id, '공식 자료, 사용자 이점, 대상 주소와 제외 범위가 있는 열린 제안 이슈 및 제안 라벨을 확인했습니다.')),
    open('네이버 데이터랩 검색어 동향', '데스크톱 조회가 접근 오류를 반환했습니다. 공식 모바일 조회는 네트워크 접근 승인 대기이며, 수치는 기록하지 않았습니다.'),
    open('승인 #8 전체 브라우저 감사와 운영 검증', '로컬 단위 테스트 98건과 Chromium 감사 4개 너비를 통과했습니다. Playwright 다운로드 접근 승인 전까지 Firefox·WebKit을 포함한 전체 감사와 운영 배포는 미확인입니다.', '미확인', [repo + '/issues/8']),
    verified('운영 추천 카드·검색 제외 확인', repo + '/actions/runs/45594658093', 'Pages build/deploy 성공 뒤 운영 추천 탭에서 HTTP 200, noindex,nofollow, #10~#12의 카드·공식 출처·이슈 링크, #5·#7·#9 거절과 #8 보류를 대조했습니다. 추천 데이터 배포용 단위 테스트 96건과 Chromium·Pixel 7 감사는 통과했습니다.'),
  ],
  'news-refresh-2026-11-25-evening': [
    verified('17:21 KST 실제 예약 실행', repo + '/actions/runs/45575503149', 'Actions에서 event=schedule과 refresh / build·refresh / deploy 성공을 확인했습니다.'),
    verified('19:25 KST 뉴스 보완 실행과 배포 생략', repo + '/actions/runs/45594849070', 'event=workflow_dispatch. 빌드 성공, 아티팩트 업로드와 배포 생략, 운영 뉴스 스냅샷과 보완 실행의 커밋 일치를 확인했습니다.'),
    verified('운영 뉴스 스냅샷과 국내 뉴스 HTTP 확인', '/news/', '운영 스냅샷의 14개 피드·112건과 국내 뉴스의 6개 출처를 확인했습니다.'),
    open('뉴스 수집 로그와 반복 주기', '원본 로그 도메인 접근 승인을 기다리고 있어 이번 빌드의 수집 건수와 피드 실패 건수는 미확인입니다. 같은 날 확인한 예약 성공 2건과 별도로 30분 주기의 지속 여부를 확인해야 합니다.'),
  ],
};

export const unconfirmed = (requirement, reason, links) => open(requirement, reason, '미확인', links);
