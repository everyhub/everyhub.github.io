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
const cells = [...table.querySelectorAll('[data-period][data-amount]')];

function updateResult() {
  try {
    const result = calculate({
      annualSalary: Number(salary.value.replaceAll(',', '')) * 10_000,
      monthlyTaxFree: Number(taxFree.value.replaceAll(',', '')) * 10_000,
      dependents: dependents.valueAsNumber,
      children: children.valueAsNumber,
    });
    for (const cell of cells) cell.textContent = won(result[cell.dataset.period][cell.dataset.amount]);
    status.textContent = won(result.monthly.net);
    annualNet.textContent = won(result.annual.net);
    error.textContent = '';
  } catch (cause) {
    if (!(cause instanceof RangeError)) throw cause;
    error.textContent = cause.message;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  updateResult();
});

const preset = new URLSearchParams(location.search).get('salary');
if (preset && /^\d+$/.test(preset) && Number(preset) >= 2_000 && Number(preset) <= limits.annualSalary / 10_000) {
  salary.value = preset;
  updateResult();
}
