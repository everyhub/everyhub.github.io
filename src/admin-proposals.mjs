export const latestFeatureReview = {
  reviewedAt: "2026-11-27 14:25",
  outcome: "1건 추가 (자동차세 계산기)",
  reason: "네이버 데이터랩 2026-10-27~11-26 5개 후보 비교에서 ‘자동차세 계산기, 자동차세 연납 계산기’ 묶음이 31일 전 기간 양의 상대 지수(최소 12.8, 평균 15.8, 최대 18.6)를 보였고, 국가법령정보센터에서 2026년 현행 지방세법 제127·128·150·151조 및 시행령 제122·125조(연납 공제율 5%)·지방세기본법 제59조 원문을 직접 확인해 /tools/car-tax/를 추가했습니다. 상대 지수가 더 높았던 DSR 계산기는 스트레스 DSR 단계·지역별 가산금리 원문을 이번 환경에서 직접 대조할 수 없어 보류했습니다.",
};

export const adminProposals = [
  {
    id: "car-tax",
    title: "자동차세 계산기",
    what: "승용차(내연기관·하이브리드·전기차)의 배기량·용도 구분·최초 등록 시기(차령 경감)와 1·3·6·9월 연납 시기에 따른 자동차세 본세·지방교육세·연납 절감액을 브라우저에서 계산합니다.",
    why: {
      text: "일반 차량 소유자가 6월·12월 정기분과 1월 연납 시기에 자동차세를 자주 확인하며, 기존 사이트에는 자동차세 계산기가 없었습니다. 네이버 데이터랩 2026-10-27~11-26 일간 비교에서 ‘자동차세 계산기, 자동차세 연납 계산기’ 묶음이 31일 전 기간 양의 상대 지수(최소 12.8, 평균 15.8, 최대 18.6)를 기록했습니다(비교 대상: DSR 계산기 평균 56.0, 타이머·스톱워치 평균 48.5, 기초대사량·칼로리 평균 15.7, 증여세 계산기 평균 10.1; 상대 지수이며 절대 검색량은 아님). DSR은 금융위원회 스트레스 DSR 세부 공고 원문을 이번 환경에서 직접 대조할 수 없어 보류했고, 2026년 현행 법령 원문으로 정확히 검증할 수 있는 자동차세 계산기를 선정했습니다.",
      sources: [{ label: "네이버 데이터랩 · 5개 계산기·도구 주제 비교 (2026-10-27~11-26)", url: "https://datalab.naver.com/keyword/trendResult.naver?hashKey=N_f929c93bf625b3e190287f5f6a50aee0" }]
    },
    officialSources: [
      { label: "국가법령정보센터 · 지방세법 제127조 (과세표준과 세율)", url: "https://www.law.go.kr/법령/지방세법/제127조" },
      { label: "국가법령정보센터 · 지방세법 제128조 (납기와 연납 공제)", url: "https://www.law.go.kr/법령/지방세법/제128조" },
      { label: "국가법령정보센터 · 지방세법 제150조·제151조 (지방교육세 30%)", url: "https://www.law.go.kr/법령/지방세법/제151조" },
      { label: "국가법령정보센터 · 지방세법 시행령 제122조·제125조 (차령·공제율 5%)", url: "https://www.law.go.kr/법령/지방세법시행령/제125조" },
      { label: "국가법령정보센터 · 지방세기본법 제59조 (10원 미만 절사)", url: "https://www.law.go.kr/법령/지방세기본법/제59조" }
    ],
    scope: "생활 계산 하위 /tools/car-tax/ 1페이지. 내연기관·하이브리드 및 전기 승용차, 비영업용·영업용, 최초 등록 반기별 차령 경감(3~12년 최대 50%), 지방교육세(비영업용 30%), 1·3·6·9월 연납 비교, 10만 원 이하 6월 일괄 부과 안내, 복사·초기화·바로가기 검색을 제공합니다.",
    risks: "승용자동차 표준세율(지방세법 제127조) 기준이며 승합·화물·특수·이륜차, 지자체 탄력세율, 중도 취득·양도 일할계산, 장애인·국가유공자 감면은 제외합니다. 입력값은 전송하거나 저장하지 않습니다.",
    createdAt: "2026-11-27 14:25",
    status: "완료",
    decision: "필요성·범용성, 최근 31일 네이버 데이터랩 연속 수요, 2026년 현행 지방세법·시행령 원문 근거를 모두 충족해 선정·구현했습니다.",
    result: { label: "자동차세 계산기", url: "https://everyhub.github.io/tools/car-tax/" }
  },
  {
    id: "loan-interest",
    title: "대출 이자 계산기",
    what: "대출 원금·기간·금리와 거치 기간을 입력해 원리금균등·원금균등·만기일시상환의 월 상환액, 총이자, 총상환액과 방식별 총이자 비교를 브라우저에서 계산합니다.",
    why: {
      text: "일반 사용자가 주택담보·전세·신용대출·할부 이용 전 상환 방식별 월 부담과 총이자를 자주 비교하며, 기존 사이트에는 디딤돌·버팀목 전용 계산기만 있고 범용 대출 이자 계산기가 없었습니다. 네이버 데이터랩 2026-10-26~11-25 일간 조회에서 ‘대출 이자 계산기, 대출이자 계산기, 원리금균등 계산기’ 묶음이 31일 전 기간 양의 상대 지수(최소 45.6, 평균 75.3, 최대 100.0)로 비교 후보 5건(대출 이자, DSR, 타이머·스톱워치, 자동차세, 증여세) 중 가장 높았습니다. 상대 지수이며 절대 검색량은 아닙니다.",
      sources: [{ label: "네이버 데이터랩 · 5개 계산기·도구 주제 비교 (2026-10-26~11-25)", url: "https://datalab.naver.com/keyword/trendResult.naver?hashKey=N_044082948704453c0488a2768e1e59d8" }]
    },
    officialSources: [
      { label: "국가법령정보센터 · 이자제한법 제2조 (이자의 최고한도)", url: "https://www.law.go.kr/법령/이자제한법/제2조" },
      { label: "국가법령정보센터 · 이자제한법 최고이자율 규정 (연 20%)", url: "https://www.law.go.kr/법령/이자제한법제2조제1항의최고이자율에관한규정" },
      { label: "국가법령정보센터 · 금융소비자보호법 제19조 (설명의무)", url: "https://www.law.go.kr/법령/금융소비자보호에관한법률/제19조" },
      { label: "한국주택금융공사 · 주택담보대출 상환방식 안내", url: "https://www.hf.go.kr/ko/sub01/sub01_01_01.do" }
    ],
    scope: "생활 계산 하위 /tools/loan-interest/ 1페이지. 원리금균등·원금균등·만기일시상환, 거치 기간, 방식별 총이자 비교, 법정 최고이자율(연 20%) 초과 안내, 쉼표 표기·복사·초기화·바로가기 검색을 제공합니다.",
    risks: "월 단위 표준 상환 산식(원 단위 반올림) 기준이며 은행별 일할 계산, 변동금리, 중도상환수수료, 개인 신용·DSR 한도 심사는 제외합니다. 입력값은 전송하거나 저장하지 않습니다.",
    createdAt: "2026-11-26 19:22",
    status: "완료",
    decision: "필요성·범용성, 최근 31일 네이버 데이터랩 상대 지수 1위, 공식 법령·기관 근거를 모두 충족해 선정·구현했습니다.",
    result: { label: "대출 이자 계산기", url: "https://everyhub.github.io/tools/loan-interest/" }
  },
  {
    id: "deposit-interest",
    title: "예금·적금 이자 계산기",
    what: "정기예금과 정기적금의 세전 이자, 이자 과세액, 세후 이자, 만기 예상 수령액을 단리·월복리와 과세 기준별로 브라우저에서 계산합니다.",
    why: {
      text: "일반 사용자가 정기예금·정기적금 가입 전 만기 수령액을 자주 비교하며, 기존 페이지에는 예·적금 이자 계산기가 없었습니다. 네이버 데이터랩 2026-10-26~11-25 일간 조회에서 ‘적금 이자 계산기, 예금 이자 계산기, 이자 계산기’ 묶음이 31일 전 기간 양의 상대 지수(최소 48.1, 평균 79.1, 최대 100.0)로 비교 후보 5건 중 가장 높았습니다. 상대 지수이며 절대 검색량은 아닙니다.",
      sources: [{ label: "네이버 데이터랩 · 5개 계산기 주제 비교 (2026-10-26~11-25)", url: "https://datalab.naver.com/keyword/trendResult.naver?hashKey=N_ab2f0d867f66cca6b6173ad2e50a8502" }]
    },
    officialSources: [
      { label: "국가법령정보센터 · 소득세법 제129조 (이자소득 14%)", url: "https://www.law.go.kr/법령/소득세법/제129조" },
      { label: "국가법령정보센터 · 지방세법 제103조의13 (개인지방소득세 10%)", url: "https://www.law.go.kr/법령/지방세법/제103조의13" },
      { label: "국가법령정보센터 · 조세특례제한법 제88조의2 (비과세종합저축)", url: "https://www.law.go.kr/법령/조세특례제한법/제88조의2" },
      { label: "국가법령정보센터 · 조세특례제한법 제89조의3 (조합등예탁금 저율과세)", url: "https://www.law.go.kr/법령/조세특례제한법/제89조의3" },
      { label: "국가법령정보센터 · 국고금 관리법 제47조 (10원 미만 절사)", url: "https://www.law.go.kr/법령/국고금관리법/제47조" }
    ],
    scope: "생활 계산 하위 /tools/deposit-interest/ 1페이지. 정기예금·정기적금, 단리·월복리, 일반과세(15.4%)·비과세(0%)·조합등예탁금(1.4%·2026년 신규 5%), 10원 미만 세액 절사, 쉼표 표기·복사·초기화·바로가기 검색을 제공합니다.",
    risks: "월 단위 표준 산식 기준이며 은행별 일할 계산(365/366일), 우대금리 조건, 중도해지, 비과세·조합등예탁금 개인 한도 및 가입 요건 판정은 제외합니다. 입력값은 전송하거나 저장하지 않습니다.",
    createdAt: "2026-11-26 14:23",
    status: "완료",
    decision: "필요성·범용성, 최근 31일 네이버 데이터랩 상대 지수, 2026년 현행 법령 원문 근거를 모두 충족해 선정·구현했습니다.",
    result: { label: "예금·적금 이자 계산기", url: "https://everyhub.github.io/tools/deposit-interest/" }
  },
  {
    id: "supermoon-viewing",
    title: "2026년 가장 큰 보름달·월출 확인 안내",
    what: "12월 24일 가장 큰 보름달을 볼 때 달이 차는 시각과 지역별로 달이 뜨는 시각을 어디에서 확인할지 안내합니다.",
    why: {
      text: "2026-11-25 19시대 KST Google Trends 한국 급상승 검색 RSS에서 ‘슈퍼문’ 항목을 확인했습니다. 한국천문연구원은 12월 24일에 2026년 중 가장 큰 보름달을 볼 수 있다고 발표했습니다. 관측 장소의 월출 시각을 직접 확인할 수 있게 안내합니다.",
      sources: [{ label: "Google Trends 한국 급상승 검색 RSS · 2026-11-25 확인", url: "https://trends.google.com/trending/rss?geo=KR" }]
    },
    officialSources: [
      { label: "한국천문연구원 · 2026년도 주목할 천문현상", url: "https://www.kasi.re.kr/publication/post/newsMaterial/32192" },
      { label: "한국천문연구원 · 월별 해·달 출몰시각", url: "https://astro.kasi.re.kr/kor/life/pageView/6" }
    ],
    scope: "생활 정보 /info/supermoon-viewing/ 한 페이지. 2026년 12월 24일 한국시간 날짜, 보름달이 되는 시각과 지역별 월출의 차이, 공식 조회 순서를 안내합니다.",
    risks: "위치 권한 요청, 날씨 연동, 관측 가능 여부 예측, 미발표 연도 계산은 제외합니다. 지역별 실제 시각은 공식 조회를 안내합니다.",
    createdAt: "2026-11-25 19:19",
    status: "보류",
    decision: "급상승 검색어와 공식 자료는 확인했지만, 한 차례 천문 현상은 기존 천문연구원 안내와 월출 조회로 확인할 수 있어 별도 페이지의 필요성이 충분하지 않습니다.",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/10"
  },
  {
    id: "digital-tourism-card",
    title: "디지털 관광주민증 발급·현장 사용 안내",
    what: "발급 지역을 고르고 방문 전 혜택을 조회한 뒤 현장에서 공식 QR 안내를 따르는 순서를 정리합니다.",
    why: {
      text: "2026-11-24 제50회 국무회의는 디지털관광주민증 발급·활용 근거를 마련한 관광진흥법의 12월 3일 시행과 시행령 심의·의결 내용을 브리핑했습니다. 지역별 참여 시설과 사용 방법을 방문 전에 확인하는 데 도움이 됩니다. 국내 검색량은 확인하지 못했습니다.",
      sources: [{ label: "대한민국 정책브리핑 · 제50회 국무회의", url: "https://www.korea.kr/briefing/stateCouncilView.do?newsId=148976402" }]
    },
    officialSources: [
      { label: "한국관광공사 · 디지털 관광주민증 서비스 소개", url: "https://korean.visitkorea.or.kr/dgtourcard/biz/svcIntro/svcIntro.do" },
      { label: "한국관광공사 · 디지털 관광주민증 공식 조회", url: "https://korean.visitkorea.or.kr/dgtourcard/" }
    ],
    scope: "생활 정보 /info/digital-tourism-card/ 한 페이지. 발급과 현장 사용 순서, 해당 지역·시설·혜택을 확인하는 공식 링크를 제공합니다.",
    risks: "회원 로그인·대리 발급·QR 생성·시설 목록 복제를 제외합니다. 혜택이나 할인율은 보장하지 않으며 구현 시 공포 원문과 시행일을 재확인합니다.",
    createdAt: "2026-11-25 19:19",
    status: "보류",
    decision: "공식 조회가 이미 제공되며, 별도 안내를 추가할 만큼 최근 검색 수요는 확인하지 못했습니다.",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/11"
  },
  {
    id: "uuid-v4",
    title: "UUID v4 생성·형식 검사",
    what: "UUID v4를 브라우저에서 한 개 또는 소량 생성·복사하고, 붙여 넣은 문자열의 형식·버전·변형 비트를 검사합니다.",
    why: {
      text: "2026-11-25 KST에 확인한 uuidjs/uuid 공개 저장소의 별은 15,345개로 개발자 관심의 간접 지표입니다. 테스트용 식별자를 복사하거나 기존 값이 v4 형식인지 확인할 수 있습니다. 국내 검색량이나 실제 이용자 수는 확인하지 못했습니다.",
      sources: [{ label: "uuidjs/uuid 공식 저장소 · 공개 별 집계", url: "https://github.com/uuidjs/uuid" }]
    },
    officialSources: [
      { label: "IETF · RFC 9562 §5.4 UUIDv4", url: "https://www.rfc-editor.org/rfc/rfc9562.html#section-5.4" },
      { label: "W3C · Web Cryptography Level 2 randomUUID", url: "https://www.w3.org/TR/webcrypto-2/#Crypto-method-randomUUID" }
    ],
    scope: "개발 도구 /tools/uuid-v4/ 한 페이지. 보안 컨텍스트에서 Web Crypto로 최대 20개까지 생성하고 한 줄씩 복사하거나 UUID v4 형식을 검사합니다.",
    risks: "다른 UUID 버전, 고유성 보장, 인증 토큰 용도, 외부 전송, 브라우저 저장은 제외합니다.",
    createdAt: "2026-11-25 19:19",
    status: "보류",
    decision: "저장소 별 수는 최근 검색 수요를 보여 주지 않으며, 개발 테스트 중심의 도구입니다.",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/12"
  },
  {
    id: "smishing-checklist",
    title: "스미싱 의심 문자 확인·신고 체크리스트",
    what: "문자 링크를 누르지 않고 발신기관에 확인하는 순서, KISA 공식 확인과 118 상담 경로를 정리합니다.",
    why: {
      text: "누구나 의심 문자를 받을 수 있습니다. 네이버 데이터랩의 2026-08-24~11-24 일간 조회에서 ‘스미싱 신고, 스미싱 확인’ 묶음은 마지막 30일 중 22일에 양의 상대 지수를 보였습니다. 절대 검색량은 아닙니다.",
      sources: [{ label: "네이버 데이터랩 · 3개 주제 비교", url: "https://m.datalab.naver.com/trendResult.naver?hashKey=N_3d488555bfb1fa10dea9a4f369641ba1" }]
    },
    officialSources: [
      { label: "KISA 보호나라 · 스미싱 확인서비스 및 118 상담", url: "https://www.boho.or.kr/kr/subPage.do?menuNo=205116" },
      { label: "경찰청 · 사이버범죄 신고시스템", url: "https://ecrm.police.go.kr/minwon/main" }
    ],
    scope: "검토 범위는 생활 정보의 /info/smishing-checklist/ 안내 1페이지였습니다.",
    risks: "사이트가 악성 여부를 판정하거나 링크·문자·번호를 수집하지 않습니다.",
    createdAt: "2026-11-25 09:43",
    status: "거절",
    decision: "최근 수요와 공식 근거는 확인했지만 저장소 관리자의 기존 거절 결정을 유지합니다.",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/7"
  },
  {
    id: "http-status-codes",
    title: "HTTP 상태 코드 빠른 찾기",
    what: "상태 번호 또는 한국어 키워드로 등록된 HTTP 상태 코드를 찾고 IANA에서 연결한 표준을 엽니다.",
    why: {
      text: "404·429·503의 차이를 점검할 때 유용하지만, ‘HTTP 상태 코드, HTTP 오류 코드’ 묶음은 동일한 네이버 데이터랩 조회에서 마지막 30일 중 하루만 양의 상대 지수를 보였습니다.",
      sources: [{ label: "네이버 데이터랩 · 3개 주제 비교", url: "https://m.datalab.naver.com/trendResult.naver?hashKey=N_3d488555bfb1fa10dea9a4f369641ba1" }]
    },
    officialSources: [
      { label: "IANA HTTP 상태 코드 등록부", url: "https://www.iana.org/assignments/http-status-codes" },
      { label: "RFC 9110 상태 코드", url: "https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes" }
    ],
    scope: "개발 도구에 /tools/http-status-codes/ 조회 화면 1페이지를 추가합니다.",
    risks: "조회값을 전송하지 않으며 URL에 요청을 보내는 상태 검사 기능은 제공하지 않습니다.",
    createdAt: "2026-11-25 09:43",
    status: "보류",
    decision: "기존 등록부로 조회할 수 있고 별도 도구를 추가할 만큼 최근 검색 수요가 뚜렷하지 않았습니다.",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/8"
  },
  {
    id: "unicode-normalize",
    title: "유니코드 NFC·NFD 비교·변환기",
    what: "같은 문자열의 NFC·NFD 형태를 브라우저에서 비교·복사하고 코드 포인트 차이를 확인합니다.",
    why: {
      text: "겉보기에는 같은 문자열의 저장 형식을 비교할 때 유용하지만, ‘유니코드 정규화, NFC NFD’ 묶음은 동일한 네이버 데이터랩 조회에서 마지막 30일에 양의 상대 지수가 표시되지 않았습니다.",
      sources: [{ label: "네이버 데이터랩 · 3개 주제 비교", url: "https://m.datalab.naver.com/trendResult.naver?hashKey=N_3d488555bfb1fa10dea9a4f369641ba1" }]
    },
    officialSources: [
      { label: "Unicode UAX #15 정규화 표준", url: "https://unicode.org/reports/tr15/" },
      { label: "ECMAScript 문자열 정규화", url: "https://tc39.es/ecma262/multipage/text-processing.html#sec-string.prototype.normalize" }
    ],
    scope: "개발 도구에 /tools/unicode-normalize/ 비교·변환 화면 1페이지를 추가합니다.",
    risks: "NFC·NFD만 지원하며, 파일명 일괄 변경·파일 업로드·입력 저장은 하지 않습니다.",
    createdAt: "2026-11-25 09:43",
    status: "거절",
    decision: "기존 거절 결정을 유지합니다. 문자열 정규화가 필요한 상황에 한정되며 최근 검색 수요도 뚜렷하지 않았습니다.",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/9"
  },
  {
    id: "csv-json-converter",
    title: "CSV·JSON 변환기",
    what: "표 데이터를 CSV와 JSON 객체 배열 사이에서 양방향으로 바꾸고, 결과를 내려받을 수 있는 브라우저 도구를 제안합니다.",
    why: {
      text: "2026-11-25 KST에 확인한 브라우저용 CSV 도구 Papa Parse의 공개 저장소 별 13,601개는 개발자 관심의 간접 근거입니다. 국내 검색량이나 이용자 수는 아닙니다. 기존 JSON 정리 도구만으로는 스프레드시트에서 내보낸 표를 JSON으로 바꿀 수 없습니다.",
      sources: [
        {
          label: "Papa Parse 공식 저장소와 공개 별 집계",
          url: "https://github.com/mholt/PapaParse"
        }
      ]
    },
    officialSources: [
      {
        label: "Python 공식 문서 원본: CSV와 구분자·인용 규칙",
        url: "https://github.com/python/cpython/blob/main/Doc/library/csv.rst"
      },
      {
        label: "Python 공식 문서 원본: JSON 데이터 형식",
        url: "https://github.com/python/cpython/blob/main/Doc/library/json.rst"
      }
    ],
    scope: "개발 도구 하위 /tools/csv-json-converter/ 1페이지. UTF-8 CSV의 첫 줄을 열 이름으로 사용하며 따옴표·쉼표·필드 내부 줄바꿈을 처리합니다. 변환 결과 복사·다운로드와 합성 예제를 제공합니다.",
    risks: "서버 전송·저장, XLSX, 중첩 JSON 평탄화와 자동 숫자 추론은 제외합니다. 중복 열 이름과 행 길이 불일치를 알리며, CSV 내보내기는 스프레드시트의 수식 해석 위험과 안전 처리의 차이를 안내합니다.",
    createdAt: "2026-11-25 09:16",
    status: "완료",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/4"
  },
  {
    id: "civil-service-fertility-leave",
    title: "국가·지방공무원 난임휴직 준비 체크리스트",
    what: "새 난임휴직과 기존 난임치료 시술휴가의 차이, 해당 공무원이 소속기관에 확인할 절차와 서류를 정리하는 안내를 제안합니다.",
    why: {
      text: "2026-11-25 KST 공식 발표 확인: 행정안전부와 인사혁신처가 국무회의에서 의결된 임용령 개정과 12월 3일 시행을 안내했습니다. 휴가와 휴직을 혼동하지 않고 인사 담당 부서에 무엇을 물을지 정리할 수 있습니다. 국내 검색량은 확인하지 않았습니다.",
      sources: [
        {
          label: "대한민국 정책브리핑의 난임휴직 시행 안내",
          url: "https://www.korea.kr/news/policyNewsView.do?newsId=148976392"
        }
      ]
    },
    officialSources: [
      {
        label: "행정안전부·인사혁신처의 임용령 개정 설명(정책브리핑)",
        url: "https://www.korea.kr/news/policyNewsView.do?newsId=148976392"
      },
      {
        label: "국가법령정보센터: 시행일과 공포 원문 재확인",
        url: "https://www.law.go.kr/"
      }
    ],
    scope: "임신·출산·육아 분야 /info/civil-service-fertility-leave/ 1페이지. 국가·지방 적용 근거를 나누고 시행일과 신청 전 확인 항목을 안내합니다. 체크리스트는 화면에서만 표시합니다.",
    risks: "민간 근로자 제도와 합쳐 설명하지 않으며 개인 자격·급여·승인 결과를 판단하지 않습니다. 공포된 시행 조문과 최신 지침을 구현 때 다시 확인하고 미공개 서류나 기준은 추정하지 않습니다. 치료 이력은 받지 않습니다.",
    createdAt: "2026-11-25 09:16",
    status: "제외",
    decision: "범용성 부족: 특정 직군에서 특정 사유로 휴직하려는 경우에만 해당합니다.",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/5"
  },
  {
    id: "rare-disease-support-checklist",
    title: "국가관리대상 희귀질환 지원 확인 순서",
    what: "질환 지정 여부 조회, 건강보험 산정특례, 희귀질환자 의료비 지원 신청을 각각 어디에서 확인할지 정리하는 안내를 제안합니다.",
    why: {
      text: "2026-11-25 KST 공식 발표 확인: 질병관리청은 2026년 국가관리대상 희귀질환 신규 지정을 발표했습니다. 신규 지정과 산정특례 등록·의료비 지원 신청이 같은 절차가 아니라는 점을 안내하면 사용자가 다음 문의처를 찾기 쉽습니다. 국내 검색량은 확인하지 않았습니다.",
      sources: [
        {
          label: "대한민국 정책브리핑의 2026년 희귀질환 신규 지정 안내",
          url: "https://www.korea.kr/news/policyNewsView.do?newsId=148976393"
        }
      ]
    },
    officialSources: [
      {
        label: "질병관리청 신규 지정 및 연계 지원 설명(정책브리핑)",
        url: "https://www.korea.kr/news/policyNewsView.do?newsId=148976393"
      },
      {
        label: "질병관리청 희귀질환 헬프라인(구현 전 연결 재확인)",
        url: "https://helpline.kdca.go.kr/"
      }
    ],
    scope: "생활정보 /info/rare-disease-support-checklist/ 1페이지와 지원금 일정 안내에서 링크 1개. 각 단계에서 확인해야 할 기관·절차·문의 경로를 구분합니다.",
    risks: "진단, 치료 조언, 개인별 자격 판정, 질환명·진료기록 입력과 신청 대행은 제외합니다. 신규 지정의 적용 시점이나 비용은 원문이 확인되지 않으면 표시하지 않으며, 조회처가 연결되는지 구현 전에 다시 검증합니다.",
    createdAt: "2026-11-25 09:16",
    status: "제외",
    decision: "범용성 부족: 국가관리대상 희귀질환 지원을 확인하는 특정 상황에 한정됩니다.",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/6"
  },
  {
    id: "move-in-checklist",
    createdAt: "2026-11-25 00:24",
    title: "전입신고·확정일자 체크리스트",
    what: "이사 전후 전입신고, 확정일자, 임대차 신고의 차이와 준비물·공식 신청 경로를 한 장에 정리합니다.",
    why: {
      text: "카카오뱅크가 2026년 9월 이사·전입신고 가이드를 발행했고, 정부24는 전입신고를 별도 생애주기 서비스로 안내합니다. 임대차 신고 대상 계산기 다음에 실제 신청 순서를 찾는 사람에게 유용합니다. 검색량은 확인하지 않았습니다.",
      sources: [
        {
          label: "카카오뱅크 전입신고 안내 (2026-09-28)",
          url: "https://blog.kakaobank.com/posts/life-moving-in-registration"
        }
      ]
    },
    officialSources: [
      {
        label: "정부24 전입신고",
        url: "https://www.gov.kr/portal/onestopSvc/transferReport"
      },
      {
        label: "찾기쉬운 생활법령정보 확정일자",
        url: "https://www.easylaw.go.kr/CSP/OnhunqueansInfoRetrieve.laf?onhunqnaAstSeq=84&onhunqueSeq=3029"
      },
      {
        label: "국토교통부 부동산거래관리시스템",
        url: "https://rtms.molit.go.kr/main/serviceInfo.do"
      }
    ],
    scope: "주거 허브에 안내 1페이지와 기존 임대차 신고 계산기에서 이어지는 링크를 추가합니다.",
    risks: "보증금 보호를 보장하거나 신청을 대신하지 않습니다. 계약·지역·담당기관별 예외를 공식 안내로 연결합니다.",
    status: "완료",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/2"
  },
  {
    id: "continued-health-insurance",
    createdAt: "2026-11-25 00:24",
    title: "퇴사 후 건강보험 임의계속가입 체크리스트",
    what: "퇴사 후 지역가입, 피부양자, 임의계속가입의 차이와 첫 고지서를 기준으로 무엇을 확인할지 안내합니다.",
    why: {
      text: "2026년 10월에도 관련 안내가 새로 발행됐고 국민건강보험공단은 별도의 제도 소개를 운영합니다. 퇴직금·실업급여를 확인한 다음 보험 선택과 신청 시점을 파악하는 데 도움이 됩니다. 검색량은 확인하지 않았습니다.",
      sources: [
        {
          label: "2026년 10월 국내 임의계속가입 안내 (수요의 간접 신호)",
          url: "https://colaydle.com/nhis-voluntary-continued-coverage/"
        }
      ]
    },
    officialSources: [
      {
        label: "국민건강보험공단 제도 안내",
        url: "https://www.nhis.or.kr/static/alim/paper/oldpaper/202212/sub/18.html"
      },
      {
        label: "국가법령정보센터 국민건강보험법 제110조",
        url: "https://www.law.go.kr/법령/국민건강보험법/제110조"
      }
    ],
    scope: "퇴직·실업 허브에 안내 1페이지와 실업급여·4대보험 계산기에서 이어지는 링크를 추가합니다.",
    risks: "개인 자격이나 보험료는 사이트가 확정하지 않습니다. 가입 요건·기한은 구현 시점의 공단·법령 원문으로 다시 대조합니다.",
    status: "거절",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/3"
  },
  {
    id: "photo-location-metadata",
    createdAt: "2026-11-25 00:24",
    title: "사진 위치정보 확인·삭제 도구",
    what: "JPEG 사진에 GPS 메타데이터가 있는지 기기에서 확인하고 위치정보가 제거된 사본을 저장하는 도구를 제안합니다.",
    why: {
      text: "Apple은 촬영 장소가 사진에 포함된 상태로 공유될 수 있다고 안내하고, Google 포토는 카메라가 넣은 위치를 앱에서 제거할 수 없다고 설명합니다. 2026년 10월에 국내용 안내도 발행됐으며, 사진을 업로드하지 않고 확인하려는 사용자에게 쓸모가 있습니다. 검색량은 확인하지 않았습니다.",
      sources: [
        {
          label: "한국어 사진 위치정보 삭제 안내 (2026-10-30)",
          url: "https://sigilock.app/ko/guides/remove-location-from-photos"
        },
        {
          label: "Google 포토 위치 정보 도움말",
          url: "https://support.google.com/photos/answer/6153599?co=GENIE.Platform%3DiOS&hl=en"
        }
      ]
    },
    officialSources: [
      {
        label: "Apple 위치 메타데이터 안내",
        url: "https://support.apple.com/ko-kr/guide/personal-safety/ips0d7a5df82/web"
      }
    ],
    scope: "이미지·PDF 하위에 JPEG용 도구 1페이지와 합성 JPEG 개인정보 테스트를 추가합니다.",
    risks: "HEIC·동영상과 화면에 찍힌 장소는 제외합니다. 원본은 수정하지 않으며 사본의 GPS 제거와 방향이 바뀌지 않는지 확인합니다.",
    status: "완료",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/1"
  }
];

const priority = { 진행중: 0, 제안: 1, 보류: 1 };

export function sortAdminProposals(entries) {
  return entries.toReversed().sort((a, b) =>
    (priority[a.status] ?? 2) - (priority[b.status] ?? 2) || b.createdAt.localeCompare(a.createdAt));
}
