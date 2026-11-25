import { csvToJson, delimiters, jsonToCsv, maxTableBytes } from './csv-json.mjs';

const form = document.querySelector('[data-utility="csv-json-converter"]');
const { direction, delimiter, file, text, protect } = form.elements;
const result = form.querySelector('output');
const status = form.querySelector('[role="status"]');
const download = form.querySelector('.utility-download');
let blobURL;
let loadedSource;
let revision = 0;

function clearResult() {
  if (blobURL) URL.revokeObjectURL(blobURL);
  blobURL = undefined;
  download.removeAttribute('href');
  download.hidden = true;
  result.value = '';
  status.textContent = '';
}

function updateDirection() {
  protect.disabled = direction.value !== 'json-to-csv';
  clearResult();
}

function setText(value) {
  text.value = value;
  loadedSource = value;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  ++revision;
  clearResult();
  try {
    const source = loadedSource ?? text.value;
    const toJSON = direction.value === 'csv-to-json';
    const converted = toJSON ? csvToJson(source, delimiter.value) : jsonToCsv(source, delimiter.value, protect.checked);
    const tab = delimiter.value === 'tab';
    const type = toJSON ? 'application/json' : tab ? 'text/tab-separated-values' : 'text/csv';
    blobURL = URL.createObjectURL(new Blob([converted], { type: type + ';charset=utf-8' }));
    download.href = blobURL;
    download.download = 'converted.' + (toJSON ? 'json' : tab ? 'tsv' : 'csv');
    result.value = converted;
    download.hidden = false;
    status.textContent = '변환했습니다.';
  } catch (error) {
    status.textContent = error.message;
  }
});

file.addEventListener('change', async () => {
  const current = ++revision;
  clearResult();
  setText('');
  const selected = file.files[0];
  if (!selected) return;
  if (selected.size > maxTableBytes) {
    status.textContent = '2MB 이하의 UTF-8 파일을 선택해 주세요.';
    return;
  }
  try {
    const contents = new TextDecoder('utf-8', { fatal: true }).decode(await selected.arrayBuffer());
    if (current !== revision) return;
    setText(contents);
    status.textContent = '파일을 읽었습니다. 방향과 구분자를 확인한 뒤 변환하세요.';
  } catch {
    if (current === revision) status.textContent = 'UTF-8 파일을 읽을 수 없습니다. 인코딩을 확인해 주세요.';
  }
});

form.querySelector('[data-table-paste]').addEventListener('click', async () => {
  const current = ++revision;
  try {
    const contents = await navigator.clipboard.readText();
    if (current !== revision) return;
    if (new TextEncoder().encode(contents).length > maxTableBytes) {
      status.textContent = '2MB 이하의 UTF-8 데이터를 입력해 주세요.';
      return;
    }
    clearResult();
    file.value = '';
    setText(contents);
    text.focus();
  } catch {
    if (current !== revision) return;
    status.textContent = '클립보드를 읽을 수 없습니다. 입력란에 직접 붙여 넣어 주세요.';
    text.focus();
  }
});

form.querySelector('[data-table-example]').addEventListener('click', () => {
  ++revision;
  clearResult();
  file.value = '';
  const sep = delimiters[delimiter.value];
  setText(direction.value === 'csv-to-json'
    ? `이름${sep}메모\n하나${sep}"쉼표,${sep}따옴표 ""예시"""\n`
    : '[\n  {"이름": "하나", "메모": "쉼표, 다음 줄\\n예시"}\n]');
});

text.addEventListener('input', () => {
  ++revision;
  loadedSource = undefined;
  file.value = '';
  clearResult();
});
direction.addEventListener('change', updateDirection);
delimiter.addEventListener('change', clearResult);
protect.addEventListener('change', clearResult);
form.addEventListener('reset', () => {
  ++revision;
  loadedSource = undefined;
  clearResult();
  queueMicrotask(updateDirection);
});
updateDirection();
