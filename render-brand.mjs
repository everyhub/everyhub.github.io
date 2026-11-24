import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const brand = new URL('./src/brand/', import.meta.url);
const targets = [32, 180, 192, 512].map((size) => ['mark.svg', `icon-${size}.png`, size, size]);
targets.push(['og.svg', 'og.png', 1200, 630]);
const browser = await chromium.launch({ executablePath: process.env.AUDIT_CHROMIUM_PATH });
try {
  const page = await browser.newPage();
  for (const [source, output, width, height] of targets) {
    const svg = await readFile(new URL(source, brand), 'utf8');
    await page.setViewportSize({ width, height });
    await page.setContent('<style>body{margin:0}svg{display:block;width:100vw;height:100vh}</style>' + svg);
    await page.evaluate(() => document.fonts.ready.then(() => {}));
    await page.screenshot({ path: fileURLToPath(new URL(output, brand)), omitBackground: true });
  }
} finally {
  await browser.close();
}
