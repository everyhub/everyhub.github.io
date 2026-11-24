export const newsSections = [
  { path: 'news/korea/', name: '국내 IT', description: '국내 기술 조직이 직접 공개한 개발 사례와 서비스 기술 소식을 모았습니다. 개발 과정, 인프라 운영, 오픈소스 활용 사례를 원문에서 확인할 수 있습니다.' },
  { path: 'news/world/', name: '해외 IT', description: '해외 기술 기관과 프로젝트의 공식 발표를 모았습니다. 웹 표준과 브라우저 정책, 과학·우주 기술 동향을 영어 원문으로 확인할 수 있습니다.' },
  { path: 'news/ai/', name: 'AI 모델·이슈', description: 'AI 개발사와 오픈소스 플랫폼의 공식 소식을 모았습니다. 모델 공개, 서비스 변경, 평가 방법과 도구 업데이트는 발표 원문에서 확인하세요.' },
  { path: 'news/trending/', name: '핫이슈', description: 'Hacker News 공식 API가 제공하는 인기 글을 모았습니다. 커뮤니티의 관심도를 나타내는 목록으로, 순위나 글 제목이 사실 확인을 뜻하지는 않습니다.' },
];

export const newsFeeds = [
  { id: 'naver', section: 'news/korea/', name: '네이버 D2', url: 'https://d2.naver.com/d2.atom' },
  { id: 'kakao', section: 'news/korea/', name: '카카오테크', url: 'https://tech.kakao.com/feed/' },
  { id: 'mozilla', section: 'news/world/', name: 'Mozilla', url: 'https://blog.mozilla.org/en/feed/' },
  { id: 'nasa', section: 'news/world/', name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
  { id: 'openai', section: 'news/ai/', name: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
  { id: 'huggingface', section: 'news/ai/', name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' },
  { id: 'hackernews', section: 'news/trending/', name: 'Hacker News', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', format: 'hn' },
];
