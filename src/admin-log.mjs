import { auditItems, unconfirmed } from './admin-audit-items.mjs';

// Times are KST; when unavailable, use the nearest known milestone.
const requests = [
  { time: "2026-11-24 22:04", id: "business-model", request: "기존 프로젝트 무관하게 자동화 수익형 모델을 고민해서 알려줘", status: "완료", reflection: "아이디어 비교 후 별도 정적 정보·도구 허브를 선택했습니다. 수익이나 광고 승인을 보장하지 않습니다.", links: ["https://everyhub.github.io/","https://github.com/everyhub/everyhub.github.io/blob/main/README.md"] },
  { time: "2026-11-24 22:04", id: "search-visibility", request: "국내에서 사용자들이 네이버나 구글 검색을 활용할텐데 거기 노출될거라고 보는지", status: "부분", reflection: "검색 요건과 한계를 안내했습니다. 운영 사이트의 인증 태그·canonical·구조화 데이터·사이트맵을 확인했습니다.", reason: "검색 서비스의 실제 색인·순위·노출 수는 공개 사이트에서 확인할 수 없습니다.", links: ["https://everyhub.github.io/","https://everyhub.github.io/sitemap.xml","https://search.google.com/search-console/","https://searchadvisor.naver.com/"] },
  { time: "2026-11-24 22:04", id: "pages-start", request: "그럼 깃허브 페이지 기준으로 진행해봐", status: "완료", reflection: "정적 사이트와 GitHub Pages 배포를 확인했습니다.", links: ["https://everyhub.github.io/","https://github.com/everyhub/everyhub.github.io/actions/workflows/pages.yml"] },
  { time: "2026-11-24 22:29", id: "anonymous-title", request: "페이지 이름 변경해줘 이름 안들어가고 좀 깔끔하게 (앞으로도 유지)", status: "완료", reflection: "개인이 아닌 에브리허브 브랜드를 제목·헤더·공유 정보에 사용합니다.", links: ["https://everyhub.github.io/"] },
  { time: "2026-11-24 22:29", id: "official-materials", request: "최신 상태 맞는지 확인 되어야 하고 공식 자료만 사용해서 유입 가능한 형태를 다 자연스럽게 탭별로 모아서 이것저것 다 추가해줘", status: "부분", reflection: "급여·근로·복지·주거 등 분야를 나누고 계산기와 정보 페이지에 기관 출처와 적용 기준을 안내합니다.", reason: "미확정 연도별 공식 값은 임의 산정하지 않으며 앞으로의 공고까지 자동 반영하지는 않습니다.", links: ["https://everyhub.github.io/sitemap/","https://everyhub.github.io/tools/minimum-wage/","https://everyhub.github.io/tools/public-rent-conversion/","https://everyhub.github.io/info/yearly-rates/"] },
  { time: "2026-11-24 22:29", id: "organization-choice", request: "무료: 이름 없는 GitHub 조직(예: paycalc-kr)을 내가 만들고 저장소를 이전할게", status: "완료", reflection: "예시 이름 대신 사용자가 선택한 everyhub 조직과 루트 사이트를 사용합니다.", links: ["https://github.com/everyhub","https://everyhub.github.io/"] },
  { time: "2026-11-24 22:29", id: "organization-url", request: "https://github.com/everyhub", status: "완료", reflection: "지정한 조직과 현재 배포 저장소가 일치합니다.", links: ["https://github.com/everyhub","https://github.com/everyhub/everyhub.github.io"] },
  { time: "2026-11-24 22:29", id: "rename-request", request: "해줘", status: "완료", reflection: "관리자 작업 안내 후 사용자 변경을 반영하여 조직 루트 주소에 배포했습니다.", links: ["https://everyhub.github.io/","https://github.com/everyhub/everyhub.github.io/actions/runs/45403381289"] },
  { time: "2026-11-24 22:29", id: "rename-confirmed", request: "해뒀음", status: "완료", reflection: "저장소 이름 변경 결과와 운영 주소를 확인했습니다.", links: ["https://github.com/everyhub/everyhub.github.io","https://everyhub.github.io/"] },
  { time: "2026-11-24 22:29", id: "github-instructions", request: "방법 자세히 알려줘", status: "완료", reflection: "조직 GitHub 연동·저장소 선택 방법을 답변했고, 이후 승인된 토큰을 이용한 배포 방법도 문서화했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/blob/main/README.md","https://app.devin.ai/settings/integrations/github"] },
  { time: "2026-11-24 22:29", id: "integration-confirmed", request: "완료", status: "부분", reflection: "사용자의 앱 설치 완료 알림을 받았으나 당시 앱 연결로 쓰기가 되지 않아 승인된 토큰 경로로 운영 배포를 완료했습니다.", reason: "당시 앱 자체의 조직 쓰기 권한은 검증되지 않았습니다. 현재 사이트 배포에는 더 이상 막힘이 없습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/runs/45403381289","https://everyhub.github.io/"] },
  { time: "2026-11-24 22:29", id: "token-choice", request: "2번", status: "완료", reflection: "승인된 토큰 방식으로 푸시·배포했고 토큰 값은 문서와 운영 사이트에 포함하지 않습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/runs/45403381289","https://github.com/everyhub/everyhub.github.io/blob/main/README.md"] },
  { time: "2026-11-24 22:30", id: "site-verification", request: "사이트 소유확인", status: "완료", reflection: "사용자가 제공한 구글·네이버 소유권 확인 태그가 운영 HTML에 존재합니다.", links: ["https://everyhub.github.io/"] },
  { time: "2026-11-24 22:31", id: "after-verification", request: "소유확인 누름 그럼 끝?", status: "완료", reflection: "소유 확인과 별도로 사이트맵 제출 및 색인 확인이 필요하다고 안내했습니다.", links: ["https://everyhub.github.io/sitemap.xml","https://search.google.com/search-console/","https://searchadvisor.naver.com/"] },
  { time: "2026-11-24 22:32", id: "sitemap-submitted", request: "했음", status: "미확인", reflection: "사용자가 제출했다고 알렸으며 공개 XML 사이트맵이 응답합니다.", reason: "계정 전용 제출 처리 결과와 실제 색인 상태는 확인할 수 없습니다.", links: ["https://everyhub.github.io/sitemap.xml","https://search.google.com/search-console/","https://searchadvisor.naver.com/"] },
  { time: "2026-11-24 22:51", id: "year-2027", request: "최신화 반영해주고 27년포함 (공식문서 기준이어야함)", status: "부분", reflection: "공식 발표가 확인된 2027년 최저임금·보험료율·기준 중위소득을 표시하고 미확정 항목을 구분합니다.", reason: "구직급여 상한·일부 보험 상하한·산재 요율·간이세액표는 적용 가능한 공식 원문 확인 전까지 미반영합니다.", links: ["https://everyhub.github.io/info/yearly-rates/","https://everyhub.github.io/tools/insurance-rates/","https://everyhub.github.io/tools/unemployment-pay/","https://everyhub.github.io/median-income/2027/4/"] },
  { time: "2026-11-24 22:51", id: "korean-wording", request: "단어들이 어색한곳은 없는지 전체적으로 확인 해주고", status: "완료", reflection: "영역 이름과 설명을 한국어의 일관된 용어로 정리하고 운영 페이지의 주요 제목·안내를 대조했습니다.", links: ["https://everyhub.github.io/","https://everyhub.github.io/sitemap/","https://everyhub.github.io/info/yearly-rates/"] },
  { time: "2026-11-24 22:51", id: "panel-and-content", request: "탭을 좌측 패널처럼 볼수있도록 사이트맵처럼해서 이런 연봉계산 외 유입이 될만한거 이것저것 많이 공식적인거 가져다가 많이많이 넣어줘", status: "완료", reflection: "분야별 왼쪽 탐색과 세금·복지·주거·노동·생활 정보 및 도구를 제공합니다.", links: ["https://everyhub.github.io/sitemap/","https://everyhub.github.io/housing/","https://everyhub.github.io/hours/","https://everyhub.github.io/info/","https://everyhub.github.io/tools/"] },
  { time: "2026-11-24 22:59", id: "maintain-readme", request: "리드미도 최신화 해주고 (다른 ai도 그 리드미 읽고 바로 이어서 작업 가능하도록 항상 업데이트)", status: "완료", reflection: "작업 구조·검증·권한·배포·예약 운영을 README에 문서화했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/blob/main/README.md"] },
  { time: "2026-11-24 22:59", id: "news-categories", request: "뉴스 페이지 (국내,국외) IT(요즘 AI등 모델이나 이슈 많을테니), 핫이슈 등", status: "완료", reflection: "국내 IT·해외 IT·AI·핫이슈 피드별 페이지와 출처를 공개했습니다.", links: ["https://everyhub.github.io/news/korea/","https://everyhub.github.io/news/world/","https://everyhub.github.io/news/ai/","https://everyhub.github.io/news/trending/"] },
  { time: "2026-11-24 22:59", id: "news-cadence", request: "별도 10분정도? 추천하는 주기로 업데이트 하는 페이지도 있으면 좋겠고", status: "부분", reflection: "첫 Refresh news 예약 실행은 2026-11-25 09:04 KST에 시작해 빌드와 Pages 배포에 성공했습니다.", reason: "성공한 예약 실행 1건을 확인했습니다. 이후에도 30분 주기로 계속 실행되는지는 미확인입니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/workflows/news.yml","https://github.com/everyhub/everyhub.github.io/actions/runs/45515165966","https://everyhub.github.io/news/"] },
  { time: "2026-11-24 22:59", id: "non-calculators", request: "계산이 아니더라도 뭔가 유입 될만한것들이 있다면 별도 사이트맵 탭 을 두고 추가", status: "완료", reflection: "생활 정보와 사진·문서·글쓰기 도구를 분야별로 추가하고 HTML 사이트맵을 제공합니다.", links: ["https://everyhub.github.io/sitemap/","https://everyhub.github.io/info/","https://everyhub.github.io/tools/"] },
  { time: "2026-11-24 23:06", id: "background-tool", request: "누끼 프로젝트에서 하던것도 별도 툴 탭 같은식으로 거기에 추가해주고 별도로 있으면 좋을만한것도 추가해줘", status: "완료", reflection: "브라우저 누끼 편집기와 이미지·텍스트·날짜 도구를 도구 허브에 제공합니다.", links: ["https://everyhub.github.io/tools/background-removal/","https://everyhub.github.io/tools/image-pdf/","https://everyhub.github.io/tools/"] },
  { time: "2026-11-24 23:06", id: "shortcut-home", request: "기본 메인페이지로 버튼형태도 좋으니 한눈에 바로가기 형태의 페이지도 있으면 좋을듯함", status: "완료", reflection: "홈을 분야별 바로가기 카드·검색 화면으로 구성했습니다.", links: ["https://everyhub.github.io/#shortcuts"] },
  { time: "2026-11-24 23:06", id: "old-home-name", request: "메인페이지 [일과 급여](https://everyhub.github.io/) 이거 이름좀 어떻게 해봐", status: "완료", reflection: "홈 제목과 서비스 표기를 새 브랜드로 바꿨습니다.", links: ["https://everyhub.github.io/"] },
  { time: "2026-11-24 23:06", id: "chosen-brand", request: "에브리허브 (EveryHub) — 주소와 일치, 추천", status: "완료", reflection: "표기와 운영 주소를 에브리허브로 통일했습니다.", links: ["https://everyhub.github.io/"] },
  { time: "2026-11-24 23:17", id: "housing-tools", request: "전세·보증금 월세 전환 한도 계산기 이건 lh sh 등 전환보증도 넣는걸로하자 유입있을듯 이런거처럼 좀 고민해줘봐", status: "완료", reflection: "민간 전월세·LH 국민임대/행복주택·SH 공고 예시 및 보증·대출·취득·중개·청약·갱신 도구를 제공합니다. 공식 근거가 없는 SGI 자동요율 등은 범위 밖입니다.", links: ["https://everyhub.github.io/housing/","https://everyhub.github.io/tools/rent-conversion/","https://everyhub.github.io/tools/public-rent-conversion/"] },
  { time: "2026-11-24 23:21", id: "compact-nav", request: "사이트맵이나 탭은 좀 줄여봐 너무 보기 힘듬", status: "완료", reflection: "메뉴와 HTML 사이트맵을 8개 분야로 압축했습니다. 금액별 페이지는 상세 바로보기와 XML 사이트맵에 유지합니다.", links: ["https://everyhub.github.io/sitemap/","https://everyhub.github.io/sitemap.xml","https://everyhub.github.io/tools/salary-calculator/#salary-index"] },
  { time: "2026-11-24 23:24", id: "github-permission", request: "깃허브 퍼미션 업데이트는 해뒀음", status: "완료", reflection: "후속 푸시와 수동 워크플로 실행 권한이 동작했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/runs/45413563090","https://github.com/everyhub/everyhub.github.io/actions/runs/45426475348"] },
  { time: "2026-11-24 23:30", id: "writing-tools", request: "글자수 계산기 같은게 있으면 좋지 않을까 싶음 툴에 이런거 좀 고민해봐 더없을지", status: "완료", reflection: "글자·UTF-8 바이트, 자소서 목표값과 텍스트·PDF·이미지·시간·생활·개발 도구를 추가했습니다. 근거가 없는 서비스별 글자 가중치는 포함하지 않습니다.", links: ["https://everyhub.github.io/tools/character-count/","https://everyhub.github.io/tools/"] },
  { time: "2026-11-24 23:35", id: "sidebar-redesign", request: "좌측 메뉴탭도 좀 보기 편하게 바꿔주고", status: "완료", reflection: "분야 아이콘·활성 상태·접기·펼치기·모바일 메뉴를 확인했습니다.", links: ["https://everyhub.github.io/","https://everyhub.github.io/tools/age/"] },
  { time: "2026-11-24 23:35", id: "header-home", request: "우측상단 사이트맵보다는 메인 페이지로 가는걸로 보여주는게 더 나을듯함", status: "완료", reflection: "헤더는 홈, 사이트맵은 메뉴 하단과 푸터에 있습니다.", links: ["https://everyhub.github.io/tools/age/","https://everyhub.github.io/sitemap/"] },
  { time: "2026-11-24 23:36", id: "salary-removed", request: "메인 페이지에서 바로가기만 있는것도 좋을거 같은데 내 연봉 계산하기 이게 같이 포함되어 나오고있음", status: "완료", reflection: "홈 입력 폼을 제거하고 옛 쿼리·해시 링크는 전용 계산기로 연결합니다.", links: ["https://everyhub.github.io/","https://everyhub.github.io/?salary=4000#calculator","https://everyhub.github.io/tools/salary-calculator/"] },
  { time: "2026-11-24 23:37", id: "standalone-admin", request: "별도로 요청사항은 어떤게 있었고 어떻게 반영했고 타임라인 볼수있는 지금 에브리허브와 연결되지않은 어드민같은 페이지 하나 놔줘", status: "완료", reflection: "이 타임라인은 메뉴·사이트맵에서 연결하지 않고 noindex 처리합니다. 인증으로 보호되는 페이지는 아닙니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/","https://everyhub.github.io/sitemap.xml"] },
  { time: "2026-11-24 23:45", id: "visitor-count", request: "페이지 접속자수도 알수잇는지? 그 관리페이지에서", status: "제외", reflection: "사이트에는 방문자 집계를 연결하지 않았습니다.", reason: "개인정보·동의·운영 정책과 집계 방식이 승인되지 않았습니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/","https://github.com/everyhub/everyhub.github.io/blob/main/README.md"] },
  { time: "2026-11-24 23:45", id: "all-chip", request: "각 바로가기마다 전체보기는 카드 우측상단에 작게? 좀 다른 느낌으로 있는게 좋지 않을까 싶은데", status: "완료", reflection: "8개 카드 오른쪽 위에 전체 → 링크가 있습니다.", links: ["https://everyhub.github.io/#shortcuts"] },
  { time: "2026-11-24 23:45", id: "convenience", request: "이런 사소한 편의성도 좀 고려해보고 전체적으로 좀 해줘", status: "완료", reflection: "빠른 검색, 최근 도구, 복사·초기화, 금액 표시, 맨 위로와 키보드·모바일 탐색을 추가했습니다.", links: ["https://everyhub.github.io/#shortcuts","https://everyhub.github.io/tools/salary-calculator/","https://everyhub.github.io/tools/character-count/"] },
  { time: "2026-11-24 23:48", id: "geek-news", request: "뉴스는 좀 더 긱뉴스든 이런게 더 낫지않을까 싶은데 좀 고민좀해보고 반영해봐", status: "완료", reflection: "긱뉴스를 앞에 배치하고 출처 필터와 토스·GitHub Changelog·LY·Google DeepMind를 추가했습니다. NASA는 제외했습니다.", links: ["https://everyhub.github.io/news/korea/","https://everyhub.github.io/news/world/","https://everyhub.github.io/news/ai/","https://everyhub.github.io/news/trending/"] },
  { time: "2026-11-24 23:53", id: "date-four-digit", request: "만 나이 계산기 연도 6자리가 들어가는데 4자리만 있는게 맞지않나", status: "완료", reflection: "도구가 지원하는 연도 범위를 적용하고 여섯 자리 연도의 계산 제출을 거부합니다.", links: ["https://everyhub.github.io/tools/age/","https://everyhub.github.io/tools/date-difference/"] },
  { time: "2026-11-24 23:53", id: "quality-privacy", request: "기능 추가할땐 버그가 없는지 외부 정보 전송은 없는지 잘 파악해서좀해 지금 있는것들도 한번 싹 훑어놔주고", status: "완료", reflection: "운영 템플릿에서 비정상 입력·브라우저 오류·네트워크를 점검했습니다. 합성 자료만 사용하고 도구의 외부 요청·폼 전송을 차단합니다.", links: ["https://everyhub.github.io/tools/","https://everyhub.github.io/tools/background-removal/","https://github.com/everyhub/everyhub.github.io/blob/main/audit.mjs"] },
  { time: "2026-11-24 23:59", id: "holiday-calendar", request: "2026년 공휴일·연휴 이런건 달력표시도 같이 있으면 보기 좋지 않겠니?", status: "완료", reflection: "2026·2027년 12개월 달력·연휴·대체공휴일·연도 전환과 목록을 제공합니다.", links: ["https://everyhub.github.io/info/holidays/2026/","https://everyhub.github.io/info/holidays/2027/"] },
  { time: "2026-11-24 23:59", id: "info-visuals", request: "이런 편의성좀 잘 챙겨 다른거 할때도", status: "완료", reflection: "세금 일정은 타임라인, 연도별 요율은 작은 화면에도 맞는 표로 표시합니다.", links: ["https://everyhub.github.io/info/tax-calendar/","https://everyhub.github.io/info/yearly-rates/"] },
  { time: "2026-11-25 00:02", id: "original-images", request: "에브리허브에 맞는 저작권없는 이미지를 좀 괜찮은느낌으로 만들고 반영시켜줘", status: "완료", reflection: "직접 제작한 CC0 SVG, 앱 아이콘, 소셜 공유 이미지와 홈 일러스트를 반영했습니다.", links: ["https://everyhub.github.io/","https://everyhub.github.io/assets/brand/hero.svg","https://github.com/everyhub/everyhub.github.io/blob/main/src/brand/LICENSE.txt"] },
  { time: "2026-11-25 00:07", id: "fuzzy-search", request: "바로가기 검색은 비슷한거 찾기 안되나? 예를들면 나이 치면 비슷한게 나와야하고 집 치면 관련 나오게?", status: "완료", reflection: "나이·집 같은 관련어, 초성·한 글자 오타와 키보드 검색을 확인했습니다.", links: ["https://everyhub.github.io/#shortcuts"] },
  { time: "2026-11-25 00:09", id: "search-release", request: "Commit+push the search change, verify deploy.", status: "완료", reflection: "검색 커밋 0aa3dbe 배포와 운영 검색을 확인했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/runs/45422534123","https://everyhub.github.io/#shortcuts"] },
  { time: "2026-11-25 00:09", id: "previous-briefs", request: "report concisely the status of each earlier brief this handoff (with commit/run)", status: "완료", reflection: "이전 요청의 기능별 배포를 별도 답변으로 제공했고 이 표에 최신 검증 근거를 연결했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions","https://everyhub.github.io/ops-7f3a9c2d/"] },
  { time: "2026-11-25 00:09", id: "schedule-recheck", request: "Re-check schedule runs.", status: "완료", reflection: "수동 실행의 배포 건너뛰기와 별도로, 2026-11-25 09:04 KST에 시작한 실제 뉴스 예약 실행의 빌드·배포 성공을 확인했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/runs/45426026991","https://github.com/everyhub/everyhub.github.io/actions/runs/45515165966"] },
  { time: "2026-11-25 00:13", id: "admin-address", request: "관리페이지 주소 줘 반영한사항들 모아보는", status: "완료", reflection: "운영 관리 페이지 주소를 제공하고 응답을 확인했습니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/"] },
  { time: "2026-11-25 00:13", id: "leftover-link", request: "메인 페이지에 이건 왜 계속 있는지? [연봉 실수령액 계산기와 공식 계산 기준 보기]", status: "완료", reflection: "독립 연봉 안내 링크를 제거했습니다. 카드와 전용 계산기는 유지합니다.", links: ["https://everyhub.github.io/","https://everyhub.github.io/tools/salary-calculator/","https://github.com/everyhub/everyhub.github.io/commit/3a9b437"] },
  { time: "2026-11-25 00:15", id: "truthful-status", request: "내가 요청한것들 다 반영되었는지 전체적으로 다시 훑어봐 점검 (프로그레스 실패인데 왜 종료처리 되는건지 이런건 다시 봐야하지 않니? 전체적으로)", status: "완료", reflection: "미검증 예약·색인은 완료로 처리하지 않고 과거 배포 실패 기록을 현재 상태와 구분합니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/","https://github.com/everyhub/everyhub.github.io/actions"] },
  { time: "2026-11-25 00:15", id: "site-layout", request: "페이지 배치가 안맞잖아 좀 잘 반영시켜봐 줄바꿈, 글자크기 등 전체적으로 좀 잘하자", status: "완료", reflection: "공통 프레임, 한글 줄바꿈, 글자 크기 및 좁은 화면의 관리 표를 정리했습니다.", links: ["https://everyhub.github.io/","https://everyhub.github.io/sitemap/","https://everyhub.github.io/ops-7f3a9c2d/","https://github.com/everyhub/everyhub.github.io/actions/runs/45424430031"] },
  { time: "2026-11-25 00:21", id: "proposals-feature", request: "다른 웹에서 요즘 뭐가 유행하고 검색이 많은지 찾아보고 어드민 관리자 페이지에 탭하나 두고", status: "완료", reflection: "추천 탭과 출처가 있는 후보를 공개했고, 첫 09:13 자동 조사에서 공개 검색 동향과 정책 공고를 검토해 제안 #4~#6을 등록했습니다. 네이버 비교 수치는 별도 기록에서 추적합니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/recommendations/","https://github.com/everyhub/everyhub.github.io/actions/runs/45517359629"] },
  { time: "2026-11-25 00:21", id: "proposal-approval", request: "내가 승인 누르면 추가해주는걸로 해줘 이건 뭘 추가하고 왜 있으면 좋은지 설명도 잘해줘야함", status: "완료", reflection: "각 제안의 무엇·왜·범위·출처·제외 조건과 권한 있는 GitHub 승인 경로를 제공합니다. 승인된 #1·#2·#4를 운영에서 확인하고 결과를 기록했습니다. 버튼은 승인 검토용 GitHub 이슈를 엽니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/recommendations/","https://github.com/everyhub/everyhub.github.io/blob/main/docs/daily-proposals.md","https://github.com/everyhub/everyhub.github.io/issues/4"] },
  { time: "2026-11-25 00:21", id: "timeline-order", request: "지금 뭘 작업중인지 최신이 제일 위로 진행중인건 더 위에겠지?", status: "완료", reflection: "진행 중 우선, 각 그룹 최신순, 가장 최근 시각 표시를 확인했습니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/","https://github.com/everyhub/everyhub.github.io/actions/runs/45425707997"] },
  { time: "2026-11-25 00:23", id: "daily-choice", request: "하루 1번 (추천)", status: "완료", reflection: "매일 09:13 KST에 등록했고 2026-11-25 첫 조사에서 제안 #4~#6의 운영 반영을 확인했습니다. 추가 슬롯은 별도 행에서 추적합니다.", links: ["https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9","https://github.com/everyhub/everyhub.github.io/actions/runs/45517359629","https://everyhub.github.io/ops-7f3a9c2d/recommendations/"] },
  { time: "2026-11-25 00:25", id: "issues-permissions", request: "이슈 권한 추가해줬고 필요한 권한 다 얘기해 미리 추가하게 더 필요하면", status: "완료", reflection: "이슈·라벨 쓰기, 코드 푸시, Actions 확인·수동 실행과 권한 목록을 검증했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/issues/1","https://github.com/everyhub/everyhub.github.io/issues/2","https://github.com/everyhub/everyhub.github.io/issues/3","https://github.com/everyhub/everyhub.github.io/blob/main/docs/daily-proposals.md"] },
  { time: "2026-11-25 00:30", id: "full-audit", request: "enumerate EVERY user request from content.txt + this session (list each verbatim-short), verify each on LIVE site", status: "완료", reflection: "확인 가능한 원문 요청과 선택·확인 답변을 나열했습니다. 운영 확인이 불가능한 항목은 이유와 상태를 따로 표기했습니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/","https://everyhub.github.io/sitemap.xml"] },
  { time: "2026-11-25 00:30", id: "audit-saved", request: "Make the admin timeline match this table exactly. Save table to /home/ubuntu/everyhub-requirements-audit.md.", status: "완료", reflection: "동일 데이터에서 관리 타임라인과 로컬 Markdown 표를 생성하고 행·상태·근거를 대조합니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/","https://github.com/everyhub/everyhub.github.io/blob/main/src/admin-log.mjs"] },
  { time: "2026-11-25 00:30", id: "schedule-experiment", request: "Find root cause … move news refresh into its own workflow file news.yml with cron 7,37 * * * * … watch for a schedule run", status: "미확인", reflection: "기본 브랜치의 별도 워크플로가 2026-11-25 00:31 KST에 active로 등록됐고 수동 빌드·배포에 성공했습니다. 등록 45분 후인 01:16까지 00:37·01:07의 예정 시각이 지났으나 예약 실행은 0건입니다.", reason: "세부 Actions 권한 설정 API가 403이며 워크플로 API는 내부 예약 등록 여부를 공개하지 않아 미실행 원인은 확정할 수 없습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/workflows/news.yml","https://github.com/everyhub/everyhub.github.io/actions/runs/45426475348"] },
  { time: "2026-11-25 00:30", id: "publish-audit", request: "Commit/push/verify as usual.", status: "완료", reflection: "요청 감사와 홈 개선을 기본 브랜치에서 배포하고 운영에서 확인합니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/workflows/pages.yml","https://everyhub.github.io/ops-7f3a9c2d/"] },
  { time: "2026-11-25 00:30", id: "home-polish", request: "heading should vertically align with the search input … card category titles … remove underline … hero paragraph wraps “기능을 / 바로” … Recheck 390 too.", status: "완료", reflection: "큰 화면 제목·검색 입력을 가운데로 정렬하고 모바일은 세로로 배치합니다. 카테고리 링크 밑줄은 호버만 켜고 기능을 바로를 한 묶음으로 유지합니다.", links: ["https://everyhub.github.io/#shortcuts"] },
  { time: "2026-11-25 01:18", id: "automation-correction", request: "the daily Devin automation IS registered … Update the “하루 1번” row", status: "완료", reflection: "매일 09:13 KST로 등록한 일일 추천 자동화의 2026-11-25 첫 실행 및 추천 탭 운영 반영을 확인했습니다.", links: ["https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9", "https://github.com/everyhub/everyhub.github.io/actions/runs/45517359629"] },
  { time: "2026-11-25 09:16", id: "daily-proposals-2026-11-25", request: "일일 추천 조사·승인 반영 및 배포 확인", status: "완료", reflection: "첫 실행 당시 미완료 승인 0건, 신규 제안 #4~#6의 운영 반영과 Pages 배포 성공을 확인했습니다. 뉴스 예약 실행도 성공했습니다. 누락됐던 네이버 비교는 같은 날 공식 모바일 양식으로 보완했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/runs/45517359629", "https://github.com/everyhub/everyhub.github.io/actions/runs/45515165966", "https://datalab.naver.com/keyword/trendResult.naver?hashKey=N_5811b2d66f4a46a789f67beafd635709"] },
  { time: "2026-11-25 01:18", id: "strict-audit", request: "잘 반영되었는지 전수조사하고 이렇게 반영되지 않고 중간에 끝나는일은 없도록해줘", status: "진행중", reflection: "요청과 이전 답변의 약속을 세부 항목으로 나누고 완료에는 운영 증거를 요구합니다.", reason: "세부 항목에 남은 확인과 미반영 기능을 기록합니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/"] },
  { time: "2026-11-25 01:38", id: "close-audit-gaps", request: "close every fixable non-완료 item … Only leave items that truly need user/account action or unpublished official data", status: "진행중", reflection: "남은 요청을 다시 분류하고 HEIC, 기관별 공식 신청 일정, X 글자 계산 및 메뉴·뉴스 편의를 보완했습니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/","https://everyhub.github.io/tools/image-resize/","https://everyhub.github.io/tools/character-count/","https://everyhub.github.io/info/support-calendar/"] },
  { time: "2026-11-25 01:59", id: "proposal-decisions-review", request: "Implement the approved ones now … #1 … never uploaded … #2 … official sources … #3 … rejected … a full Korean copy and editing review", status: "완료", reflection: "사진 위치정보와 이사 안내를 운영에서 확인하고 세 이슈를 결정대로 종료했습니다. 전 템플릿의 문구와 두 화면 너비의 줄바꿈·글자 크기를 검토했습니다.", links: ["https://everyhub.github.io/tools/photo-location/","https://everyhub.github.io/housing/move-in-checklist/","https://everyhub.github.io/ops-7f3a9c2d/recommendations/"] },
  { time: "2026-11-25 02:02", id: "admin-active-work", request: "관리페이지에 진행중인것도 보여지는게 가능할지?", status: "완료", reflection: "관리 타임라인 위에 지금 작업 중 패널을 추가했습니다. 작업명, 시작 시각, 현재 단계, 마지막 갱신 시각이 배포 후 표시되며, 요청 이력은 상태로 필터링할 수 있습니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/","https://github.com/everyhub/everyhub.github.io/actions/runs/45444446999"] },
  { time: "2026-11-25 02:07", id: "site-review-checklist", request: "처음부터 전체적으로 페이지 구성, 버그, 줄바꿈, 보이는 형태 모든걸 검수하고 이상있는건 반영하고 앞으로도 그게 반영되게 리드미에도 반영", status: "완료", reflection: "템플릿·개별 페이지와 반복 상세 표본을 네 너비에서 검수하고 금액 줄바꿈, 관리 표, 입력 높이, 빈 결과 복사 동작을 바로잡았습니다. 내부 링크와 브라우저 점검을 자동화하고 배포 전 검수 절차를 문서화했습니다.", links: ["https://everyhub.github.io/","https://everyhub.github.io/sitemap/","https://github.com/everyhub/everyhub.github.io/actions/runs/45446245464"] },
  { time: "2026-11-25 09:40", id: "site-proposal-news-review", request: "전체적으로 페이지 검수하고 … 기능 넣는거 하루한번말고 그 이상으로 해주고 … 뉴스도 잘 업데이트 되는지 국내 뉴스 가져올만한게 있는지", status: "완료", reflection: "사이트 네 너비 재검수, 추천 3건 등록, 뉴스 예약 및 출처 확인, 과기정통부 보도자료를 반영했습니다. 추천·승인 확인은 09:13·14:13·19:13 KST에 등록했고 추가 슬롯 첫 실행은 별도 행에서 추적합니다.", links: ["https://everyhub.github.io/news/korea/#source-msit","https://github.com/everyhub/everyhub.github.io/actions/runs/45520510235","https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9"] },
  { time: "2026-11-25 10:00", id: "csv-json-converter", request: "#4 has the 승인 label … implement the CSV·JSON 변환기 … check again how many news.yml schedule runs exist since 09:04 KST", status: "완료", reflection: "CSV·JSON 변환기를 브라우저 전용으로 배포·검증하고 이슈 #4에 결과를 남겨 완료 종료했습니다. 뉴스 예약은 2026-11-25 10:00 KST 조회에서 09:04 KST 이후 성공 1건입니다.", links: ["https://everyhub.github.io/tools/csv-json-converter/","https://github.com/everyhub/everyhub.github.io/issues/4#issuecomment-7149108445","https://github.com/everyhub/everyhub.github.io/actions/runs/45521833543","https://github.com/everyhub/everyhub.github.io/actions/runs/45515165966"] },
  { time: "2026-11-25 10:23", id: "remaining-work-review", request: "승인카드는 생성 시 받아볼수있는 알림이 있는지? … 그냥 지금대로두고 남은작업 마저해", status: "진행중", reflection: "알림 설정은 유지했습니다. 추천 예약 세 시간대와 뉴스 보완 갱신을 기록했고, 14:13·19:13 첫 실행은 각각 확인 대기입니다.", links: ["https://app.devin.ai/automations/24995db258e34007bc506bbdf23280c9","https://github.com/everyhub/everyhub.github.io/blob/main/docs/daily-proposals.md","https://github.com/everyhub/everyhub.github.io/actions/runs/45525260475"] },
  { time: "2026-11-25 10:40", id: "official-values-browser-matrix", request: "Check every published official value … across 2026 and 2027 … Define the browser support scope as Chromium, Firefox, and WebKit … plus … iPhone and Pixel", status: "부분", reflection: "노동·세금·주거 및 공휴일의 기관 원문·표 근거를 보강했습니다. cf59d3a 운영 배포의 Chromium·Firefox·WebKit 4개 너비 재감사와 로컬 모바일 에뮬레이션을 통과했습니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/#official-value-evidence","https://github.com/everyhub/everyhub.github.io/blob/main/README.md#배포-전-검수-체크리스트","https://github.com/everyhub/everyhub.github.io/actions/runs/45527730525","https://github.com/everyhub/everyhub.github.io/actions/runs/45528824434"] },
  { time: "2026-11-25 11:27", id: "qualitative-ux-review", request: "페이지 구조나 부자연스러운 어투 줄바꿈 등 페이지 보기좋은 상태 기능들 괜찮은지 버그는 없는지 uiux 잘 고민해줘봐", status: "부분", reflection: "390·1440px에서 템플릿과 도구의 전체 화면을 감수했습니다. 연봉 비교 표의 금액과 단위를 붙이고 관리 표의 근거 링크를 한 줄 이름으로 줄였습니다. 오류가 발생하면 이전 결과나 안내 문구를 복사하지 않도록 했습니다.", links: ["https://everyhub.github.io/salary/20000/","https://everyhub.github.io/ops-7f3a9c2d/#qualitative-ux-review","https://github.com/everyhub/everyhub.github.io/blob/main/README.md#배포-전-검수-체크리스트"] },
  { time: "2026-11-25 19:13", id: "daily-proposals-2026-11-25-evening", request: "19:13 추천 조사·승인 반영 및 Pages 배포 확인", status: "부분", reflection: "신규 제안 #10~#12와 기존 #5·#7·#9의 거절을 추천 탭에 배포하고 운영 카드와 검색 제외 설정을 확인했습니다. 당시 #8은 로컬 구현과 Chromium 검사까지만 진행했습니다.", reason: "이후 새 선정 기준에서 최근 검색 수요가 부족해 #8을 배포하지 않고 이슈를 종료했습니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/runs/45594658093","https://github.com/everyhub/everyhub.github.io/issues/8"] },
  { time: "2026-11-25 19:13", id: "news-refresh-2026-11-25-evening", request: "뉴스 예약 및 보완 실행 확인", status: "부분", reflection: "17:21 KST 예약은 Pages 배포에 성공했습니다. 직전 30분에 성공한 예약이 없어 19:25 KST에 수동 보완했고 빌드가 성공했습니다. 같은 뉴스와 커밋이라 추가 배포는 생략됐습니다. 운영 스냅샷에서 14개 피드·112건을 확인했습니다.", reason: "Actions 원본 로그의 수집 건수와 피드 실패 건수, 30분 주기의 지속 여부는 미확인입니다.", links: ["https://github.com/everyhub/everyhub.github.io/actions/runs/45575503149","https://github.com/everyhub/everyhub.github.io/actions/runs/45594849070","https://everyhub.github.io/news/"] },
  { time: "2026-11-25 22:46", id: "automatic-feature-selection", request: "승인 대신 자동 추가하되 개인에 맞춘 기능은 피하고, 필요성·최근 검색 수요·공식 근거가 있는 기능만 추가", status: "부분", reflection: "방문자 집계는 추가하지 않았습니다. 별도 승인 없이 회당 최대 1건만 선정하며, 적합한 후보가 없으면 유지보수를 우선하도록 절차를 바꿨습니다. 이번에는 신규 기능을 추가하지 않았습니다.", links: ["https://everyhub.github.io/ops-7f3a9c2d/recommendations/","https://github.com/everyhub/everyhub.github.io/blob/main/docs/daily-proposals.md"] },
  { time: "2026-11-26 14:13", id: "daily-feature-review-2026-11-26-afternoon", request: "14:13 자동 기능 점검·구현 및 배포·뉴스 예약 확인", status: "완료", reflection: "네이버 데이터랩 31일 비교와 2026년 현행 법령 원문을 바탕으로 예금·적금 이자 계산기(/tools/deposit-interest/)를 추가하고 Pages 배포(45761588069)와 운영 390·1440px 동작·오프라인 0요청·관리 페이지를 확인했습니다. 최근 30분 내 뉴스 예약이 없어 14:27 KST 보완 실행(45761732433)으로 빌드·배포 성공 및 14개 피드·112건을 확인했습니다.", links: ["https://everyhub.github.io/tools/deposit-interest/","https://everyhub.github.io/ops-7f3a9c2d/recommendations/","https://github.com/everyhub/everyhub.github.io/actions/runs/45761588069","https://github.com/everyhub/everyhub.github.io/actions/runs/45761732433"] },
  { time: "2026-11-26 19:13", id: "daily-feature-review-2026-11-26-evening", request: "19:13 자동 기능 점검·구현 및 배포·뉴스 예약 확인", status: "진행중", reflection: "네이버 데이터랩 31일 비교와 공식 법령·기관 근거를 바탕으로 대출 이자 계산기(/tools/loan-interest/)를 구현하고 로컬 단위 테스트·브라우저 감사를 통과했습니다. 배포 후 운영 반영과 뉴스 예약을 확인합니다.", links: ["https://everyhub.github.io/tools/loan-interest/","https://everyhub.github.io/ops-7f3a9c2d/recommendations/","https://datalab.naver.com/keyword/trendResult.naver?hashKey=N_044082948704453c0488a2768e1e59d8"] },
];

