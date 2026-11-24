const filters = document.querySelector('.admin-status-filters');
const buttons = Array.from(filters.querySelectorAll('[data-timeline-filter]'));
const rows = Array.from(document.querySelectorAll('[data-timeline-status]'));
const empty = document.querySelector('[data-timeline-empty]');

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-timeline-filter]');
  if (!button) return;
  const status = button.dataset.timelineFilter;
  for (const option of buttons) option.setAttribute('aria-pressed', String(option === button));
  let count = 0;
  for (const row of rows) {
    const visible = status === '전체' || row.dataset.timelineStatus === status;
    row.hidden = row.nextElementSibling.hidden = !visible;
    if (visible) count++;
  }
  empty.hidden = count !== 0;
});

filters.hidden = false;
