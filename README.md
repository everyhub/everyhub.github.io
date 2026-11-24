# 에브리허브 (EveryHub)

[운영 사이트](https://everyhub.github.io/) · [저장소](https://github.com/everyhub/everyhub.github.io) · [배포 기록](https://github.com/everyhub/everyhub.github.io/actions/workflows/pages.yml)

공식 한국 자료를 바탕으로 한 계산기와 생활 정보, 브라우저 사진·텍스트 도구, IT·AI 소식을 제공하는 정적 사이트입니다. 홈의 **한눈에 바로가기**, 왼쪽 메뉴와 [HTML 사이트맵](https://everyhub.github.io/sitemap/)에서 분야별 기능을 열 수 있습니다. 기존 연봉별 주소 101개와 홈의 `?salary=4000#calculator` 같은 링크를 유지합니다. 전용 연봉 계산기는 `/tools/salary-calculator/`입니다. 공개 페이지 201개와 별도의 검색 제외 이미지 편집기 문서 하나를 생성합니다.

## 새 작업에 착수할 때

1. 이 문서와 `git status --short -b`를 먼저 확인하세요. 데이터 수정 전에 관련 모듈과 `test/`의 기존 계약을 읽습니다.
2. 아래 표의 원문에서 수치, 적용일, 범위와 예외를 확인하세요. 공포·고시와 입법·행정예고를 구분합니다. 미확정·미확인 항목은 화면에 표시하고 임의의 수치를 넣지 않습니다. 자료 확인일은 실제로 확인한 경우에만 바꿉니다.
3. 중립 브랜드 **에브리허브 (EveryHub)**를 유지하며 운영 URL이나 예시에 개인 이름을 넣지 않습니다. 한국어 표현, 띄어쓰기와 용어를 검토하고 기존 주소와 상대 링크를 보존합니다. 새 공개 페이지는 홈 바로가기, 메뉴, HTML/XML 사이트맵, canonical 및 적절한 구조화 데이터에 포함합니다.
4. 기능·출처·운영 방법·미완료 작업을 바꿀 때마다 **같은 변경에서 이 README를 갱신**하세요. 다음 작업자가 읽을 내용, 다음 확인 시점과 검증 방법을 남깁니다.

홈·왼쪽 메뉴·HTML 사이트맵은 `navigationGroups`의 8개 분야를 공유합니다. 왼쪽 메뉴는 현재 페이지의 분야만 기본으로 열리고 HTML 사이트맵은 분야별 도구만 표시합니다. 연봉·시급·퇴직금·가구원 수 등 세부 예시는 해당 계산기의 바로보기에서 열 수 있습니다. 전체 예시는 접힌 목록에도 일반 링크로 연결하며, 공개 상세 페이지는 기존 주소와 XML 사이트맵을 유지합니다. 기존 `/tax/`와 `/living/`은 각각 `/pay/`, `/info/`에서 이동할 수 있습니다.

## 파일 지도

| 파일 | 역할 |
| --- | --- |
| `build.mjs`, `site.config.mjs` | 공통 설정, 정적 HTML과 자산, XML 사이트맵·robots, 뉴스 스냅샷 생성 |
| `src/pages.mjs`, `src/labor-pages.mjs` | 공통 레이아웃/메타데이터, 홈·연봉별 상세, 분야·계산기·예시·HTML 사이트맵 템플릿 |
| `src/navigation.mjs`, `src/navigation-browser.mjs`, `src/style.css` | 왼쪽 메뉴 트리, 모바일 접기/펼치기, 스타일 |
| `src/calculator.mjs`, `src/rates.mjs`, `src/withholding-table.mjs` | 연봉 실수령액, 국민연금·건강보험 등 보험료, 공식 근로소득 간이세액표 |
| `src/labor.mjs`, `src/labor-rates.mjs`, `src/tool-specs.mjs` | 최저임금·퇴직·실업·육아·근로시간 계산, 공식 근거 및 브라우저 폼 정의 |
| `src/guides.mjs`, `src/guide-rates.mjs`, `src/guide-specs.mjs` | 추가 세금·복지·주거·근로 계산, 공식 근거 및 폼 정의 |
| `src/housing.mjs`, `src/housing-rates.mjs`, `src/housing-specs.mjs`, `src/housing-examples.mjs` | 주거 계산, 기관별 공고·요율, 폼 및 금액별 예시. 주거 허브는 `/housing/` |
| `src/browser.mjs`, `src/labor-browser.mjs`, `src/display.mjs` | 브라우저 입력·계산·표시. 계산 입력값은 서버로 보내지 않음 |
| `src/news-config.mjs`, `src/news.mjs`, `src/news-pages.mjs` | 공식 피드 목록, RSS/Atom·Hacker News API 수집 및 실패 시 복구, 분야별 소식 |
| `src/information.mjs`, `src/information-pages.mjs` | 공식 공휴일·연휴, 국세청 정기 신고·납부 기간, 연도별 최저임금·보험료 비교 |
| `src/utility-*.mjs`, `src/utility.mjs` | 브라우저 사진 변환, 글자 수·UTF-8 바이트, 만 나이, 날짜 차이, 면적 환산 도구와 SEO 페이지 |
| `src/background-removal/` | 같은 출처의 독립 편집기, ONNX 모델·WASM, 브러시·머리카락 보정. 모델 출처와 라이선스는 `vendor/SOURCES.txt` |
| `test/`, `.github/workflows/pages.yml` | Node 내장 테스트, GitHub Pages 빌드 및 배포 |

## 로컬 실행과 검증

Node.js 22 이상(운영 CI는 24)을 사용합니다. 써드파티 npm 의존성 설치는 필요하지 않습니다. 현재 작업 환경의 Node가 기본 PATH에 없으면 `~/.nvm/versions/node/v24.22.2/bin`을 PATH에 추가합니다.

```sh
export PATH="$HOME/.nvm/versions/node/v24.22.2/bin:$PATH"
npm test
npm run build
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

브라우저에서 `http://127.0.0.1:8080/`, `/salary/4000/`, `/tools/salary-calculator/`, `/tools/`, `/sitemap/`, `/news/`, `/info/`를 확인하세요. 모바일 메뉴와 바로가기를 점검합니다. 누끼는 실제 사용자 사진 대신 합성 이미지를 사용해 모델 추론, 투명 PNG, 직접 수정, 네트워크 탭에서 모델·WASM만 같은 출처로 요청되는지 확인합니다. 로컬 기본 빌드는 피드를 요청하지 않습니다. 온라인 피드 빌드는 `NEWS_REFRESH=1 npm run build`로 확인하세요.

## 사진 도구의 개인정보와 배포 용량

- 누끼·이미지 변환 페이지에는 광고·분석 스크립트를 넣지 않습니다. 사진과 입력값은 메모리에서만 처리하고 사용자 요청 때만 결과 파일을 만듭니다. 편집기 문서와 Blob Worker는 CSP로 연결을 같은 출처에 제한하며, 업로드·외부 폰트·CDN·웹 저장소·서비스 워커를 쓰지 않습니다.
- ONNX 모델 3개와 Runtime/WASM은 기존 프로젝트 파일을 변경 없이 제공합니다. 가장 큰 파일은 약 44.3MB, 전체 편집기 자산은 약 93.4MB입니다(십진 단위). 모델은 기능을 실행할 때 필요한 것만 받습니다. GitHub Pages에서는 단일 스레드로 동작하며 PWA 설치·오프라인 캐시는 제공하지 않습니다.
- 새 모델을 넣을 때 출처와 재배포 라이선스를 확인하고 Git 파일당 100MB, Pages 사이트 1GB 한도를 확인하세요. 이미지 변환은 PNG·JPG·WebP를 지원하며 HEIC 디코더는 포함하지 않습니다.

## 데이터 갱신

- **급여·보험료:** 공단 및 법령 원문과 `src/rates.mjs`를 대조합니다. 국민연금 기준소득월액 상·하한은 7월에 별도 확인합니다. 법령 별표 2가 바뀌면 `src/withholding-table.mjs`의 월 과세급여 구간, 가족 1~11명 세액, 1,000만 원 초과 산식, 자녀 공제를 함께 점검합니다. 2026년 1~2월과 3월 이후의 표 숫자 및 고액 산식은 동일하고 자녀 공제액은 다릅니다.
- **근로·세금·복지:** `src/labor-rates.mjs`와 `src/guide-rates.mjs`에 연결된 최저임금위원회, 고용노동부·고용24, 국가법령정보센터, 국세청, 보건복지부 등 공식 자료를 확인합니다. 기준 중위소득은 고시의 가구별 금액과 급여별 선정 비율을 함께 대조합니다. 값과 적용일을 기록하고 회귀 테스트를 추가합니다.
- **주거·전월세:** LH·SH 공고의 적용일·유형·양방향 전환율과 동·호별 한도를 확인해 `src/housing-rates.mjs`를 갱신합니다. LH 국민임대·행복주택 한도는 지금도 개별 공고의 차액을 입력하며, SH 자동 한도는 인용한 공고의 예시입니다. HUG는 모바일 공시 범위, HF는 일반전세지킴보증 기본 요율, SGI는 공식 견적 요율 직접 입력입니다. 전세·구입자금 대출은 기금의 공시 범위와 상품 한도를 확인하고 우대 후 금리는 직접 입력합니다. 중개보수는 서울 주택, 취득세는 개인 유상매매에 한정합니다. 다른 시도 확대와 SGI 자동 요율은 공식 원문을 검증한 뒤 추가합니다.
- **생활 정보:** `src/information.mjs`의 공휴일은 우주항공청 월력요항·한국천문연구원 자료와 개정 법령을 대조합니다. 임시 지정이나 공휴일 변경 시 두 연도 페이지를 확인합니다. 세무일정 안내는 정기 법정 기간과 해당 월에 실제 적용되는 국세청 공지를 구분합니다.
- **IT·AI 소식:** 발행처의 공개 RSS·Atom 또는 공식 API만 사용합니다. 분야는 국내 IT(네이버 D2·카카오테크), 해외 IT(Mozilla·NASA), AI 모델·이슈(OpenAI·Hugging Face), 핫이슈(Hacker News)입니다. 원문 제목·출처·시간·링크와 피드가 제공하는 짧은 소개만 표시합니다. 전문·이미지·댓글은 싣지 않고, 해당 발행처의 이용 정책을 확인합니다. 정책브리핑 RSS는 2026년 7월 1일 종료되어 연결하지 않습니다.

## 배포 및 장애 대응

- 조직 사이트 기본 URL은 `https://everyhub.github.io/`입니다. 저장소의 **Settings → Pages → Build and deployment → Source**는 **GitHub Actions**입니다. CI는 Pages의 URL을 사용하므로 하위 경로도 지원합니다. 운영 URL을 덮어쓸 때만 **Settings → Secrets and variables → Actions → Variables**의 `SITE_URL`을 설정합니다.
- 권한이 있으면 변경 파일만 명시해 커밋하고 `git push origin main`을 실행하세요. 프록시 쓰기 권한이 없고 이미 승인·주입된 토큰이 있다면 터미널 기록·명령 인자에 토큰을 넣지 않는 아래 방법을 사용합니다. `T`는 환경변수로만 주입하고, 값을 출력하지 마세요. 셸 추적(`set -x`)과 HTTP/Git 트레이스를 켜지 않습니다.

```sh
git -c credential.helper= \
  -c 'credential.helper=!f() { [ "$1" != get ] || printf "password=%s\n" "$T"; }; f' \
  push https://x-access-token@github.com/everyhub/everyhub.github.io.git main
```

- `main` 푸시, 매월 1일 03:17 UTC, 수동 실행은 전체 빌드·배포합니다. 30분 주기 예약 실행은 게시물이나 배포 대상 커밋이 달라진 경우에만 아티팩트를 올리고 배포합니다. 30분은 목표 주기이며 GitHub 예약 실행이 지연되거나 누락될 수 있습니다. 겹치는 Pages 실행은 최신 실행이 앞선 실행을 취소합니다.
- 피드가 실패하면 운영 `news-data.json`의 해당 피드 마지막 정상 목록을 사용합니다. 새 피드에 이전 데이터가 없으면 다른 피드를 배포하면서 출처 링크를 표시합니다. 이전 스냅샷이 404가 아닌 오류로 읽히지 않으면 기존 사이트를 보존하도록 빌드를 중단합니다. 수집 오류와 건수는 Actions 로그를 확인하세요.
- 배포 후 Actions에서 **Deploy to GitHub Pages**의 결과와 커밋을 확인하고 운영 홈·대표 계산기·새 페이지·`sitemap.xml`을 HTTP로 확인합니다. 예약 실행에서 ‘소식 변경 없음’으로 배포 작업이 건너뛰어지는 것은 정상입니다.

## 검색 및 광고

- [Google Search Console](https://search.google.com/search-console/)과 [네이버 서치어드바이저](https://searchadvisor.naver.com/)에서 실제 운영 URL을 등록한 뒤 HTML 메타 태그로 소유권을 확인하고 [sitemap.xml](https://everyhub.github.io/sitemap.xml)을 제출합니다. `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`은 공개 HTML에 렌더링되는 검증 값입니다. 색인·순위·FAQ 리치 결과는 보장되지 않습니다. 하위 경로 사이트의 robots.txt는 호스트 루트 robots.txt를 대신할 수 없습니다.
- `ADSENSE_CLIENT_ID`와 `ADSENSE_SLOT_ID`를 넣기 전에는 광고가 표시되지 않습니다. 활성화 전 [GitHub Pages 사용 제한](https://docs.github.com/ko/pages/getting-started-with-github-pages/github-pages-limits), AdSense 자격, ads.txt 및 개인정보·동의 요건을 확인하세요. 상업 운영 조건이 맞지 않으면 상업적 호스팅과 커스텀 도메인을 검토합니다.

## 다음에 확인할 일

- 2027년 구직급여 상한, 출산전후휴가 급여 상한, 국민연금 하반기 기준소득월액 상·하한, 건강보험 상·하한, 산재보험 업종별 요율 및 근로소득 간이세액표의 확정 원문을 확인합니다. 그전에는 2027년 전체 실수령액을 제공하지 않습니다.
- 정부 지원금·정책 사업별 신청 일정 및 연도 단위의 미확인 세무 일정은 개별 공식 공고와 적용 대상을 확인한 뒤 생활 정보에 추가합니다. 주거 도구는 다른 시도의 중개보수 조례, 감면·일시적 2주택 등 취득세 특례, SGI 공시 요율표의 공식 근거와 적용 조건을 검증한 뒤 확장합니다.
- 뉴스 피드 정상 동작·이용 정책과 검색 색인을 주기적으로 재확인합니다. 공개 API 목록의 인기순은 공식 사실 확인이나 사이트의 추천을 뜻하지 않습니다.
