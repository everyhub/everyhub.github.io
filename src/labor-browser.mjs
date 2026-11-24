import { tools } from './tool-specs.mjs';
import { won } from './display.mjs';

const form = document.querySelector('#tool-form');
const tool = tools[form.dataset.tool];
const rows = new Map([...document.querySelectorAll('[data-result]')].map((cell) => [cell.dataset.result, cell]));
const periods = document.querySelector('#tool-periods');
const status = document.querySelector('#tool-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = Object.fromEntries(tool.fields.map(({ key, options }) => {
    const field = form.elements.namedItem(`field-${key}`);
    return [key, options ? options.find(([option]) => String(option) === field.value)[0] : field.valueAsNumber];
  }));
  const result = tool.calculate(values);
  for (const { key, format } of tool.outputs) {
    rows.get(key).textContent = result[key] === undefined ? '해당 없음' : format(result[key]);
  }
  if (periods) periods.replaceChildren(...result[tool.iterate].map((amount, i) => {
    const item = document.createElement('li');
    item.textContent = `${i + 1}개월째 ${won(amount)}`;
    return item;
  }));
  status.textContent = `계산 결과: ${[...rows.values()].at(-1).textContent}`;
});
