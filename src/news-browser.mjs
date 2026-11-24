const filters = document.querySelector('.news-filters');
const buttons = filters.querySelectorAll('button');
const articles = document.querySelectorAll('[data-news-source]');

filters.hidden = false;
function selectSource(button) {
  const source = button.dataset.newsFilter;
  for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
  for (const article of articles) article.hidden = Boolean(source && article.dataset.newsSource !== source);
}

function applyFragment() {
  const active = [...buttons].find((button) => location.hash === '#source-' + button.dataset.newsFilter);
  selectSource(active ?? buttons[0]);
}

for (const button of buttons) {
  button.addEventListener('click', () => {
    const source = button.dataset.newsFilter;
    history.replaceState(null, '', location.pathname + location.search + (source ? '#source-' + source : ''));
    selectSource(button);
  });
}
addEventListener('hashchange', applyFragment);
applyFragment();
