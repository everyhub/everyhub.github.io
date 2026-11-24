import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export function updateActiveWork(items, action, title, step, now = new Date()) {
  title = title?.trim();
  step = step?.trim();
  if (!title || !['start', 'step', 'done'].includes(action) || (action !== 'done' && !step)) {
    throw new Error('Usage: npm run now -- start|step "<title>" "<step>" or npm run now -- done "<title>"');
  }
  const active = items.find((item) => item.title === title);
  if (action === 'start') {
    if (active) throw new Error('이미 진행 중인 작업입니다. step 명령을 사용하세요.');
    const updatedAt = now.toISOString();
    return [{ title, step, startedAt: updatedAt, updatedAt }, ...items];
  }
  if (!active) throw new Error('진행 중인 작업을 찾지 못했습니다.');
  if (action === 'done') return items.filter((item) => item !== active);
  return items.map((item) => item === active ? { ...item, step, updatedAt: now.toISOString() } : item);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const file = new URL('./src/admin-now.json', import.meta.url);
    const items = JSON.parse(await readFile(file, 'utf8'));
    const updated = updateActiveWork(items, ...process.argv.slice(2, 5));
    await writeFile(file, JSON.stringify(updated, null, 2) + '\n');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
