import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const assetType = /\.(?:css|m?js|json|svg|png|jpe?g|webp|gif|avif|ico|webmanifest)$/i;
const moduleReference = /(^[\t ]*(?:(?:import|export)[ \t]+[^'"();]*?\bfrom\s*|import[ \t]*)|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"\s]+)\2/gm;

export function fingerprintAssets(files, baseURL) {
  const versions = new Map();
  const contents = new Map();
  const visiting = new Set();
  const base = new URL(baseURL);

  function assetPath(reference, from) {
    if (!URL.canParse(reference, new URL(from, base))) return;
    const url = new URL(reference, new URL(from, base));
    if (url.origin === base.origin && url.pathname.startsWith(base.pathname)) {
      return url.pathname.slice(base.pathname.length);
    }
  }

  function versioned(reference, from, separator = '&') {
    const name = assetPath(reference, from);
    if (!files.has(name)) return reference;
    const hash = fingerprint(name);
    const fragmentStart = reference.indexOf('#');
    const address = fragmentStart < 0 ? reference : reference.slice(0, fragmentStart);
    const fragment = fragmentStart < 0 ? '' : reference.slice(fragmentStart);
    return address + (address.includes('?') ? separator : '?') + 'v=' + hash + fragment;
  }

  function fingerprint(name) {
    if (versions.has(name)) return versions.get(name);
    if (visiting.has(name)) throw new Error('Circular asset imports: ' + name);
    visiting.add(name);
    const source = files.get(name);
    let content = source;
    if (name.endsWith('.mjs')) {
      content = source.toString().replace(moduleReference, (match, prefix, quote, reference) => {
        if (!files.has(assetPath(reference, name))) throw new Error(`Missing asset import: ${name} → ${reference}`);
        return prefix + quote + versioned(reference, name) + quote;
      });
    } else if (name.endsWith('.webmanifest')) {
      const manifest = JSON.parse(source);
      for (const icon of manifest.icons ?? []) icon.src = versioned(icon.src, name);
      content = JSON.stringify(manifest);
    }
    const hash = createHash('sha256').update(content).digest('hex').slice(0, 16);
    contents.set(name, content);
    versions.set(name, hash);
    visiting.delete(name);
    return hash;
  }

  for (const name of files.keys()) fingerprint(name);
  const html = (source, from) => source.replace(
    /(\s(?:src|href|content|poster)\s*=\s*)(["'])([^"'\s]+)\2/gi,
    (match, prefix, quote, reference) => {
      if (!assetType.test(reference.split(/[?#]/, 1)[0])) return match;
      return prefix + quote + versioned(reference, from, '&amp;') + quote;
    },
  );
  return { contents, html };
}

export async function versionBuildAssets(dist, baseURL) {
  const names = (await readdir(join(dist, 'assets'), { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && assetType.test(entry.name))
    .map(({ parentPath, name }) => relative(dist, join(parentPath, name)).split(sep).join('/'));
  const files = new Map(await Promise.all(names.map(async (name) => [name, await readFile(join(dist, name))])));
  const { contents, html } = fingerprintAssets(files, baseURL);
  await Promise.all([...contents].filter(([, content]) => typeof content === 'string')
    .map(([name, content]) => writeFile(join(dist, name), content)));
  return html;
}