export function hasCompletionEvidence(item) {
  return item.status === '완료' && !!item.evidence?.trim() &&
    Array.isArray(item.links) && item.links.some((url) => URL.canParse(url) && new URL(url).protocol === 'https:');
}

export function auditRequest({ status: priorStatus, reason, ...entry }, items) {
  if (!items?.length) items = [unconfirmed(entry.request,
    reason ?? '이전 답변에서 처리했지만 이 항목의 독립적인 운영 증거를 아직 확인하지 않았습니다.', entry.links)];
  items = items.map((item) => item.status === '완료' && !hasCompletionEvidence(item)
    ? unconfirmed(item.requirement, '운영 검사 설명이나 근거 URL이 없어 완료할 수 없습니다.', item.links)
    : item);
  const status = items.every(hasCompletionEvidence) ? '완료'
    : items.every((item) => item.status === '제외') ? '제외'
      : items.some((item) => item.status === '진행중') ? '진행중'
        : priorStatus === '미확인' ? '미확인'
          : items.some((item) => item.status === '완료' || item.status === '부분') ? '부분' : '미확인';
  return { ...entry, status, reason: status === '완료' ? undefined : reason ?? '세부 항목의 사유와 남은 확인을 참고하세요.', items };
}

export const adminTimeline = requests.map((entry) => auditRequest(entry, auditItems[entry.id]));

