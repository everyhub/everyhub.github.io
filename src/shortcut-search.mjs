const initialLetters = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const hangulInitial = /^[ㄱ-ㅎ]+$/u;

function words(value) {
  return value.normalize('NFKC').toLowerCase()
    .replace(/[ᄀ-ᄒ]/gu, (letter) => initialLetters[letter.charCodeAt(0) - 0x1100])
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

const initials = (value) => value.replace(/[가-힣]/gu, (letter) =>
  initialLetters[Math.floor((letter.charCodeAt(0) - 0xac00) / 588)]);

function withinOneEdit(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, changes = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++changes > 1) return false;
    if (a.length >= b.length) i++;
    if (a.length <= b.length) j++;
  }
  return changes + a.length - i + b.length - j === 1;
}

export function indexShortcuts(entries) {
  return entries.map((entry) => {
    const titleWords = words(entry.title);
    return {
      entry,
      titleWords,
      title: titleWords.join(''),
      keywords: entry.keywords.map((label) => ({ text: words(label).join(''), label })),
      initialWords: titleWords.map(initials),
    };
  });
}

function match(index, query) {
  if (index.title === query) return { rank: 0 };
  const keyword = index.keywords.find(({ text }) => text === query);
  if (keyword) return { rank: 1, keyword: keyword.label };
  if (index.title.includes(query)) return { rank: 2, prefix: index.title.startsWith(query) };
  if (hangulInitial.test(query) && query.length >= 2) {
    const initial = index.initialWords.join('');
    if (initial.includes(query)) return { rank: 3, prefix: initial.startsWith(query),
      highlight: index.titleWords[index.initialWords.findIndex((word) => word.includes(query))] };
  }
  if (query.length >= 3 && /^[가-힣a-z]+$/u.test(query)) {
    const highlight = index.titleWords.find((word) => word !== '계산기' && withinOneEdit(query, word));
    if (highlight) return { rank: 4, highlight };
    const keyword = index.keywords.find(({ text }) => withinOneEdit(query, text));
    if (keyword) return { rank: 4, keyword: keyword.label };
  }
  return null;
}

export function searchShortcuts(index, query) {
  const terms = words(query.slice(0, 80));
  if (!terms.length) return [];
  const phrase = terms.join('');
  return index.flatMap((item) => {
    let ranked = match(item, phrase);
    if ((!ranked || ranked.rank === 4) && terms.length > 1) {
      const matches = terms.map((term) => match(item, term));
      if (matches.every(Boolean)) {
        ranked = { rank: Math.max(2, ...matches.map(({ rank }) => rank)), keyword: matches.find(({ keyword }) => keyword)?.keyword };
      }
    }
    return ranked ? [{ entry: item.entry, ...ranked }] : [];
  }).sort((a, b) => a.rank - b.rank || Number(Boolean(b.prefix)) - Number(Boolean(a.prefix)));
}
