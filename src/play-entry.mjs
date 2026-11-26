import { playLimits, validateEntries } from './play.mjs';

export function entryBoxes({ max, countLabel, unit, groups }) {
  return `<label class="play-count-label">${countLabel}<select data-entry-count>
    ${Array.from({ length: max - 1 }, (_, index) => `<option value="${index + 2}">${index + 2}${unit}</option>`).join('')}
  </select></label>
  <div class="play-entry-groups">${groups.map(({ id, heading, label, examples, repeat = false }) =>
    `<fieldset class="play-entry-group" data-entry-group="${id}" data-entry-label="${label}" data-entry-repeat="${repeat}">
      <legend>${heading}</legend><div class="play-entry-list" data-entry-list>
      ${[0, 1].map((index) => `<label><span>${label} ${index + 1}</span><input type="text" maxlength="${playLimits.name * 2}"
        enterkeyhint="next" placeholder="예: ${examples[index]}" data-entry-input></label>`).join('')}</div>
    </fieldset>`).join('')}</div>`;
}

export function bindEntryBoxes(form) {
  const count = form.querySelector('[data-entry-count]');
  const groups = [...form.querySelectorAll('[data-entry-group]')];
  function sync() {
    for (const group of groups) {
      const list = group.querySelector('[data-entry-list]');
      while (list.children.length < Number(count.value)) {
        const row = list.firstElementChild.cloneNode(true);
        row.querySelector('span').textContent = `${group.dataset.entryLabel} ${list.children.length + 1}`;
        const input = row.querySelector('input');
        input.value = input.defaultValue = '';
        input.removeAttribute('placeholder');
        list.append(row);
      }
      [...list.children].forEach((row, index) => {
        row.hidden = index >= Number(count.value);
        row.querySelector('input').disabled = row.hidden;
      });
    }
    const active = [...form.querySelectorAll('[data-entry-input]:enabled')];
    active.forEach((input, index) => { input.enterKeyHint = index === active.length - 1 ? 'go' : 'next'; });
  }
  count.addEventListener('change', sync);
  form.addEventListener('reset', () => queueMicrotask(sync));
  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.isComposing || event.keyCode === 229 || !event.target.matches('[data-entry-input]')) return;
    const active = [...form.querySelectorAll('[data-entry-input]:enabled')];
    const next = active[active.indexOf(event.target) + 1];
    if (!next) return;
    event.preventDefault();
    next.focus();
  });
  sync();
  return (id) => {
    const group = groups.find(({ dataset }) => dataset.entryGroup === id);
    const inputs = [...group.querySelectorAll('[data-entry-input]:enabled')];
    const values = inputs.map(({ value }) => value.trim().normalize());
    const empty = values.indexOf('');
    if (empty !== -1) {
      inputs[empty].focus();
      throw new Error(`${group.dataset.entryLabel} ${empty + 1} 칸을 채워 주세요.`);
    }
    return validateEntries(values, { allowRepeats: group.dataset.entryRepeat === 'true' });
  };
}
