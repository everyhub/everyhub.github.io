const original = [
  { path: 'tools/background-removal/', name: '이미지 배경 제거 (누끼)', description: '인물과 사물 사진의 배경을 기기에서 지우고 머리카락과 가장자리를 직접 수정합니다.' },
  { path: 'tools/image-resize/', name: '이미지 크기·용량 줄이기', description: '사진을 줄이거나 HEIC를 JPG로 변환합니다. PNG와 WebP로도 저장할 수 있습니다.' },
  { path: 'tools/character-count/', name: '글자 수·바이트 세기', description: '공백 포함·제외 글자 수를 세고 자소서, Bluesky·X 게시글의 분량을 확인합니다.' },
  { path: 'tools/age/', name: '만 나이 계산기', description: '생년월일과 기준일로 민법상 만 나이를 계산합니다.' },
  { path: 'tools/date-difference/', name: '디데이·날짜 차이 계산기', description: '오늘이나 지정한 날짜를 기준으로 남은 날과 지난 날을 계산합니다.' },
  { path: 'tools/area-converter/', name: '평·제곱미터 환산기', description: '부동산 면적을 비교할 때 평과 제곱미터(㎡)를 양방향으로 환산합니다.' },
];

export const utilityGroups = [
  { path: 'tools/writing/', name: '글쓰기', description: '글자 수, 원고 정리와 텍스트 비교' },
  { path: 'tools/image-pdf/', name: '이미지·PDF', description: '사진 편집, PDF 변환과 페이지 편집' },
  { path: 'tools/date-time/', name: '날짜·시간', description: '만 나이, 날짜 차이, 근무일과 세계 시간' },
  { path: 'tools/everyday/', name: '생활 계산', description: '예금·적금·대출 이자, 단위 환산, 할인율, 더치페이와 추첨' },
  { path: 'tools/developer/', name: '개발 도구', description: 'JSON, 인코딩, QR 코드, 비밀번호와 색상' },
];

const additions = [
  ['text-cleanup', '글쓰기', '텍스트 정리·중복 줄 제거', '공백과 빈 줄을 정리하거나 중복 줄을 없애고 영문 대소문자를 변환합니다.'],
  ['text-compare', '글쓰기', '텍스트 비교', '두 텍스트의 다른 줄을 줄 번호 기준으로 확인합니다.'],
  ['pdf-merge', '이미지·PDF', 'PDF 합치기', '선택한 PDF 파일을 목록 순서대로 한 파일에 합칩니다.'],
  ['pdf-split', '이미지·PDF', 'PDF 나누기·페이지 추출', '원하는 PDF 페이지나 범위를 골라 새 파일로 저장합니다.'],
  ['images-to-pdf', '이미지·PDF', '이미지 PDF 변환', '여러 JPG·PNG 이미지를 한 장씩 PDF 페이지로 변환합니다.'],
  ['photo-location', '이미지·PDF', '사진 위치정보 확인·삭제', 'JPG 사진의 EXIF GPS 좌표를 확인하고 원본 메타데이터가 제외된 사본을 저장합니다.'],
  ['passport-photo', '이미지·PDF', '증명·여권 사진 크기 자르기', '사진을 여권용 413 × 531픽셀 또는 제출처가 요구하는 증명사진 크기로 자릅니다.'],
  ['workdays', '날짜·시간', '근무일수·영업일 계산기', '2026·2027년 한국의 공휴일과 주말을 빼고 근무일수를 셉니다.'],
  ['world-time', '날짜·시간', '세계 시간·시차 변환기', '서울에서 입력한 날짜와 시각을 주요 해외 도시의 현지 시각으로 바꿉니다.'],
  ['lunar-calendar', '날짜·시간', '음력·양력 변환기', '한국천문연구원 달력자료로 2026~2028년 음력 날짜를 양력과 서로 바꿉니다.'],
  ['deposit-interest', '생활 계산', '예금·적금 이자 계산기', '정기예금과 정기적금의 세전·세후 이자와 만기 수령액을 단리·월복리 및 과세 기준별로 계산합니다.'],
  ['loan-interest', '생활 계산', '대출 이자 계산기', '대출 원금·기간·금리와 거치 기간을 입력해 원리금균등·원금균등·만기일시상환의 월 상환액과 총이자를 계산합니다.'],
  ['bmi', '생활 계산', 'BMI 체질량지수 계산기', '키와 체중으로 한국 성인의 BMI와 대한비만학회 기준 구간을 확인합니다.'],
  ['unit-converter', '생활 계산', '길이·무게·온도 단위 변환기', '센티미터·인치, 킬로그램·파운드, 섭씨·화씨를 환산합니다.'],
  ['percentage', '생활 계산', '퍼센트·할인율 계산기', '할인가, 가격 변동률, 전체 대비 비율을 계산합니다.'],
  ['split-bill', '생활 계산', '더치페이·N분의 1 계산기', '총액을 사람 수로 나누고 나머지 1원까지 맞춥니다.'],
  ['random-picker', '생활 계산', '랜덤 추첨기', '후보 이름을 한 줄에 하나씩 적고 중복 없이 무작위로 뽑습니다.'],
  ['json-formatter', '개발 도구', 'JSON 정리·압축', 'JSON 파일 형식 오류를 확인하고 들여쓰기를 넣거나 공백을 줄입니다.'],
  ['csv-json-converter', '개발 도구', 'CSV·JSON 변환기', '표 데이터를 CSV와 JSON 객체 배열 사이에서 바꾸고, 결과를 복사하거나 파일로 저장하세요.'],
  ['text-encoding', '개발 도구', 'Base64·URL 인코딩 변환기', '한글이 포함된 문자열을 UTF-8 Base64 또는 URL 구성요소로 변환하거나 복원합니다.'],
  ['qr-generator', '개발 도구', 'QR 코드 만들기', '텍스트나 링크를 스캔할 수 있는 QR 코드 PNG로 만듭니다.'],
  ['password-generator', '개발 도구', '무작위 비밀번호 생성기', '영문과 숫자·기호로 구성한 비밀번호를 기기에서 생성합니다.'],
  ['color-converter', '개발 도구', '색상 코드 변환기', 'HEX와 RGB 색상 코드를 서로 변환하고 색상을 미리 봅니다.'],
];

const originalGroups = [1, 1, 0, 2, 2, 3];
export const utilitySections = [
  ...original.map((item, i) => ({ ...item, group: utilityGroups[originalGroups[i]].name })),
  ...additions.map(([id, group, name, description]) => ({ path: `tools/${id}/`, group, name, description })),
];
