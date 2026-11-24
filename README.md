# 일과 급여

공식 자료에 근거한 급여·근로·세금·복지·주거 계산기를 모은 한국어 정적 사이트입니다. 왼쪽 탐색 메뉴와 HTML 사이트맵에서 분야별 계산기 및 금액·가구별 페이지를 찾을 수 있습니다. 기존 연봉 실수령액 상세 페이지 101개를 유지합니다.

## 로컬 실행

Node.js 22 이상이 필요합니다. npm 의존성 설치는 필요하지 않습니다.

```sh
npm test
npm run build
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

브라우저에서 `http://127.0.0.1:8080/` 또는 `http://127.0.0.1:8080/salary/4000/`을 엽니다. 계산은 브라우저 안에서만 이루어집니다.

## GitHub Pages에 배포

1. 새 GitHub 저장소를 만들고 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 지정합니다.
2. 이 소스를 저장소의 기본 브랜치 `main`에 올립니다. **Actions**에서 **Deploy to GitHub Pages** 작업과 배포 URL을 확인합니다. `main` 푸시, 매월 1일 03:17 UTC, 수동 실행 시 빌드·배포합니다. 예약 실행은 GitHub 스케줄러 사정에 따라 지연될 수 있습니다.
3. 조직 사이트를 `https://ORG.github.io/`에서 운영하려면 조직 안의 저장소 이름을 `ORG.github.io`로 설정합니다. Actions 빌드는 Pages가 알려 주는 URL을 기본으로 사용하므로 프로젝트의 하위 경로도 지원합니다. 덮어쓰려면 **Settings → Secrets and variables → Actions → Variables**의 `SITE_URL`에 새 운영 URL을 넣으세요. 직접 실행하는 빌드는 조직 사이트 루트 URL을 기본으로 사용합니다. 커스텀 도메인이라면 먼저 Pages의 도메인·DNS를 설정합니다.

`site.config.mjs`의 아래 환경변수는 기본적으로 비어 있습니다. 소유권 확인 코드는 공개 HTML에 들어가는 값입니다.

| 변수 | 용도 |
| --- | --- |
| `SITE_URL` | 사이트의 전체 절대 URL (canonical, sitemap, Open Graph) |
| `GOOGLE_SITE_VERIFICATION` | Google 확인 메타 태그의 `content` 값 |
| `NAVER_SITE_VERIFICATION` | 네이버 확인 메타 태그의 `content` 값 |
| `ADSENSE_CLIENT_ID` | AdSense 게시자 ID (`ca-pub-…`). 비워 두면 광고 스크립트를 싣지 않음 |
| `ADSENSE_SLOT_ID` | 승인 후 만든 디스플레이 광고 단위 ID |

## Google 및 네이버 검색 등록

- **[Google Search Console](https://search.google.com/search-console/)**: URL 접두어 속성에 `https://OWNER.github.io/REPOSITORY/`처럼 실제 배포 URL과 하위 경로 전체를 등록합니다. HTML 태그 방식의 코드 값을 설정하고 재배포한 뒤 소유권을 확인하고, **Sitemaps**에서 `sitemap.xml`을 제출합니다. URL 검사에서 홈과 대표 상세 페이지가 검색 가능 상태인지 확인합니다.
- **[네이버 서치어드바이저](https://searchadvisor.naver.com/)**: **웹마스터 도구 → 사이트 등록**에서 운영 URL을 등록합니다. HTML 태그 방식의 코드 값을 설정하고 재배포한 뒤 소유를 확인하고, **요청 → 사이트맵 제출**에 사이트맵 URL을 입력합니다. 서치어드바이저가 프로젝트 하위 경로를 독립 사이트로 등록하거나 검증하지 못하면, 소유한 커스텀 도메인을 연결해 루트 URL로 등록하세요.
- `dist/robots.txt`는 생성되지만, 프로젝트 사이트의 `/salary-calc/robots.txt`는 호스트 루트의 robots 파일을 대신하지 못합니다. 호스트 루트를 관리하지 않는 경우 검색 도구에 사이트맵을 직접 제출하세요.
- 사이트맵 제출과 구조화 데이터는 검색 노출·순위·FAQ 리치 결과를 보장하지 않습니다. 먼저 대표 연봉 상세 페이지의 색인과 검색 유입을 확인하세요.

## 계산 기준을 매년 갱신

1. `src/rates.mjs`에 연결된 공단·법령 원문을 확인하고 연도, 보험료율, 상·하한 및 적용월, 자녀 공제를 갱신합니다. 국민연금 기준소득월액 상·하한은 7월에 별도 확인합니다.
2. 법령 별표 2에서 표가 바뀌면 `src/withholding-table.mjs`의 월 과세급여 구간 시작액(천 원)과 가족 1~11명 세액(원)을 교체하고, 1,000만 원 초과 산식도 대조합니다. 2026년 1~2월과 3월 이후의 표 숫자와 고액 산식은 동일하고 자녀 공제액만 다릅니다.
3. 해당 연도의 공식 세액표 금액과 보험료 계산 예시를 `test/calculator.test.mjs`에 반영한 뒤 테스트와 빌드를 실행합니다. 월간 배포가 요율을 자동 갱신하지는 않습니다.
4. `src/labor-rates.mjs`에서 최저임금·법정수당·휴가·고용보험·산재보험 기준을 각 공식 원문과 대조하고 적용일 및 확인일을 갱신합니다. 다음 연도에 적용될 고시와 현재 적용 기준은 구분해 표시합니다. 확인일은 빌드 날짜로 자동 변경하지 않습니다. 각 계산기 화면에 적용 범위와 공식 근거를 표시합니다.
5. `src/guide-rates.mjs`의 기준 중위소득은 연도별 고시와 기초생활보장 급여별 선정 기준을 함께 대조합니다. 근로시간·세금·주택임대차 계산은 해당 조문을 확인합니다. 행정예고나 입법예고 단계의 수치는 확정 기준에 넣지 않습니다.

국내 일반 직장가입자가 12개월에 나눠 받는 급여를 가정합니다. 실제 보험료는 회사의 신고액과 정산, 감면에 따라 달라지며, 상여·퇴직금·연말정산은 계산하지 않습니다. 결과는 참고용입니다.

## 광고 운영 전 확인

초기 설정은 광고가 꺼져 있습니다. 유입과 색인을 확인한 뒤, 활성화 전에 [GitHub Pages 사용 제한](https://docs.github.com/ko/pages/getting-started-with-github-pages/github-pages-limits)과 AdSense 사이트 자격, ads.txt, 동의 및 개인정보 안내 요건을 확인하세요. 무료 정보 사이트의 광고 수익화가 승인된다는 보장은 없습니다. 호스트 루트의 ads.txt나 상업 운영이 필요하면 커스텀 도메인 및 상업적 호스팅으로 이전하는 편이 적합할 수 있습니다.
