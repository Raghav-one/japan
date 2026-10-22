const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.SITE_URL || 'http://127.0.0.1:4187/';
const executablePath = process.env.CHROME_PATH;

(async () => {
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  assert.equal(await page.locator('.source-provided').count(), 1);
  assert.equal(await page.locator('.trip-progress').count(), 1);
  assert.equal(await page.locator('nav a').count(), 13);
  assert.equal(await page.locator('input[type="checkbox"]').count(), 10);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const first = page.locator('input[type="checkbox"]').first();
  await first.check();
  assert.equal(await page.locator('.progress-status').innerText(), '1 of 10 complete');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('input[type="checkbox"]').first().isChecked(), true);
  await page.locator('.trip-progress button').click();
  assert.equal(await page.locator('input[type="checkbox"]').first().isChecked(), false);
  await page.locator('a[href="#safe"]').click();
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('a[href="#safe"]').evaluate(el => el.classList.contains('active')), true);
  await page.screenshot({ path: '/tmp/japan-public-desktop.png' });

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phone = await mobile.newPage();
  phone.on('pageerror', error => errors.push(error.message));
  await phone.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await phone.screenshot({ path: '/tmp/japan-public-mobile.png' });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ desktop: 'pass', mobile: 'pass', checklist: 'pass', navigation: 'pass', errors }));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
