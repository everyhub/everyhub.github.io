const storage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const inputKey = (field) => field.name || field.id;
const eligible = (field) => inputKey(field) && !['file', 'password'].includes(field.type);
const formStorageKey = (form) => `everyhub:inputs:${location.pathname}:${form.id || form.dataset.tool || form.dataset.utility || 'form'}`;
const moneyLabel = /원|연봉|월급|월세|보증금|대출|소득|재산|총액|금액|급여|임대료|전세|자산|매매가|분양/;
const numericValue = (value) => value.replaceAll(',', '').trim();
const moneyDisplay = (value) => {
  const raw = numericValue(value);
  if (!raw || !Number.isFinite(Number(raw))) return value;
  return Number(raw).toLocaleString('en-US', { maximumFractionDigits: 20 });
};

function formatMoneyInputs() {
  document.querySelectorAll('main label input[type="number"]').forEach((field) => {
    const label = field.closest('label');
    if (!label || !moneyLabel.test(label.textContent)) return;
    field.type = 'text';
    field.inputMode = 'decimal';
    field.dataset.moneyInput = 'true';
    field.value = moneyDisplay(field.value);
    field.addEventListener('focus', () => { field.value = numericValue(field.value); });
    field.addEventListener('blur', () => { field.value = moneyDisplay(field.value); });
    field.form?.addEventListener('submit', () => {
      field.value = numericValue(field.value);
      window.setTimeout(() => { field.value = moneyDisplay(field.value); });
    }, true);
  });
}

function rememberForm(form) {
  const fields = [...form.elements].filter(eligible);
  if (!fields.length) return;
  const key = formStorageKey(form);
  if (!location.search) {
    const saved = storage(key, {});
    fields.forEach((field) => {
      if (!(inputKey(field) in saved)) return;
      if (field.type === 'checkbox' || field.type === 'radio') field.checked = saved[inputKey(field)];
      else field.value = saved[inputKey(field)];
    });
  }
  const persist = () => {
    const values = {};
    fields.forEach((field) => { values[inputKey(field)] = field.type === 'checkbox' || field.type === 'radio' ? field.checked : field.value; });
    save(key, values);
  };
  fields.forEach((field) => ['input', 'change'].forEach((event) => field.addEventListener(event, persist)));
  if (!form.querySelector('.convenience-reset')) {
    const reset = document.createElement('button');
    reset.type = 'reset'; reset.className = 'convenience-reset'; reset.textContent = '입력 초기화';
    form.append(reset);
    reset.addEventListener('click', () => { try { localStorage.removeItem(key); } catch {} });
  }
  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      if (!form.querySelector('input[type=file]') && form.querySelector('button[type=submit]')) form.requestSubmit();
    });
  });
}

function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const textarea = document.createElement('textarea');
  textarea.value = value; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
  document.body.append(textarea); textarea.select(); document.execCommand('copy'); textarea.remove();
  return Promise.resolve();
}

function addCopyButton() {
  const result = document.querySelector('.tool-result, .net, .utility-result');
  if (!result || result.querySelector('.convenience-copy')) return;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'convenience-copy'; button.textContent = '결과 복사';
  button.addEventListener('click', async () => {
    const text = result.innerText.trim();
    if (!text) return;
    try { await copyText(text); button.textContent = '복사 완료'; } catch { button.textContent = '복사할 수 없음'; }
    window.setTimeout(() => { button.textContent = '결과 복사'; }, 1800);
  });
  (result.matches('.utility-result') ? result.parentElement : result).append(button);
}

function addBackToTop() {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'back-to-top'; button.textContent = '맨 위로'; button.hidden = true;
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.append(button);
  window.addEventListener('scroll', () => { button.hidden = scrollY < 500; }, { passive: true });
}

function recentTools() {
  const key = 'everyhub:recent-tools';
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="/tools/"]');
    if (!link || link.href.endsWith('/tools/') || link.closest('[data-recent-tools]')) return;
    const recent = storage(key, []).filter((item) => item.href !== link.href);
    recent.unshift({ href: link.href, name: link.textContent.trim() });
    save(key, recent.slice(0, 6));
  });
  const panel = document.querySelector('[data-recent-tools]');
  if (!panel) return;
  const recent = storage(key, []);
  if (!recent.length) return;
  panel.hidden = false;
  panel.querySelector('ul').innerHTML = recent.map((item) => `<li><a href="${item.href}">${item.name}</a></li>`).join('');
}

function dashboardSearch() {
  const search = document.querySelector('[data-dashboard-search]');
  if (!search) return;
  const cards = [...document.querySelectorAll('[data-dashboard-card]')];
  const empty = document.querySelector('[data-dashboard-empty]');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let shown = 0;
    cards.forEach((card) => {
      const match = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !match; if (match) shown += 1;
    });
    if (empty) empty.hidden = shown > 0;
  });
}

formatMoneyInputs();
document.querySelectorAll('main form').forEach(rememberForm);
addCopyButton();
addBackToTop();
recentTools();
dashboardSearch();
