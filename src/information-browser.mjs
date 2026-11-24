const parts = new Intl.DateTimeFormat('en', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
}).formatToParts(new Date());
const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
const date = `${values.year}-${values.month}-${values.day}`;
const today = document.querySelector(`#holiday-calendar time[datetime="${date}"]`);
if (today) {
  today.setAttribute('aria-current', 'date');
  today.id = 'today';
  document.querySelector('[data-calendar-today]').hidden = false;
}
