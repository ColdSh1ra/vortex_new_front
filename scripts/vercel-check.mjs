// Checks the Vercel function before deploying: `npm run vercel:check`.
// Copies only what Vercel would ship — files traced from api/index.js by @vercel/nft (the tracer
// Vercel uses) plus vercel.json includeFiles (globs skip dot-directories) — into a temp folder,
// then loads it with require(esm) disabled, as Vercel's runtime does, and requests every route.
// Catches missing bundled files (ERR_MODULE_NOT_FOUND / ENOENT) and ESM-only deps (ERR_REQUIRE_ESM).
// Run `npm run build:vercel` first (the npm script does it).
import { nodeFileTrace } from '@vercel/nft';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (process.argv[2] === '--smoke') {
  await smoke(process.argv[3]);
} else {
  await check();
}

async function check() {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const { fileList } = await nodeFileTrace([path.join(root, 'api/index.js')], { base: root });
  const included = fs.globSync(expandBraces(config.functions['api/index.js'].includeFiles), { cwd: root })
    .filter((file) => !file.split(path.sep).some((part) => part.startsWith('.')));

  const task = fs.mkdtempSync(path.join(os.tmpdir(), 'vercel-task-'));
  let bytes = 0;
  for (const rel of new Set([...fileList, ...included])) {
    const src = path.join(root, rel);
    const stat = fs.lstatSync(src, { throwIfNoEntry: false });
    if (!stat || stat.isDirectory()) continue;
    const dst = path.join(task, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (stat.isSymbolicLink()) fs.symlinkSync(fs.readlinkSync(src), dst);
    else { fs.copyFileSync(src, dst); bytes += stat.size; }
  }
  console.log(`Function copy: ${fileList.size} traced + ${included.length} included files, ${(bytes / 1048576).toFixed(1)} MB (limit 250 MB)`);

  const result = spawnSync(process.execPath, ['--no-experimental-require-module', fileURLToPath(import.meta.url), '--smoke', task], {
    stdio: 'inherit',
    // A clean environment, like a Vercel project without CMS/Director variables.
    env: { PATH: process.env.PATH, NODE_ENV: 'production' },
  });
  fs.rmSync(task, { recursive: true, force: true });
  process.exitCode = result.status ?? 1;
}

function expandBraces(pattern) {
  const match = pattern.match(/^\{(.*)\}$/);
  return match ? match[1].split(',') : [pattern];
}

async function smoke(task) {
  const { createRequire } = await import('node:module');
  const http = await import('node:http');
  const app = createRequire(path.join(task, 'api', 'index.js'))('./index.js');
  const site = JSON.parse(fs.readFileSync(path.join(task, 'shared', 'site.json'), 'utf8'));
  const paths = [
    ...site.staticPaths, ...Object.keys(site.languageCodes).map((language) => `/?lang=${language}`),
    '/blog', '/blog?page=2', '/blog/missing-article',
    '/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt',
    '/api/content', '/api/content/media', '/does-not-exist',
  ];

  const server = http.createServer(app).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let failures = 0;
  for (const route of paths) {
    const response = await fetch(base + route, { redirect: 'manual' });
    const body = await response.text();
    if (response.status >= 500) {
      failures += 1;
      console.log(`FAIL ${response.status} ${route}  ${body.slice(0, 100)}`);
    }
  }
  server.close();
  console.log(failures ? `${failures} of ${paths.length} routes failed (see "Page rendering failed" above)` : `All ${paths.length} routes respond without 5xx`);
  process.exitCode = failures ? 1 : 0;
}
