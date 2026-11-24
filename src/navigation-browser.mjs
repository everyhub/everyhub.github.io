const toggle = document.querySelector('.nav-toggle');
const sidebar = document.querySelector('#site-navigation');
const mobile = matchMedia('(max-width: 52rem)');

function setOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
  sidebar.hidden = mobile.matches && !open;
}

toggle.hidden = false;
setOpen(false);
toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') === 'false'));
mobile.addEventListener('change', () => setOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobile.matches && toggle.getAttribute('aria-expanded') === 'true') {
    setOpen(false);
    toggle.focus();
  }
});