export const initialDeployment = { time: '2026-11-24 22:04', request: '초기 GitHub Pages 배포 실행', reflection: '이전 저장소의 첫 실행은 실패했습니다. 현재 에브리허브 저장소의 배포 성공은 별도 실행에서 확인했습니다.', status: '실패', reason: '이전 저장소에서 Pages 설정이 끝나기 전에 실행했습니다.', links: [] };

const inProgress = ({ status }) => Number(status.replace(/\s+/g, '') === '진행중');

export function sortAdminTimeline(entries) {
  return entries.toReversed().sort((a, b) =>
    inProgress(b) - inProgress(a) || b.time.localeCompare(a.time));
}

export function auditEvidenceLabel(url) {
  const { hostname, pathname, hash } = new URL(url);
  if (hostname === 'github.com') {
    const run = pathname.match(/\/actions\/runs\/(\d+)/);
    if (run) return `Actions #${run[1]}`;
    const issue = pathname.match(/\/issues\/(\d+)/);
    if (issue) return `이슈 #${issue[1]}`;
    if (pathname.includes('/blob/')) return 'GitHub 문서';
    return 'GitHub 근거';
  }
  if (hostname === 'everyhub.github.io') {
    if (pathname === '/') return hash ? '홈 바로가기' : '운영 홈';
    if (pathname.startsWith('/ops-7f3a9c2d/')) return '관리 근거';
    if (pathname.startsWith('/sitemap')) return '사이트맵';
    return '운영 근거';
  }
  if (hostname.endsWith('.naver.com')) return '네이버 근거';
  if (hostname.endsWith('.google.com')) return 'Google 근거';
  if (hostname === 'app.devin.ai') return 'Devin 근거';
  if (hostname === 'housing.seoul.go.kr') return '서울시 근거';
  if (hostname === 'techblog.woowahan.com') return '우아한형제들';
  return '외부 근거';
}

