# 에브리허브 (EveryHub)

[운영 사이트](https://everyhub.github.io/) · [저장소](https://github.com/everyhub/everyhub.github.io) · [배포 기록](https://github.com/everyhub/everyhub.github.io/actions/workflows/pages.yml)

공식 한국 자료를 바탕으로 한 계산기와 생활 정보, 브라우저 사진·텍스트 도구, IT·AI 소식을 제공하는 정적 사이트입니다. 홈은 **한눈에 바로가기** 카드만 보여 주며 연봉 계산기는 `/tools/salary-calculator/`에서 엽니다. 기존 연봉별 주소와 홈의 `?salary=4000#calculator` 같은 링크는 홈에서 전용 계산기 주소로 자동 이동합니다. [HTML 사이트맵](https://everyhub.github.io/sitemap/)과 왼쪽 메뉴에서 분야별 기능을 열 수 있습니다. 공개 페이지 231개와 검색에서 제외한 관리 페이지 두 개, 이미지 편집기 문서 하나를 생성합니다.

## 새 작업에 착수할 때

1. 이 문서와 `git status --short -b`를 먼저 확인하세요. 데이터 수정 전에 관련 모듈과 `test/`의 기존 계약을 읽습니다.
2. 아래 표의 원문에서 수치, 적용일, 범위와 예외를 확인하세요. 공포·고시와 입법·행정예고를 구분합니다. 미확정·미확인 항목은 화면에 표시하고 임의의 수치를 넣지 않습니다. 자료 확인일은 실제로 확인한 경우에만 바꿉니다.
3. 중립 브랜드 **에브리허브 (EveryHub)**를 유지하며 운영 URL이나 예시에 개인 이름을 넣지 않습니다. 한국어 표현, 띄어쓰기와 용어를 검토하고 기존 주소와 상대 링크를 보존합니다. 새 공개 페이지는 홈 바로가기, 메뉴, HTML/XML 사이트맵, canonical 및 적절한 구조화 데이터에 포함합니다.
4. 기능·출처·운영 방법·미완료 작업을 바꿀 때마다 **같은 변경에서 이 README를 갱신**하세요. 다음 작업자가 읽을 내용, 다음 확인 시점과 검증 방법을 남깁니다.

홈·왼쪽 메뉴·HTML 사이트맵은 `navigationGroups`의 8개 분야를 공유합니다. 왼쪽 메뉴는 현재 페이지의 분야만 기본으로 열리고, 아이콘·넓은 터치 영역·강한 현재 위치 표시로 탐색을 돕습니다. 메뉴 하단의 **바로가기 검색**은 홈 검색창에 포커스를 둡니다. 상단 오른쪽에는 홈 링크를 두고 전체 사이트맵은 메뉴 하단과 모든 페이지 푸터에서 엽니다. HTML 사이트맵은 분야별 도구만 표시합니다. 연봉·시급·퇴직금·가구원 수 등 세부 예시는 해당 계산기의 바로보기에서 열 수 있습니다. 전체 예시는 접힌 목록에도 일반 링크로 연결하며, 공개 상세 페이지는 기존 주소와 XML 사이트맵을 유지합니다. 기존 `/tax/`와 `/living/`은 각각 `/pay/`, `/info/`에서 이동할 수 있습니다.

## 파일 지도

| 파일 | 역할 |
| --- | --- |
| `build.mjs`, `site.config.mjs` | 공통 설정, 정적 HTML과 자산, XML 사이트맵·robots, 뉴스 스냅샷 생성 |
| `src/pages.mjs`, `src/labor-pages.mjs` | 공통 레이아웃/메타데이터, 홈·연봉별 상세, 분야·계산기·예시·HTML 사이트맵 템플릿 |
| `src/navigation.mjs`, `src/navigation-browser.mjs`, `src/style.css` | 왼쪽 메뉴 트리, 모바일 접기/펼치기, 스타일 |
| `src/admin-log.mjs`, `src/admin-pages.mjs` | 연결하지 않은 noindex 작업 요청 타임라인과 다음 작업용 요청 기록 |
| `src/admin-proposals.mjs`, [추천 운영 절차](docs/daily-proposals.md) | 하루 세 번의 자동 기능 조사·반영 절차와 관리 탭 결과 기록 |
| `src/calculator.mjs`, `src/rates.mjs`, `src/withholding-table.mjs` | 연봉 실수령액, 국민연금·건강보험 등 보험료, 공식 근로소득 간이세액표 |
| `src/labor.mjs`, `src/labor-rates.mjs`, `src/tool-specs.mjs` | 최저임금·퇴직·실업·육아·근로시간 계산, 공식 근거 및 브라우저 폼 정의 |
| `src/guides.mjs`, `src/guide-rates.mjs`, `src/guide-specs.mjs` | 추가 세금·복지·주거·근로 계산, 공식 근거 및 폼 정의 |
| `src/housing.mjs`, `src/housing-rates.mjs`, `src/housing-specs.mjs`, `src/housing-examples.mjs` | 주거 계산, 기관별 공고·요율, 폼 및 금액별 예시. 주거 허브는 `/housing/` |
| `src/browser.mjs`, `src/labor-browser.mjs`, `src/display.mjs` | 브라우저 입력·계산·표시. 계산 입력값은 서버로 보내지 않음 |
| `src/news-config.mjs`, `src/news.mjs`, `src/news-pages.mjs` | 공식 피드 목록, RSS/Atom·Hacker News API 수집 및 실패 시 복구, 분야별 소식 |
| `src/information.mjs`, `src/information-pages.mjs` | 공식 공휴일·연휴, 국세청 정기 신고·납부 기간, 연도별 최저임금·보험료 비교 |
| `src/utility-*.mjs`, `src/utility.mjs` | 도구 분류, 폼, 브라우저 처리, 파일 다운로드, SEO 페이지 |
| `src/utility-vendor/` | 같은 출처에서 필요할 때만 불러오는 pdf-lib 1.17.1·qrcode-generator 2.0.4 (MIT); `SOURCES.md`에 원본과 라이선스 |
| `src/background-removal/` | 같은 출처의 독립 편집기, ONNX 모델·WASM, 브러시·머리카락 보정. 모델 출처와 라이선스는 `vendor/SOURCES.txt` |
| `test/`, `.github/workflows/pages.yml` | Node 내장 테스트, GitHub Pages 빌드 및 배포 |

## 로컬 실행과 검증

Node.js 22 이상(운영 CI는 24)을 사용합니다. 빌드·단위 테스트에는 설치가 필요하지 않으며 브라우저 감사에만 Playwright를 사용합니다. 현재 작업 환경의 Node가 기본 PATH에 없으면 `~/.nvm/versions/node/v24.22.2/bin`을 PATH에 추가합니다.

```sh
export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"
npm test
npm run build
npm ci
npx playwright install chromium firefox webkit
npm run audit
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

브라우저에서 `http://127.0.0.1:8080/`, `/salary/4000/`, `/tools/salary-calculator/`, `/tools/`, `/sitemap/`, `/news/`, `/info/`를 확인하세요. 모바일 메뉴와 바로가기를 점검합니다. 누끼는 실제 사용자 사진 대신 합성 이미지를 사용해 모델 추론, 투명 PNG, 직접 수정, 네트워크 탭에서 모델·WASM만 같은 출처로 요청되는지 확인합니다. 로컬 기본 빌드는 피드를 요청하지 않습니다. 온라인 피드 빌드는 `NEWS_REFRESH=1 npm run build`로 확인하세요.

## 배포 전 검수 체크리스트

- [ ] 시작할 때 `npm run now -- start`, 단계가 바뀔 때 `npm run now -- step`, 종료할 때 `npm run now -- done`으로 관리 페이지의 작업 기록을 갱신합니다. 단계는 커밋·푸시 후 배포되면 보입니다.
- [ ] `npm test`와 `npm run audit`를 실행합니다. 데스크톱 Chromium·Firefox·WebKit(Playwright)은 각각 390·768·1024·1440px에서, 모바일 에뮬레이션은 iPhone 15(WebKit)와 Pixel 7(Chromium)의 기본 뷰포트에서 레이아웃과 기능을 점검합니다. 전체 HTML 내부 링크·앵커, 페이지 구조, 가로 넘침, 이미지와 주요 버튼·입력 높이를 검사합니다.
- [ ] 네 너비에서 홈·분야·검색·계산기·개별 도구·주거·생활 정보·뉴스·사이트맵·관리 페이지의 캡처를 직접 봅니다. 반복 생성하는 연봉·시급·퇴직금·중위소득 상세는 낮은 값·대표 값·높은 값을 표본으로 확인합니다. 제목·본문 크기, 고립된 글자와 금액·단위 줄바꿈, 여백·대비·아이콘, 모바일 표, 메뉴 열기·닫기와 데스크톱 고정 메뉴, 푸터를 확인합니다. 수정한 화면은 다시 캡처해 비교합니다.
- [ ] 390·1440px에서 각 템플릿과 도구의 첫 화면부터 푸터까지 확인합니다. 반복 상세는 레이아웃 변형별로 최소·최대값을 포함하고, 뉴스는 기사 목록이 채워진 운영 화면도 봅니다. 첫 화면에 제목과 주 작업이 보이고, 보충 설명이 입력과 결과 사이를 가로막지 않아야 합니다. 본문은 자연스러운 합니다체로 쓰고, 버튼은 동작을, 오류 메시지는 바로 고칠 내용을 짧게 안내합니다. 표에서는 금액과 단위를 붙이고 근거 링크는 짧은 이름으로 표시합니다.
- [ ] 지원 범위의 각 너비·에뮬레이션에서 모든 양식·도구의 정상·경계·오류 입력과 콘솔을 확인합니다. 입력 안내, 결과·다운로드, 복사·초기화·최근 도구·관련어 검색도 점검합니다. 사진·문서는 합성 파일만 사용합니다. 브라우저 감사는 쿼리 없는 동일 출처 GET/HEAD 외 요청을 차단하고 실패로 보고합니다.
- [ ] 마우스뿐 아니라 Tab과 Enter로 양식을 사용합니다. 결과에는 값과 단위를 명확히 표시하고, 오류 메시지나 잘못된 입력에 남아 있는 이전 값을 결과로 복사할 수 없는지 확인합니다.
- [ ] 배포 후 실제 운영 사이트에서 바뀐 동작을 다시 확인합니다. 모든 세부 요구의 운영 검사 결과와 HTTPS 근거 URL이 있어야 관리 타임라인에서 요청을 `완료`로 표시합니다. 확인하지 않은 브라우저·기기·입력이나 미해결 사항은 검증 범위와 별도로 기록합니다.

Linux에서 시스템 라이브러리가 없으면 `npx playwright install-deps chromium firefox webkit`로 준비합니다. 한 환경만 다시 검사하려면 `AUDIT_PROFILE=chromium|firefox|webkit|iphone|pixel` 중 하나를 지정하세요. Chromium 실행 파일은 `AUDIT_CHROMIUM_PATH`, 캡처 폴더는 `AUDIT_SCREENSHOTS`로 지정할 수 있습니다. `AUDIT_REPORT`는 매트릭스 실행에서 프로필별 JSON 파일을 만들며 쿼리 값은 제외합니다. Firefox·WebKit은 자동화가 OS 클립보드 권한을 부여할 수 없어 붙여 넣기·복사 값 검증에 메모리 클립보드를 사용합니다. 모바일 에뮬레이션은 실제 기기나 OS 클립보드 호환성을 보증하지 않습니다. 뉴스 목록까지 보려면 운영 감사 또는 `NEWS_REFRESH=1 npm run audit`를 사용합니다(피드는 브라우저가 아니라 빌드에서 수집합니다).

## 브라우저 도구의 개인정보와 배포 용량

- 헤더 마크, 홈 일러스트, 1200×630 공유 이미지는 직접 만든 SVG이며 32·180·192·512px 아이콘과 함께 동일 출처에서 제공됩니다. 스톡 이미지나 외부 폰트 파일을 쓰지 않으며, 원본·PNG는 `src/brand/LICENSE.txt`의 CC0 적용 대상입니다. SVG 수정 후 감사 환경의 Chromium과 로컬 한글 글꼴(권장: Noto Sans CJK KR)로 `node render-brand.mjs`를 실행해 PNG를 다시 만듭니다.

- `/tools/`는 글쓰기, 이미지·PDF, 날짜·시간, 생활 계산, 개발 도구의 하위 허브 5개로 연결합니다. 왼쪽 메뉴와 HTML 사이트맵에는 하위 허브까지만 나열하고, 기존 도구 주소와 새 개별 도구는 XML 사이트맵에 모두 포함합니다.
- 사용자 요청을 반영할 때마다 `src/admin-log.mjs`에 KST 시각, 요청, 반영 내용, 상태와 커밋·배포 기록을 한 행씩 추가합니다. 작업 타임라인은 메뉴·HTML/XML 사이트맵과 연결하지 않으며 `noindex,nofollow`를 사용합니다. 로그인으로 보호되는 페이지는 아니므로 경로를 공개 링크에 적지 않고 비공개 정보를 넣지 않습니다.
- 모든 작업 세션과 자동화 실행은 시작할 때 `npm run now -- start "작업명" "현재 단계"`, 단계가 바뀌면 `npm run now -- step "작업명" "새 단계"`를 실행하세요. 끝날 때는 성공·실패와 관계없이 `npm run now -- done "작업명"`으로 자신의 항목을 지웁니다. 각 변경은 `src/admin-now.json`을 커밋·푸시한 뒤 Pages가 배포하면 관리 페이지의 **지금 작업 중**에 표시됩니다. 요청의 완료 여부는 별도로 작업 타임라인에 기록하고, 상태 필터로 확인합니다.
- 모든 사용자 요청과 답변에서 약속한 항목을 `src/admin-audit-items.mjs`에 각각 기록하세요. 각 세부 항목을 운영 사이트에서 실제 사용하여 성공한 검사·화면과 근거 URL을 남긴 뒤에만 완료로 표시합니다. 검증하지 못하거나 반영하지 못한 항목에는 구체적인 사유·남은 일을 쓰고, 하위 항목이 하나라도 완료가 아니면 상위 요청을 종료하지 않습니다.
- 운영 사이트에서도 동일한 브라우저 검사를 하려면 `AUDIT_LIVE_URL=https://everyhub.github.io npm run audit`를 실행합니다. 관리 타임라인과 동일한 표는 `node --input-type=module -e "import { renderRequirementsAudit } from './src/admin-log.mjs'; process.stdout.write(renderRequirementsAudit())" > "$HOME/everyhub-requirements-audit.md"`로 내보냅니다.
- [자동 기능 점검 절차](docs/daily-proposals.md): 조사 → 선정 → 구현 → 감사 → 배포 → 관리 페이지 기록. 별도 승인 없이, **뚜렷한 필요성과 범용성·최근 검색 수요·공식 근거**를 모두 갖춘 기능만 회당 **최대 1건** 추가합니다. 해당 후보가 없으면 **추가 없음**과 이유를 남기고 버그 수정·공식 수치 갱신·UX 개선을 우선합니다. 브라우저 전용 도구의 외부 요청은 0건이어야 하고 배포 전 감사를 통과해야 합니다. 매일 **09:13·14:13·19:13 KST**에 등록된 실행은 기능 추가 의무가 아닙니다. 방문자 집계나 추적은 추가하지 않습니다.
- 홈에는 카드 오른쪽 위 전체보기, 바로가기 검색과 최근 본 도구를 제공합니다. 바로가기는 이름뿐 아니라 ‘나이’, ‘집’, ‘퇴사’, ‘ㅇㅂ’ 같은 관련어·초성과 한 글자 오타(세 글자부터)도 찾습니다. 동의어 목록은 `src/tool-specs.mjs`의 `shortcutKeywords`에서 관리합니다. 검색어는 전송·저장하지 않으며, `/`로 검색창에 이동하고 화살표와 Enter로 결과를 열 수 있습니다. 계산기에는 금액의 쉼표 표기와 입력 초기화·결과 복사, 긴 페이지에는 맨 위로 버튼이 있습니다. 최근 도구 주소와 일부 도구의 비민감 설정만 해당 브라우저의 `localStorage`에 저장합니다. 연봉·텍스트·파일·비밀번호 결과는 저장하지 않습니다. 방문자 분석은 연결하지 않았습니다.
- 사진·PDF·텍스트는 브라우저 메모리에서만 처리합니다. PDF·QR의 라이브러리는 동일 출처의 정적 자산으로 제공하며, 저장은 사용자가 Blob 다운로드를 눌렀을 때만 이뤄집니다. 파일 테스트에는 실제 문서가 아닌 직접 만든 작은 PDF·이미지를 사용합니다.
- 글자 수 도구에서 X 일반 게시글을 선택하면 공식 `twitter-text` 가중치를 적용합니다. 근무일수는 생활 정보의 2026·2027년 공식 공휴일 데이터를 재사용합니다. 여권 사진은 외교부 권장 온라인 규격으로 자를 뿐, 심사를 보장하지 않습니다.
- [CSV·JSON 변환기](https://everyhub.github.io/tools/csv-json-converter/)는 2MB 이하 UTF-8 데이터를 파일 또는 붙여 넣기로 받아 쉼표·탭·세미콜론으로 양방향 변환합니다. 첫 CSV 행은 고유한 열 이름이어야 하고 값은 문자열로 유지합니다. JSON은 키가 같은 평면 객체 배열만 지원합니다. 결과는 기기에서 복사·저장할 수 있고, CSV 수식처럼 보이는 문자열 앞에는 기본적으로 작은따옴표를 붙입니다. 감사는 페이지를 연 뒤 오프라인으로 변환·복사·저장을 실행하고 요청 0건을 확인합니다.
- [예금·적금 이자 계산기](https://everyhub.github.io/tools/deposit-interest/)는 정기예금·정기적금의 단리·월복리 이자를 월 단위 표준 산식으로 계산하고, 소득세법 제129조·지방세법 제103조의13·조세특례제한법 제88조의2·제89조의3·국고금 관리법 제47조에 따라 일반과세(15.4%)·비과세(0%)·조합등예탁금(1.4%·2026년 신규 5%) 세액(10원 미만 절사)과 만기 예상 수령액을 브라우저에서만 계산합니다.

- `/tools/`의 모든 계산기·도구에는 광고·분석 스크립트를 넣지 않습니다. CSP로 같은 출처 자산만 요청할 수 있으며 폼의 서버 제출을 차단합니다. 누끼 편집기와 Blob Worker도 같은 출처의 모델만 읽으며 사진을 전송하거나 저장하지 않습니다.
- 만 나이·디데이는 네 자리 연도 1900~2100년만 허용합니다. 세계 시간은 서울에 UTC+9를 적용하는 1989~2100년, 근무일수는 공식 자료가 있는 2026~2027년만 계산합니다.
- ONNX 모델 3개와 Runtime/WASM은 기존 프로젝트 파일을 변경 없이 제공합니다. 가장 큰 파일은 약 44.3MB, 전체 편집기 자산은 약 93.4MB입니다(십진 단위). 모델은 기능을 실행할 때 필요한 것만 받습니다. GitHub Pages에서는 단일 스레드로 동작하며 PWA 설치·오프라인 캐시는 제공하지 않습니다.
- 이미지 변환은 PNG·JPG·WebP로 저장할 수 있으며, HEIC·HEIF(HEVC) 입력은 같은 출처의 WASM 디코더로 읽습니다. 원본과 라이선스는 `src/utility-vendor/SOURCES.md`를 참고하세요. 새 모델의 출처와 재배포 라이선스를 확인하고 Git 파일당 100MB, Pages 사이트 1GB 한도를 지키세요.
- 음양력 변환은 한국천문연구원 달력자료에 있는 음력 2026~2028년만 지원합니다. 글자 수 도구의 자소서 목표값은 예시이며, Bluesky의 게시글 규격은 글자 수와 UTF-8 바이트를 따로 검사합니다. 증명사진 크기는 제출처에 맞게 직접 입력합니다.

## 데이터 갱신

- **국내 뉴스 출처 검토:** [과기정통부 공식 RSS](https://www.msit.go.kr/user/rss/rss.do?bbsSeqNo=94)는 원문에 공공누리 제1유형을 표시한 글의 제목과 링크만 싣습니다. [정책브리핑](https://www.korea.kr/etc/noticeView.do?newsId=132038885)은 2026년 7월 1일 RSS를 종료했습니다. [연합뉴스 RSS](https://www.yna.co.kr/rss/index)는 사업 목적 사용에 사전 서면 허가가 필요하고, [전자신문 이용약관](https://info.etnews.com/sub_3_4.html)은 상업적 활용을 제한합니다. 블로터·IT조선·Google News KR의 경우 응답하는 피드는 확인했으나 상업 사이트에서 제3자 기사 소개를 재게시할 권한을 확인하지 못했습니다. ZDNet Korea·디지털데일리·아이뉴스24도 사용 가능한 공식 피드와 재게시 조건을 모두 확인하지 못해 보류합니다.
- **네이버 뉴스:** [뉴스 검색 API](https://developers.naver.com/docs/serviceapi/search/news/news.md)는 앱 등록 후 Client ID와 Client Secret이 필요한 키워드 검색입니다. 뉴스 홈 편집 목록을 제공한다는 근거는 없습니다. [API 이용약관](https://developers.naver.com/products/terms/)상 명시 범위 밖 캐시·가공·배포는 제한되므로 키만으로 정적 스냅샷에 저장하지 않습니다. 적용하려면 허용된 저장·표시 방식 확인과 서버 측 인증이 필요합니다.

- **급여·보험료:** 공단 및 법령 원문과 `src/rates.mjs`를 대조합니다. 국민연금 기준소득월액 상·하한은 7월에 별도 확인합니다. 법령 별표 2가 바뀌면 `src/withholding-table.mjs`의 월 과세급여 구간, 가족 1~11명 세액, 1,000만 원 초과 산식, 자녀 공제를 함께 점검합니다. 2026년 1~2월과 3월 이후의 표 숫자 및 고액 산식은 동일하고 자녀 공제액은 다릅니다.
- **근로·세금·복지:** `src/labor-rates.mjs`와 `src/guide-rates.mjs`에 연결된 최저임금위원회, 고용노동부·고용24, 국가법령정보센터, 국세청, 보건복지부 등 공식 자료를 확인합니다. 기준 중위소득은 고시의 가구별 금액과 급여별 선정 비율을 함께 대조합니다. 값과 적용일을 기록하고 회귀 테스트를 추가합니다.
- **주거·전월세:** LH·SH 공고의 적용일·유형·양방향 전환율과 동·호별 한도를 확인해 `src/housing-rates.mjs`를 갱신합니다. LH 국민임대·행복주택 한도는 지금도 개별 공고의 차액을 입력하며, SH 자동 한도는 인용한 공고의 예시입니다. HUG는 모바일 공시 범위, HF는 일반전세지킴보증 기본 요율, SGI는 공식 견적 요율 직접 입력입니다. 전세·구입자금 대출은 기금의 공시 범위와 상품 한도를 확인하고 우대 후 금리는 직접 입력합니다. 중개보수는 서울 주택, 취득세는 개인 유상매매에 한정합니다. 다른 시도 확대와 SGI 자동 요율은 공식 원문을 검증한 뒤 추가합니다.
- **생활 정보:** `src/information.mjs`의 공휴일은 우주항공청 월력요항·한국천문연구원 자료와 개정 법령을 대조합니다. 임시 지정이나 공휴일 변경 시 두 연도 페이지를 확인합니다. 세무일정 안내는 정기 법정 기간과 해당 월에 실제 적용되는 국세청 공지를 구분합니다.
- 공휴일 페이지는 같은 공식 날짜 목록에서 12개월 달력, 공휴일·대체공휴일 표시와 3일 이상 연휴 구간을 만듭니다. 기존 목록은 유지합니다. 오늘 표시는 브라우저에서 한국시간으로 계산하고 연도는 링크로 전환합니다. 세금 신고는 월별 일정, 임금·보험료는 모바일에서도 읽을 수 있는 비교표로 표시합니다. 생활 정보 페이지는 외부 스크립트를 요청하지 않습니다.
- **IT·AI 소식:** 발행처의 공개 RSS·Atom 또는 공식 API만 사용합니다. 국내 IT는 긱뉴스(GeekNews)를 먼저 보여 주며 네이버 D2·카카오테크·토스·당근 기술 블로그와 과학기술정보통신부 보도자료를 함께 제공합니다. 해외 IT는 GitHub Changelog·Mozilla·LY Corporation·Engineering at Meta, AI 모델·이슈는 OpenAI·Hugging Face·Google DeepMind, 핫이슈는 Hacker News를 담습니다. 분야 안에서 출처별로 골라 볼 수 있습니다. 원문 제목·출처·날짜·링크와 피드가 제공하는 짧은 소개만 표시하며, 전문·이미지·댓글은 싣지 않습니다.

- `/info/support-calendar/`는 복지로·국세청·고용24에서 기간이나 상시 접수를 확인한 주요 제도를 안내합니다. 일정 추가·변경 시 확인일, 공식 공고와 접수처를 함께 갱신합니다.

## 배포 및 장애 대응

- **사진 위치정보 확인·삭제:** JPG의 EXIF GPS 좌표를 기기에서 읽고, 회전 방향을 적용한 새 JPG를 저장합니다. 사진을 업로드하거나 원본 파일을 변경하지 않습니다. 브라우저 감사는 페이지를 연 뒤 오프라인 상태에서 합성 사진의 확인·저장을 실행하며 네트워크 요청이 0건인지 검사합니다.
- **전입신고·확정일자 체크리스트:** 주거 허브와 전월세 신고 대상 계산기에서 이사 절차, 신고 기한, 계약서 준비, 정부24·인터넷등기소·국토교통부 접수처를 안내합니다.

- 뉴스의 출처 보기는 `#source-geeknews` 같은 주소로 공유할 수 있습니다. 우아한형제들 기술블로그는 수집 환경에서 공식 피드가 접근을 허용하지 않아 원문 링크만 제공합니다.

- 조직 사이트 기본 URL은 `https://everyhub.github.io/`입니다. 저장소의 **Settings → Pages → Build and deployment → Source**는 **GitHub Actions**입니다. CI는 Pages의 URL을 사용하므로 하위 경로도 지원합니다. 운영 URL을 덮어쓸 때만 **Settings → Secrets and variables → Actions → Variables**의 `SITE_URL`을 설정합니다.
- 권한이 있으면 변경 파일만 명시해 커밋하고 `git push origin main`을 실행하세요. 프록시에 쓰기 권한이 없으면 승인·주입된 `EVERYHUB_GITHUB_TOKEN`으로 GitHub에 직접 푸시합니다. 이 명령에서만 전역·시스템 설정을 무시해 프록시 URL 재작성을 피합니다. 토큰과 헤더를 출력하거나 셸 추적(`set -x`)·HTTP/Git 트레이스를 켜지 마세요.

```sh
(
  : "${EVERYHUB_GITHUB_TOKEN:?EVERYHUB_GITHUB_TOKEN is not set}"
  export EVERYHUB_PUSH_HEADER="Authorization: Basic $(printf 'x-access-token:%s' "$EVERYHUB_GITHUB_TOKEN" | base64 | tr -d '\n')"
  GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 \
    git --config-env=http.extraheader=EVERYHUB_PUSH_HEADER \
    push https://github.com/everyhub/everyhub.github.io.git main
)
```

- `main` 푸시, 매월 1일 03:17 UTC, 기본 수동 실행은 전체 빌드·배포합니다. [Refresh news](https://github.com/everyhub/everyhub.github.io/actions/workflows/news.yml)는 정각을 피해 UTC 매시 07·37분에 공통 Pages 워크플로를 호출합니다. 예약이 누락되면 **Refresh news → Run workflow**로 수동 실행할 수 있습니다(기존 **Deploy to GitHub Pages → Run workflow → news_only**도 동작합니다). 뉴스 실행은 게시물이나 배포 대상 커밋이 달라진 경우에만 배포합니다. 예약 시각은 목표이며 GitHub가 실행을 지연하거나 누락할 수 있습니다. 수동 실행 성공과 예약 실행 확인은 별개입니다. 겹치는 Pages 실행은 최신 실행이 앞선 실행을 취소합니다.
- 2026-11-25 [09:04 KST](https://github.com/everyhub/everyhub.github.io/actions/runs/45515165966)와 [17:21 KST](https://github.com/everyhub/everyhub.github.io/actions/runs/45575503149)에 시작한 Refresh news 예약 실행의 빌드·Pages 배포 성공을 확인했습니다. 추천 자동화는 매 실행마다 최근 뉴스 예약을 확인하고, 직전 30분에 성공한 예약이 없으면 [보완 갱신 절차](docs/daily-proposals.md#5-뉴스-예약-누락-시-보완-갱신)를 따릅니다.
- 같은 날 [19:25 KST 보완 실행](https://github.com/everyhub/everyhub.github.io/actions/runs/45594849070)은 빌드에 성공했고 뉴스와 커밋이 같아 배포를 생략했습니다. 운영 스냅샷은 14개 피드·112건입니다. 빌드 원본 로그의 피드 실패 건수와 30분 주기의 지속 여부는 미확인입니다.
- 피드가 실패하면 운영 `news-data.json`의 해당 피드 마지막 정상 목록을 사용합니다. 새 피드에 이전 데이터가 없으면 다른 피드를 배포하면서 출처 링크를 표시합니다. 이전 스냅샷이 404가 아닌 오류로 읽히지 않으면 기존 사이트를 보존하도록 빌드를 중단합니다. 수집 오류와 건수는 Actions 로그를 확인하세요.
- 배포 후 Actions에서 **Deploy to GitHub Pages**의 결과와 커밋을 확인하고 운영 홈·대표 계산기·새 페이지·`sitemap.xml`을 HTTP로 확인합니다. 예약 실행에서 ‘소식 변경 없음’으로 배포 작업이 건너뛰어지는 것은 정상입니다.

## 검색 및 광고

- [Google Search Console](https://search.google.com/search-console/)과 [네이버 서치어드바이저](https://searchadvisor.naver.com/)에서 실제 운영 URL을 등록한 뒤 HTML 메타 태그로 소유권을 확인하고 [sitemap.xml](https://everyhub.github.io/sitemap.xml)을 제출합니다. `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`은 공개 HTML에 렌더링되는 검증 값입니다. 색인·순위·FAQ 리치 결과는 보장되지 않습니다. 하위 경로 사이트의 robots.txt는 호스트 루트 robots.txt를 대신할 수 없습니다.
- `ADSENSE_CLIENT_ID`와 `ADSENSE_SLOT_ID`를 넣기 전에는 광고가 표시되지 않습니다. 활성화 전 [GitHub Pages 사용 제한](https://docs.github.com/ko/pages/getting-started-with-github-pages/github-pages-limits), AdSense 자격, ads.txt 및 개인정보·동의 요건을 확인하세요. 상업 운영 조건이 맞지 않으면 상업적 호스팅과 커스텀 도메인을 검토합니다.

## 다음에 확인할 일

- 2027년 구직급여 상한, 출산전후휴가 급여 상한, 국민연금 하반기 기준소득월액 상·하한, 건강보험 상·하한, 산재보험 업종별 요율 및 근로소득 간이세액표의 확정 원문을 확인합니다. 그전에는 2027년 전체 실수령액을 제공하지 않습니다.
- 정부 지원금·정책 사업별 신청 일정 및 연도 단위의 미확인 세무 일정은 개별 공식 공고와 적용 대상을 확인한 뒤 생활 정보에 추가합니다. 주거 도구는 다른 시도의 중개보수 조례, 감면·일시적 2주택 등 취득세 특례, SGI 공시 요율표의 공식 근거와 적용 조건을 검증한 뒤 확장합니다.
- 뉴스 피드 정상 동작·이용 정책과 검색 색인을 주기적으로 재확인합니다. 공개 API 목록의 인기순은 공식 사실 확인이나 사이트의 추천을 뜻하지 않습니다.
