const storage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const inputKey = (field) => field.name || field.id;
const preferences = {
  'character-count': ['preset'],
  'unit-converter': ['pair'],
  'area-converter': ['unit'],
  'password-generator': ['length', 'symbols'],
};
const formStorageKey = (form) => `everyhub:preferences:${location.pathname}:${form.dataset.utility}`;
const moneyLabel = /\((?:만 ?원|원(?:\/(?:시간|일|월))?)[,)]/;
const moneyFormat = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 20 });

function formatMoneyInputs() {
  document.querySelectorAll('main label input[type="number"]').forEach((field) => {
    const label = field.closest('label');
    if (!label || !moneyLabel.test(label.textContent)) return;
    const display = document.createElement('span');
    display.className = 'money-display';
    display.setAttribute('aria-hidden', 'true');
    field.after(display);
    const update = () => {
      const value = field.valueAsNumber;
      display.textContent = Math.abs(value) >= 1000 ? moneyFormat.format(value) : '';
    };
    update();
    field.addEventListener('input', update);
    field.form.addEventListener('reset', () => setTimeout(update));
  });
}

function rememberForm(form) {
  const fields = [...form.elements].filter((field) => preferences[form.dataset.utility]?.includes(inputKey(field)));
  const key = formStorageKey(form);
  if (!location.search) {
    const saved = storage(key, {}) ?? {};
    fields.forEach((field) => {
      if (!Object.hasOwn(saved, inputKey(field))) return;
      if (field.type === 'checkbox' || field.type === 'radio') field.checked = saved[inputKey(field)];
      else field.value = saved[inputKey(field)];
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  const persist = () => {
    const values = {};
    fields.forEach((field) => { values[inputKey(field)] = field.type === 'checkbox' || field.type === 'radio' ? field.checked : field.value; });
    save(key, values);
  };
  fields.forEach((field) => field.addEventListener('change', persist));
  const reset = document.createElement('button');
  reset.type = 'reset'; reset.className = 'convenience-reset'; reset.textContent = '입력 초기화';
  (form.querySelector('button[type="submit"]') ?? form.lastElementChild).after(reset);
  form.addEventListener('reset', () => {
    try { localStorage.removeItem(key); } catch {}
    window.setTimeout(() => {
      if (!form.dataset.utility) form.requestSubmit();
    });
  });
}

function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const textarea = document.createElement('textarea');
  textarea.value = value; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
  document.body.append(textarea); textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  return copied ? Promise.resolve() : Promise.reject();
}

function addCopyButton() {
  const result = document.querySelector('#tool-form ~ .tool-result, #salary-form ~ .net, .utility-result');
  if (!result) return;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'convenience-copy'; button.textContent = '결과 복사';
  button.addEventListener('click', async () => {
    const text = (result.value ?? result.innerText).trim();
    if (!text) return;
    try { await copyText(text); button.textContent = '복사 완료'; } catch { button.textContent = '복사할 수 없음'; }
    window.setTimeout(() => { button.textContent = '결과 복사'; }, 1800);
  });
  result.after(button);
}

function addBackToTop() {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'back-to-top'; button.textContent = '맨 위로'; button.hidden = true;
  button.addEventListener('click', () => {
    document.querySelector('.site-head .brand').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  document.body.append(button);
  const update = () => { button.hidden = scrollY < 500; };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function recentTools() {
  const key = 'everyhub:recent-tools:v2';
  const stored = storage(key, []);
  const recent = Array.isArray(stored) ? stored.filter((item) =>
    typeof item?.name === 'string' && /^\/(?:[\w-]+\/)*tools\/[\w-]+\/$/.test(item.path)) : [];
  if (document.body.hasAttribute('data-recent-tool')) {
    const path = location.pathname;
    const name = document.querySelector('main h1').textContent;
    if (recent[0]?.path === path) return;
    const previous = recent.findIndex((item) => item.path === path);
    if (previous >= 0) recent.splice(previous, 1);
    recent.unshift({ path, name });
    save(key, recent.slice(0, 6));
  }
  const panel = document.querySelector('[data-recent-tools]');
  if (!panel) return;
  if (!recent.length) return;
  panel.hidden = false;
  panel.querySelector('ul').replaceChildren(...recent.map(({ path, name }) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = path;
    link.textContent = name;
    item.append(link);
    return item;
  }));
}

function dashboardSearch() {
  const search = document.querySelector('[data-dashboard-search]');
  if (!search) return;
  search.closest('label').hidden = false;
  const cards = [...document.querySelectorAll('[data-dashboard-card]')];
  const empty = document.querySelector('[data-dashboard-empty]');
  const results = document.querySelector('[data-dashboard-results]');
  const links = [...results.querySelectorAll('li')];
  search.addEventListener('input', () => {
    const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    for (const card of cards) card.hidden = terms.length > 0;
    let matched = 0;
    for (const item of links) {
      item.hidden = !terms.every((term) => item.textContent.toLocaleLowerCase().includes(term));
      if (!item.hidden) matched++;
    }
    empty.hidden = !terms.length || matched > 0;
    results.hidden = !terms.length || !matched;
  });
}

try {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith('everyhub:inputs:')) localStorage.removeItem(key);
  }
} catch {}
formatMoneyInputs();
document.querySelectorAll('main form').forEach(rememberForm);
addCopyButton();
addBackToTop();
recentTools();
dashboardSearch();