export function renderRequirementsAudit(entries = adminTimeline) {
  const cell = (value) => value.replaceAll('|', '\\|').replace(/\s*\n\s*/g, ' ');
  const evidence = (links) => links.map((url) => `[${auditEvidenceLabel(url)}](<${url}>)`).join(' · ');
  const lines = sortAdminTimeline(entries).map(({ time, request, reflection, status, reason, links, items }) => {
    const detail = items.map((item) => `**${item.status}** — ${item.requirement}: ${item.evidence ?? item.reason} ${evidence(item.links)}`.trim())
      .join('<br>');
    return `| ${[time, request, reflection, status, reason ?? '—', evidence(links) || '—', detail].map(cell).join(' | ')} |`;
  });
  return [
    '# 에브리허브 전체 요청 감사',
    '',
    '보관된 대화와 현재 세션의 사용자 원문 발췌(반복 URL 목록과 인증값 제외). 정확한 요청 시각이 없는 행은 인접 작업 시각(KST)입니다. 모든 세부 항목에 운영 검사 설명과 근거 URL이 있어야 완료입니다. 이전 운영 기록은 별도로 표시합니다.',
    '',
    '| 시각(KST) | 요청 | 반영 내용 | 상태 | 사유 | 근거 URL | 세부 항목 · 상태 · 검사/사유 · 근거 |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...lines,
    '',
  ].join('\n');
}

export const adminPending = [
  '추천 운영용 GitHub 토큰 만료일(2027-01-23) 전에 동일한 최소 권한으로 교체하고 연결 확인',
  '별도 Refresh news 워크플로: 2026-11-25 09:04·17:21, 2026-11-26 03:48·11:08 KST 예약 성공 4건을 확인했으며 30분 반복 주기는 미확인',
  '공식 고시 전인 2027년 구직급여 상한·일부 보험 상·하한·산재 요율·간이세액표 확인',
  'Google Search Console·네이버 서치어드바이저 색인과 sitemap 처리 결과 확인',
  'AdSense 승인·광고 정책·상업 운영 조건 확인',
];
