import { informationSources as calendar } from './information.mjs';
import { dateRange } from './utility.mjs';
import { worldTimeRange } from './utility-extra.mjs';
import { lunarSolarRange, lunarSources } from './lunar-calendar.mjs';

const source = (name, url) => ({ name, url });
const area = (name, label, attributes = '') => `<label>${label}<textarea name="${name}" rows="5" ${attributes}></textarea></label>`;
const input = (name, label, attributes) => `<label>${label}<input name="${name}" ${attributes}></label>`;
const select = (name, label, options) => `<label>${label}<select name="${name}">${options.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;
const grid = (...parts) => `<div class="form-grid">${parts.join('')}</div>`;
const check = (name, label) => input(name, label, 'type="checkbox"');
const button = (name) => `<button type="submit">${name}</button>`;
const download = '<a class="button utility-download" hidden>결과 파일 저장</a>';
const form = (html, question, answer, sources) => ({ html, faq: [[question, answer]], sources });
const text = () => area('text', '입력 텍스트', 'maxlength="100000"');
export const dateInput = (name, label, [min, max] = dateRange, value = '') =>
  input(name, label, `type="date" min="${min}" max="${max}" value="${value}" required`);
const num = (name, label, value, min = '0', step = 'any', max = '1000000000000') =>
  input(name, label, `type="number" value="${value}" min="${min}" max="${max}" step="${step}" required`);
const pdf = (multiple = '') => input('file', 'PDF 파일', `type="file" accept="application/pdf,.pdf" required ${multiple}`);
const pdfCaveat = '<p class="note">암호화된 파일은 지원하지 않습니다. 새 PDF에는 원본의 책갈피, 전자서명, 일부 양식이 보존되지 않을 수 있습니다.</p>';

export const extraUtilityForms = {
  'text-cleanup': form(
    text() + grid(check('spaces', '앞뒤·연속 공백 정리'), check('blank', '빈 줄 제거'), check('unique', '중복 줄 제거'),
      select('casing', '대소문자', [['none', '유지'], ['upper', '대문자'], ['lower', '소문자']])) + button('텍스트 정리'),
    '중복 줄은 어떤 순서로 남나요?', '공백과 대소문자를 선택한 방식대로 정리한 뒤, 같은 줄이 여러 개면 처음 나온 줄만 남깁니다.'),
  'text-compare': form(
    grid(area('first', '원본', 'maxlength="50000"'), area('second', '비교할 내용', 'maxlength="50000"')) + button('줄 비교'),
    '중간에 줄을 삽입하면 어떻게 표시하나요?', '같은 줄 번호에 있는 내용끼리 비교합니다. 중간에 줄을 넣으면 뒤의 줄 번호가 모두 달라질 수 있습니다. 다른 줄 중 처음 100개를 표시합니다.'),
  'pdf-merge': form(
    pdf('multiple') + '<p class="note">선택된 파일 순서입니다. 순서를 바꾸려면 파일을 다시 선택하세요.</p><ol class="utility-file-list"></ol>' + pdfCaveat + button('PDF 합치기') + download,
    '합치기 순서는 어떻게 정하나요?', '파일을 고르면 화면에 표시되는 목록 위에서부터 페이지를 가져옵니다. PDF를 두 개 이상 선택하세요.'),
  'pdf-split': form(
    pdf() + input('pages', '페이지 또는 범위 (예: 1, 3–5)', 'placeholder="1, 3-5" required maxlength="1000"') + pdfCaveat + button('선택한 페이지 추출') + download,
    'PDF를 페이지별로 한 번에 나누나요?', '아닙니다. 선택한 페이지를 입력 순서대로 모아 새 PDF 하나에 저장합니다. 페이지 번호는 1부터 셉니다.'),
  'images-to-pdf': form(
    input('file', 'JPG 또는 PNG 파일', 'type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple required') +
      '<p class="note">선택된 파일 순서대로 이미지 한 장을 A4 한 쪽에 넣습니다.</p><ol class="utility-file-list"></ol>' + button('PDF 만들기') + download,
    '사진 비율이 달라지나요?', '아닙니다. 사진의 가로세로 비율을 유지하고 페이지 가운데에 놓습니다.'),
  'passport-photo': form(
    input('file', '사진 파일', 'type="file" accept="image/jpeg,image/png,image/webp" required') +
      select('format', '사진 용도', [['passport', '여권 · 413 × 531px'], ['custom', '증명사진 · 요구 크기 직접 입력']]) +
      `<fieldset data-custom-photo hidden disabled>${grid(num('width', '가로 (px)', 300, 1, 1, 2000),
        num('height', '세로 (px)', 400, 1, 1, 2000))}</fieldset>` +
      '<p class="note">되도록 앞을 바라보는 흰 배경 사진을 사용하세요. 머리 길이, 배경, 촬영일 등은 자동 판정하지 않습니다.</p>' +
      grid(input('x', '좌우 위치', 'type="range" min="0" max="100" value="50"'), input('y', '상하 위치', 'type="range" min="0" max="100" value="50"'),
        input('zoom', '확대 배율', 'type="range" min="1" max="4" step="0.01" value="1"')) +
      '<canvas class="utility-preview passport-preview" width="413" height="531" role="img" aria-label="사진 자르기 미리보기" hidden></canvas>' +
      button('JPG 만들기') + download,
    '자른 사진이 여권 심사를 통과하나요?', '외교부 권장 온라인 픽셀 크기로만 자릅니다. 인화 크기는 3.5cm × 4.5cm, 머리 길이는 3.2~3.6cm입니다. 표정, 배경, 촬영일 등은 제출 전 외교부 안내와 직접 비교하세요.',
    [source('외교부 여권안내 · 여권사진 규격', 'https://www.passport.go.kr/home/kor/contents.do?menuPos=32'),
      source('외교부 여권안내 · 온라인 사진 파일 기준', 'https://www.passport.go.kr/home/kor/onlinePhotoVerify/index.do?menuPos=33')]),
  workdays: form(
    grid(...[['start', '시작일'], ['end', '종료일']].map(([key, name]) =>
      dateInput(key, name, ['2026-01-01', '2027-12-31'], key === 'start' ? '2026-01-01' : '2026-01-31'))) + button('근무일수 계산'),
    '어떤 날을 빼나요?', '시작일과 종료일을 포함하며 토·일요일과 한국 공휴일 달력의 평일 휴일을 뺍니다. 토·일요일과 공휴일이 겹치면 한 번만 뺍니다. 사업장별 휴일과 근무 일정은 다를 수 있습니다.',
    [calendar.calendar2026, calendar.calendar2027, calendar.holidayLaw]),
  'world-time': form(
    grid(dateInput('reference', '서울 날짜', worldTimeRange), input('time', '서울 시각', 'type="time" value="12:00" required')) + button('현지 시각 보기'),
    '서머타임을 반영하나요?', '브라우저가 제공하는 IANA 시간대 데이터의 날짜별 시차와 서머타임을 반영합니다. 출발 시각인 서울은 UTC+9를 적용하는 1989년 이후 날짜를 지원합니다.',
    [source('IANA · Time Zone Database', 'https://www.iana.org/time-zones')]),
  'lunar-calendar': form(
    select('mode', '변환 방향', [['solar', '양력 → 음력'], ['lunar', '음력 → 양력']]) +
      `<fieldset data-calendar="solar">${dateInput('solar', '양력 날짜', lunarSolarRange, lunarSolarRange[0])}</fieldset>` +
      `<fieldset data-calendar="lunar" hidden disabled>${grid(num('year', '음력 연도', 2028, 2026, 1, 2028),
        num('month', '월', 5, 1, 1, 12), num('day', '일', 1, 1, 1, 30), check('leap', '윤달'))}</fieldset>` +
      button('변환'),
    '지원 범위는 어디까지인가요?', '음력 2026~2028년(양력 2026-02-17~2029-02-12)입니다. 한국천문연구원의 월초 자료를 사용하고 날짜를 외부로 보내지 않습니다.',
    [...lunarSources, source('한국천문연구원 · 음양력 변환', 'https://astro.kasi.re.kr/kor/life/pageView/8')]),
  bmi: form(
    grid(num('height', '키 (cm)', 170, 50, 'any', 300), num('weight', '체중 (kg)', 65, 1, 'any', 600)) + button('BMI 계산'),
    'BMI만으로 건강 상태를 판단할 수 있나요?', '아닙니다. 한국 성인의 참고 구간이며 어린이·청소년과 임신 중에는 적용하지 않습니다. 근육량과 체지방 분포를 반영하지 않아 진단에 사용할 수 없습니다.',
    [source('대한비만학회 · 비만 진료지침 (한국 성인 분류)', 'https://www.kosso.or.kr/inc/download_obesity.php?fno=1&num=10')]),
  'unit-converter': form(grid(num('value', '환산할 값', 100, -1e12), select('pair', '환산 방향',
    [['cm-in', '센티미터 → 인치'], ['in-cm', '인치 → 센티미터'], ['kg-lb', '킬로그램 → 파운드'], ['lb-kg', '파운드 → 킬로그램'], ['c-f', '섭씨 → 화씨'], ['f-c', '화씨 → 섭씨']])) + button('환산'),
    '어떤 환산값을 사용하나요?', '1인치는 2.54cm, 1파운드는 0.45359237kg입니다. 섭씨에 9/5를 곱하고 32를 더하면 화씨가 됩니다.',
    [source('미국 국립표준기술연구소 · SI 환산 계수', 'https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors')]),
  percentage: form(
    grid(select('mode', '계산 유형', [['discount', '할인가 (원래 가격, 할인율 %)'], ['change', '증감률 (이전 값, 이후 값)'], ['part', '전체 대비 비율 (전체, 일부)']]),
      num('first', '기준값', 50000), num('second', '비교값 또는 할인율', 20)) + button('퍼센트 계산'),
    '증감률은 어떻게 계산하나요?', '이후 값에서 이전 값을 뺀 뒤 이전 값으로 나누고 100을 곱합니다. 기준값이 0이면 증감률을 계산할 수 없습니다.'),
  'split-bill': form(grid(num('total', '총액 (원)', 100000, 0, 1), num('people', '인원 (명)', 3, 1, 1, 10000)) + button('분담액 계산'),
    '총액이 인원으로 나누어떨어지지 않으면요?', '나머지 금액만큼의 인원에게 1원씩 더 배분해 분담액 합계를 맞춥니다.'),
  'random-picker': form(area('text', '후보 (한 줄에 하나)', 'maxlength="50000" required') +
    num('count', '당첨 인원 (명)', 1, 1, 1, 1000) + button('추첨'),
    '같은 이름이 여러 번 들어가면 어떻게 되나요?', '앞뒤 공백을 지운 뒤 같은 이름은 한 명으로 처리합니다. 당첨자는 중복 없이 뽑습니다.'),
  'ladder-draw': form(
    grid(area('people', '참가자 (한 줄에 하나)', 'maxlength="240" required'), area('choices', '결과 (한 줄에 하나)', 'maxlength="240" required')) + button('사다리 만들기') +
      '<svg class="utility-preview ladder-preview" role="img" aria-label="사다리 연결도" hidden></svg>',
    '인원과 결과는 몇 개 넣나요?', '두 목록 모두 2~8개로 개수를 맞추고 참가자 이름은 서로 다르게 쓰세요. 같은 결과는 여러 줄에 입력해도 됩니다.'),
  'json-formatter': form(text() + select('mode', '출력 형식', [['pretty', '2칸 들여쓰기'], ['compact', '공백 줄이기']]) + button('JSON 정리'),
    '입력한 값이 그대로 유지되나요?', '브라우저의 JSON 파서를 사용합니다. 매우 큰 정수는 정밀도를 잃을 수 있고 중복 키는 마지막 값만 남으므로 이런 데이터에는 사용하지 마세요.'),
  'text-encoding': form(text() + select('mode', '인코딩 방식', [['base64-encode', 'UTF-8 → Base64'], ['base64-decode', 'Base64 → UTF-8'],
    ['url-encode', 'URL 구성요소 인코딩'], ['url-decode', 'URL 구성요소 디코딩']]) + button('변환'),
    'Base64가 암호화인가요?', '아닙니다. 누구나 복원할 수 있는 인코딩입니다. URL 변환은 URL 전체가 아닌 쿼리 값 같은 구성요소에 사용하세요.'),
  'qr-generator': form(area('text', 'QR 코드에 넣을 주소나 텍스트', 'maxlength="720" required') +
    '<canvas class="utility-preview" role="img" aria-label="생성된 QR 코드" hidden></canvas>' + button('QR 코드 만들기') + download,
    '입력한 URL에 접속하나요?', '아닙니다. 입력 문자열을 QR 코드에 담을 뿐이며 주소를 검사하거나 외부에 전송하지 않습니다.'),
  'password-generator': form(grid(num('length', '길이', 20, 8, 1, 128), input('symbols', '기호를 후보 문자에 포함', 'type="checkbox" checked')) + button('비밀번호 생성'),
    '비밀번호를 어디에 보관하나요?', '서버에 보내거나 기록하지 않습니다. 브라우저의 암호학적 난수로 생성하며, 서비스마다 다른 비밀번호를 사용해 비밀번호 관리자에 저장하세요.'),
  'color-converter': form(input('text', 'HEX 또는 RGB', 'value="#07674F" maxlength="50" required') +
    '<canvas class="utility-preview" width="100" height="50" role="img" aria-label="변환한 색상" hidden></canvas>' + button('색상 변환'),
    '투명도도 변환하나요?', '아닙니다. 3자리·6자리 HEX와 0~255의 RGB 값을 변환합니다.'),
};
