import { calculate, limits } from './calculator.mjs';
import { won } from './display.mjs';

const form = document.querySelector('#salary-form');
const salary = form.elements.annualSalary;
const taxFree = form.elements.monthlyTaxFree;
const dependents = form.elements.dependents;
const children = form.elements.children;
const status = document.querySelector('#calc-status');
const annualNet = document.querySelector('#annual-net');
const error = document.querySelector('#calc-error');
const table = document.querySelector('#calculation-table');
const summary = status.closest('.net');
const cells = [...table.querySelectorAll('[data-period][data-amount]')];

function hideResult() {
  summary.hidden = table.hidden = true;
}

function updateResult() {
  try {
    if (taxFree.valueAsNumber > salary.valueAsNumber / 12) {
      throw new RangeError('월 비과세액은 세전 연봉을 12로 나눈 금액 이하여야 합니다. 두 금액 모두 만 원 단위로 입력하세요.');
    }
    if (children.valueAsNumber > dependents.valueAsNumber) {
      throw new RangeError('공제 대상 자녀 수는 부양가족 수보다 많을 수 없습니다.');
    }
    const result = calculate({
      annualSalary: salary.valueAsNumber * 10_000,
      monthlyTaxFree: taxFree.valueAsNumber * 10_000,
      dependents: dependents.valueAsNumber,
      children: children.valueAsNumber,
    });
    for (const cell of cells) cell.textContent = won(result[cell.dataset.period][cell.dataset.amount]);
    status.textContent = won(result.monthly.net);
    annualNet.textContent = won(result.annual.net);
    error.textContent = '';
    summary.hidden = table.hidden = false;
  } catch (cause) {
    if (!(cause instanceof RangeError)) throw cause;
    hideResult();
    error.textContent = cause.message;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateResult();
});
form.addEventListener('invalid', () => {
  hideResult();
  error.textContent = '';
}, true);

const preset = new URLSearchParams(location.search).get('salary');
if (preset && /^\d+$/.test(preset) && Number(preset) >= 2_000 && Number(preset) <= limits.annualSalary / 10_000) {
  salary.value = preset;
  updateResult();
}
