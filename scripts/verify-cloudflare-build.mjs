#!/usr/bin/env node
/**
 * Verifies GymWeek frontend build output is Cloudflare Pages–ready.
 * Run after: npm run build
 */
import { existsSync, readFileSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

const failures = [];
const passes = [];

function pass(msg) {
  passes.push(msg);
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  failures.push(msg);
  console.error(`  ✗ ${msg}`);
}

function checkFile(relativePath, label = relativePath) {
  const full = join(ROOT, relativePath);
  if (!existsSync(full)) {
    fail(`Missing ${label}`);
    return false;
  }
  pass(`Found ${label}`);
  return true;
}

function collectJsFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collectJsFiles(p, out);
    else if (name.endsWith('.js')) out.push(p);
  }
  return out;
}

console.log('\nGymWeek — Cloudflare Pages compatibility checks\n');

checkFile('wrangler.toml');
const wranglerText = existsSync(join(ROOT, 'wrangler.toml'))
  ? readFileSync(join(ROOT, 'wrangler.toml'), 'utf8')
  : '';
if (wranglerText.includes('pages_build_output_dir')) {
  pass('wrangler.toml pages_build_output_dir set');
} else {
  fail('wrangler.toml must set pages_build_output_dir for Cloudflare Pages');
}

if (/^\[assets\]/m.test(wranglerText)) {
  fail('wrangler.toml [assets] is Workers-only — remove it for Cloudflare Pages deploys');
} else {
  pass('wrangler.toml has no [assets] block (Pages-compatible)');
}

if (existsSync(join(ROOT, 'public/404.html')) || existsSync(join(DIST, '404.html'))) {
  fail('404.html disables Pages SPA mode — remove it so /dashboard routes work');
} else {
  pass('No 404.html (Pages SPA fallback enabled)');
}

if (existsSync(join(ROOT, 'public/_redirects'))) {
  const redirects = readFileSync(join(ROOT, 'public/_redirects'), 'utf8');
  if (/\/index\.html/.test(redirects)) {
    fail('public/_redirects must not rewrite to /index.html (Cloudflare error 100324)');
  } else {
    pass('public/_redirects present without /index.html rewrites');
  }
} else {
  pass('No public/_redirects (Pages SPA — omit 404.html in build)');
}

if (checkFile('public/_headers')) {
  const headers = readFileSync(join(ROOT, 'public/_headers'), 'utf8');
  if (!headers.includes('X-Frame-Options')) fail('_headers missing X-Frame-Options');
  else pass('_headers contains security headers');
}

checkFile('src/config/api.js');

if (!existsSync(DIST)) {
  fail('dist/ folder not found — run npm run build first');
} else {
  pass('dist/ folder exists');

  if (existsSync(join(DIST, 'index.html'))) pass('dist/index.html exists');
  else fail('dist/index.html missing');

  if (existsSync(join(DIST, '_redirects'))) {
    const distRedirects = readFileSync(join(DIST, '_redirects'), 'utf8');
    if (/\/index\.html/.test(distRedirects)) {
      fail('dist/_redirects rewrites to /index.html — remove public/_redirects and redeploy');
    } else {
      pass('dist/_redirects present without /index.html rewrites');
    }
  } else {
    pass('dist/_redirects absent (Pages SPA — no 404.html)');
  }

  if (existsSync(join(DIST, '_headers'))) pass('dist/_headers copied to build output');
  else fail('dist/_headers missing (must live in public/)');

  const assetsDir = join(DIST, 'assets');
  if (existsSync(assetsDir) && statSync(assetsDir).isDirectory()) {
    pass('dist/assets/ exists');
  } else {
    fail('dist/assets/ missing');
  }

  const wrangler = wranglerText || readFileSync(join(ROOT, 'wrangler.toml'), 'utf8');
  if (wrangler.includes('pages_build_output_dir = "dist"')) {
    pass('wrangler.toml pages_build_output_dir = "dist"');
  } else {
    fail('wrangler.toml must set pages_build_output_dir = "dist"');
  }

  if (process.env.CF_PAGES === '1' || process.env.REQUIRE_VITE_API_URL === '1') {
    const jsFiles = collectJsFiles(join(DIST, 'assets'));
    const expected = (process.env.VITE_API_URL || '').replace(/\/$/, '');
    const hasApiUrl = expected
      ? jsFiles.some((f) => readFileSync(f, 'utf8').includes(expected))
      : jsFiles.some((f) => /https:\/\/[^"'\s]{8,}/.test(readFileSync(f, 'utf8')));
    if (hasApiUrl) pass('Built assets reference external API URL');
    else fail('VITE_API_URL not embedded — set it in Cloudflare Pages env before build');
  } else {
    pass('Skipped VITE_API_URL embed check (set REQUIRE_VITE_API_URL=1 for strict CI)');
  }
}

if (checkFile('.env.example')) {
  const envEx = readFileSync(join(ROOT, '.env.example'), 'utf8');
  if (envEx.includes('VITE_API_URL')) pass('.env.example documents VITE_API_URL');
  else fail('.env.example missing VITE_API_URL');
}

console.log(`\n${passes.length} passed, ${failures.length} failed\n`);

if (failures.length) {
  process.exit(1);
}

console.log('All Cloudflare Pages compatibility checks passed.\n');
