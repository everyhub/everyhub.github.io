export const maxTableBytes = 2_000_000;
export const delimiters = Object.freeze({ comma: ',', tab: '\t', semicolon: ';' });
const maxRecords = 20_000;
const maxColumns = 200;
const maxOutputBytes = 8_000_000;
const utf8 = new TextEncoder();

function separator(choice) {
  if (!Object.hasOwn(delimiters, choice)) throw new Error('지원하는 구분자를 선택해 주세요.');
  return delimiters[choice];
}

function inputText(text) {
  if (utf8.encode(text).length > maxTableBytes) throw new Error('2MB 이하의 UTF-8 데이터를 입력해 주세요.');
  const input = text.replace(/^\uFEFF/, '');
  if (!input.trim()) throw new Error('변환할 데이터를 입력하거나 파일을 선택해 주세요.');
  return input;
}

function csvRows(text, delimiter) {
  const rows = [];
  let row = [], value = '', state = 'start';
  const field = () => {
    if (row.length >= maxColumns) throw new Error(`열은 ${maxColumns}개까지 지원합니다.`);
    row.push(value); value = ''; state = 'start';
  };
  const record = () => {
    if (rows.length >= maxRecords + 1) throw new Error(`데이터는 ${maxRecords.toLocaleString('ko-KR')}행까지 지원합니다.`);
    field(); rows.push(row); row = [];
  };
  const invalidQuote = () => { throw new Error(`${rows.length + 1}번째 레코드의 큰따옴표를 확인해 주세요.`); };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (state === 'quoted') {
      if (char !== '"') value += char;
      else if (text[i + 1] === '"') { value += '"'; i++; }
      else state = 'closed';
    } else if (char === delimiter) {
      field();
    } else if (char === '\r' || char === '\n') {
      record();
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else if (state === 'closed') {
      invalidQuote();
    } else if (char === '"') {
      if (state !== 'start') invalidQuote();
      state = 'quoted';
    } else {
      state = 'plain';
      value += char;
    }
  }
  if (state === 'quoted') invalidQuote();
  if (state !== 'start' || row.length) record();
  return rows;
}

function checkHeaders(headers) {
  if (!headers.length || headers.some(header => !header.trim())) throw new Error('빈 열 이름을 사용할 수 없습니다.');
  if (new Set(headers).size !== headers.length) throw new Error('열 이름이 중복됩니다. 첫 행에 서로 다른 이름을 입력해 주세요.');
}

export function csvToJson(text, choice) {
  const [headers, ...rows] = csvRows(inputText(text), separator(choice));
  checkHeaders(headers);
  if (!rows.length) return '[]';
  let size = 4;
  const objects = rows.map((row, i) => {
    if (row.length !== headers.length) throw new Error(`${i + 2}번째 레코드의 열 개수가 첫 행과 다릅니다. 구분자를 확인해 주세요.`);
    const json = '  ' + JSON.stringify(Object.fromEntries(headers.map((header, j) => [header, row[j]])), null, 2).replaceAll('\n', '\n  ');
    size += utf8.encode(json).length + 2;
    if (size > maxOutputBytes) throw new Error('결과가 8MB를 초과합니다. 데이터를 나누어 변환해 주세요.');
    return json;
  });
  return '[\n' + objects.join(',\n') + '\n]';
}

export function jsonToCsv(text, choice, protect = true) {
  const delimiter = separator(choice);
  const input = inputText(text);
  let rows;
  try { rows = JSON.parse(input); } catch { throw new Error('올바른 JSON을 입력하세요. 큰따옴표, 쉼표와 괄호를 확인해 주세요.'); }
  if (!Array.isArray(rows) || !rows.length || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('객체가 하나 이상 들어 있는 JSON 배열을 입력하세요.');
  }
  const headers = Object.keys(rows[0]);
  checkHeaders(headers);
  if (rows.length > maxRecords) throw new Error(`데이터는 ${maxRecords.toLocaleString('ko-KR')}행까지 지원합니다.`);
  if (headers.length > maxColumns) throw new Error(`열은 ${maxColumns}개까지 지원합니다.`);
  const field = (value) => {
    if (value !== null && typeof value === 'object') throw new Error('중첩 객체나 배열은 변환할 수 없습니다.');
    if (typeof value === 'number' && (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))) {
      throw new Error('안전하게 표현할 수 없는 숫자입니다. 큰 정수는 큰따옴표로 감싸 문자열로 입력하세요.');
    }
    const data = protect && typeof value === 'string' && /^[\t\r\n]|^\s*[=+\-@＝＋－＠]/u.test(value) ? "'" + value : String(value ?? '');
    return data.includes(delimiter) || /["\r\n]/.test(data) ? '"' + data.replaceAll('"', '""') + '"' : data;
  };
  return [headers.map(field), ...rows.map((row, i) => {
    if (Object.keys(row).length !== headers.length || !headers.every(header => Object.hasOwn(row, header))) {
      throw new Error(`${i + 1}번째 객체의 키가 첫 객체와 다릅니다.`);
    }
    return headers.map(header => field(row[header]));
  })].map(row => row.join(delimiter)).join('\r\n') + '\r\n';
}
