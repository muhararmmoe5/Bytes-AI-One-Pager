/* Drives real Chrome through the live teaser and reports every PostHog
   request, so analytics problems show up as facts, not guesses.
   Run by the smoke-test workflow: npm i playwright-core, then node this. */
const { chromium } = require('playwright-core');

(async () => {
  const site = process.env.SITE || 'https://one-pager.trybytes.ai';
  const b = await chromium.launch({ channel: 'chrome' });
  const page = await b.newPage();
  const ph = [];
  page.on('response', r => {
    if (r.url().includes('posthog.com')) {
      ph.push(`${r.status()} ${r.request().method()} ${r.url().split('?')[0]}`);
    }
  });
  page.on('requestfailed', r => {
    if (r.url().includes('posthog.com')) {
      ph.push(`FAILED ${r.method()} ${r.url().split('?')[0]} (${r.failure() && r.failure().errorText})`);
    }
  });
  page.on('console', m => { if (m.type() === 'error') console.log('console.error:', m.text()); });
  page.on('pageerror', e => console.log('pageerror:', e.message));

  await page.goto(site + '/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(3000); // let array.js load + init + $pageview
  console.log('title            :', await page.title());
  console.log('posthog loaded   :', await page.evaluate(() =>
    !!(window.posthog && (window.posthog.__loaded || typeof window.posthog.get_distinct_id === 'function'))));

  await page.fill('#gate-email', 'posthog-live-test@trybytes.ai');
  await page.fill('#gate-code', 'BYTES2026');
  await page.click('#gate-form button[type=submit]');
  await page.waitForFunction(() => document.body.classList.contains('unlocked'), null, { timeout: 10000 });
  console.log('gate             : unlocked');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1500);
  await page.keyboard.press('End');
  await page.waitForTimeout(3500); // let capture batches flush

  console.log('--- posthog requests seen by the browser ---');
  console.log(ph.length ? ph.join('\n') : '(none at all)');
  const assets = ph.some(x => /^2\d\d GET .*\/static\/array\.js/.test(x));
  const ingest = ph.some(x => /^2\d\d POST /.test(x));
  console.log('array.js loaded  :', assets ? 'PASS' : 'FAIL');
  console.log('events ingested  :', ingest ? 'PASS' : 'FAIL');
  await b.close();
  if (!assets || !ingest) process.exit(1);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
