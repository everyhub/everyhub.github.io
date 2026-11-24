const filters = document.querySelector('.news-filters');
const buttons = filters.querySelectorAll('button');
const articles = document.querySelectorAll('[data-news-source]');

filters.hidden = false;
for (const button of buttons) {
  button.addEventListener('click', () => {
    const source = button.dataset.newsFilter;
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    for (const article of articles) article.hidden = Boolean(source && article.dataset.newsSource !== source);
  });
}
