/* Drives real Chrome through the live teaser and reports every PostHog
   request AND the /flags response body (quota limiting shows up there),
   so analytics problems show up as facts, not guesses. */
const { chromium } = require('playwright-core');

(async () => {
  const site = process.env.SITE || 'https://one-pager.trybytes.ai';
  const b = await chromium.launch({ channel: 'chrome' });
  const page = await b.newPage();
  const ph = [];
  let flagsBody = null;
  const isIngest = u => u.includes('/i/v0/e') || u.includes('/batch') || /posthog\.com\/e\/?(\?|$)/.test(u);
  page.on('response', async r => {
    const u = r.url();
    if (!u.includes('posthog.com')) return;
    ph.push(`${r.status()} ${r.request().method()} ${u.split('?')[0]}`);
    if (u.includes('/flags')) { try { flagsBody = await r.text(); } catch (e) {} }
  });
  page.on('requestfailed', r => {
    if (r.url().includes('posthog.com')) {
      ph.push(`FAILED ${r.method()} ${r.url().split('?')[0]} (${r.failure() && r.failure().errorText})`);
    }
  });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(`console.${m.type()}:`, m.text().slice(0, 300)); });
  page.on('pageerror', e => console.log('pageerror:', e.message));

  await page.goto(site + '/', { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(4000);
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
  await page.waitForTimeout(12000); // well past posthog-js's batch flush interval

  console.log('distinct_id      :', await page.evaluate(() =>
    window.posthog && window.posthog.get_distinct_id && window.posthog.get_distinct_id()));

  // force one instant capture to see whether ANY event can leave the page
  await page.evaluate(() => {
    if (window.posthog && window.posthog.capture) {
      window.posthog.capture('live_probe_instant', { source: 'smoke-test' }, { send_instantly: true });
    }
  });
  await page.waitForTimeout(4000);

  console.log('--- posthog requests seen by the browser ---');
  console.log(ph.length ? ph.join('\n') : '(none at all)');
  if (flagsBody) {
    console.log('--- /flags response (truncated) ---');
    console.log(flagsBody.slice(0, 900));
    try {
      const f = JSON.parse(flagsBody);
      console.log('quotaLimited     :', JSON.stringify(f.quotaLimited || f.quota_limited || 'not present'));
    } catch (e) {}
  }
  const assets = ph.some(x => /^2\d\d GET .*\/static\/array\.js/.test(x));
  const ingest = ph.filter(x => /^2\d\d POST /.test(x) && isIngest(x));
  console.log('array.js loaded  :', assets ? 'PASS' : 'FAIL');
  console.log('event POSTs      :', ingest.length ? 'PASS — ' + ingest.length + ' capture request(s)' : 'FAIL — captures never left the browser');
  await b.close();
  if (!assets || !ingest.length) process.exit(1);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
