export const adminProposals = [
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
    status: "진행중",
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
    status: "진행중",
    issueUrl: "https://github.com/everyhub/everyhub.github.io/issues/1"
  }
];

const priority = { 제안: 0, 승인됨: 1, 진행중: 1 };

export function sortAdminProposals(entries) {
  return entries.toReversed().sort((a, b) =>
    (priority[a.status] ?? 2) - (priority[b.status] ?? 2) || b.createdAt.localeCompare(a.createdAt));
}
