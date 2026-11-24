const toggle = document.querySelector('.nav-toggle');
const sidebar = document.querySelector('#site-navigation');
const mobile = matchMedia('(max-width: 52rem)');

const legacySalary = document.body.dataset.pagePath === '' && new URLSearchParams(location.search).has('salary');
if (legacySalary) {
  const target = new URL('tools/salary-calculator/', document.baseURI);
  target.search = location.search;
  target.hash = location.hash || '#calculator';
  location.replace(target.href);
}

function setOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
  sidebar.hidden = mobile.matches && !open;
}

toggle.hidden = false;
setOpen(false);
toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') === 'false'));
const search = document.querySelector('#shortcut-search');
sidebar.querySelector('a[href$="#shortcut-search"]')?.addEventListener('click', (event) => {
  if (!search || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (mobile.matches) setOpen(false);
  search.focus();
});
mobile.addEventListener('change', () => setOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobile.matches && toggle.getAttribute('aria-expanded') === 'true') {
    setOpen(false);
    toggle.focus();
  }
});
