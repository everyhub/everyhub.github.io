export const newsSections = [
  { path: 'news/korea/', name: '국내 IT', description: '긱뉴스(GeekNews)가 모은 개발자 커뮤니티 소식과 국내 기술 조직의 개발 사례를 한곳에서 살펴보세요.' },
  { path: 'news/world/', name: '해외 IT', description: 'GitHub 제품 업데이트, 웹·브라우저 소식과 해외 개발팀의 엔지니어링 사례를 모았습니다.' },
  { path: 'news/ai/', name: 'AI 모델·이슈', description: 'AI 개발사와 오픈소스 플랫폼의 공식 소식을 모았습니다. 모델 공개, 서비스 변경, 평가 방법과 도구 업데이트는 발표 원문에서 확인하세요.' },
  { path: 'news/trending/', name: '핫이슈', description: 'Hacker News 공식 API가 제공하는 인기 글을 모았습니다. 커뮤니티의 관심도를 나타내는 목록으로, 순위나 글 제목이 사실 확인을 뜻하지는 않습니다.' },
];

export const newsFeeds = [
  { id: 'geeknews', section: 'news/korea/', name: '긱뉴스 (GeekNews)', url: 'https://news.hada.io/rss/news', featured: true },
  { id: 'naver', section: 'news/korea/', name: '네이버 D2', url: 'https://d2.naver.com/d2.atom' },
  { id: 'kakao', section: 'news/korea/', name: '카카오테크', url: 'https://tech.kakao.com/feed/' },
  { id: 'toss', section: 'news/korea/', name: '토스 기술 블로그', url: 'https://toss.tech/rss.xml' },
  { id: 'github', section: 'news/world/', name: 'GitHub Changelog', url: 'https://github.blog/changelog/feed/' },
  { id: 'mozilla', section: 'news/world/', name: 'Mozilla', url: 'https://blog.mozilla.org/en/feed/' },
  { id: 'line', section: 'news/world/', name: 'LY Corporation Tech Blog', url: 'https://engineering.linecorp.com/en/feed/' },
  { id: 'openai', section: 'news/ai/', name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { id: 'huggingface', section: 'news/ai/', name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { id: 'deepmind', section: 'news/ai/', name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml' },
  { id: 'hackernews', section: 'news/trending/', name: 'Hacker News', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', format: 'hn' },
];
