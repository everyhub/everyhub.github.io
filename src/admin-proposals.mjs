export const adminProposals = [
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
    status: "제안",
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
    scope: "임신·출산·육아 분야 /info/civil-service-fertility-leave/ 1페이지. 국가·지방 적용 근거를 나누고 시행일·신청 전 확인 항목·공식 문의 경로를 안내합니다. 체크리스트는 화면에서만 표시합니다.",
    risks: "민간 근로자 제도와 합쳐 설명하지 않으며 개인 자격·급여·승인 결과를 판단하지 않습니다. 공포된 시행 조문과 최신 지침을 구현 때 다시 확인하고 미공개 서류나 기준은 추정하지 않습니다. 치료 이력은 받지 않습니다.",
    createdAt: "2026-11-25 09:16",
    status: "제안",
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
    status: "제안",
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

const priority = { 제안: 0, 승인됨: 1, 진행중: 1 };

export function sortAdminProposals(entries) {
  return entries.toReversed().sort((a, b) =>
    (priority[a.status] ?? 2) - (priority[b.status] ?? 2) || b.createdAt.localeCompare(a.createdAt));
}
